import { describe, expect, it } from 'vitest'

import { boolean, parse, safeParse } from '../../index'

describe('boolean schema', () => {
  it('accepts boolean values', async () => {
    const schema = boolean()

    await expect(parse(schema, true)).resolves.toBe(true)
    await expect(parse(schema, false)).resolves.toBe(false)
  })

  it('rejects non-boolean values', async () => {
    const schema = boolean()
    const report = await safeParse(schema, 'not-boolean')

    expect(report.passed).toBe(false)
    expect('value' in report).toBe(false)
  })

  it('supports optional modifier', async () => {
    const schema = boolean().optional()

    const hit = await safeParse(schema, true)
    expect(hit.passed).toBe(true)
    expect(hit.value).toBe(true)

    const optionalReport = await safeParse(schema, undefined)
    expect(optionalReport.passed).toBe(true)
    expect(optionalReport.value).toBeUndefined()

    const nullReport = await safeParse(schema, null)
    expect(nullReport.passed).toBe(false)
  })

  it('supports exactOptional modifier', async () => {
    const schema = boolean().exactOptional()

    const report = await safeParse(schema, undefined)
    expect(report.passed).toBe(true)
    if (report.passed) {
      expect(report.value).toBeUndefined()
    }
  })

  it('supports undefinable modifier', async () => {
    const schema = boolean().undefinable()

    const undefReport = await safeParse(schema, undefined)
    expect(undefReport.passed).toBe(true)
    expect(undefReport.value).toBeUndefined()

    const nullReport = await safeParse(schema, null)
    expect(nullReport.passed).toBe(false)
  })

  it('supports nullable modifier', async () => {
    const schema = boolean().nullable()

    const nullReport = await safeParse(schema, null)
    expect(nullReport.passed).toBe(true)
    expect(nullReport.value).toBeNull()

    const undefinedReport = await safeParse(schema, undefined)
    expect(undefinedReport.passed).toBe(false)
  })

  it('supports nullish modifier', async () => {
    const schema = boolean().nullish()

    const undefinedReport = await safeParse(schema, undefined)
    expect(undefinedReport.passed).toBe(true)
    expect(undefinedReport.value).toBeUndefined()

    const nullReport = await safeParse(schema, null)
    expect(nullReport.passed).toBe(true)
    expect(nullReport.value).toBeNull()
  })

  it('supports default modifier', async () => {
    const schema = boolean().default(true)

    await expect(parse(schema, undefined)).resolves.toBe(true)
    await expect(parse(schema, null)).resolves.toBe(true)
    await expect(parse(schema, false)).resolves.toBe(false)
  })

  it('applies required after optional', async () => {
    const schema = boolean().optional().required()

    const report = await safeParse(schema, undefined)
    expect(report.passed).toBe(false)
  })

  it('uses last optionality modifier wins semantics', async () => {
    const optionalThenNullable = boolean().optional().nullable()
    const nullableThenOptional = boolean().nullable().optional()

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
