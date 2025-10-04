import { describe, expect, it } from 'vitest'

import { number, parse, safeParse, string } from '../../index'
import { object } from '../../leitplanken/object'

describe('object schema', () => {
  it('accepts objects matching nested schemas', async () => {
    const schema = object({
      name: string().minLength(2),
      age: number().min(0),
      city: string().optional(),
    })

    const value = await parse(schema, { name: 'Al', age: 30 })

    expect(value).toEqual({ name: 'Al', age: 30 })
  })

  it('rejects objects with invalid nested values', async () => {
    const schema = object({
      name: string().minLength(2),
      age: number().min(0),
    })

    const report = await safeParse(schema, { name: 'A', age: -5 })

    expect(report.passed).toBe(false)
    expect('value' in report).toBe(false)
  })

  it('supports optional modifier', async () => {
    const schema = object({
      name: string(),
    }).optional()

    const value = await parse(schema, { name: 'Spur' })
    expect(value).toEqual({ name: 'Spur' })

    const optionalResult = await safeParse(schema, undefined)
    expect(optionalResult.passed).toBe(true)
    if (optionalResult.passed) {
      expect(optionalResult.value).toBeUndefined()
    }
  })

  it('supports exactOptional modifier', async () => {
    const schema = object({
      age: number(),
    }).exactOptional()

    const report = await safeParse(schema, undefined)
    expect(report.passed).toBe(true)
    if (report.passed) {
      expect(report.value).toBeUndefined()
    }
  })

  it('supports undefinable modifier', async () => {
    const schema = object({
      active: string(),
    }).undefinable()

    const undefinedResult = await safeParse(schema, undefined)
    expect(undefinedResult.passed).toBe(true)
    if (undefinedResult.passed) {
      expect(undefinedResult.value).toBeUndefined()
    }

    const definedResult = await safeParse(schema, { active: 'yes' })
    expect(definedResult.passed).toBe(true)
    if (definedResult.passed) {
      expect(definedResult.value).toEqual({ active: 'yes' })
    }
  })

  it('supports nullable modifier', async () => {
    const schema = object({
      name: string(),
    }).nullable()

    const nullResult = await safeParse(schema, null)
    expect(nullResult.passed).toBe(true)
    if (nullResult.passed) {
      expect(nullResult.value).toBeNull()
    }

    const undefinedResult = await safeParse(schema, undefined)
    expect(undefinedResult.passed).toBe(false)
  })

  it('supports nullish modifier', async () => {
    const schema = object({
      label: string(),
    }).nullish()

    const nullResult = await safeParse(schema, null)
    expect(nullResult.passed).toBe(true)
    if (nullResult.passed) {
      expect(nullResult.value).toBeNull()
    }

    const undefinedResult = await safeParse(schema, undefined)
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

    await expect(parse(schema, { name: 'Nova', age: 4 })).resolves.toEqual({ name: 'Nova', age: 4 })
    await expect(parse(schema, undefined)).resolves.toEqual({ name: 'Fallback', age: 0 })
    await expect(parse(schema, null)).resolves.toEqual({ name: 'Fallback', age: 0 })
  })

  it('applies required after optional', async () => {
    const schema = object({
      tag: string(),
    }).optional().required()

    const report = await safeParse(schema, undefined)
    expect(report.passed).toBe(false)
  })

  it('uses last optionality modifier wins semantics', async () => {
    const nullableThenOptional = object({
      name: string(),
    }).nullable().optional()
    const optionalThenNullable = object({
      name: string(),
    }).optional().nullable()

    const nullableThenOptionalUndefined = await safeParse(nullableThenOptional, undefined)
    expect(nullableThenOptionalUndefined.passed).toBe(true)
    if (nullableThenOptionalUndefined.passed) {
      expect(nullableThenOptionalUndefined.value).toBeUndefined()
    }
    const nullableThenOptionalNull = await safeParse(nullableThenOptional, null)
    expect(nullableThenOptionalNull.passed).toBe(false)

    const optionalThenNullableNull = await safeParse(optionalThenNullable, null)
    expect(optionalThenNullableNull.passed).toBe(true)
    if (optionalThenNullableNull.passed) {
      expect(optionalThenNullableNull.value).toBeNull()
    }
    const optionalThenNullableUndefined = await safeParse(optionalThenNullable, undefined)
    expect(optionalThenNullableUndefined.passed).toBe(false)
  })

  it('allows nested optional entries', async () => {
    const schema = object({
      name: string(),
      nickname: string().optional(),
    })

    await expect(parse(schema, { name: 'Spur' })).resolves.toEqual({ name: 'Spur' })
    await expect(parse(schema, { name: 'Spur', nickname: 'S' })).resolves.toEqual({ name: 'Spur', nickname: 'S' })
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

    expect(async () => await parse(schema, {
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
