import { describe, expect, it } from 'vitest'

import { string } from '../../index'

describe('string schema', () => {
  it('accepts strings that satisfy length constraints', async () => {
    const schema = string().minLength(2).maxLength(5)

    const value = await schema.parse('spur')

    expect(value).toBe('spur')
  })

  it('rejects strings that are too short', async () => {
    const schema = string().minLength(3)
    const report = await schema.safeParse('hi')

    expect(report.passed).toBe(false)
    expect('value' in report).toBe(false)
  })

  it('rejects non-string inputs', async () => {
    const schema = string()
    const report = await schema.safeParse(42)

    expect(report.passed).toBe(false)
    expect('value' in report).toBe(false)
  })

  it('supports optional modifier', async () => {
    const schema = string().optional()

    const definedResult = await schema.safeParse('text')
    expect(definedResult.passed).toBe(true)
    if (definedResult.passed) {
      expect(definedResult.value).toBe('text')
    }

    const optionalResult = await schema.safeParse(undefined)
    expect(optionalResult.passed).toBe(true)
    if (optionalResult.passed) {
      expect(optionalResult.value).toBeUndefined()
    }
  })

  it('supports exactOptional modifier', async () => {
    const schema = string().exactOptional()

    const exactOptionalResult = await schema.safeParse(undefined)
    expect(exactOptionalResult.passed).toBe(true)
    if (exactOptionalResult.passed) {
      expect(exactOptionalResult.value).toBeUndefined()
    }
  })

  it('supports undefinable modifier', async () => {
    const schema = string().undefinable()

    const undefinedResult = await schema.safeParse(undefined)
    expect(undefinedResult.passed).toBe(true)
    if (undefinedResult.passed) {
      expect(undefinedResult.value).toBeUndefined()
    }

    const nullResult = await schema.safeParse(null)
    expect(nullResult.passed).toBe(false)
  })

  it('supports nullable modifier', async () => {
    const schema = string().nullable()

    const nullResult = await schema.safeParse(null)
    expect(nullResult.passed).toBe(true)
    if (nullResult.passed) {
      expect(nullResult.value).toBeNull()
    }

    const undefinedResult = await schema.safeParse(undefined)
    expect(undefinedResult.passed).toBe(false)
  })

  it('supports nullish modifier', async () => {
    const schema = string().nullish()

    const undefinedResult = await schema.safeParse(undefined)
    expect(undefinedResult.passed).toBe(true)
    if (undefinedResult.passed) {
      expect(undefinedResult.value).toBeUndefined()
    }

    const nullResult = await schema.safeParse(null)
    expect(nullResult.passed).toBe(true)
    if (nullResult.passed) {
      expect(nullResult.value).toBeNull()
    }
  })

  it('supports default modifier', async () => {
    const schema = string().default('fallback')

    await expect(schema.parse('value')).resolves.toBe('value')
    await expect(schema.parse(undefined)).resolves.toBe('fallback')
    await expect(schema.parse(null)).resolves.toBe('fallback')
  })

  it('applies required after optional', async () => {
    const schema = string().optional().required()

    const report = await schema.safeParse(undefined)
    expect(report.passed).toBe(false)
  })

  it('uses last optionality modifier wins semantics', async () => {
    const nullableThenOptional = string().nullable().optional()
    const optionalThenNullable = string().optional().nullable()

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
})
