import { describe, expect, it } from 'vitest'

import { boolean } from '../../index'

describe('boolean schema', () => {
  it('accepts boolean values', async () => {
    const schema = boolean()

    await expect(schema.parse(true)).resolves.toBe(true)
    await expect(schema.parse(false)).resolves.toBe(false)
  })

  it('rejects non-boolean values', async () => {
    const schema = boolean()
    const report = await schema.safeParse('not-boolean')

    expect(report.passed).toBe(false)
    expect('value' in report).toBe(false)
  })

  it('supports optional modifier', async () => {
    const schema = boolean().optional()

    const hit = await schema.safeParse(true)
    expect(hit.passed).toBe(true)
    expect(hit.value).toBe(true)

    const optionalReport = await schema.safeParse(undefined)
    expect(optionalReport.passed).toBe(true)
    expect(optionalReport.value).toBeUndefined()

    const nullReport = await schema.safeParse(null)
    expect(nullReport.passed).toBe(false)
  })

  it('supports exactOptional modifier', async () => {
    const schema = boolean().exactOptional()

    const report = await schema.safeParse(undefined)
    expect(report.passed).toBe(true)
    if (report.passed) {
      expect(report.value).toBeUndefined()
    }
  })

  it('supports undefinable modifier', async () => {
    const schema = boolean().undefinable()

    const undefReport = await schema.safeParse(undefined)
    expect(undefReport.passed).toBe(true)
    expect(undefReport.value).toBeUndefined()

    const nullReport = await schema.safeParse(null)
    expect(nullReport.passed).toBe(false)
  })

  it('supports nullable modifier', async () => {
    const schema = boolean().nullable()

    const nullReport = await schema.safeParse(null)
    expect(nullReport.passed).toBe(true)
    expect(nullReport.value).toBeNull()

    const undefinedReport = await schema.safeParse(undefined)
    expect(undefinedReport.passed).toBe(false)
  })

  it('supports nullish modifier', async () => {
    const schema = boolean().nullish()

    const undefinedReport = await schema.safeParse(undefined)
    expect(undefinedReport.passed).toBe(true)
    expect(undefinedReport.value).toBeUndefined()

    const nullReport = await schema.safeParse(null)
    expect(nullReport.passed).toBe(true)
    expect(nullReport.value).toBeNull()
  })

  it('supports default modifier', async () => {
    const schema = boolean().default(true)

    await expect(schema.parse(undefined)).resolves.toBe(true)
    await expect(schema.parse(null)).resolves.toBe(true)
    await expect(schema.parse(false)).resolves.toBe(false)
  })

  it('applies required after optional', async () => {
    const schema = boolean().optional().required()

    const report = await schema.safeParse(undefined)
    expect(report.passed).toBe(false)
  })

  it('uses last optionality modifier wins semantics', async () => {
    const optionalThenNullable = boolean().optional().nullable()
    const nullableThenOptional = boolean().nullable().optional()

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
})
