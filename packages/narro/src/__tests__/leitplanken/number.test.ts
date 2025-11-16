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

    expect(report.success).toBe(false)
    expect('data' in report).toBe(false)
  })

  it('rejects numbers above the maximum', async () => {
    const schema = number().max(5)
    const report = await schema.safeParse(10)

    expect(report.success).toBe(false)
    expect('data' in report).toBe(false)
  })

  it('rejects non-number inputs', async () => {
    const schema = number()
    const report = await schema.safeParse('not-a-number')

    expect(report.success).toBe(false)
    expect('data' in report).toBe(false)
  })

  it('supports optional modifier', async () => {
    const schema = number().optional()

    const definedResult = await schema.safeParse(7)
    expect(definedResult.success).toBe(true)
    if (definedResult.success) {
      expect(definedResult.data).toBe(7)
    }

    const optionalResult = await schema.safeParse(undefined)
    expect(optionalResult.success).toBe(true)
    if (optionalResult.success) {
      expect(optionalResult.data).toBeUndefined()
    }
  })

  it('supports exactOptional modifier', async () => {
    const schema = number().exactOptional()

    const report = await schema.safeParse(undefined)
    expect(report.success).toBe(true)
    if (report.success) {
      expect(report.data).toBeUndefined()
    }
  })

  it('supports undefinable modifier', async () => {
    const schema = number().undefinable()

    const undefinedResult = await schema.safeParse(undefined)
    expect(undefinedResult.success).toBe(true)
    if (undefinedResult.success) {
      expect(undefinedResult.data).toBeUndefined()
    }

    const zeroResult = await schema.safeParse(0)
    expect(zeroResult.success).toBe(true)
    if (zeroResult.success) {
      expect(zeroResult.data).toBe(0)
    }
  })

  it('supports nullable modifier', async () => {
    const schema = number().nullable()

    const nullResult = await schema.safeParse(null)
    expect(nullResult.success).toBe(true)
    if (nullResult.success) {
      expect(nullResult.data).toBeNull()
    }

    const undefinedResult = await schema.safeParse(undefined)
    expect(undefinedResult.success).toBe(false)
  })

  it('supports nullish modifier', async () => {
    const schema = number().nullish()

    const undefinedResult = await schema.safeParse(undefined)
    expect(undefinedResult.success).toBe(true)
    if (undefinedResult.success) {
      expect(undefinedResult.data).toBeUndefined()
    }

    const nullResult = await schema.safeParse(null)
    expect(nullResult.success).toBe(true)
    if (nullResult.success) {
      expect(nullResult.data).toBeNull()
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
    expect(report.success).toBe(false)
  })

  it('uses last optionality modifier wins semantics', async () => {
    const nullableThenOptional = number().nullable().optional()
    const optionalThenNullable = number().optional().nullable()

    const nullableThenOptionalUndefined = await nullableThenOptional.safeParse(undefined)
    expect(nullableThenOptionalUndefined.success).toBe(true)
    if (nullableThenOptionalUndefined.success) {
      expect(nullableThenOptionalUndefined.data).toBeUndefined()
    }
    const nullableThenOptionalNull = await nullableThenOptional.safeParse(null)
    expect(nullableThenOptionalNull.success).toBe(false)

    const optionalThenNullableNull = await optionalThenNullable.safeParse(null)
    expect(optionalThenNullableNull.success).toBe(true)
    if (optionalThenNullableNull.success) {
      expect(optionalThenNullableNull.data).toBeNull()
    }
    const optionalThenNullableUndefined = await optionalThenNullable.safeParse(undefined)
    expect(optionalThenNullableUndefined.success).toBe(false)
  })
})
