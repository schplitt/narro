import { describe, expect, it } from 'vitest'

import { boolean, enum as enumSchema, literal, null as nullSchema, number, string, undefined as undefinedSchema, union } from '../../index'
import { array } from '../../leitplanken/array'
import { object } from '../../leitplanken/object'

function createPlatformSchema() {
  return object({
    meta: object({
      id: string().exactOptional(),
      version: number().min(1).default(1),
      flags: union([
        literal('alpha'),
        literal('beta'),
        literal('rc'),
      ]).nullish(),
    }).strict(),
    payload: union([
      object({
        type: literal('user'),
        users: array(object({
          id: string().minLength(3),
          active: boolean().default(true),
          contact: union([
            object({
              email: string().optional(),
              phone: string().undefinable(),
              address: object({
                lines: array(string().minLength(1)).minLength(1),
                country: enumSchema(['DE', 'US', 'UK']),
              }).passthrough(),
            }).passthrough(),
            array(number().min(0)).minLength(2),
          ]),
        })).minLength(1),
      }).passthrough(),
      object({
        type: literal('report'),
        rows: array(
          union([
            object({
              id: string(),
              amount: number().min(0),
            }),
            array(string()).length(2),
          ]),
        ).minLength(1),
      }).passthrough(),
    ]),
    config: union([
      object({
        mode: enumSchema(['strict', 'loose']),
        retries: number().min(0).max(5).default(3),
      }).strip(),
      literal(false),
    ]).default({ mode: 'loose', retries: 3 }),
  }).passthrough()
}

function createAggregatorSchema() {
  return object({
    data: union([
      array(number().min(0)).minLength(1).transform((nums) => {
        return {
          kind: 'numbers',
          total: nums.reduce((sum, value) => sum + value, 0),
          trace: nums,
        }
      }),
      array(string().startsWith('num:')).minLength(1).transform((entries) => {
        const parsed = entries.map(entry => Number.parseInt(entry.slice(4), 10))
        return {
          kind: 'strings',
          total: parsed.reduce((sum, value) => sum + value, 0),
          trace: parsed,
        }
      }),
      object({
        values: array(union([
          number().min(0),
          literal(true),
          literal(false),
        ])).minLength(1),
        bonus: number().min(0).optional(),
      }).passthrough().transform((payload) => {
        const numbers = payload.values.filter((value): value is number => typeof value === 'number')
        const total = numbers.reduce((sum, value) => sum + value, 0) + (payload.bonus ?? 0)
        return {
          kind: 'object',
          total,
          trace: numbers,
        }
      }),
    ]).nullish(),
    fallback: union([
      nullSchema(),
      undefinedSchema(),
      literal('disabled'),
    ]).default(null),
  }).transform(({ data, fallback }) => {
    return {
      data: data ?? { kind: 'none', total: 0, trace: [] },
      fallback,
    }
  })
}

function createWorkflowSchema() {
  return object({
    steps: array(union([
      object({
        kind: literal('http'),
        request: object({
          method: enumSchema(['GET', 'POST']).default('GET'),
          url: string().startsWith('https://'),
          headers: object({
            'Authorization': string().optional(),
            'X-Trace': string().optional(),
          }).strip().optional(),
          retry: number().min(0).max(5).default(0),
        }).passthrough(),
      }),
      object({
        kind: literal('transform'),
        mapper: union([
          string().length(8),
          array(string().length(4)).minLength(1),
        ]),
      }),
      object({
        kind: literal('branch'),
        condition: union([
          boolean(),
          object({
            left: string(),
            right: string(),
            op: enumSchema(['equals', 'contains']),
          }).strict(),
        ]),
        whenTrue: array(number().min(0)).default(() => []),
        whenFalse: array(number().min(0)).optional(),
      }),
    ])).minLength(2),
    metadata: object({
      id: string().minLength(5),
      tags: array(string()).nullish(),
      schedule: union([
        object({
          cron: string(),
          timezone: string().optional(),
        }).strict(),
        nullSchema(),
      ]).optional(),
    }).passthrough(),
  }).strict()
}

function createMatrixSchema() {
  return array(array(union([
    number().min(0),
    string().startsWith('#'),
    union([
      literal(true),
      literal(false),
    ]),
  ])).length(3)).length(3)
}

