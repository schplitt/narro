import { describe, expect, it } from 'vitest'

import { _null, _undefined, literal, number, string, union } from '../../index'
import { object } from '../../leitplanken/object'

describe('object schema', () => {
  it('accepts objects matching nested schemas', async () => {
    const schema = object({
      name: string().minLength(2),
      age: number().min(0),
      city: string().optional(),
    })

    const value = await schema.parse({ name: 'Al', age: 30 })

    expect(value).toEqual({ name: 'Al', age: 30 })
  })

  it('rejects objects with invalid nested values', async () => {
    const schema = object({
      name: string().minLength(2),
      age: number().min(0),
    })

    const report = await schema.safeParse({ name: 'A', age: -5 })

    expect(report.success).toBe(false)
    expect('data' in report).toBe(false)
  })

  it('supports optional modifier', async () => {
    const schema = object({
      name: string(),
    }).optional()

    const value = await schema.parse({ name: 'Spur' })
    expect(value).toEqual({ name: 'Spur' })

    const optionalResult = await schema.safeParse(undefined)
    expect(optionalResult.success).toBe(true)
    expect(optionalResult.data).toBeUndefined()
  })

  it('supports exactOptional modifier', async () => {
    const schema = object({
      age: number(),
    }).exactOptional()

    const report = await schema.safeParse(undefined)
    expect(report.success).toBe(true)
    expect(report.data).toBeUndefined()
  })

  it('supports undefinable modifier', async () => {
    const schema = object({
      active: string(),
    }).undefinable()

    const undefinedResult = await schema.safeParse(undefined)
    expect(undefinedResult.success).toBe(true)
    expect(undefinedResult.data).toBeUndefined()

    const definedResult = await schema.safeParse({ active: 'yes' })
    expect(definedResult.success).toBe(true)
    expect(definedResult.data).toEqual({ active: 'yes' })
  })

  it('supports nullable modifier', async () => {
    const schema = object({
      name: string(),
    }).nullable()

    const nullResult = await schema.safeParse(null)
    expect(nullResult.success).toBe(true)
    expect(nullResult.data).toBeNull()

    const undefinedResult = await schema.safeParse(undefined)
    expect(undefinedResult.success).toBe(false)
  })

  it('supports nullish modifier', async () => {
    const schema = object({
      label: string(),
    }).nullish()

    const nullResult = await schema.safeParse(null)
    expect(nullResult.success).toBe(true)
    expect(nullResult.data).toBeNull()

    const undefinedResult = await schema.safeParse(undefined)
    expect(undefinedResult.success).toBe(true)
    expect(undefinedResult.data).toBeUndefined()
  })

  it('supports default modifier', async () => {
    const schema = object({
      name: string(),
      age: number(),
    }).default({ name: 'Fallback', age: 0 })

    await expect(schema.parse({ name: 'Nova', age: 4 })).resolves.toEqual({ name: 'Nova', age: 4 })
    await expect(schema.parse(undefined)).resolves.toEqual({ name: 'Fallback', age: 0 })
    await expect(schema.parse(null)).resolves.toEqual({ name: 'Fallback', age: 0 })
  })

  it('applies required after optional', async () => {
    const schema = object({
      tag: string(),
    }).optional().required()

    const report = await schema.safeParse(undefined)
    expect(report.success).toBe(false)
  })

  it('uses last optionality modifier wins semantics', async () => {
    const nullableThenOptional = object({
      name: string(),
    }).nullable().optional()
    const optionalThenNullable = object({
      name: string(),
    }).optional().nullable()

    const nullableThenOptionalUndefined = await nullableThenOptional.safeParse(undefined)
    expect(nullableThenOptionalUndefined.success).toBe(true)
    expect(nullableThenOptionalUndefined.data).toBeUndefined()
    const nullableThenOptionalNull = await nullableThenOptional.safeParse(null)
    expect(nullableThenOptionalNull.success).toBe(false)

    const optionalThenNullableNull = await optionalThenNullable.safeParse(null)
    expect(optionalThenNullableNull.success).toBe(true)
    expect(optionalThenNullableNull.data).toBeNull()
    const optionalThenNullableUndefined = await optionalThenNullable.safeParse(undefined)
    expect(optionalThenNullableUndefined.success).toBe(false)
  })

  it('allows nested optional entries', async () => {
    const schema = object({
      name: string(),
      nickname: string().optional(),
    })

    await expect(schema.parse({ name: 'Spur' })).resolves.toEqual({ name: 'Spur' })
    await expect(schema.parse({ name: 'Spur', nickname: 'S' })).resolves.toEqual({ name: 'Spur', nickname: 'S' })
  })

  it('allows for a complex nested object schema', async () => {
    const schema = object({
      id: string().minLength(5),
      profile: object({
        name: string().minLength(2),
        age: number().min(0).optional(),
        contact: object({
          email: string().exactOptional(),
          phone: string().undefinable(),
        }).optional(),
      }),
      tags: object({
        primary: string(),
        secondary: string().optional(),
      }).optional(),
    })

    const res = await schema.safeParse({
      id: 'user_12345',
      profile: {
        name: 'Alice',
        age: 28,
        contact: {
          email: 'alice@example.com',
          phone: undefined,
        },
      },
      tags: {
        primary: 'admin',
      },
    })

    expect(res.success).toBe(true)
  })

  describe('property optionality enforcement', () => {
    describe('exactOptional entries', () => {
      it('fails when key is present', async () => {
        const schema = object({
          label: string().exactOptional(),
        })

        const result = await schema.safeParse({ label: undefined })

        expect(result.success).toBe(false)
      })

      it('passes when key is omitted', async () => {
        const schema = object({
          label: string().exactOptional(),
        })

        const result = await schema.safeParse({})

        expect(result.success).toBe(true)
        expect(result.data).toEqual({})
      })
    })

    describe('nullish entries', () => {
      it('fails when key is omitted', async () => {
        const schema = object({
          label: string().nullish(),
        })

        const result = await schema.safeParse({})

        expect(result.success).toBe(false)
      })

      it('passes when key is present', async () => {
        const schema = object({
          label: string().nullish(),
        })

        const result = await schema.safeParse({ label: undefined })

        expect(result.success).toBe(true)
        expect(result.data).toEqual({ label: undefined })
      })
    })

    describe('undefinable entries', () => {
      it('fails when key is omitted', async () => {
        const schema = object({
          label: string().undefinable(),
        })

        const result = await schema.safeParse({})

        expect(result.success).toBe(false)
      })

      it('passes when key is present', async () => {
        const schema = object({
          label: string().undefinable(),
        })

        const result = await schema.safeParse({ label: undefined })

        expect(result.success).toBe(true)
        expect(result.data).toEqual({ label: undefined })
      })
    })

    describe('undefined schema entries', () => {
      it('fails when key is omitted', async () => {
        const schema = object({
          label: _undefined(),
        })

        const result = await schema.safeParse({})

        expect(result.success).toBe(false)
      })

      it('passes when key is present', async () => {
        const schema = object({
          label: _undefined(),
        })

        const result = await schema.safeParse({ label: undefined })

        expect(result.success).toBe(true)
        // property must stay present even when value is undefined
        expect(result.data).toEqual({ label: undefined })
      })
    })
  })

  describe('shape modifiers', () => {
    it('strict fails when unknown keys exist', async () => {
      const schema = object({
        label: string(),
      }).strict()

      const result = await schema.safeParse({ label: 'Spur', alias: 'Team' })

      expect(result.success).toBe(false)
      expect('data' in result).toBe(false)
    })

    it('strict passes without unknown keys', async () => {
      const schema = object({
        label: string(),
      }).strict()

      const result = await schema.safeParse({ label: 'Spur' })

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ label: 'Spur' })
    })

    it('passthrough retains unknown keys', async () => {
      const schema = object({
        label: string(),
      }).passthrough()

      const result = await schema.safeParse({ label: 'Spur', alias: 'Team' })

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ label: 'Spur', alias: 'Team' })
    })

    it('strip removes unknown keys', async () => {
      const schema = object({
        label: string(),
      }).strip()

      const result = await schema.safeParse({ label: 'Spur', alias: 'Team' })

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ label: 'Spur' })
      expect(Object.prototype.hasOwnProperty.call(result.data, 'alias')).toBe(false)
    })
  })

  it('should work with the speciall cases (temp)', async () => {
    const schema = object({
      fallback: union([
        _null(),
        _undefined(),
        literal('disabled'),
      ]).default(null),
    })

    const result = await schema.safeParse({ id: true })

    expect(result.success).toBe(true)
    expect(result.data).toEqual({ fallback: null })
  })

  describe('property optionality modifiers', () => {
    describe('optional()', () => {
      it('passes when property is missing', async () => {
        const schema = object({
          name: string().optional(),
        })

        const result = await schema.safeParse({})

        expect(result.success).toBe(true)
        expect(result.data).toEqual({})
      })

      it('passes when property is undefined', async () => {
        const schema = object({
          name: string().optional(),
        })

        const result = await schema.safeParse({ name: undefined })

        expect(result.success).toBe(true)
        expect(result.data).toEqual({ name: undefined })
      })

      it('passes when property has valid value', async () => {
        const schema = object({
          name: string().optional(),
        })

        const result = await schema.safeParse({ name: 'Spur' })

        expect(result.success).toBe(true)
        expect(result.data).toEqual({ name: 'Spur' })
      })

      it('fails when property has invalid value', async () => {
        const schema = object({
          name: string().optional(),
        })

        const result = await schema.safeParse({ name: 123 })

        expect(result.success).toBe(false)
      })

      it('fails when property is null', async () => {
        const schema = object({
          name: string().optional(),
        })

        const result = await schema.safeParse({ name: null })

        expect(result.success).toBe(false)
      })
    })

    describe('exactOptional()', () => {
      it('passes when property is missing', async () => {
        const schema = object({
          name: string().exactOptional(),
        })

        const result = await schema.safeParse({})

        expect(result.success).toBe(true)
        expect(result.data).toEqual({})
      })

      it('fails when property is undefined', async () => {
        const schema = object({
          name: string().exactOptional(),
        })

        const result = await schema.safeParse({ name: undefined })

        expect(result.success).toBe(false)
      })

      it('passes when property has valid value', async () => {
        const schema = object({
          name: string().exactOptional(),
        })

        const result = await schema.safeParse({ name: 'Spur' })

        expect(result.success).toBe(true)
        expect(result.data).toEqual({ name: 'Spur' })
      })

      it('fails when property has invalid value', async () => {
        const schema = object({
          name: string().exactOptional(),
        })

        const result = await schema.safeParse({ name: 123 })

        expect(result.success).toBe(false)
      })

      it('fails when property is null', async () => {
        const schema = object({
          name: string().exactOptional(),
        })

        const result = await schema.safeParse({ name: null })

        expect(result.success).toBe(false)
      })
    })

    describe('undefinable()', () => {
      it('fails when property is missing', async () => {
        const schema = object({
          name: string().undefinable(),
        })

        const result = await schema.safeParse({})

        expect(result.success).toBe(false)
      })

      it('passes when property is undefined', async () => {
        const schema = object({
          name: string().undefinable(),
        })

        const result = await schema.safeParse({ name: undefined })

        expect(result.success).toBe(true)
        expect(result.data).toEqual({ name: undefined })
      })

      it('passes when property has valid value', async () => {
        const schema = object({
          name: string().undefinable(),
        })

        const result = await schema.safeParse({ name: 'Spur' })

        expect(result.success).toBe(true)
        expect(result.data).toEqual({ name: 'Spur' })
      })

      it('fails when property has invalid value', async () => {
        const schema = object({
          name: string().undefinable(),
        })

        const result = await schema.safeParse({ name: 123 })

        expect(result.success).toBe(false)
      })

      it('fails when property is null', async () => {
        const schema = object({
          name: string().undefinable(),
        })

        const result = await schema.safeParse({ name: null })

        expect(result.success).toBe(false)
      })
    })

    describe('nullable()', () => {
      it('fails when property is missing', async () => {
        const schema = object({
          name: string().nullable(),
        })

        const result = await schema.safeParse({})

        expect(result.success).toBe(false)
      })

      it('fails when property is undefined', async () => {
        const schema = object({
          name: string().nullable(),
        })

        const result = await schema.safeParse({ name: undefined })

        expect(result.success).toBe(false)
      })

      it('passes when property is null', async () => {
        const schema = object({
          name: string().nullable(),
        })

        const result = await schema.safeParse({ name: null })

        expect(result.success).toBe(true)
        expect(result.data).toEqual({ name: null })
      })

      it('passes when property has valid value', async () => {
        const schema = object({
          name: string().nullable(),
        })

        const result = await schema.safeParse({ name: 'Spur' })

        expect(result.success).toBe(true)
        expect(result.data).toEqual({ name: 'Spur' })
      })

      it('fails when property has invalid value', async () => {
        const schema = object({
          name: string().nullable(),
        })

        const result = await schema.safeParse({ name: 123 })

        expect(result.success).toBe(false)
      })
    })

    describe('nullish()', () => {
      it('fails when property is missing', async () => {
        const schema = object({
          name: string().nullish(),
        })

        const result = await schema.safeParse({})

        expect(result.success).toBe(false)
      })

      it('passes when property is undefined', async () => {
        const schema = object({
          name: string().nullish(),
        })

        const result = await schema.safeParse({ name: undefined })

        expect(result.success).toBe(true)
        expect(result.data).toEqual({ name: undefined })
      })

      it('passes when property is null', async () => {
        const schema = object({
          name: string().nullish(),
        })

        const result = await schema.safeParse({ name: null })

        expect(result.success).toBe(true)
        expect(result.data).toEqual({ name: null })
      })

      it('passes when property has valid value', async () => {
        const schema = object({
          name: string().nullish(),
        })

        const result = await schema.safeParse({ name: 'Spur' })

        expect(result.success).toBe(true)
        expect(result.data).toEqual({ name: 'Spur' })
      })

      it('fails when property has invalid value', async () => {
        const schema = object({
          name: string().nullish(),
        })

        const result = await schema.safeParse({ name: 123 })

        expect(result.success).toBe(false)
      })
    })

    describe('required() (default)', () => {
      it('fails when property is missing', async () => {
        const schema = object({
          name: string(),
        })

        const result = await schema.safeParse({})

        expect(result.success).toBe(false)
      })

      it('fails when property is undefined', async () => {
        const schema = object({
          name: string(),
        })

        const result = await schema.safeParse({ name: undefined })

        expect(result.success).toBe(false)
      })

      it('fails when property is null', async () => {
        const schema = object({
          name: string(),
        })

        const result = await schema.safeParse({ name: null })

        expect(result.success).toBe(false)
      })

      it('passes when property has valid value', async () => {
        const schema = object({
          name: string(),
        })

        const result = await schema.safeParse({ name: 'Spur' })

        expect(result.success).toBe(true)
        expect(result.data).toEqual({ name: 'Spur' })
      })

      it('fails when property has invalid value', async () => {
        const schema = object({
          name: string(),
        })

        const result = await schema.safeParse({ name: 123 })

        expect(result.success).toBe(false)
      })
    })

    describe('default()', () => {
      it('uses default when property is missing', async () => {
        const schema = object({
          name: string().default('Default'),
        })

        const result = await schema.safeParse({})

        expect(result.success).toBe(true)
        expect(result.data).toEqual({ name: 'Default' })
      })

      it('uses default when property is undefined', async () => {
        const schema = object({
          name: string().default('Default'),
        })

        const result = await schema.safeParse({ name: undefined })

        expect(result.success).toBe(true)
        expect(result.data).toEqual({ name: 'Default' })
      })

      it('uses default when property is null', async () => {
        const schema = object({
          name: string().default('Default'),
        })

        const result = await schema.safeParse({ name: null })

        expect(result.success).toBe(true)
        expect(result.data).toEqual({ name: 'Default' })
      })

      it('uses provided value when property has valid value', async () => {
        const schema = object({
          name: string().default('Default'),
        })

        const result = await schema.safeParse({ name: 'Spur' })

        expect(result.success).toBe(true)
        expect(result.data).toEqual({ name: 'Spur' })
      })

      it('fails when property has invalid value', async () => {
        const schema = object({
          name: string().default('Default'),
        })

        const result = await schema.safeParse({ name: 123 })

        expect(result.success).toBe(false)
      })
    })
  })
})
