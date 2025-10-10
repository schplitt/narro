import { describe, expect, it } from 'vitest'

import { number, string, union } from '../../index'

describe('union schema', () => {
  it('accepts values from any branch', async () => {
    const schema = union([number(), string()])

    await expect(schema.parse(42)).resolves.toBe(42)
    await expect(schema.parse('spur')).resolves.toBe('spur')
  })

  it('rejects values outside all branches', async () => {
    const schema = union([number(), string()])

    const report = await schema.safeParse(true)

    expect(report.passed).toBe(false)
    expect('value' in report).toBe(false)
  })

  it('supports optional modifier', async () => {
    const schema = union([number(), string()]).optional()

    const definedReport = await schema.safeParse('ok')
    expect(definedReport.passed).toBe(true)
    expect(definedReport.value).toBe('ok')

    const optionalReport = await schema.safeParse(undefined)
    expect(optionalReport.passed).toBe(true)
    expect(optionalReport.value).toBeUndefined()

    const nullReport = await schema.safeParse(null)
    expect(nullReport.passed).toBe(false)
  })

  it('supports default modifier', async () => {
    const schema = union([number(), string()]).default('fallback')

    await expect(schema.parse(undefined)).resolves.toBe('fallback')
    await expect(schema.parse(null)).resolves.toBe('fallback')
    await expect(schema.parse(7)).resolves.toBe(7)
  })

  it('supports transform', async () => {
    const schema = union([number(), string()]).transform((value) => {
      return typeof value === 'number' ? value * 2 : value.toUpperCase()
    })

    await expect(schema.parse(5)).resolves.toBe(10)
    await expect(schema.parse('spur')).resolves.toBe('SPUR')
  })
})
