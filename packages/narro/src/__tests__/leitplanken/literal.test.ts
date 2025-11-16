import { describe, expect, it } from 'vitest'

import { literal } from '../../index'

describe('literal schema', () => {
  it('accepts matching string literal', async () => {
    const schema = literal('narro')

    await expect(schema.parse('narro')).resolves.toBe('narro')
  })

  it('rejects non matching values', async () => {
    const schema = literal('narro')
    const report = await schema.safeParse('other')

    expect(report.success).toBe(false)
    expect('data' in report).toBe(false)
  })

  it('supports number literals', async () => {
    const schema = literal(42)

    await expect(schema.parse(42)).resolves.toBe(42)

    const miss = await schema.safeParse(7)
    expect(miss.success).toBe(false)
  })

  it('supports optional modifier', async () => {
    const schema = literal('optional').optional()

    const hit = await schema.safeParse('optional')
    expect(hit.success).toBe(true)
    expect(hit.data).toBe('optional')

    const optionalResult = await schema.safeParse(undefined)
    expect(optionalResult.success).toBe(true)
    expect(optionalResult.data).toBeUndefined()

    const nullResult = await schema.safeParse(null)
    expect(nullResult.success).toBe(false)
  })

  it('supports exactOptional modifier', async () => {
    const schema = literal('exact').exactOptional()

    const undefinedResult = await schema.safeParse(undefined)
    expect(undefinedResult.success).toBe(true)
    expect(undefinedResult.data).toBeUndefined()

    const definedResult = await schema.safeParse('exact')
    expect(definedResult.success).toBe(true)
    expect(definedResult.data).toBe('exact')
  })

  it('supports undefinable modifier', async () => {
    const schema = literal('maybe').undefinable()

    const undefinedResult = await schema.safeParse(undefined)
    expect(undefinedResult.success).toBe(true)
    expect(undefinedResult.data).toBeUndefined()

    const definedResult = await schema.safeParse('maybe')
    expect(definedResult.success).toBe(true)
    expect(definedResult.data).toBe('maybe')
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
    expect(nullResult.success).toBe(true)
    expect(nullResult.data).toBeNull()

    const undefinedResult = await schema.safeParse(undefined)
    expect(undefinedResult.success).toBe(false)
  })

  it('supports nullish modifier for numbers', async () => {
    const schema = literal(5).nullish()

    const undefinedResult = await schema.safeParse(undefined)
    expect(undefinedResult.success).toBe(true)
    expect(undefinedResult.data).toBeUndefined()

    const nullResult = await schema.safeParse(null)
    expect(nullResult.success).toBe(true)
    expect(nullResult.data).toBeNull()

    const miss = await schema.safeParse(6)
    expect(miss.success).toBe(false)
  })

  it('applies required after optional', async () => {
    const schema = literal('value').optional().required()

    const report = await schema.safeParse(undefined)
    expect(report.success).toBe(false)
  })

  it('uses last optionality modifier wins semantics', async () => {
    const optionalThenNullable = literal('x').optional().nullable()
    const nullableThenOptional = literal('x').nullable().optional()

    const optionalThenNullableNull = await optionalThenNullable.safeParse(null)
    expect(optionalThenNullableNull.success).toBe(true)
    expect(optionalThenNullableNull.data).toBeNull()

    const optionalThenNullableUndefined = await optionalThenNullable.safeParse(undefined)
    expect(optionalThenNullableUndefined.success).toBe(false)

    const nullableThenOptionalUndefined = await nullableThenOptional.safeParse(undefined)
    expect(nullableThenOptionalUndefined.success).toBe(true)
    expect(nullableThenOptionalUndefined.data).toBeUndefined()

    const nullableThenOptionalNull = await nullableThenOptional.safeParse(null)
    expect(nullableThenOptionalNull.success).toBe(false)
  })

  it('supports boolean true literal', async () => {
    const schema = literal(true)

    await expect(schema.parse(true)).resolves.toBe(true)

    const miss = await schema.safeParse(false)
    expect(miss.success).toBe(false)
  })

  it('supports boolean false literal', async () => {
    const schema = literal(false)

    await expect(schema.parse(false)).resolves.toBe(false)

    const miss = await schema.safeParse(true)
    expect(miss.success).toBe(false)
  })

  it('supports boolean literals with optional modifier', async () => {
    const schema = literal(true).optional()

    const hit = await schema.safeParse(true)
    expect(hit.success).toBe(true)
    expect(hit.data).toBe(true)

    const optionalResult = await schema.safeParse(undefined)
    expect(optionalResult.success).toBe(true)
    expect(optionalResult.data).toBeUndefined()

    const miss = await schema.safeParse(false)
    expect(miss.success).toBe(false)
  })

  it('supports boolean literals with default modifier', async () => {
    const schema = literal(true).default(true)

    await expect(schema.parse(true)).resolves.toBe(true)
    await expect(schema.parse(undefined)).resolves.toBe(true)
    await expect(schema.parse(null)).resolves.toBe(true)
  })

  it('supports nullish modifier for strings', async () => {
    const schema = literal('nullish').nullish()

    const undefinedResult = await schema.safeParse(undefined)
    expect(undefinedResult.success).toBe(true)
    expect(undefinedResult.data).toBeUndefined()

    const nullResult = await schema.safeParse(null)
    expect(nullResult.success).toBe(true)
    expect(nullResult.data).toBeNull()
  })
})
