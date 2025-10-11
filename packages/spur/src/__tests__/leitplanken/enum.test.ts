import { describe, expect, it } from 'vitest'

import { enum as enumSchema } from '../../index'

describe('enum schema', () => {
  it('accepts configured string values', async () => {
    const schema = enumSchema(['red', 'green', 'blue'])

    await expect(schema.parse('red')).resolves.toBe('red')
    await expect(schema.parse('blue')).resolves.toBe('blue')
  })

  it('rejects values outside enumeration', async () => {
    const schema = enumSchema(['one', 'two'])
    const report = await schema.safeParse('three')

    expect(report.success).toBe(false)
    expect('data' in report).toBe(false)
  })

  it('supports numeric enums', async () => {
    const schema = enumSchema([1, 2, 3])

    await expect(schema.parse(2)).resolves.toBe(2)

    const miss = await schema.safeParse(4)
    expect(miss.success).toBe(false)
  })

  it('supports optional modifier', async () => {
    const schema = enumSchema(['optional', 'other']).optional()

    const hit = await schema.safeParse('optional')
    expect(hit.success).toBe(true)
    expect(hit.data).toBe('optional')

    const optionalReport = await schema.safeParse(undefined)
    expect(optionalReport.success).toBe(true)
    expect(optionalReport.data).toBeUndefined()

    const nullReport = await schema.safeParse(null)
    expect(nullReport.success).toBe(false)
  })

  it('supports exactOptional modifier', async () => {
    const schema = enumSchema(['exact', 'other']).exactOptional()

    const undefinedReport = await schema.safeParse(undefined)
    expect(undefinedReport.success).toBe(true)
    expect(undefinedReport.data).toBeUndefined()

    const definedReport = await schema.safeParse('exact')
    expect(definedReport.success).toBe(true)
    expect(definedReport.data).toBe('exact')
  })

  it('supports undefinable modifier', async () => {
    const schema = enumSchema(['undef', 'other']).undefinable()

    const undefinedReport = await schema.safeParse(undefined)
    expect(undefinedReport.success).toBe(true)
    expect(undefinedReport.data).toBeUndefined()

    const definedReport = await schema.safeParse('undef')
    expect(definedReport.success).toBe(true)
    expect(definedReport.data).toBe('undef')
  })

  it('supports default modifier', async () => {
    const schema = enumSchema(['fallback', 'value']).default('fallback')

    await expect(schema.parse(undefined)).resolves.toBe('fallback')
    await expect(schema.parse(null)).resolves.toBe('fallback')
    await expect(schema.parse('value')).resolves.toBe('value')
  })

  it('supports nullable modifier', async () => {
    const schema = enumSchema(['nullable']).nullable()

    const nullReport = await schema.safeParse(null)
    expect(nullReport.success).toBe(true)
    expect(nullReport.data).toBeNull()

    const undefinedReport = await schema.safeParse(undefined)
    expect(undefinedReport.success).toBe(false)
  })

  it('supports nullish modifier', async () => {
    const schema = enumSchema([1, 2]).nullish()

    const undefinedReport = await schema.safeParse(undefined)
    expect(undefinedReport.success).toBe(true)
    expect(undefinedReport.data).toBeUndefined()

    const nullReport = await schema.safeParse(null)
    expect(nullReport.success).toBe(true)
    expect(nullReport.data).toBeNull()
  })

  it('applies required after optional', async () => {
    const schema = enumSchema(['value']).optional().required()

    const report = await schema.safeParse(undefined)
    expect(report.success).toBe(false)
  })

  it('uses last optionality modifier wins semantics', async () => {
    const optionalThenNullable = enumSchema(['x', 'y']).optional().nullable()
    const nullableThenOptional = enumSchema(['x', 'y']).nullable().optional()

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

  it('supports boolean enum', async () => {
    const schema = enumSchema([true, false])

    await expect(schema.parse(true)).resolves.toBe(true)
    await expect(schema.parse(false)).resolves.toBe(false)

    const miss = await schema.safeParse('true')
    expect(miss.success).toBe(false)
  })

  it('supports boolean enum with optional modifier', async () => {
    const schema = enumSchema([true, false]).optional()

    const hit = await schema.safeParse(true)
    expect(hit.success).toBe(true)
    expect(hit.data).toBe(true)

    const optionalReport = await schema.safeParse(undefined)
    expect(optionalReport.success).toBe(true)
    expect(optionalReport.data).toBeUndefined()
  })

  it('supports boolean enum with default modifier', async () => {
    const schema = enumSchema([true, false]).default(false)

    await expect(schema.parse(undefined)).resolves.toBe(false)
    await expect(schema.parse(null)).resolves.toBe(false)
    await expect(schema.parse(true)).resolves.toBe(true)
  })

  it('supports mixed enum with booleans', async () => {
    const schema = enumSchema(['yes', 'no', true, false])

    await expect(schema.parse('yes')).resolves.toBe('yes')
    await expect(schema.parse(true)).resolves.toBe(true)
    await expect(schema.parse(false)).resolves.toBe(false)

    const miss = await schema.safeParse('true')
    expect(miss.success).toBe(false)
  })
})
