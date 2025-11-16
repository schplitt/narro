import { describe, expect, it } from 'vitest'

import { string } from '../../index'

describe('string schema', () => {
  it('accepts strings that satisfy length constraints', async () => {
    const schema = string().minLength(2).maxLength(5)

    const value = await schema.parse('narro')

    expect(value).toBe('narro')
  })

  it('rejects strings that are too short', async () => {
    const schema = string().minLength(3)
    const report = await schema.safeParse('hi')

    expect(report.success).toBe(false)
    expect('data' in report).toBe(false)
  })

  it('rejects strings that exceed maxLength', async () => {
    const schema = string().maxLength(3)
    const report = await schema.safeParse('longer')

    expect(report.success).toBe(false)
    expect('data' in report).toBe(false)
  })

  it('enforces exact length constraint', async () => {
    const schema = string().length(4)

    await expect(schema.parse('code')).resolves.toBe('code')

    const report = await schema.safeParse('tool')
    expect(report.success).toBe(true)

    const miss = await schema.safeParse('hi')
    expect(miss.success).toBe(false)
  })

  it('validates startsWith constraint', async () => {
    const schema = string().startsWith('narro')

    await expect(schema.parse('narro-app')).resolves.toBe('narro-app')

    const report = await schema.safeParse('app-narro')
    expect(report.success).toBe(false)
  })

  it('validates endsWith constraint', async () => {
    const schema = string().endsWith('-schema')

    await expect(schema.parse('object-schema')).resolves.toBe('object-schema')

    const report = await schema.safeParse('schema-object')
    expect(report.success).toBe(false)
  })

  it('rejects non-string inputs', async () => {
    const schema = string()
    const report = await schema.safeParse(42)

    expect(report.success).toBe(false)
    expect('data' in report).toBe(false)
  })

  it('supports optional modifier', async () => {
    const schema = string().optional()

    const definedResult = await schema.safeParse('text')
    expect(definedResult.success).toBe(true)
    if (definedResult.success) {
      expect(definedResult.data).toBe('text')
    }

    const optionalResult = await schema.safeParse(undefined)
    expect(optionalResult.success).toBe(true)
    if (optionalResult.success) {
      expect(optionalResult.data).toBeUndefined()
    }
  })

  it('supports exactOptional modifier', async () => {
    const schema = string().exactOptional()

    const exactOptionalResult = await schema.safeParse(undefined)
    expect(exactOptionalResult.success).toBe(true)
    if (exactOptionalResult.success) {
      expect(exactOptionalResult.data).toBeUndefined()
    }
  })

  it('supports undefinable modifier', async () => {
    const schema = string().undefinable()

    const undefinedResult = await schema.safeParse(undefined)
    expect(undefinedResult.success).toBe(true)
    if (undefinedResult.success) {
      expect(undefinedResult.data).toBeUndefined()
    }

    const nullResult = await schema.safeParse(null)
    expect(nullResult.success).toBe(false)
  })

  it('supports nullable modifier', async () => {
    const schema = string().nullable()

    const nullResult = await schema.safeParse(null)
    expect(nullResult.success).toBe(true)
    if (nullResult.success) {
      expect(nullResult.data).toBeNull()
    }

    const undefinedResult = await schema.safeParse(undefined)
    expect(undefinedResult.success).toBe(false)
  })

  it('supports nullish modifier', async () => {
    const schema = string().nullish()

    const undefinedResult = await schema.safeParse(undefined)
    expect(undefinedResult.success).toBe(true)
    if (undefinedResult.success) {
      expect(undefinedResult.data).toBeUndefined()
    }

    const nullResult = await schema.safeParse(null)
    expect(nullResult.success).toBe(true)
    if (nullResult.success) {
      expect(nullResult.data).toBeNull()
    }
  })

  it('supports default modifier', async () => {
    const schema = string().default('fallback')

    await expect(schema.parse('value')).resolves.toBe('value')
    await expect(schema.parse(undefined)).resolves.toBe('fallback')
    await expect(schema.parse(null)).resolves.toBe('fallback')
  })

  it('applies required after optional', async () => {
    const schema = string().optional().required()

    const report = await schema.safeParse(undefined)
    expect(report.success).toBe(false)
  })

  it('uses last optionality modifier wins semantics', async () => {
    const nullableThenOptional = string().nullable().optional()
    const optionalThenNullable = string().optional().nullable()

    const nullableThenOptionalUndefined = await nullableThenOptional.safeParse(undefined)
    expect(nullableThenOptionalUndefined.success).toBe(true)
    if (nullableThenOptionalUndefined.success) {
      expect(nullableThenOptionalUndefined.data).toBeUndefined()
    }
    const nullableThenOptionalNull = await nullableThenOptional.safeParse(null)
    expect(nullableThenOptionalNull.success).toBe(false)

    const optionalThenNullableNull = await optionalThenNullable.safeParse(null)
    expect(optionalThenNullableNull.success).toBe(true)
    if (optionalThenNullableNull.success) {
      expect(optionalThenNullableNull.data).toBeNull()
    }
    const optionalThenNullableUndefined = await optionalThenNullable.safeParse(undefined)
    expect(optionalThenNullableUndefined.success).toBe(false)
  })
})
