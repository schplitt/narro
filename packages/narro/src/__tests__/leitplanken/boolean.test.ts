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

    expect(report.success).toBe(false)
    expect('data' in report).toBe(false)
  })

  it('supports optional modifier', async () => {
    const schema = boolean().optional()

    const hit = await schema.safeParse(true)
    expect(hit.success).toBe(true)
    expect(hit.data).toBe(true)

    const optionalReport = await schema.safeParse(undefined)
    expect(optionalReport.success).toBe(true)
    expect(optionalReport.data).toBeUndefined()

    const nullReport = await schema.safeParse(null)
    expect(nullReport.success).toBe(false)
  })

  it('supports exactOptional modifier', async () => {
    const schema = boolean().exactOptional()

    const report = await schema.safeParse(undefined)
    expect(report.success).toBe(true)
    if (report.success) {
      expect(report.data).toBeUndefined()
    }
  })

  it('supports undefinable modifier', async () => {
    const schema = boolean().undefinable()

    const undefReport = await schema.safeParse(undefined)
    expect(undefReport.success).toBe(true)
    expect(undefReport.data).toBeUndefined()

    const nullReport = await schema.safeParse(null)
    expect(nullReport.success).toBe(false)
  })

  it('supports nullable modifier', async () => {
    const schema = boolean().nullable()

    const nullReport = await schema.safeParse(null)
    expect(nullReport.success).toBe(true)
    expect(nullReport.data).toBeNull()

    const undefinedReport = await schema.safeParse(undefined)
    expect(undefinedReport.success).toBe(false)
  })

  it('supports nullish modifier', async () => {
    const schema = boolean().nullish()

    const undefinedReport = await schema.safeParse(undefined)
    expect(undefinedReport.success).toBe(true)
    expect(undefinedReport.data).toBeUndefined()

    const nullReport = await schema.safeParse(null)
    expect(nullReport.success).toBe(true)
    expect(nullReport.data).toBeNull()
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
    expect(report.success).toBe(false)
  })

  it('uses last optionality modifier wins semantics', async () => {
    const optionalThenNullable = boolean().optional().nullable()
    const nullableThenOptional = boolean().nullable().optional()

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
})
