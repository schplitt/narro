import { describe, expect, it } from 'vitest'

import { literal, parse, safeParse } from '../../index'

describe('literal schema', () => {
  it('accepts matching string literal', async () => {
    const schema = literal('spur')

    await expect(parse(schema, 'spur')).resolves.toBe('spur')
  })

  it('rejects non matching values', async () => {
    const schema = literal('spur')
    const report = await safeParse(schema, 'other')

    expect(report.passed).toBe(false)
    expect('value' in report).toBe(false)
  })

  it('supports number literals', async () => {
    const schema = literal(42)

    await expect(parse(schema, 42)).resolves.toBe(42)

    const miss = await safeParse(schema, 7)
    expect(miss.passed).toBe(false)
  })

  it('supports optional modifier', async () => {
    const schema = literal('optional').optional()

    const hit = await safeParse(schema, 'optional')
    expect(hit.passed).toBe(true)
    expect(hit.value).toBe('optional')

    const optionalResult = await safeParse(schema, undefined)
    expect(optionalResult.passed).toBe(true)
    expect(optionalResult.value).toBeUndefined()

    const nullResult = await safeParse(schema, null)
    expect(nullResult.passed).toBe(false)
  })

  it('supports default modifier', async () => {
    const schema = literal('fallback').default('fallback')

    await expect(parse(schema, 'fallback')).resolves.toBe('fallback')
    await expect(parse(schema, undefined)).resolves.toBe('fallback')
    await expect(parse(schema, null)).resolves.toBe('fallback')
  })

  it('supports nullable modifier', async () => {
    const schema = literal('nullable').nullable()

    const nullResult = await safeParse(schema, null)
    expect(nullResult.passed).toBe(true)
    expect(nullResult.value).toBeNull()

    const undefinedResult = await safeParse(schema, undefined)
    expect(undefinedResult.passed).toBe(false)
  })

  it('supports nullish modifier for numbers', async () => {
    const schema = literal(5).nullish()

    const undefinedResult = await safeParse(schema, undefined)
    expect(undefinedResult.passed).toBe(true)
    expect(undefinedResult.value).toBeUndefined()

    const nullResult = await safeParse(schema, null)
    expect(nullResult.passed).toBe(true)
    expect(nullResult.value).toBeNull()

    const miss = await safeParse(schema, 6)
    expect(miss.passed).toBe(false)
  })

  it('applies required after optional', async () => {
    const schema = literal('value').optional().required()

    const report = await safeParse(schema, undefined)
    expect(report.passed).toBe(false)
  })

  it('uses last optionality modifier wins semantics', async () => {
    const optionalThenNullable = literal('x').optional().nullable()
    const nullableThenOptional = literal('x').nullable().optional()

    const optionalThenNullableNull = await safeParse(optionalThenNullable, null)
    expect(optionalThenNullableNull.passed).toBe(true)
    expect(optionalThenNullableNull.value).toBeNull()

    const optionalThenNullableUndefined = await safeParse(optionalThenNullable, undefined)
    expect(optionalThenNullableUndefined.passed).toBe(false)

    const nullableThenOptionalUndefined = await safeParse(nullableThenOptional, undefined)
    expect(nullableThenOptionalUndefined.passed).toBe(true)
    expect(nullableThenOptionalUndefined.value).toBeUndefined()

    const nullableThenOptionalNull = await safeParse(nullableThenOptional, null)
    expect(nullableThenOptionalNull.passed).toBe(false)
  })
})
