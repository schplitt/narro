import { describe, expect, it } from 'vitest'

import { number, string, union } from '../../index'
import { array } from '../../leitplanken/array'
import { object } from '../../leitplanken/object'

describe('union schema', () => {
  it('accepts values from any branch', async () => {
    const schema = union([number(), string()])

    await expect(schema.parse(42)).resolves.toBe(42)
    await expect(schema.parse('spur')).resolves.toBe('spur')
  })

  it('rejects values outside all branches', async () => {
    const schema = union([number(), string()])

    const report = await schema.safeParse(true)

    expect(report.success).toBe(false)
    expect('data' in report).toBe(false)
  })

  it('supports optional modifier', async () => {
    const schema = union([number(), string()]).optional()

    const definedReport = await schema.safeParse('ok')
    expect(definedReport.success).toBe(true)
    expect(definedReport.data).toBe('ok')

    const optionalReport = await schema.safeParse(undefined)
    expect(optionalReport.success).toBe(true)
    expect(optionalReport.data).toBeUndefined()

    const nullReport = await schema.safeParse(null)
    expect(nullReport.success).toBe(false)
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

  describe('union optionality modifiers', () => {
    it('supports exactOptional modifier', async () => {
      const schema = union([number(), string()]).exactOptional()

      const report = await schema.safeParse(undefined)
      expect(report.success).toBe(true)
      expect(report.data).toBeUndefined()
    })

    it('supports undefinable modifier', async () => {
      const schema = union([number(), string()]).undefinable()

      const undefinedReport = await schema.safeParse(undefined)
      expect(undefinedReport.success).toBe(true)
      expect(undefinedReport.data).toBeUndefined()

      const definedReport = await schema.safeParse('spur')
      expect(definedReport.success).toBe(true)
      expect(definedReport.data).toBe('spur')
    })

    it('supports nullable modifier', async () => {
      const schema = union([number(), string()]).nullable()

      const nullReport = await schema.safeParse(null)
      expect(nullReport.success).toBe(true)
      expect(nullReport.data).toBeNull()

      const undefinedReport = await schema.safeParse(undefined)
      expect(undefinedReport.success).toBe(false)
    })

    it('supports nullish modifier', async () => {
      const schema = union([number(), string()]).nullish()

      const undefinedReport = await schema.safeParse(undefined)
      expect(undefinedReport.success).toBe(true)
      expect(undefinedReport.data).toBeUndefined()

      const nullReport = await schema.safeParse(null)
      expect(nullReport.success).toBe(true)
      expect(nullReport.data).toBeNull()
    })

    it('applies required after optional', async () => {
      const schema = union([number(), string()]).optional().required()

      const report = await schema.safeParse(undefined)
      expect(report.success).toBe(false)
    })
  })

  it('supports unions mixing objects and arrays', async () => {
    const schema = union([
      object({ id: string() }),
      array(number()),
    ])

    await expect(schema.parse({ id: 'item-1' })).resolves.toEqual({ id: 'item-1' })
    await expect(schema.parse([1, 2, 3])).resolves.toEqual([1, 2, 3])

    const miss = await schema.safeParse(true)
    expect(miss.success).toBe(false)
  })
})
