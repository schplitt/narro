import { describe, expect, it } from 'vitest'

import { literal } from '../../index'

describe('literal schema', () => {
  it('accepts matching string literal', async () => {
    const schema = literal('spur')

    await expect(schema.parse('spur')).resolves.toBe('spur')
  })

  it('rejects non matching values', async () => {
    const schema = literal('spur')
    const report = await schema.safeParse('other')

    expect(report.passed).toBe(false)
    expect('value' in report).toBe(false)
  })

  it('supports number literals', async () => {
    const schema = literal(42)

    await expect(schema.parse(42)).resolves.toBe(42)

    const miss = await schema.safeParse(7)
    expect(miss.passed).toBe(false)
  })

  it('supports optional modifier', async () => {
    const schema = literal('optional').optional()

    const hit = await schema.safeParse('optional')
    expect(hit.passed).toBe(true)
    expect(hit.value).toBe('optional')

    const optionalResult = await schema.safeParse(undefined)
    expect(optionalResult.passed).toBe(true)
    expect(optionalResult.value).toBeUndefined()

    const nullResult = await schema.safeParse(null)
    expect(nullResult.passed).toBe(false)
  })

  it('supports default modifier', async () => {
    const schema = literal('fallback').default('fallback')

    await expect(schema.parse('fallback')).resolves.toBe('fallback')
    await expect(schema.parse(undefined)).resolves.toBe('fallback')
    await expect(schema.parse(null)).resolves.toBe('fallback')
  })

  it('supports nullable modifier', async () => {
    const schema = literal('nullable').nullable()

    const nullResult = await schema.safeParse(null)
    expect(nullResult.passed).toBe(true)
    expect(nullResult.value).toBeNull()

    const undefinedResult = await schema.safeParse(undefined)
    expect(undefinedResult.passed).toBe(false)
  })

  it('supports nullish modifier for numbers', async () => {
    const schema = literal(5).nullish()

    const undefinedResult = await schema.safeParse(undefined)
    expect(undefinedResult.passed).toBe(true)
    expect(undefinedResult.value).toBeUndefined()

    const nullResult = await schema.safeParse(null)
    expect(nullResult.passed).toBe(true)
    expect(nullResult.value).toBeNull()

    const miss = await schema.safeParse(6)
    expect(miss.passed).toBe(false)
  })

  it('applies required after optional', async () => {
    const schema = literal('value').optional().required()

    const report = await schema.safeParse(undefined)
    expect(report.passed).toBe(false)
  })

  it('uses last optionality modifier wins semantics', async () => {
    const optionalThenNullable = literal('x').optional().nullable()
    const nullableThenOptional = literal('x').nullable().optional()

    const optionalThenNullableNull = await optionalThenNullable.safeParse(null)
    expect(optionalThenNullableNull.passed).toBe(true)
    expect(optionalThenNullableNull.value).toBeNull()

    const optionalThenNullableUndefined = await optionalThenNullable.safeParse(undefined)
    expect(optionalThenNullableUndefined.passed).toBe(false)

    const nullableThenOptionalUndefined = await nullableThenOptional.safeParse(undefined)
    expect(nullableThenOptionalUndefined.passed).toBe(true)
    expect(nullableThenOptionalUndefined.value).toBeUndefined()

    const nullableThenOptionalNull = await nullableThenOptional.safeParse(null)
    expect(nullableThenOptionalNull.passed).toBe(false)
  })

  it('supports boolean true literal', async () => {
    const schema = literal(true)

    await expect(schema.parse(true)).resolves.toBe(true)

    const miss = await schema.safeParse(false)
    expect(miss.passed).toBe(false)
  })

  it('supports boolean false literal', async () => {
    const schema = literal(false)

    await expect(schema.parse(false)).resolves.toBe(false)

    const miss = await schema.safeParse(true)
    expect(miss.passed).toBe(false)
  })

  it('supports boolean literals with optional modifier', async () => {
    const schema = literal(true).optional()

    const hit = await schema.safeParse(true)
    expect(hit.passed).toBe(true)
    expect(hit.value).toBe(true)

    const optionalResult = await schema.safeParse(undefined)
    expect(optionalResult.passed).toBe(true)
    expect(optionalResult.value).toBeUndefined()

    const miss = await schema.safeParse(false)
    expect(miss.passed).toBe(false)
  })

  it('supports boolean literals with default modifier', async () => {
    const schema = literal(true).default(true)

    await expect(schema.parse(true)).resolves.toBe(true)
    await expect(schema.parse(undefined)).resolves.toBe(true)
    await expect(schema.parse(null)).resolves.toBe(true)
  })
})
