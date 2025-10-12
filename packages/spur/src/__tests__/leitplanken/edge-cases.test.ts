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
})