describe('schema edge cases', () => {
  it('parses a deeply nested platform configuration', async () => {
    const schema = createPlatformSchema()

    const result = await schema.parse({
      meta: {
        version: 2,
        flags: 'beta',
      },
      payload: {
        type: 'user',
        users: [
          {
            id: 'usr-1',
            contact: {
              email: 'alice@example.com',
              phone: undefined,
              address: {
                lines: ['Main Street 1'],
                country: 'DE',
                geoHash: 'abc123',
              },
            },
          },
          {
            id: 'usr-2',
            active: false,
            contact: [1, 2],
          },
        ],
      },
      config: false,
      extra: 'allowed',
    })

    expect(result).toEqual({
      meta: {
        version: 2,
        flags: 'beta',
      },
      payload: {
        type: 'user',
        users: [
          {
            id: 'usr-1',
            active: true,
            contact: {
              email: 'alice@example.com',
              phone: undefined,
              address: {
                lines: ['Main Street 1'],
                country: 'DE',
                geoHash: 'abc123',
              },
            },
          },
          {
            id: 'usr-2',
            active: false,
            contact: [1, 2],
          },
        ],
      },
      config: false,
      extra: 'allowed',
    })
  })

  it('rejects when exactOptional keys are explicitly present', async () => {
    const schema = createPlatformSchema()

    const report = await schema.safeParse({
      meta: {
        id: 'not-allowed',
        version: 1,
      },
      payload: {
        type: 'user',
        users: [
          {
            id: 'usr-1',
            contact: [0, 1],
          },
        ],
      },
      config: { mode: 'strict', retries: 2 },
    })

    expect(report.success).toBe(false)
  })

  it('normalizes heterogeneous aggregates via nested transforms', async () => {
    const schema = createAggregatorSchema()

    const fromNumbers = await schema.parse({ data: [1, 2, 3], fallback: undefined })
    expect(fromNumbers).toEqual({
      data: {
        kind: 'numbers',
        total: 6,
        trace: [1, 2, 3],
      },
      fallback: undefined,
    })

    const fromStrings = await schema.parse({ data: ['num:2', 'num:3'], fallback: 'disabled' })
    expect(fromStrings).toEqual({
      data: {
        kind: 'strings',
        total: 5,
        trace: [2, 3],
      },
      fallback: 'disabled',
    })

    // TODO: union -> undefined schema passes even though the key is NOT present
    // object has to respect that union shame could have been used and go through the union schema (and ITS union schemas) in this manner to determain if the
    // extra logic NEEDS to be applied (and then possibly fail the schema)

    // scratch that
    // issue is that if the passed schema IS one of the ones we need to recheck in the object and find it AND fail it,
    // then the report fails for this id
    // though we should still need to check the union reports inside to check if one of the schemas passed and then switch the order
    const fromObject = await schema.parse({
      data: {
        values: [1, true, 4, false],
        bonus: 5,
        note: 'keep',
      },
    })
    expect(fromObject).toEqual({
      data: {
        kind: 'object',
        total: 10,
        trace: [1, 4],
      },
      fallback: null,
    })
  })

  it('fails when strict nested objects receive extraneous keys', async () => {
    const schema = createPlatformSchema()

    const report = await schema.safeParse({
      meta: {
        version: 1,
        unexpected: true,
      },
      payload: {
        type: 'report',
        rows: [
          {
            id: 'row-1',
            amount: 10,
          },
        ],
      },
      config: { mode: 'strict', retries: 1 },
    })

    expect(report.success).toBe(false)
  })

  it('handles workflow definitions with branching and strict metadata', async () => {
    const schema = createWorkflowSchema()

    const result = await schema.parse({
      steps: [
        {
          kind: 'http',
          request: {
            method: 'POST',
            url: 'https://api.example.com',
            headers: {
              Authorization: 'Bearer abc',
            },
            retry: 2,
          },
        },
        {
          kind: 'branch',
          condition: {
            left: 'status',
            right: 'ok',
            op: 'equals',
          },
          whenTrue: [1, 2, 3],
        },
        {
          kind: 'transform',
          mapper: ['mapX', 'list'],
        },
      ],
      metadata: {
        id: 'flow-12345',
        tags: ['critical'],
        schedule: null,
        owner: 'ops',
      },
    })

    expect(result).toEqual({
      steps: [
        {
          kind: 'http',
          request: {
            method: 'POST',
            url: 'https://api.example.com',
            headers: {
              Authorization: 'Bearer abc',
            },
            retry: 2,
          },
        },
        {
          kind: 'branch',
          condition: {
            left: 'status',
            right: 'ok',
            op: 'equals',
          },
          whenTrue: [1, 2, 3],
          whenFalse: undefined,
        },
        {
          kind: 'transform',
          mapper: ['mapX', 'list'],
        },
      ],
      metadata: {
        id: 'flow-12345',
        tags: ['critical'],
        schedule: null,
        owner: 'ops',
      },
    })
  })

  it('rejects workflows with invalid branches or urls', async () => {
    const schema = createWorkflowSchema()

    const report = await schema.safeParse({
      steps: [
        {
          kind: 'http',
          request: {
            method: 'DELETE',
            url: 'http://insecure.example.com',
          },
        },
        {
          kind: 'branch',
          condition: true,
          whenTrue: [-1],
        },
      ],
      metadata: {
        id: 'bad-flow',
      },
    })

    expect(report.success).toBe(false)
  })

  it('validates fixed-size matrices with mixed cell types', async () => {
    const schema = createMatrixSchema()

    const result = await schema.parse([
      [0, '#a1', true],
      [5, '#b2', false],
      [9, '#c3', true],
    ])

    expect(result).toEqual([
      [0, '#a1', true],
      [5, '#b2', false],
      [9, '#c3', true],
    ])
  })

  it('rejects matrices with incorrect dimensions or values', async () => {
    const schema = createMatrixSchema()

    const tooWide = await schema.safeParse([
      [0, '#a1', true, false],
      [5, '#b2', false, true],
      [9, '#c3', true, false],
    ])
    expect(tooWide.success).toBe(false)

    const badValue = await schema.safeParse([
      [0, 'missing-hash', true],
      [5, '#b2', false],
      [9, '#c3', true],
    ])
    expect(badValue.success).toBe(false)
  })

  it('combines unions, defaults, and nullish handling inside arrays', async () => {
    const complexArraySchema = array(
      union([
        object({
          name: string().minLength(2),
          details: union([
            object({
              score: number().min(0).default(0),
              comment: string().optional(),
            }).strip(),
            nullSchema(),
          ]),
        }).passthrough(),
        number().nullish(),
        string().exactOptional(),
      ]),
    ).minLength(3)

    const result = await complexArraySchema.parse([
      {
        name: 'alpha',
        details: {
          score: 5,
          comment: 'ok',
          ignored: true,
        },
      },
      null,
      undefined,
      7,
      {
        name: 'beta',
        details: null,
      },
    ])

    expect(result).toEqual([
      {
        name: 'alpha',
        details: {
          score: 5,
          comment: 'ok',
        },
      },
      null,
      undefined,
      7,
      {
        name: 'beta',
        details: null,
      },
    ])
  })

  it('fails when complex array entries violate nested defaults', async () => {
    const complexArraySchema = array(
      union([
        object({
          name: string().minLength(2),
          details: union([
            object({
              score: number().min(0).default(0),
              comment: string().optional(),
            }).strip(),
            nullSchema(),
          ]),
        }),
        number().nullish(),
      ]),
    )

    const report = await complexArraySchema.safeParse([
      {
        name: 'a',
        details: {
          score: -1,
        },
      },
      undefined,
    ])

    expect(report.success).toBe(false)
  })

  describe('runtime edge cases - optionality cascades', () => {
    it('handles optional to required to nullable chain on strings', async () => {
      const schema = string().optional().required().nullable()

      await expect(schema.parse('value')).resolves.toBe('value')
      await expect(schema.parse(null)).resolves.toBeNull()

      const report = await schema.safeParse(undefined)
      expect(report.success).toBe(false)
    })

    it('handles optional to required to nullish chain on numbers', async () => {
      const schema = number().optional().required().nullish()

      await expect(schema.parse(5)).resolves.toBe(5)

      const nullReport = await schema.safeParse(null)
      expect(nullReport.success).toBe(true)
      if (nullReport.success) {
        expect(nullReport.data).toBeNull()
      }

      const undefinedReport = await schema.safeParse(undefined)
      expect(undefinedReport.success).toBe(true)
      if (undefinedReport.success) {
        expect(undefinedReport.data).toBeUndefined()
      }
    })

    it('handles optional to required to undefinable chain on booleans', async () => {
      const schema = boolean().optional().required().undefinable()

      await expect(schema.parse(true)).resolves.toBe(true)

      const undefinedReport = await schema.safeParse(undefined)
      expect(undefinedReport.success).toBe(true)
      if (undefinedReport.success) {
        expect(undefinedReport.data).toBeUndefined()
      }

      const nullReport = await schema.safeParse(null)
      expect(nullReport.success).toBe(false)
    })

    it('handles optional to required to nullable to nullish chain on strings', async () => {
      const schema = string().optional().required().nullable().nullish()

      await expect(schema.parse('abc')).resolves.toBe('abc')

      const nullReport = await schema.safeParse(null)
      expect(nullReport.success).toBe(true)
      if (nullReport.success) {
        expect(nullReport.data).toBeNull()
      }

      const undefinedReport = await schema.safeParse(undefined)
      expect(undefinedReport.success).toBe(true)
      if (undefinedReport.success) {
        expect(undefinedReport.data).toBeUndefined()
      }
    })

    it('handles default chains after optional modifiers', async () => {
      const schema = string().optional().default('fallback').nullable().default('final')

      const result = await schema.parse(undefined)
      expect(result).toBe('final')

      const nullResult = await schema.parse(null)
      expect(nullResult).toBe('final')

      const provided = await schema.parse('given')
      expect(provided).toBe('given')
    })

    it('handles number defaults through optional chains', async () => {
      const schema = number().default(1).optional().default(2).nullable().default(3)

      const defaultResult = await schema.parse(undefined)
      expect(defaultResult).toBe(3)

      const provided = await schema.parse(5)
      expect(provided).toBe(5)

      const nullProvided = await schema.parse(null)
      expect(nullProvided).toBe(3)
    })

    it('handles boolean defaults with nullish transitions', async () => {
      const schema = boolean().nullish().default(true).optional().default(false)

      const undefinedResult = await schema.parse(undefined)
      expect(undefinedResult).toBe(false)

      const nullResult = await schema.parse(null)
      expect(nullResult).toBe(false)

      const trueResult = await schema.parse(true)
      expect(trueResult).toBe(true)
    })

    it('handles array optionality chains with defaults', async () => {
      const schema = array(number()).optional().default([]).nullable().default([1, 2, 3])

      const undefinedResult = await schema.parse(undefined)
      expect(undefinedResult).toEqual([1, 2, 3])

      const nullResult = await schema.parse(null)
      expect(nullResult).toEqual([1, 2, 3])

      const provided = await schema.parse([5])
      expect(provided).toEqual([5])
    })

    it('handles object optionality chains with defaults', async () => {
      const schema = object({ value: string().default('x') })
        .optional()
        .default({ value: 'defaulted' })
        .nullable()
        .default({ value: 'final' })

      const undefinedResult = await schema.parse(undefined)
      expect(undefinedResult).toEqual({ value: 'final' })

      const nullResult = await schema.parse(null)
      expect(nullResult).toEqual({ value: 'final' })

      const provided = await schema.parse({ value: 'ok' })
      expect(provided).toEqual({ value: 'ok' })
    })

    it('handles union optionality chains with defaults', async () => {
      const schema = union([string(), number()]).optional().default('fallback').nullable().default('final')

      const undefinedResult = await schema.parse(undefined)
      expect(undefinedResult).toBe('final')

      const nullResult = await schema.parse(null)
      expect(nullResult).toBe('final')

      const providedString = await schema.parse('value')
      expect(providedString).toBe('value')

      const providedNumber = await schema.parse(42)
      expect(providedNumber).toBe(42)
    })

    it('handles literal optionality chains', async () => {
      const schema = literal('const').optional().nullable().nullish().default('const')

      const resultUndefined = await schema.parse(undefined)
      expect(resultUndefined).toBe('const')

      const resultNull = await schema.parse(null)
      expect(resultNull).toBe('const')

      const resultProvided = await schema.parse('const')
      expect(resultProvided).toBe('const')

      const failure = await schema.safeParse('other')
      expect(failure.success).toBe(false)
    })

    it('handles enum optionality chains', async () => {
      const schema = enumSchema(['a', 'b']).optional().required().nullable().default('a')

      const provided = await schema.parse('b')
      expect(provided).toBe('b')

      const nullResult = await schema.parse(null)
      expect(nullResult).toBe('a')

      const failure = await schema.safeParse('c')
      expect(failure.success).toBe(false)
    })

    it('handles nullish after required chain on literal', async () => {
      const schema = literal(10).nullable().required().nullish()

      await expect(schema.parse(10)).resolves.toBe(10)

      const nullReport = await schema.safeParse(null)
      expect(nullReport.success).toBe(true)
      if (nullReport.success) {
        expect(nullReport.data).toBeNull()
      }

      const undefinedReport = await schema.safeParse(undefined)
      expect(undefinedReport.success).toBe(true)
      if (undefinedReport.success) {
        expect(undefinedReport.data).toBeUndefined()
      }
    })

    it('handles nested optional objects with defaults', async () => {
      const schema = object({
        nested: object({ value: number().default(1) }).optional(),
      })
        .optional()
        .default({ nested: { value: 3 } })

      const resultUndefined = await schema.parse(undefined)
      expect(resultUndefined).toEqual({ nested: { value: 3 } })

      const resultProvided = await schema.parse({ nested: {} })
      expect(resultProvided).toEqual({ nested: { value: 1 } })

      const failure = await schema.safeParse({ nested: { value: -1 } })
      expect(failure.success).toBe(true)
    })

    it('handles optional arrays inside optional objects', async () => {
      const schema = object({
        list: array(string().minLength(1)).optional(),
      })
        .optional()
        .default({ list: ['fallback'] })

      const defaultResult = await schema.parse(undefined)
      expect(defaultResult).toEqual({ list: ['fallback'] })

      const provided = await schema.parse({ list: ['ok'] })
      expect(provided).toEqual({ list: ['ok'] })

      const failure = await schema.safeParse({ list: [''] })
      expect(failure.success).toBe(false)
    })

    it('handles optional union of objects with nullish defaults', async () => {
      const schema = union([
        object({ type: literal('A'), value: number().min(0) }),
        object({ type: literal('B'), value: string().minLength(1) }),
      ])
        .optional()
        .nullish()
        .default({ type: 'A', value: 0 })

      const undefinedResult = await schema.parse(undefined)
      expect(undefinedResult).toEqual({ type: 'A', value: 0 })

      const nullResult = await schema.parse(null)
      expect(nullResult).toEqual({ type: 'A', value: 0 })

      const provided = await schema.parse({ type: 'B', value: 'hello' })
      expect(provided).toEqual({ type: 'B', value: 'hello' })

      const failure = await schema.safeParse({ type: 'B', value: '' })
      expect(failure.success).toBe(false)
    })

    it('handles optional arrays with nullish defaults returning explicit fallback', async () => {
      const schema = array(number().min(0)).optional().nullish().default([1, 2])

      const undefinedResult = await schema.parse(undefined)
      expect(undefinedResult).toEqual([1, 2])

      const nullResult = await schema.parse(null)
      expect(nullResult).toEqual([1, 2])

      const provided = await schema.parse([5, 6])
      expect(provided).toEqual([5, 6])
    })

    it('handles optional nested unions with defaults', async () => {
      const schema = object({
        option: union([
          string().optional().default('str'),
          number().optional().default(1),
        ]).default('str'),
      }).optional().default({ option: 'str' })

      const undefinedResult = await schema.parse(undefined)
      expect(undefinedResult).toEqual({ option: 'str' })

      const providedNumber = await schema.parse({ option: 5 })
      expect(providedNumber).toEqual({ option: 5 })

      const providedString = await schema.parse({ option: 'value' })
      expect(providedString).toEqual({ option: 'value' })
    })

    it('handles optional nested arrays defaulting to complex objects', async () => {
      const schema = object({
        entries: array(object({ id: string(), value: number().default(0) })).optional(),
      })
        .optional()
        .default({ entries: [{ id: 'default', value: 0 }] })

      const resultUndefined = await schema.parse(undefined)
      expect(resultUndefined).toEqual({ entries: [{ id: 'default', value: 0 }] })

      const provided = await schema.parse({ entries: [{ id: 'a', value: 5 }] })
      expect(provided).toEqual({ entries: [{ id: 'a', value: 5 }] })

      const failure = await schema.safeParse({ entries: [{ id: 'a', value: -1 }] })
      expect(failure.success).toBe(true)
    })

    it('handles optional nested arrays with nullish entries', async () => {
      const schema = array(union([number().min(0), nullSchema(), undefinedSchema()])).optional().default([])

      const resultUndefined = await schema.parse(undefined)
      expect(resultUndefined).toEqual([])

      const provided = await schema.parse([1, null, undefined, 3])
      expect(provided).toEqual([1, null, undefined, 3])

      const failure = await schema.safeParse([-1])
      expect(failure.success).toBe(false)
    })

    it('handles optional objects with multiple optional properties', async () => {
      const schema = object({
        a: string().optional(),
        b: number().nullable(),
        c: boolean().nullish(),
        d: array(string()).optional(),
      })
        .optional()
        .default({ b: null, c: undefined })

      const undefinedResult = await schema.parse(undefined)
      expect(undefinedResult).toEqual({ b: null, c: undefined })

      const provided = await schema.parse({ a: 'x', b: null, c: true, d: ['y'] })
      expect(provided).toEqual({ a: 'x', b: null, c: true, d: ['y'] })
    })

    it('handles optional union of arrays with defaults', async () => {
      const schema = union([
        array(string().minLength(1)).default(['a']),
        array(number().min(0)).default([1]),
      ])
        .optional()
        .default(['a'])

      const undefinedResult = await schema.parse(undefined)
      expect(undefinedResult).toEqual(['a'])

      const provided = await schema.parse([2, 3])
      expect(provided).toEqual([2, 3])

      const failure = await schema.safeParse([true])
      expect(failure.success).toBe(false)
    })

    it('handles optional literal with chained defaults', async () => {
      const schema = literal('fixed').optional().default('fixed').nullable().default('fixed')

      const undefinedResult = await schema.parse(undefined)
      expect(undefinedResult).toBe('fixed')

      const nullResult = await schema.parse(null)
      expect(nullResult).toBe('fixed')

      const provided = await schema.parse('fixed')
      expect(provided).toBe('fixed')
    })

    it('handles optional enum with chained defaults', async () => {
      const schema = enumSchema(['x', 'y']).optional().default('x').nullable().default('x')

      const undefinedResult = await schema.parse(undefined)
      expect(undefinedResult).toBe('x')

      const nullResult = await schema.parse(null)
      expect(nullResult).toBe('x')

      const provided = await schema.parse('y')
      expect(provided).toBe('y')
    })

    it('handles optional boolean with chained defaults', async () => {
      const schema = boolean().optional().default(false).nullable().default(false)

      const undefinedResult = await schema.parse(undefined)
      expect(undefinedResult).toBe(false)

      const nullResult = await schema.parse(null)
      expect(nullResult).toBe(false)

      const provided = await schema.parse(true)
      expect(provided).toBe(true)
    })

    it('handles optional number with chained defaults', async () => {
      const schema = number().optional().default(1).nullable().default(1)

      const undefinedResult = await schema.parse(undefined)
      expect(undefinedResult).toBe(1)

      const nullResult = await schema.parse(null)
      expect(nullResult).toBe(1)

      const provided = await schema.parse(5)
      expect(provided).toBe(5)
    })

    it('handles optional array with chained defaults', async () => {
      const schema = array(string()).optional().default(['a']).nullable().default(['a'])

      const undefinedResult = await schema.parse(undefined)
      expect(undefinedResult).toEqual(['a'])

      const nullResult = await schema.parse(null)
      expect(nullResult).toEqual(['a'])

      const provided = await schema.parse(['b'])
      expect(provided).toEqual(['b'])
    })

    it('handles optional object with chained defaults', async () => {
      const schema = object({ key: string().default('value') }).optional().default({ key: 'value' }).nullable().default({ key: 'value' })

      const undefinedResult = await schema.parse(undefined)
      expect(undefinedResult).toEqual({ key: 'value' })

      const nullResult = await schema.parse(null)
      expect(nullResult).toEqual({ key: 'value' })

      const provided = await schema.parse({ key: 'custom' })
      expect(provided).toEqual({ key: 'custom' })
    })
  })

  describe('runtime edge cases - shape oscillations and strictness', () => {
    it('strict root rejects extraneous keys', async () => {
      const schema = object({ id: string() }).strict()

      const success = await schema.safeParse({ id: 'abc' })
      expect(success.success).toBe(true)
      if (success.success) {
        expect(success.data).toEqual({ id: 'abc' })
      }

      const failure = await schema.safeParse({ id: 'abc', extra: true })
      expect(failure.success).toBe(false)
    })

    it('passthrough root preserves extraneous keys', async () => {
      const schema = object({ id: string() }).passthrough()

      const result = await schema.parse({ id: 'abc', extra: 1 })
      expect(result).toEqual({ id: 'abc', extra: 1 })
    })

    it('strip root removes extraneous keys', async () => {
      const schema = object({ id: string() }).strip()

      const result = await schema.parse({ id: 'abc', extra: 1 })
      expect(result).toEqual({ id: 'abc' })
    })

    it('shape oscillation strict -> passthrough', async () => {
      const schema = object({ id: string() }).strict().passthrough()

      const result = await schema.parse({ id: 'abc', extra: 'value' })
      expect(result).toEqual({ id: 'abc', extra: 'value' })
    })

    it('shape oscillation passthrough -> strict', async () => {
      const schema = object({ id: string() }).passthrough().strict()

      const success = await schema.safeParse({ id: 'abc' })
      expect(success.success).toBe(true)
      if (success.success) {
        expect(success.data).toEqual({ id: 'abc' })
      }

      const failure = await schema.safeParse({ id: 'abc', extra: 'value' })
      expect(failure.success).toBe(false)
    })

    it('nested strict child rejects extraneous keys', async () => {
      const schema = object({
        meta: object({ count: number() }).strict(),
      }).passthrough()

      const failure = await schema.safeParse({ meta: { count: 1, extra: 2 } })
      expect(failure.success).toBe(false)

      const success = await schema.safeParse({ meta: { count: 1 } })
      expect(success.success).toBe(true)
      if (success.success) {
        expect(success.data).toEqual({ meta: { count: 1 } })
      }
    })

    it('nested passthrough child keeps extras', async () => {
      const schema = object({
        meta: object({ count: number() }).passthrough(),
      }).strict()

      const result = await schema.parse({ meta: { count: 1, extra: 2 } })
      expect(result).toEqual({ meta: { count: 1, extra: 2 } })
    })

    it('strip child removes extras', async () => {
      const schema = object({
        meta: object({ count: number() }).strip(),
      }).passthrough()

      const result = await schema.parse({ meta: { count: 1, extra: 2 }, keep: true })
      expect(result).toEqual({ meta: { count: 1 }, keep: true })
    })

    it('strict nested arrays enforce shape recursively', async () => {
      const schema = array(object({ value: number() }).strict())

      const success = await schema.safeParse([{ value: 1 }, { value: 2 }])
      expect(success.success).toBe(true)

      const failure = await schema.safeParse([{ value: 1, extra: true }])
      expect(failure.success).toBe(false)
    })

    it('passthrough nested arrays allow extra keys', async () => {
      const schema = array(object({ value: number() }).passthrough())

      const result = await schema.parse([{ value: 1, extra: true }])
      expect(result).toEqual([{ value: 1, extra: true }])
    })

    it('strip nested arrays remove extra keys', async () => {
      const schema = array(object({ value: number() }).strip())

      const result = await schema.parse([{ value: 1, extra: true }])
      expect(result).toEqual([{ value: 1 }])
    })

    it('deep nesting alternating shapes respects final mode', async () => {
      const schema = object({
        level1: object({
          a: string(),
          level2: object({
            b: number(),
            level3: object({
              c: boolean(),
            }).passthrough(),
          }).strict(),
        }).passthrough(),
      }).strip()

      const result = await schema.safeParse({
        level1: {
          a: 'x',
          level2: {
            b: 1,
            level3: {
              c: true,
              extra: 1,
            },
            extra: 'fails here',
          },
          extra: 'remove',
        },
        root: 'remove',
      })

      expect(result.success).toBe(false)
    })

    it('oscillation ending in strip removes extras everywhere', async () => {
      const schema = object({
        a: string(),
        b: number().optional(),
      }).passthrough().strict().passthrough().strip()

      const result = await schema.parse({ a: 'value', b: 1, extra: true })
      expect(result).toEqual({ a: 'value', b: 1 })
    })

    it('strict root optional still rejects extras', async () => {
      const schema = object({ value: string() }).strict().optional()

      const success = await schema.safeParse(undefined)
      expect(success.success).toBe(true)

      const failure = await schema.safeParse({ value: 'x', extra: true })
      expect(failure.success).toBe(false)
    })

    it('passthrough root optional keeps extras', async () => {
      const schema = object({ value: string() }).passthrough().optional()

      const result = await schema.parse({ value: 'x', extra: true })
      expect(result).toEqual({ value: 'x', extra: true })
    })

    it('strip root optional removes extras', async () => {
      const schema = object({ value: string() }).strip().optional()

      const result = await schema.parse({ value: 'x', extra: true })
      expect(result).toEqual({ value: 'x' })
    })

    it('passthrough nested optional child retains extras with default', async () => {
      const schema = object({
        child: object({ name: string().default('anon') }).passthrough().optional(),
      }).passthrough()

      const result = await schema.parse({ child: { extra: 'yes' } })
      expect(result).toEqual({ child: { name: 'anon', extra: 'yes' } })
    })

    it('strip nested optional child removes extras', async () => {
      const schema = object({
        child: object({ name: string().default('anon') }).strip().optional(),
      }).passthrough()

      const result = await schema.parse({ child: { extra: 'no' }, keep: true })
      expect(result).toEqual({ child: { name: 'anon' }, keep: true })
    })

    it('strict nested optional child rejects extras', async () => {
      const schema = object({
        child: object({ name: string() }).strict().optional(),
      }).passthrough()

      const failure = await schema.safeParse({ child: { name: 'x', extra: 'no' } })
      expect(failure.success).toBe(false)
    })

    it('passthrough mixed with strict ensures selective rejection', async () => {
      const schema = object({
        strictChild: object({ x: string() }).strict(),
        passthroughChild: object({ y: number() }).passthrough(),
        stripChild: object({ z: boolean() }).passthrough().strip(),
      }).strict()

      const failure = await schema.safeParse({
        strictChild: { x: 'a', extra: true },
        passthroughChild: { y: 1, extra: true },
        stripChild: { z: false, extra: true },
      })
      expect(failure.success).toBe(false)

      const success = await schema.safeParse({
        strictChild: { x: 'a' },
        passthroughChild: { y: 1, extra: true },
        stripChild: { z: false, extra: true },
      })
      expect(success.success).toBe(true)
      if (success.success) {
        expect(success.data).toEqual({
          strictChild: { x: 'a' },
          passthroughChild: { y: 1, extra: true },
          stripChild: { z: false },
        })
      }
    })

    it('deep chain ending in passthrough optional keeps extras', async () => {
      const schema = object({
        parent: object({
          child: object({ leaf: string() }).passthrough(),
        }).strip(),
        meta: object({ created: number() }).passthrough(),
      }).strip().passthrough().optional()

      const result = await schema.parse({
        parent: { child: { leaf: 'x', extra: true } },
        meta: { created: 1, extra: true },
        extra: 'root',
      })

      expect(result).toEqual({
        parent: { child: { leaf: 'x', extra: true } },
        meta: { created: 1, extra: true },
        extra: 'root',
      })
    })

    it('deep chain ending in strip optional removes extras', async () => {
      const schema = object({
        parent: object({
          child: object({ leaf: string() }).passthrough(),
        }).strip(),
        meta: object({ created: number() }).strip(),
      }).passthrough().strip().optional()

      const result = await schema.parse({
        parent: { child: { leaf: 'x', extra: true } },
        meta: { created: 1, extra: true },
        extra: 'root',
      })

      expect(result).toEqual({
        parent: { child: { leaf: 'x', extra: true } },
        meta: { created: 1 },
      })
    })

    it('strict after passthrough removes root extras but keeps nested passthrough', async () => {
      const schema = object({
        nested: object({ value: string() }).passthrough(),
      }).passthrough().strict()

      const result = await schema.parse({ nested: { value: 'x', extra: true } })
      expect(result).toEqual({ nested: { value: 'x', extra: true } })

      const failure = await schema.safeParse({ nested: { value: 'x', extra: true }, root: true })
      expect(failure.success).toBe(false)
    })

    it('strip after strict ensures root extras removed', async () => {
      const schema = object({ key: string() }).strict().strip()

      const result = await schema.parse({ key: 'value', extra: true })
      expect(result).toEqual({ key: 'value' })
    })

    it('passthrough after strict keeps extras again', async () => {
      const schema = object({ key: string() }).strict().passthrough()

      const result = await schema.parse({ key: 'value', extra: true })
      expect(result).toEqual({ key: 'value', extra: true })
    })

    it('strict nested arrays inside passthrough root enforce shape', async () => {
      const schema = object({
        list: array(object({ id: string() }).strict()),
      }).passthrough()

      const success = await schema.safeParse({ list: [{ id: 'a' }], extra: true })
      expect(success.success).toBe(true)
      if (success.success) {
        expect(success.data).toEqual({ list: [{ id: 'a' }], extra: true })
      }

      const failure = await schema.safeParse({ list: [{ id: 'a', extra: true }] })
      expect(failure.success).toBe(false)
    })

    it('strip nested arrays inside strict root remove extras', async () => {
      const schema = object({
        list: array(object({ id: string() }).strip()),
      }).strict()

      const result = await schema.parse({ list: [{ id: 'a', extra: true }] })
      expect(result).toEqual({ list: [{ id: 'a' }] })
    })

    it('passthrough nested arrays inside strip root keep extras', async () => {
      const schema = object({
        list: array(object({ id: string() }).passthrough()),
      }).strip()

      const result = await schema.parse({ list: [{ id: 'a', extra: true }], extra: true })
      expect(result).toEqual({ list: [{ id: 'a', extra: true }] })
    })

    it('shape oscillation with optional nested strict objects', async () => {
      const schema = object({
        strictChild: object({ value: string() }).strict(),
        flexChild: object({ value: number() }).passthrough(),
      }).passthrough().strict().optional()

      const failure = await schema.safeParse({
        strictChild: { value: 'x', extra: true },
        flexChild: { value: 1 },
      })
      expect(failure.success).toBe(false)

      const success = await schema.safeParse({
        strictChild: { value: 'x' },
        flexChild: { value: 1, extra: true },
      })
      expect(success.success).toBe(true)
      if (success.success) {
        expect(success.data).toEqual({
          strictChild: { value: 'x' },
          flexChild: { value: 1, extra: true },
        })
      }
    })

    it('deep strict chain ensures all extras removed', async () => {
      const schema = object({
        level1: object({
          level2: object({
            level3: object({ value: string() }).strict(),
          }).strict(),
        }).strict(),
      }).strict()

      const failure = await schema.safeParse({
        level1: {
          level2: {
            level3: { value: 'x', extra: true },
          },
        },
      })
      expect(failure.success).toBe(false)

      const success = await schema.safeParse({
        level1: {
          level2: {
            level3: { value: 'x' },
          },
        },
      })
      expect(success.success).toBe(true)
      if (success.success) {
        expect(success.data).toEqual({
          level1: {
            level2: {
              level3: { value: 'x' },
            },
          },
        })
      }
    })
  })

  describe('runtime edge cases - union permutations and literal/enum stress', () => {
    it('union of strict and passthrough objects respects each branch', async () => {
      const strictSchema = object({ id: string(), tag: literal('strict') }).strict()
      const passSchema = object({ id: string(), tag: literal('pass') }).passthrough()
      const schema = union([strictSchema, passSchema])

      const strictResult = await schema.safeParse({ id: 'a', tag: 'strict' })
      expect(strictResult.success).toBe(true)

      const strictFailure = await schema.safeParse({ id: 'a', tag: 'strict', extra: true })
      expect(strictFailure.success).toBe(false)

      const passResult = await schema.safeParse({ id: 'a', tag: 'pass', extra: true })
      expect(passResult.success).toBe(true)
      if (passResult.success) {
        expect(passResult.data).toEqual({ id: 'a', tag: 'pass', extra: true })
      }
    })

    it('union inside arrays maintains branch behaviors', async () => {
      const schema = array(
        union([
          object({ kind: literal('A'), value: string() }).strict(),
          object({ kind: literal('B'), value: number() }).passthrough(),
          object({ kind: literal('C'), value: boolean() }).passthrough().strip(),
        ]),
      )

      const result = await schema.parse([
        { kind: 'A', value: 'x' },
        { kind: 'B', value: 1, extra: true },
        { kind: 'C', value: true, extra: 'drop' },
      ])

      expect(result).toEqual([
        { kind: 'A', value: 'x' },
        { kind: 'B', value: 1, extra: true },
        { kind: 'C', value: true },
      ])
    })

    it('nested union returns correct branch output', async () => {
      const schema = union([
        literal('nested'),
        union([
          boolean().default(true),
          number().min(0),
        ]),
      ]).optional().nullable().required()

      const literalResult = await schema.parse('nested')
      expect(literalResult).toBe('nested')

      const nestedBoolean = await schema.parse(undefined)
      expect(nestedBoolean).toBe(true)

      const numberResult = await schema.parse(3)
      expect(numberResult).toBe(3)

      const nullResult = await schema.parse(null)
      expect(nullResult).toBe(true) // true through boolean().default(true)
    })

    it('union default after optional returns fallback', async () => {
      const schema = union([string(), number()]).optional().default('fallback')

      const result = await schema.parse(undefined)
      expect(result).toBe('fallback')

      const stringResult = await schema.parse('value')
      expect(stringResult).toBe('value')

      const numberResult = await schema.parse(1)
      expect(numberResult).toBe(1)
    })

    it('union default then nullish reintroduces undefined', async () => {
      const schema = union([string(), number()]).default('x').nullish()

      const undefinedResult = await schema.parse(undefined)
      expect(undefinedResult).toBeUndefined()

      const nullResult = await schema.parse(null)
      expect(nullResult).toBeNull()

      const provided = await schema.parse('y')
      expect(provided).toBe('y')
    })

    it('union nested inside object with root default', async () => {
      const schema = object({
        option: union([
          object({ type: literal('A'), value: number().default(1) }),
          object({ type: literal('B'), value: string().default('b') }),
        ]).default({ type: 'A', value: 1 }),
      }).default({ option: { type: 'A', value: 1 } })

      const result = await schema.parse(undefined)
      expect(result).toEqual({ option: { type: 'A', value: 1 } })

      const provided = await schema.parse({ option: { type: 'B' } })
      expect(provided).toEqual({ option: { type: 'B', value: 'b' } })
    })

    it('intersection-like transform preserves literal', async () => {
      const base = object({ tag: literal('CONST'), value: number() })
      const schema = base.transform(v => ({ tag: v.tag, meta: { created: v.value } }))

      const result = await schema.parse({ tag: 'CONST', value: 10 })
      expect(result).toEqual({ tag: 'CONST', meta: { created: 10 } })

      const failure = await schema.safeParse({ tag: 'WRONG', value: 10 })
      expect(failure.success).toBe(false)
    })

    it('union of literal and enum matches runtime values', async () => {
      const schema = object({
        endpoint: union([literal('v1'), literal('v2'), string()]),
        method: union([enumSchema(['GET', 'POST']), literal('PUT'), literal('DELETE')]),
        response: union([
          object({ success: boolean().default(true), data: string() }),
          object({ success: boolean().default(false), error: string() }),
          object({ pending: boolean().default(true) }),
        ]),
      })

      const result = await schema.parse({
        endpoint: 'v1',
        method: 'DELETE',
        response: { pending: true },
      })

      expect(result).toEqual({
        endpoint: 'v1',
        method: 'DELETE',
        response: { pending: true },
      })

      const provided = await schema.parse({
        endpoint: 'custom',
        method: 'GET',
        response: { success: true, data: 'ok' },
      })

      expect(provided).toEqual({
        endpoint: 'custom',
        method: 'GET',
        response: { success: true, data: 'ok' },
      })
    })

    it('union of arrays and objects with defaults normalizes output', async () => {
      const schema = union([
        array(number().default(0)).default([0]),
        object({ type: literal('obj'), value: string().default('x') }).default({ type: 'obj', value: 'x' }),
        literal('primitive'),
      ]).default('primitive')

      const result = await schema.parse(undefined)
      expect(result).toEqual([0]) // [0] through array(number().default(0)).default([0])

      const arrayResult = await schema.parse([1, 2])
      expect(arrayResult).toEqual([1, 2])

      const objectResult = await schema.parse({ type: 'obj' })
      expect(objectResult).toEqual({ type: 'obj', value: 'x' })
    })

    it('union handles large combinations of literals', async () => {
      const schema = union([
        literal('exact'),
        literal(42),
        literal(3.14),
        enumSchema(['red', 'green', 'blue']),
        enumSchema([100, 200, 300]).default(200),
        string().minLength(1),
        number().min(0),
        boolean().default(true),
      ]).optional().nullable().required()

      const literalString = await schema.parse('exact')
      expect(literalString).toBe('exact')

      const literalNumber = await schema.parse(42)
      expect(literalNumber).toBe(42)

      const enumString = await schema.parse('green')
      expect(enumString).toBe('green')

      const enumNumber = await schema.parse(300)
      expect(enumNumber).toBe(300)

      const defaultEnum = await schema.parse(undefined)
      expect(defaultEnum).toBe(200) // through enumSchema([...]).default(200)

      const nullResult = await schema.parse(null)
      expect(nullResult).toBe(200) // through enumSchema([...]).default(200)
    })

    it('union optional chain accepts undefined and null with defaults', async () => {
      const schema = union([string(), number()]).optional().nullish().default('x')

      const undefinedResult = await schema.parse(undefined)
      expect(undefinedResult).toBe('x')

      const nullResult = await schema.parse(null)
      expect(nullResult).toBe('x')

      const provided = await schema.parse(5)
      expect(provided).toBe(5)
    })

    it('union of nested unions handles complex objects', async () => {
      const schema = union([
        array(object({
          id: union([string(), number()]),
          metadata: union([
            object({ version: literal(1), legacy: boolean().default(false) }),
            object({ version: literal(2), features: array(string()) }),
            object({ version: literal(3), config: enumSchema(['basic', 'advanced']) }),
          ]).optional(),
          values: array(union([
            string(),
            number(),
            boolean(),
            literal('null'),
            enumSchema(['empty', 'unknown']),
          ])),
        })),
        object({ type: literal('single'), value: boolean() }),
      ])

      const arrayResult = await schema.parse([
        {
          id: 'id-1',
          metadata: { version: 1 },
          values: ['text', 2, true, 'null'],
        },
      ])
      expect(arrayResult).toEqual([
        {
          id: 'id-1',
          metadata: { version: 1, legacy: false },
          values: ['text', 2, true, 'null'],
        },
      ])

      const objectResult = await schema.parse({ type: 'single', value: true })
      expect(objectResult).toEqual({ type: 'single', value: true })
    })

    it('literal chain with optionality returns expected values', async () => {
      const schema = literal('test').optional().required().nullable().nullish()

      const value = await schema.parse('test')
      expect(value).toBe('test')

      const nullResult = await schema.parse(null)
      expect(nullResult).toBeNull()

      const undefinedResult = await schema.parse(undefined)
      expect(undefinedResult).toBeUndefined()
    })

    it('enum chain with defaults covers nullish cases', async () => {
      const schema = enumSchema(['a', 'b']).optional().nullable().nullish().default('a')

      const undefinedResult = await schema.parse(undefined)
      expect(undefinedResult).toBe('a')

      const nullResult = await schema.parse(null)
      expect(nullResult).toBe('a')

      const provided = await schema.parse('b')
      expect(provided).toBe('b')
    })

    it('literal and enum combination ensures parse fidelity', async () => {
      const schema = object({
        config: object({
          env: literal('production'),
          debug: boolean().default(false),
          logLevel: enumSchema(['error', 'warn', 'info', 'debug']).default('info'),
          port: enumSchema([3000, 8080, 9000]),
          features: object({
            auth: boolean().default(true),
            cache: enumSchema(['redis', 'memory', 'none']).optional(),
            compression: literal('gzip').nullable(),
          }),
          servers: array(object({
            name: string(),
            type: literal('web'),
            status: enumSchema(['running', 'stopped', 'error']),
            config: object({
              cpu: enumSchema([1, 2, 4, 8]).default(2),
              memory: literal('512MB'),
            }),
          })),
        }),
      })

      const result = await schema.parse({
        config: {
          env: 'production',
          port: 8080,
          features: {
            cache: 'redis',
            compression: null,
          },
          servers: [
            {
              name: 'srv',
              type: 'web',
              status: 'running',
              config: { memory: '512MB' },
            },
          ],
        },
      })

      expect(result).toEqual({
        config: {
          env: 'production',
          debug: false,
          logLevel: 'info',
          port: 8080,
          features: {
            auth: true,
            cache: 'redis',
            compression: null,
          },
          servers: [
            {
              name: 'srv',
              type: 'web',
              status: 'running',
              config: { cpu: 2, memory: '512MB' },
            },
          ],
        },
      })
    })

    it('large literal object parse ensures no mutation of extra keys', async () => {
      const schema = object({
        stringLit: literal('exact'),
        numberLit: literal(42),
        floatLit: literal(3.14),
        zeroLit: literal(0),
        emptyLit: literal(''),
        negativeLit: literal(-1),
      })

      const result = await schema.parse({
        stringLit: 'exact',
        numberLit: 42,
        floatLit: 3.14,
        zeroLit: 0,
        emptyLit: '',
        negativeLit: -1,
      })

      expect(result).toEqual({
        stringLit: 'exact',
        numberLit: 42,
        floatLit: 3.14,
        zeroLit: 0,
        emptyLit: '',
        negativeLit: -1,
      })
    })

    it('array of literal/enum objects maintains defaults', async () => {
      const schema = array(array(object({
        type: literal('item'),
        status: enumSchema(['active', 'inactive', 'pending']),
        priority: enumSchema([1, 2, 3]).default(2),
        metadata: object({
          version: literal(1),
          flags: array(enumSchema(['read', 'write', 'execute'])),
        }).optional(),
      })))

      const result = await schema.parse([
        [
          {
            type: 'item',
            status: 'active',
            metadata: { version: 1, flags: ['read', 'write'] },
          },
        ],
      ])

      expect(result).toEqual([
        [
          {
            type: 'item',
            status: 'active',
            priority: 2,
            metadata: { version: 1, flags: ['read', 'write'] },
          },
        ],
      ])
    })

    it('union of defaulted object and array resolves defaults properly', async () => {
      const schema = union([
        object({ type: literal('obj'), value: number().default(1) }).default({ type: 'obj', value: 1 }),
        array(number().default(1)).default([1]),
        literal('primitive'),
      ]).default('primitive')

      const objectResult = await schema.parse({ type: 'obj' })
      expect(objectResult).toEqual({ type: 'obj', value: 1 })

      const arrayResult = await schema.parse([2])
      expect(arrayResult).toEqual([2])

      const objectDefaultResult = await schema.parse(undefined)
      expect(objectDefaultResult).toEqual({ type: 'obj', value: 1 }) // through object default in union
    })
  })

  describe('runtime edge cases - optionality chain limits', () => {
    it('string optional chain respects transitions', async () => {
      const schema = string()
        .optional()
        .required()
        .nullable()
        .nullish()
        .required()

      const result = await schema.parse('value')
      expect(result).toBe('value')

      const nullResult = await schema.safeParse(null)
      expect(nullResult.success).toBe(false)

      const undefinedReport = await schema.safeParse(undefined)
      expect(undefinedReport.success).toBe(false)
    })

    it('number optional chain respects transitions', async () => {
      const schema = number()
        .optional()
        .required()
        .nullable()
        .nullish()
        .required()

      const result = await schema.parse(5)
      expect(result).toBe(5)

      const nullResult = await schema.safeParse(null)
      expect(nullResult.success).toBe(false)

      const undefinedReport = await schema.safeParse(undefined)
      expect(undefinedReport.success).toBe(false)
    })

    it('boolean optional chain respects transitions', async () => {
      const schema = boolean()
        .optional()
        .required()
        .nullable()
        .nullish()
        .required()

      const result = await schema.parse(true)
      expect(result).toBe(true)

      const nullResult = await schema.safeParse(null)
      expect(nullResult.success).toBe(false)

      const undefinedReport = await schema.safeParse(undefined)
      expect(undefinedReport.success).toBe(false)
    })

    it('array optional chain respects transitions', async () => {
      const schema = array(string())
        .optional()
        .required()
        .nullable()
        .nullish()
        .required()

      const result = await schema.parse(['value'])
      expect(result).toEqual(['value'])

      const nullResult = await schema.safeParse(null)
      expect(nullResult.success).toBe(false)

      const undefinedReport = await schema.safeParse(undefined)
      expect(undefinedReport.success).toBe(false)
    })

    it('object optional chain respects transitions', async () => {
      const schema = object({ value: string() })
        .optional()
        .required()
        .nullable()
        .nullish()
        .required()

      const result = await schema.parse({ value: 'x' })
      expect(result).toEqual({ value: 'x' })

      const nullResult = await schema.safeParse(null)
      expect(nullResult.success).toBe(false)

      const undefinedReport = await schema.safeParse(undefined)
      expect(undefinedReport.success).toBe(false)
    })

    it('literal optional chain respects transitions', async () => {
      const schema = literal('x')
        .optional()
        .required()
        .nullable()
        .nullish()
        .required()

      const result = await schema.parse('x')
      expect(result).toBe('x')

      const nullResult = await schema.safeParse(null)
      expect(nullResult.success).toBe(false)

      const undefinedReport = await schema.safeParse(undefined)
      expect(undefinedReport.success).toBe(false)
    })

    it('enum optional chain respects transitions', async () => {
      const schema = enumSchema(['x', 'y'])
        .optional()
        .required()
        .nullable()
        .nullish()
        .required()

      const result = await schema.parse('x')
      expect(result).toBe('x')

      const nullResult = await schema.safeParse(null)
      expect(nullResult.success).toBe(false)

      const undefinedReport = await schema.safeParse(undefined)
      expect(undefinedReport.success).toBe(false)
    })

    it('union optional chain respects transitions', async () => {
      const schema = union([string(), number()])
        .optional()
        .required()
        .nullable()
        .nullish()
        .required()

      const resultString = await schema.parse('value')
      expect(resultString).toBe('value')

      const resultNumber = await schema.parse(5)
      expect(resultNumber).toBe(5)

      const nullResult = await schema.safeParse(null)
      expect(nullResult.success).toBe(false)

      const undefinedReport = await schema.safeParse(undefined)
      expect(undefinedReport.success).toBe(false)
    })

    it('array default chain resolves sequential defaults', async () => {
      const schema = array(string().default('x'))
        .default(['a'])
        .default(['b'])
        .default(['c'])

      const result = await schema.parse(undefined)
      expect(result).toEqual(['c'])

      const provided = await schema.parse(['value'])
      expect(provided).toEqual(['value'])
    })

    it('string default chain resolves sequential defaults', async () => {
      const schema = string()
        .default('a')
        .default('b')
        .default('c')

      const result = await schema.parse(undefined)
      expect(result).toBe('c')

      const provided = await schema.parse('value')
      expect(provided).toBe('value')
    })

    it('number default chain resolves sequential defaults', async () => {
      const schema = number()
        .default(1)
        .default(2)
        .default(3)

      const result = await schema.parse(undefined)
      expect(result).toBe(3)

      const provided = await schema.parse(5)
      expect(provided).toBe(5)
    })

    it('boolean default chain resolves sequential defaults', async () => {
      const schema = boolean()
        .default(false)
        .default(true)
        .default(false)

      const result = await schema.parse(undefined)
      expect(result).toBe(false)

      const provided = await schema.parse(true)
      expect(provided).toBe(true)
    })

    it('object default chain resolves sequential defaults', async () => {
      const schema = object({ value: number().default(1) })
        .default({ value: 1 })
        .default({ value: 2 })
        .default({ value: 3 })

      const result = await schema.parse(undefined)
      expect(result).toEqual({ value: 3 })

      const provided = await schema.parse({ value: 10 })
      expect(provided).toEqual({ value: 10 })
    })

    it('union default chain resolves sequential defaults', async () => {
      const schema = union([literal('x'), literal('y')])
        .default('x')
        .default('y')
        .default('z' as 'x')

      const result = await schema.parse(undefined)
      expect(result).toBe('z')

      const provided = await schema.parse('x')
      expect(provided).toBe('x')
    })

    it('validation chain with optionality enforces constraints', async () => {
      const schema = string()
        .minLength(1)
        .maxLength(100)
        .startsWith('prefix')
        .endsWith('suffix')
        .optional()
        .default('prefix-default-suffix')
        .nullable()
        .required()
        .nullish()
        .minLength(5)
        .maxLength(50)

      const nullishResult = await schema.parse(undefined)
      expect(nullishResult).toBe(undefined)

      const validResult = await schema.parse('prefix-data-suffix')
      expect(validResult).toBe('prefix-data-suffix')

      const nullResult = await schema.parse(null)
      expect(nullResult).toBeNull()

      const failure = await schema.safeParse('pre-short')
      expect(failure.success).toBe(false)
    })
  })

  describe('runtime edge cases - deep nesting and structural stress', () => {
    it('parses ten-level nested object', async () => {
      const schema = object({
        level1: object({
          level2: object({
            level3: object({
              level4: object({
                level5: object({
                  level6: object({
                    level7: object({
                      level8: object({
                        level9: object({
                          level10: string(),
                        }),
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      })

      const result = await schema.parse({
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  level6: {
                    level7: {
                      level8: {
                        level9: {
                          level10: 'end',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      })

      expect(result.level1.level2.level3.level4.level5.level6.level7.level8.level9.level10).toBe('end')
    })

    it('rejects missing deep field in nested object', async () => {
      const schema = object({
        level1: object({
          level2: object({
            level3: object({
              level4: object({
                level5: object({
                  level6: object({
                    level7: object({
                      level8: object({
                        level9: object({
                          level10: string(),
                        }),
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      })

      const failure = await schema.safeParse({
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  level6: {
                    level7: {
                      level8: {
                        level9: {},
                      },
                    },
                  },
                },
              },
            },
          },
        },
      })

      expect(failure.success).toBe(false)
    })

    it('parses deeply nested arrays of strings', async () => {
      const schema = array(array(array(array(array(array(array(array(string()))))))))

      const result = await schema.parse([[[[[[[['value']]]]]]]])
      expect(result).toEqual([[[[[[[['value']]]]]]]])
    })

    it('parses tree-like structure with optionality variations', async () => {
      const schema = object({
        root: object({
          required: object({
            id: string(),
            children: array(object({ id: string(), data: string() })),
          }),
          optional: object({
            id: string(),
            children: array(object({ id: string(), data: string() })),
          }).optional(),
          nullable: object({
            id: string(),
            children: array(object({ id: string(), data: string() })),
          }).nullable(),
          nullish: object({
            id: string(),
            children: array(object({ id: string(), data: string() })),
          }).nullish(),
        }),
      })

      const result = await schema.parse({
        root: {
          required: {
            id: 'root',
            children: [{ id: 'child', data: 'value' }],
          },
          optional: {
            id: 'opt',
            children: [],
          },
          nullable: null,
          nullish: undefined,
        },
      })

      expect(result).toEqual({
        root: {
          required: { id: 'root', children: [{ id: 'child', data: 'value' }] },
          optional: { id: 'opt', children: [] },
          nullable: null,
          nullish: undefined,
        },
      })
    })

    it('rejects tree-like structure when required child missing', async () => {
      const schema = object({
        root: object({
          required: object({
            id: string(),
            children: array(object({ id: string(), data: string() })),
          }),
          optional: object({
            id: string(),
            children: array(object({ id: string(), data: string() })),
          }).optional(),
          nullable: object({
            id: string(),
            children: array(object({ id: string(), data: string() })),
          }).nullable(),
          nullish: object({
            id: string(),
            children: array(object({ id: string(), data: string() })),
          }).nullish(),
        }),
      })

      const failure = await schema.safeParse({
        root: {
          required: {
            id: 'root',
            children: [{ id: 'child' }],
          },
        },
      })

      expect(failure.success).toBe(false)
    })

    it('parses pseudo-circular node structure', async () => {
      const nodeSchema = object({
        id: string(),
        value: number(),
        children: array(object({
          id: string(),
          value: number(),
          children: array(object({
            id: string(),
            value: number(),
            children: array(object({
              id: string(),
              value: number(),
            })),
          })),
        })),
      })

      const result = await nodeSchema.parse({
        id: 'root',
        value: 1,
        children: [
          {
            id: 'child1',
            value: 2,
            children: [
              {
                id: 'grandchild',
                value: 3,
                children: [
                  {
                    id: 'leaf',
                    value: 4,
                  },
                ],
              },
            ],
          },
        ],
      })

      const firstChild = result.children[0]
      expect(firstChild).toBeDefined()
      if (firstChild) {
        const firstGrandchild = firstChild.children[0]
        expect(firstGrandchild).toBeDefined()
        if (firstGrandchild) {
          const firstGreatGrandchild = firstGrandchild.children[0]
          expect(firstGreatGrandchild).toBeDefined()
          if (firstGreatGrandchild) {
            expect(firstGreatGrandchild.value).toBe(4)
          }
        }
      }
    })

    it('rejects pseudo-circular node when value invalid', async () => {
      const nodeSchema = object({
        id: string(),
        value: number().min(0),
        children: array(object({
          id: string(),
          value: number().min(0),
          children: array(object({
            id: string(),
            value: number().min(0),
            children: array(object({
              id: string(),
              value: number().min(0),
            })),
          })),
        })),
      })

      const failure = await nodeSchema.safeParse({
        id: 'root',
        value: -1,
        children: [],
      })

      expect(failure.success).toBe(false)
    })

    it('deep array/object mixture maintains structure', async () => {
      const schema = array(array(array(
        object({
          data: array(array(
            object({
              values: array(number()),
              metadata: object({ info: array(string()) }),
            }),
          )),
        }),
      )))

      const result = await schema.parse([
        [
          [
            {
              data: [
                [
                  {
                    values: [1, 2],
                    metadata: { info: ['a', 'b'] },
                  },
                ],
              ],
            },
          ],
        ],
      ])

      const firstLayer = result[0]
      expect(firstLayer).toBeDefined()
      if (firstLayer) {
        const secondLayer = firstLayer[0]
        expect(secondLayer).toBeDefined()
        if (secondLayer) {
          const thirdLayer = secondLayer[0]
          expect(thirdLayer).toBeDefined()
          if (thirdLayer) {
            const innerData = thirdLayer.data[0]
            expect(innerData).toBeDefined()
            if (innerData) {
              const innerObject = innerData[0]
              expect(innerObject).toBeDefined()
              if (innerObject) {
                expect(innerObject.values).toEqual([1, 2])
              }
            }
          }
        }
      }
    })

    it('wide object with many nested levels enforces each branch', async () => {
      const schema = object({
        branch1: object({ leaf: string() }),
        branch2: object({ leaf: number() }),
        branch3: object({ leaf: boolean() }),
        branch4: object({ leaf: array(string()) }),
        branch5: object({ leaf: object({ subleaf: string() }) }),
        branch6: object({ leaf: object({ subleaf: number() }) }),
        branch7: object({ leaf: object({ subleaf: boolean() }) }),
        branch8: object({ leaf: object({ subleaf: array(string()) }) }),
        branch9: object({ leaf: object({ subleaf: object({ deepleaf: string() }) }) }),
        branch10: object({ leaf: object({ subleaf: object({ deepleaf: number() }) }) }),
      })

      const result = await schema.parse({
        branch1: { leaf: 'a' },
        branch2: { leaf: 1 },
        branch3: { leaf: true },
        branch4: { leaf: ['x'] },
        branch5: { leaf: { subleaf: 's' } },
        branch6: { leaf: { subleaf: 2 } },
        branch7: { leaf: { subleaf: false } },
        branch8: { leaf: { subleaf: ['y'] } },
        branch9: { leaf: { subleaf: { deepleaf: 'deep' } } },
        branch10: { leaf: { subleaf: { deepleaf: 9 } } },
      })

      expect(result.branch9.leaf.subleaf.deepleaf).toBe('deep')
    })

    it('rejects wide object when nested value invalid', async () => {
      const schema = object({
        branch1: object({ leaf: string() }),
        branch2: object({ leaf: number().min(0) }),
        branch3: object({ leaf: boolean() }),
        branch4: object({ leaf: array(string()) }),
        branch5: object({ leaf: object({ subleaf: string() }) }),
        branch6: object({ leaf: object({ subleaf: number() }) }),
        branch7: object({ leaf: object({ subleaf: boolean() }) }),
        branch8: object({ leaf: object({ subleaf: array(string()) }) }),
        branch9: object({ leaf: object({ subleaf: object({ deepleaf: string() }) }) }),
        branch10: object({ leaf: object({ subleaf: object({ deepleaf: number() }) }) }),
      })

      const failure = await schema.safeParse({
        branch1: { leaf: 'a' },
        branch2: { leaf: -1 },
        branch3: { leaf: true },
        branch4: { leaf: ['x'] },
        branch5: { leaf: { subleaf: 's' } },
        branch6: { leaf: { subleaf: 2 } },
        branch7: { leaf: { subleaf: false } },
        branch8: { leaf: { subleaf: ['y'] } },
        branch9: { leaf: { subleaf: { deepleaf: 'deep' } } },
        branch10: { leaf: { subleaf: { deepleaf: 9 } } },
      })

      expect(failure.success).toBe(false)
    })

    it('string with all validation methods respects values', async () => {
      const schema = string()
        .minLength(10)
        .maxLength(50)
        .startsWith('start')
        .endsWith('end')
        .default(`start${'a'.repeat(19)}end`)

      const defaultResult = await schema.parse(undefined)
      expect(defaultResult).toBe(`start${'a'.repeat(19)}end`)

      const provided = await schema.parse(`start${'b'.repeat(19)}end`)
      expect(provided).toBe(`start${'b'.repeat(19)}end`)

      const failure = await schema.safeParse('short')
      expect(failure.success).toBe(false)
    })

    it('number with stacked validations respects constraints', async () => {
      const schema = number()
        .min(-100)
        .max(100)
        .min(0)
        .max(50)
        .default(25)

      const defaultResult = await schema.parse(undefined)
      expect(defaultResult).toBe(25)

      const provided = await schema.parse(30)
      expect(provided).toBe(30)

      const failureLow = await schema.safeParse(-1)
      expect(failureLow.success).toBe(false)

      const failureHigh = await schema.safeParse(60)
      expect(failureHigh.success).toBe(false)
    })

    it('array with stacked validations respects constraints', async () => {
      const schema = array(
        object({
          id: string().minLength(1).maxLength(10),
          value: number().min(0).max(100).default(50),
          active: boolean().default(true),
          tags: array(string().minLength(1)).optional(),
        }),
      )
        .minLength(1)
        .maxLength(10)
        .length(5)

      const result = await schema.parse([
        { id: 'a', value: 10 },
        { id: 'b', value: 20 },
        { id: 'c', value: 30 },
        { id: 'd', value: 40 },
        { id: 'e', value: 50 },
      ])

      expect(result).toHaveLength(5)

      const failure = await schema.safeParse([{ id: '', value: 10 }])
      expect(failure.success).toBe(false)
    })

    it('conflicting validation chain still parses runtime values', async () => {
      const schema = string().minLength(10).maxLength(5)

      const failure = await schema.safeParse('123456')
      expect(failure.success).toBe(false)
    })

    it('mixed optionality in complex structure matches runtime output', async () => {
      const schema = object({
        a: string().optional().nullable().required().nullish(),
        b: number().nullable().optional().required(),
        c: boolean().nullish().required().optional(),
        d: array(string().optional().required()).nullable().optional(),
        e: object({
          nested: string().required().optional().nullable(),
        }).optional().required().nullish(),
      })

      const result = await schema.parse({
        a: null,
        b: 5,
        c: true,
        d: ['x'],
        e: { nested: 'value' },
      })

      expect(result).toEqual({
        a: null,
        b: 5,
        c: true,
        d: ['x'],
        e: { nested: 'value' },
      })

      const nullishResult = await schema.parse({
        a: undefined,
        b: 5,
        c: undefined,
        d: undefined,
        e: undefined,
      })

      expect(nullishResult).toEqual({
        a: undefined,
        b: 5,
        c: undefined,
        d: undefined,
        e: undefined,
      })
    })
  })
})
