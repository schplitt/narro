import { describe, expect, it } from 'vitest'

import { number, string } from '../../index'
import { object } from '../../leitplanken/object'

describe('object schema', () => {
  it('accepts objects matching nested schemas', async () => {
    const schema = object({
      name: string().minLength(2),
      age: number().min(0),
      city: string().optional(),
    })

    const value = await schema.parse({ name: 'Al', age: 30 })

    expect(value).toEqual({ name: 'Al', age: 30 })
  })

  it('rejects objects with invalid nested values', async () => {
    const schema = object({
      name: string().minLength(2),
      age: number().min(0),
    })

    const report = await schema.safeParse({ name: 'A', age: -5 })

    expect(report.passed).toBe(false)
    expect('value' in report).toBe(false)
  })

  it('supports optional modifier', async () => {
    const schema = object({
      name: string(),
    }).optional()

    const value = await schema.parse({ name: 'Spur' })
    expect(value).toEqual({ name: 'Spur' })

    const optionalResult = await schema.safeParse(undefined)
    expect(optionalResult.passed).toBe(true)
    if (optionalResult.passed) {
      expect(optionalResult.value).toBeUndefined()
    }
  })

  it('supports exactOptional modifier', async () => {
    const schema = object({
      age: number(),
    }).exactOptional()

    const report = await schema.safeParse(undefined)
    expect(report.passed).toBe(true)
    if (report.passed) {
      expect(report.value).toBeUndefined()
    }
  })

  it('supports undefinable modifier', async () => {
    const schema = object({
      active: string(),
    }).undefinable()

    const undefinedResult = await schema.safeParse(undefined)
    expect(undefinedResult.passed).toBe(true)
    if (undefinedResult.passed) {
      expect(undefinedResult.value).toBeUndefined()
    }

    const definedResult = await schema.safeParse({ active: 'yes' })
    expect(definedResult.passed).toBe(true)
    if (definedResult.passed) {
      expect(definedResult.value).toEqual({ active: 'yes' })
    }
  })

  it('supports nullable modifier', async () => {
    const schema = object({
      name: string(),
    }).nullable()

    const nullResult = await schema.safeParse(null)
    expect(nullResult.passed).toBe(true)
    if (nullResult.passed) {
      expect(nullResult.value).toBeNull()
    }

    const undefinedResult = await schema.safeParse(undefined)
    expect(undefinedResult.passed).toBe(false)
  })

  it('supports nullish modifier', async () => {
    const schema = object({
      label: string(),
    }).nullish()

    const nullResult = await schema.safeParse(null)
    expect(nullResult.passed).toBe(true)
    if (nullResult.passed) {
      expect(nullResult.value).toBeNull()
    }

    const undefinedResult = await schema.safeParse(undefined)
    expect(undefinedResult.passed).toBe(true)
    if (undefinedResult.passed) {
      expect(undefinedResult.value).toBeUndefined()
    }
  })

  it('supports default modifier', async () => {
    const schema = object({
      name: string(),
      age: number(),
    }).default({ name: 'Fallback', age: 0 })

    await expect(schema.parse({ name: 'Nova', age: 4 })).resolves.toEqual({ name: 'Nova', age: 4 })
    await expect(schema.parse(undefined)).resolves.toEqual({ name: 'Fallback', age: 0 })
    await expect(schema.parse(null)).resolves.toEqual({ name: 'Fallback', age: 0 })
  })

  it('applies required after optional', async () => {
    const schema = object({
      tag: string(),
    }).optional().required()

    const report = await schema.safeParse(undefined)
    expect(report.passed).toBe(false)
  })

  it('uses last optionality modifier wins semantics', async () => {
    const nullableThenOptional = object({
      name: string(),
    }).nullable().optional()
    const optionalThenNullable = object({
      name: string(),
    }).optional().nullable()

    const nullableThenOptionalUndefined = await nullableThenOptional.safeParse(undefined)
    expect(nullableThenOptionalUndefined.passed).toBe(true)
    if (nullableThenOptionalUndefined.passed) {
      expect(nullableThenOptionalUndefined.value).toBeUndefined()
    }
    const nullableThenOptionalNull = await nullableThenOptional.safeParse(null)
    expect(nullableThenOptionalNull.passed).toBe(false)

    const optionalThenNullableNull = await optionalThenNullable.safeParse(null)
    expect(optionalThenNullableNull.passed).toBe(true)
    if (optionalThenNullableNull.passed) {
      expect(optionalThenNullableNull.value).toBeNull()
    }
    const optionalThenNullableUndefined = await optionalThenNullable.safeParse(undefined)
    expect(optionalThenNullableUndefined.passed).toBe(false)
  })

  it('allows nested optional entries', async () => {
    const schema = object({
      name: string(),
      nickname: string().optional(),
    })

    await expect(schema.parse({ name: 'Spur' })).resolves.toEqual({ name: 'Spur' })
    await expect(schema.parse({ name: 'Spur', nickname: 'S' })).resolves.toEqual({ name: 'Spur', nickname: 'S' })
  })

  it('allows for a complex nested object schema', async () => {
    const schema = object({
      id: string().minLength(5),
      profile: object({
        name: string().minLength(2),
        age: number().min(0).optional(),
        contact: object({
          email: string().exactOptional(),
          phone: string().undefinable(),
        }).optional(),
      }),
      tags: object({
        primary: string(),
        secondary: string().optional(),
      }).optional(),
    })

    expect(async () => await schema.parse({
      id: 'user_12345',
      profile: {
        name: 'Alice',
        age: 28,
        contact: {
          email: 'alice@example.com',
          phone: undefined,
        },
      },
      tags: {
        primary: 'admin',
      },
    })).not.toThrow()
  })

  // TODO: test transform and the undefined, exactOptional extra logic
})
