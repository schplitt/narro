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

    expect(report.passed).toBe(false)
    expect('value' in report).toBe(false)
  })

  it('supports numeric enums', async () => {
    const schema = enumSchema([1, 2, 3])

    await expect(schema.parse(2)).resolves.toBe(2)

    const miss = await schema.safeParse(4)
    expect(miss.passed).toBe(false)
  })

  it('supports optional modifier', async () => {
    const schema = enumSchema(['optional', 'other']).optional()

    const hit = await schema.safeParse('optional')
    expect(hit.passed).toBe(true)
    expect(hit.value).toBe('optional')

    const optionalReport = await schema.safeParse(undefined)
    expect(optionalReport.passed).toBe(true)
    expect(optionalReport.value).toBeUndefined()

    const nullReport = await schema.safeParse(null)
    expect(nullReport.passed).toBe(false)
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
    expect(nullReport.passed).toBe(true)
    expect(nullReport.value).toBeNull()

    const undefinedReport = await schema.safeParse(undefined)
    expect(undefinedReport.passed).toBe(false)
  })

  it('supports nullish modifier', async () => {
    const schema = enumSchema([1, 2]).nullish()

    const undefinedReport = await schema.safeParse(undefined)
    expect(undefinedReport.passed).toBe(true)
    expect(undefinedReport.value).toBeUndefined()

    const nullReport = await schema.safeParse(null)
    expect(nullReport.passed).toBe(true)
    expect(nullReport.value).toBeNull()
  })

  it('applies required after optional', async () => {
    const schema = enumSchema(['value']).optional().required()

    const report = await schema.safeParse(undefined)
    expect(report.passed).toBe(false)
  })

  it('uses last optionality modifier wins semantics', async () => {
    const optionalThenNullable = enumSchema(['x', 'y']).optional().nullable()
    const nullableThenOptional = enumSchema(['x', 'y']).nullable().optional()

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

  it('supports boolean enum', async () => {
    const schema = enumSchema([true, false])

    await expect(schema.parse(true)).resolves.toBe(true)
    await expect(schema.parse(false)).resolves.toBe(false)

    const miss = await schema.safeParse('true')
    expect(miss.passed).toBe(false)
  })

  it('supports boolean enum with optional modifier', async () => {
    const schema = enumSchema([true, false]).optional()

    const hit = await schema.safeParse(true)
    expect(hit.passed).toBe(true)
    expect(hit.value).toBe(true)

    const optionalReport = await schema.safeParse(undefined)
    expect(optionalReport.passed).toBe(true)
    expect(optionalReport.value).toBeUndefined()
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
    expect(miss.passed).toBe(false)
  })
})
