import { describe, expect, it } from 'vitest'

import { enum as enumSchema, parse, safeParse } from '../../index'

describe('enum schema', () => {
  it('accepts configured string values', async () => {
    const schema = enumSchema(['red', 'green', 'blue'])

    await expect(parse(schema, 'red')).resolves.toBe('red')
    await expect(parse(schema, 'blue')).resolves.toBe('blue')
  })

  it('rejects values outside enumeration', async () => {
    const schema = enumSchema(['one', 'two'])
    const report = await safeParse(schema, 'three')

    expect(report.passed).toBe(false)
    expect('value' in report).toBe(false)
  })

  it('supports numeric enums', async () => {
    const schema = enumSchema([1, 2, 3])

    await expect(parse(schema, 2)).resolves.toBe(2)

    const miss = await safeParse(schema, 4)
    expect(miss.passed).toBe(false)
  })

  it('supports optional modifier', async () => {
    const schema = enumSchema(['optional', 'other']).optional()

    const hit = await safeParse(schema, 'optional')
    expect(hit.passed).toBe(true)
    expect(hit.value).toBe('optional')

    const optionalReport = await safeParse(schema, undefined)
    expect(optionalReport.passed).toBe(true)
    expect(optionalReport.value).toBeUndefined()

    const nullReport = await safeParse(schema, null)
    expect(nullReport.passed).toBe(false)
  })

  it('supports default modifier', async () => {
    const schema = enumSchema(['fallback', 'value']).default('fallback')

    await expect(parse(schema, undefined)).resolves.toBe('fallback')
    await expect(parse(schema, null)).resolves.toBe('fallback')
    await expect(parse(schema, 'value')).resolves.toBe('value')
  })

  it('supports nullable modifier', async () => {
    const schema = enumSchema(['nullable']).nullable()

    const nullReport = await safeParse(schema, null)
    expect(nullReport.passed).toBe(true)
    expect(nullReport.value).toBeNull()

    const undefinedReport = await safeParse(schema, undefined)
    expect(undefinedReport.passed).toBe(false)
  })

  it('supports nullish modifier', async () => {
    const schema = enumSchema([1, 2]).nullish()

    const undefinedReport = await safeParse(schema, undefined)
    expect(undefinedReport.passed).toBe(true)
    expect(undefinedReport.value).toBeUndefined()

    const nullReport = await safeParse(schema, null)
    expect(nullReport.passed).toBe(true)
    expect(nullReport.value).toBeNull()
  })

  it('applies required after optional', async () => {
    const schema = enumSchema(['value']).optional().required()

    const report = await safeParse(schema, undefined)
    expect(report.passed).toBe(false)
  })

  it('uses last optionality modifier wins semantics', async () => {
    const optionalThenNullable = enumSchema(['x', 'y']).optional().nullable()
    const nullableThenOptional = enumSchema(['x', 'y']).nullable().optional()

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
