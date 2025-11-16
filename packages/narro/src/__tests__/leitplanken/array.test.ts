import { describe, expect, it } from 'vitest'

import { array } from '../../schemas/array'
import { number } from '../../schemas/number'
import { object } from '../../schemas/object'
import { string } from '../../schemas/string'

describe('array schema', () => {
  it('parses arrays when every element matches the child schema', async () => {
    const schema = array(string().minLength(2))

    await expect(schema.parse(['hi', 'there'])).resolves.toEqual(['hi', 'there'])
  })

  it('fails when at least one element violates the child schema', async () => {
    const schema = array(number().min(0))

    const report = await schema.safeParse([1, -1])

    expect(report.success).toBe(false)
  })

  it('supports optional modifier on the array schema', async () => {
    const schema = array(string()).optional()

    const report = await schema.safeParse(undefined)
    expect(report.success).toBe(true)
    expect(report.data).toBeUndefined()
  })

  it('enforces array-level minLength constraint', async () => {
    const schema = array(string()).minLength(2)

    const report = await schema.safeParse(['only-one'])
    expect(report.success).toBe(false)
  })

  it('enforces array-level maxLength constraint', async () => {
    const schema = array(string()).maxLength(2)

    const report = await schema.safeParse(['a', 'b', 'c'])
    expect(report.success).toBe(false)
  })

  it('enforces exact array length', async () => {
    const schema = array(string()).length(2)

    await expect(schema.parse(['one', 'two'])).resolves.toEqual(['one', 'two'])

    const miss = await schema.safeParse(['one'])
    expect(miss.success).toBe(false)
  })

  it('allows transforming the parsed array result', async () => {
    const schema = array(number()).transform(values => values.reduce((total, value) => total + value, 0))

    await expect(schema.parse([1, 2, 3])).resolves.toBe(6)
  })

  describe('array optionality modifiers', () => {
    it('supports exactOptional modifier', async () => {
      const schema = array(string()).exactOptional()

      const report = await schema.safeParse(undefined)
      expect(report.success).toBe(true)
      expect(report.data).toBeUndefined()
    })

    it('supports undefinable modifier', async () => {
      const schema = array(string()).undefinable()

      const undefinedReport = await schema.safeParse(undefined)
      expect(undefinedReport.success).toBe(true)
      expect(undefinedReport.data).toBeUndefined()

      const definedReport = await schema.safeParse(['narro'])
      expect(definedReport.success).toBe(true)
      expect(definedReport.data).toEqual(['narro'])
    })

    it('supports nullable modifier', async () => {
      const schema = array(string()).nullable()

      const nullReport = await schema.safeParse(null)
      expect(nullReport.success).toBe(true)
      expect(nullReport.data).toBeNull()

      const undefinedReport = await schema.safeParse(undefined)
      expect(undefinedReport.success).toBe(false)
    })

    it('supports nullish modifier', async () => {
      const schema = array(string()).nullish()

      const undefinedReport = await schema.safeParse(undefined)
      expect(undefinedReport.success).toBe(true)
      expect(undefinedReport.data).toBeUndefined()

      const nullReport = await schema.safeParse(null)
      expect(nullReport.success).toBe(true)
      expect(nullReport.data).toBeNull()
    })

    it('supports default modifier', async () => {
      const schema = array(number()).default([1, 2])

      await expect(schema.parse(undefined)).resolves.toEqual([1, 2])
      await expect(schema.parse(null)).resolves.toEqual([1, 2])
      await expect(schema.parse([3])).resolves.toEqual([3])
    })

    it('applies required after optional', async () => {
      const schema = array(string()).optional().required()

      const report = await schema.safeParse(undefined)
      expect(report.success).toBe(false)
    })
  })

  it('supports arrays of nested object schemas', async () => {
    const schema = array(object({
      id: string(),
      tags: array(string()).optional(),
    }))

    const result = await schema.safeParse([
      { id: 'user-1', tags: ['admin'] },
      { id: 'user-2' },
    ])

    expect(result.success).toBe(true)
    expect(result.data).toEqual([
      { id: 'user-1', tags: ['admin'] },
      { id: 'user-2' },
    ])
  })
})
