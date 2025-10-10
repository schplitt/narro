import { describe, expect, it } from 'vitest'

import { number } from '../../index'

describe('number schema', () => {
  it('accepts numbers within bounds', async () => {
    const schema = number().min(1).max(5)

    const value = await schema.parse(3)

    expect(value).toBe(3)
  })

  it('rejects numbers below the minimum', async () => {
    const schema = number().min(10)
    const report = await schema.safeParse(5)

    expect(report.passed).toBe(false)
    expect('value' in report).toBe(false)
  })

  it('rejects non-number inputs', async () => {
    const schema = number()
    const report = await schema.safeParse('not-a-number')

    expect(report.passed).toBe(false)
    expect('value' in report).toBe(false)
  })

  it('supports optional modifier', async () => {
    const schema = number().optional()

    const definedResult = await schema.safeParse(7)
    expect(definedResult.passed).toBe(true)
    if (definedResult.passed) {
      expect(definedResult.value).toBe(7)
    }

    const optionalResult = await schema.safeParse(undefined)
    expect(optionalResult.passed).toBe(true)
    if (optionalResult.passed) {
      expect(optionalResult.value).toBeUndefined()
    }
  })

  it('supports exactOptional modifier', async () => {
    const schema = number().exactOptional()

    const report = await schema.safeParse(undefined)
    expect(report.passed).toBe(true)
    if (report.passed) {
      expect(report.value).toBeUndefined()
    }
  })

  it('supports undefinable modifier', async () => {
    const schema = number().undefinable()

    const undefinedResult = await schema.safeParse(undefined)
    expect(undefinedResult.passed).toBe(true)
    if (undefinedResult.passed) {
      expect(undefinedResult.value).toBeUndefined()
    }

    const zeroResult = await schema.safeParse(0)
    expect(zeroResult.passed).toBe(true)
    if (zeroResult.passed) {
      expect(zeroResult.value).toBe(0)
    }
  })

  it('supports nullable modifier', async () => {
    const schema = number().nullable()

    const nullResult = await schema.safeParse(null)
    expect(nullResult.passed).toBe(true)
    if (nullResult.passed) {
      expect(nullResult.value).toBeNull()
    }

    const undefinedResult = await schema.safeParse(undefined)
    expect(undefinedResult.passed).toBe(false)
  })

  it('supports nullish modifier', async () => {
    const schema = number().nullish()

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
    const schema = number().default(99)

    await expect(schema.parse(42)).resolves.toBe(42)
    await expect(schema.parse(undefined)).resolves.toBe(99)
    await expect(schema.parse(null)).resolves.toBe(99)
  })

  it('accepts function defaults', async () => {
    const schema = number().default(() => 123)

    await expect(schema.parse(undefined)).resolves.toBe(123)
  })

  it('applies required after optional', async () => {
    const schema = number().optional().required()

    const report = await schema.safeParse(undefined)
    expect(report.passed).toBe(false)
  })

  it('uses last optionality modifier wins semantics', async () => {
    const nullableThenOptional = number().nullable().optional()
    const optionalThenNullable = number().optional().nullable()

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
