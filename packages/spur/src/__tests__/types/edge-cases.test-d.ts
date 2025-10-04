import type { InferInput, InferOutput } from '../../types/utils'

import { describe, expectTypeOf, it } from 'vitest'

import { array } from '../../leitplanken/array'
import { boolean } from '../../leitplanken/boolean'
import { enum_ } from '../../leitplanken/enum'
import { literal } from '../../leitplanken/literal'
import { number } from '../../leitplanken/number'
import { object } from '../../leitplanken/object'
import { string } from '../../leitplanken/string'
import { union } from '../../leitplanken/union'

describe('edge cases - extreme type complexity', () => {
  it('maximum nesting depth', () => {
    const _schema = object({
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

    interface ExpectedType {
      level1: {
        level2: {
          level3: {
            level4: {
              level5: {
                level6: {
                  level7: {
                    level8: {
                      level9: {
                        level10: string
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<ExpectedType>()
  })

  it('maximum array nesting', () => {
    const _schema = array(array(array(array(array(array(array(array(string()))))))))
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[][][][][][][][]>()
  })

  it('mixed deep nesting with all optionality types', () => {
    const _schema = object({
      required: object({
        value: string(),
      }),
      optional: object({
        value: string(),
      }).optional(),
      nullable: object({
        value: string(),
      }).nullable(),
      nullish: object({
        value: string(),
      }).nullish(),
      defaulted: object({
        value: string().default('default'),
      }),
    })

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      required: { value: string }
      nullable: { value: string } | null
      nullish: { value: string } | undefined | null
      defaulted: { value: string }
      optional?: { value: string } | undefined
    }>()
  })
})

describe('edge cases - object shape modes with extreme combinations', () => {
  it('root passthrough adds index signature while nested strict removes it', () => {
    const _schema = object({
      id: string(),
      meta: object({
        version: number(),
        flags: array(string()),
      }).strict(),
      data: object({
        payload: object({
          value: number(),
        }).passthrough(),
      }).passthrough(),
    }).passthrough()

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      id: string
      meta: {
        version: number
        flags: string[]
      }
      data: {
        payload: {
          value: number
          [key: string]: any
        }
        [key: string]: any
      }
      [key: string]: any
    }>()
  })

  it('shape mode oscillation ends in strip (no index signature)', () => {
    const _schema = object({
      a: string(),
      b: number().optional(),
    })
      .passthrough()
      .strict()
      .passthrough()
      .strip() // final

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      a: string
      b?: number
    }>()
  })

  it('shape mode oscillation ends in passthrough (index signature present)', () => {
    const _schema = object({
      user: object({ name: string() }),
      count: number().nullable(),
    })
      .strict()
      .strip()
      .passthrough() // final
      .nullable()

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      user: { name: string }
      count: number | null
      [key: string]: any
    } | null>()
  })

  it('passthrough + optional root', () => {
    const _schema = object({
      alpha: string().optional(),
      beta: number().undefinable(),
    }).passthrough().optional()

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      alpha?: string
      beta: number | undefined
      [key: string]: any
    } | undefined>()
  })

  it('nested differing final shape modes', () => {
    const _schema = object({
      strictChild: object({ x: string() }).strict(),
      passthroughChild: object({ y: number() }).passthrough(),
      stripChild: object({ z: boolean() }).passthrough().strip(),
    }).strict()

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      strictChild: { x: string }
      passthroughChild: { y: number, [key: string]: any }
      stripChild: { z: boolean }
    }>()
  })

  it('deep nesting alternating shapes', () => {
    const _schema = object({
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

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      level1: {
        a: string
        level2: {
          b: number
          level3: {
            c: boolean
            [key: string]: any
          }
        }
        [key: string]: any
      }
    }>()
  })

  it('union of strict vs passthrough objects', () => {
    const _strict = object({ id: string(), tag: literal('strict') }).strict()
    const _passthrough = object({ id: string(), tag: literal('pass') }).passthrough()
    const _schema = union([
      _strict,
      _passthrough,
    ])

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<
      | { id: string, tag: 'strict' }
      | { id: string, tag: 'pass', [key: string]: any }
    >()
  })

  it('array of objects with different final shapes (inside union stress)', () => {
    const _schema = array(
      union([
        object({ kind: literal('A'), value: string() }).strict(),
        object({ kind: literal('B'), value: number() }).passthrough(),
        object({ kind: literal('C'), value: boolean() }).passthrough().strip(),
      ]),
    )

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<
      | { kind: 'A', value: string }
      | { kind: 'B', value: number, [key: string]: any }
      | { kind: 'C', value: boolean }
    >>()
  })

  it('passthrough after nullish then required (final passthrough)', () => {
    const _schema = object({
      core: string(),
    })
      .nullish()
      .required()
      .passthrough()

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      core: string
      [key: string]: any
    }>()
  })

  it('strip after passing through optional and nullable', () => {
    const _schema = object({ id: number().nullable(), name: string().optional() })
      .passthrough()
      .optional()
      .nullable()
      .strip()

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      id: number | null
      name?: string
    } | null>()
  })

  it('deep chain ending in passthrough optional with nested passthrough children', () => {
    const _schema = object({
      parent: object({
        child: object({ leaf: string() }).passthrough(),
      }).strip(),
      meta: object({ created: number() }).passthrough(),
    })
      .strip()
      .passthrough()
      .optional()

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      parent: { child: { leaf: string, [key: string]: any } }
      meta: { created: number, [key: string]: any }
      [key: string]: any
    } | undefined>()
  })
})

describe('transform edge cases', () => {
  it('extreme shape oscillation followed by transform', () => {
    const base = object({
      a: number(),
      b: object({ c: string().optional(), d: number().nullable() }).optional(),
      e: union([object({ kind: literal('x'), v: number() }), object({ kind: literal('y'), w: string() })]),
    })
      .strip()
      .passthrough()
      .strict()
      .passthrough()
      .optional()

    const _mid = base.transform(v => v ? ({ tag: v.e.kind, hasC: !!(v.b && v.b.c) }) : { tag: 'x' as 'x' | 'y', hasC: false })
    expectTypeOf<InferOutput<typeof _mid>>().toEqualTypeOf<{ tag: 'x' | 'y', hasC: boolean }>()
  })

  it('summarizes deep nested array/object structure', () => {
    const base = object({ items: union([
      object({ type: literal('x'), value: number() }),
      object({ type: literal('y'), value: string() }),
    ]).optional() }).optional()

    const _mapped2 = base.transform((v) => {
      if (!v || !v.items)
        return { total: 0, kinds: [] as ('x' | 'y')[] }
      return { total: (v.items as any).length as number, kinds: (v.items as any).map((i: any) => i.type) as ('x' | 'y')[] }
    })

    expectTypeOf<InferOutput<typeof _mapped2>>().toEqualTypeOf<{ total: number, kinds: ('x' | 'y')[] }>()
  })

  it('intersection output preserving narrowed literal', () => {
    const base = object({ tag: literal('CONST'), value: number() })
    interface Extra { meta: { created: number } }
    const _mapped3 = base.transform(v => ({ tag: v.tag, meta: { created: v.value } } as { tag: 'CONST' } & Extra))
    expectTypeOf<InferOutput<typeof _mapped3>>().toEqualTypeOf<{ tag: 'CONST', meta: { created: number } }>()
  })

  it('input shape stability across transform chain', () => {
    const _base = object({ a: number(), b: string().optional() }).transform(v => v.a)

    type Input = InferInput<typeof _base>

    expectTypeOf<Input>().toEqualTypeOf<{ a: number, b?: string }>()
  })
})

describe('edge cases - literal and enum complexity', () => {
  it('object with all literal types', () => {
    const _schema = object({
      stringLit: literal('exact'),
      numberLit: literal(42),
      floatLit: literal(3.14),
      zeroLit: literal(0),
      emptyLit: literal(''),
      negativeLit: literal(-1),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      stringLit: 'exact'
      numberLit: 42
      floatLit: 3.14
      zeroLit: 0
      emptyLit: ''
      negativeLit: -1
    }>()
  })

  it('object with all enum types', () => {
    const _schema = object({
      colors: enum_(['red', 'green', 'blue']),
      numbers: enum_([1, 2, 3, 4, 5]),
      mixed: enum_(['none', 0, 'all', 100]),
      single: enum_(['only']),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      colors: 'red' | 'green' | 'blue'
      numbers: 1 | 2 | 3 | 4 | 5
      mixed: 'none' | 0 | 'all' | 100
      single: 'only'
    }>()
  })

  it('nested arrays with literal and enum elements', () => {
    const _schema = array(array(object({
      type: literal('item'),
      status: enum_(['active', 'inactive', 'pending']),
      priority: enum_([1, 2, 3]).default(2),
      metadata: object({
        version: literal(1),
        flags: array(enum_(['read', 'write', 'execute'])),
      }).optional(),
    })))

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<Array<{
      type: 'item'
      status: 'active' | 'inactive' | 'pending'
      priority: 1 | 2 | 3
      metadata?: {
        version: 1
        flags: Array<'read' | 'write' | 'execute'>
      }
    }>>>()
  })

  it('literal and enum through all optionality states', () => {
    const _schema1 = literal('test')
    const _schema2 = literal('test').optional()
    const _schema3 = literal('test').optional().required()
    const _schema4 = literal('test').nullable()
    const _schema5 = literal('test').nullish()
    const _schema6 = literal('test').default('test').optional()

    expectTypeOf<InferOutput<typeof _schema1>>().toEqualTypeOf<'test'>()
    expectTypeOf<InferOutput<typeof _schema2>>().toEqualTypeOf<'test' | undefined>()
    expectTypeOf<InferOutput<typeof _schema3>>().toEqualTypeOf<'test'>()
    expectTypeOf<InferOutput<typeof _schema4>>().toEqualTypeOf<'test' | null>()
    expectTypeOf<InferOutput<typeof _schema5>>().toEqualTypeOf<'test' | undefined | null>()
    expectTypeOf<InferOutput<typeof _schema6>>().toEqualTypeOf<'test' | undefined>()

    const _enum1 = enum_(['a', 'b'])
    const _enum2 = enum_(['a', 'b']).optional()
    const _enum3 = enum_(['a', 'b']).nullable().required()
    const _enum4 = enum_(['a', 'b']).default('a').nullish()

    expectTypeOf<InferOutput<typeof _enum1>>().toEqualTypeOf<'a' | 'b'>()
    expectTypeOf<InferOutput<typeof _enum2>>().toEqualTypeOf<'a' | 'b' | undefined>()
    expectTypeOf<InferOutput<typeof _enum3>>().toEqualTypeOf<'a' | 'b'>()
    expectTypeOf<InferOutput<typeof _enum4>>().toEqualTypeOf<'a' | 'b' | undefined | null>()
  })

  it('complex object with mixed literal, enum, and primitives', () => {
    const _schema = object({
      config: object({
        env: literal('production'),
        debug: boolean().default(false),
        logLevel: enum_(['error', 'warn', 'info', 'debug']).default('info'),
        port: enum_([3000, 8080, 9000]),
        features: object({
          auth: boolean().default(true),
          cache: enum_(['redis', 'memory', 'none']).optional(),
          compression: literal('gzip').nullable(),
        }),
        servers: array(object({
          name: string(),
          type: literal('web'),
          status: enum_(['running', 'stopped', 'error']),
          config: object({
            cpu: enum_([1, 2, 4, 8]).default(2),
            memory: literal('512MB'),
          }),
        })),
      }),
    })

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      config: {
        env: 'production'
        debug: boolean
        logLevel: 'error' | 'warn' | 'info' | 'debug'
        port: 3000 | 8080 | 9000
        features: {
          auth: boolean
          compression: 'gzip' | null
          cache?: 'redis' | 'memory' | 'none'
        }
        servers: Array<{
          name: string
          type: 'web'
          status: 'running' | 'stopped' | 'error'
          config: {
            cpu: 1 | 2 | 4 | 8
            memory: '512MB'
          }
        }>
      }
    }>()
  })

  it('complex union combinations in nested structures', () => {
    const _schema = object({
      api: object({
        endpoint: union([literal('v1'), literal('v2'), string()]),
        method: union([
          enum_(['GET', 'POST']),
          literal('PUT'),
          literal('DELETE'),
        ]),
        response: union([
          object({ success: boolean().default(true), data: string() }),
          object({ success: boolean().default(false), error: string() }),
          object({ pending: boolean().default(true) }),
        ]),
        headers: array(union([
          object({ type: literal('auth'), token: string() }),
          object({ type: literal('content'), value: literal('application/json') }),
          object({ type: literal('custom'), key: string(), value: string() }),
        ])),
      }),
    })

    type ApiSchema = InferOutput<typeof _schema>

    expectTypeOf<ApiSchema>().toEqualTypeOf<{
      api: {
        endpoint: 'v1' | 'v2' | string
        method: 'GET' | 'POST' | 'PUT' | 'DELETE'
        response:
          | { success: boolean, data: string }
          | { success: boolean, error: string }
          | { pending: boolean }
        headers: Array<
          | { type: 'auth', token: string }
          | { type: 'content', value: 'application/json' }
          | { type: 'custom', key: string, value: string }
        >
      }
    }>()
  })
})

describe('edge cases - union complexity', () => {
  it('union through all optionality states', () => {
    const _schema1 = union([string(), number()])
    const _schema2 = union([string(), number()]).optional()
    const _schema3 = union([string(), number()]).optional().required()
    const _schema4 = union([string(), number()]).nullable()
    const _schema5 = union([string(), number()]).nullish()
    const _schema6 = union([string(), number()]).nullish().required()

    expectTypeOf<InferOutput<typeof _schema1>>().toEqualTypeOf<string | number>()
    expectTypeOf<InferOutput<typeof _schema2>>().toEqualTypeOf<string | number | undefined>()
    expectTypeOf<InferOutput<typeof _schema3>>().toEqualTypeOf<string | number>()
    expectTypeOf<InferOutput<typeof _schema4>>().toEqualTypeOf<string | number | null>()
    expectTypeOf<InferOutput<typeof _schema5>>().toEqualTypeOf<string | number | undefined | null>()
    expectTypeOf<InferOutput<typeof _schema6>>().toEqualTypeOf<string | number>()
  })

  it('nested unions with all schema types', () => {
    const _schema = array(object({
      id: union([string(), number()]),
      type: union([
        literal('user'),
        literal('admin'),
        enum_(['guest', 'member']),
      ]),
      metadata: union([
        object({ version: literal(1), legacy: boolean().default(false) }),
        object({ version: literal(2), features: array(string()) }),
        object({ version: literal(3), config: enum_(['basic', 'advanced']) }),
      ]).optional(),
      values: array(union([
        string(),
        number(),
        boolean(),
        literal('null'),
        enum_(['empty', 'unknown']),
      ])),
    }))

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<{
      id: string | number
      type: 'user' | 'admin' | 'guest' | 'member'
      values: Array<string | number | boolean | 'null' | 'empty' | 'unknown'>
      metadata?:
        | { version: 1, legacy: boolean }
        | { version: 2, features: string[] }
        | { version: 3, config: 'basic' | 'advanced' }
    }>>()
  })

  it('maximum union complexity with all features', () => {
    const _schema = union([
      // Primitives
      string().minLength(1),
      number().min(0),
      boolean().default(true),

      // Literals
      literal('exact'),
      literal(42),
      literal(3.14),

      // OneOf schemas
      enum_(['red', 'green', 'blue']),
      enum_([100, 200, 300]).default(200),

      // Nested union
      union([literal('nested'), boolean()]),
    ]).optional().nullable().required()

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<
      string | number | boolean | 'exact' | 42 | 3.14 | 'red' | 'green' | 'blue' | 100 | 200 | 300
    >()
  })
})

describe('edge cases - optionality chain limits', () => {
  it('string through all optionality states', () => {
    const _schema1 = string()
    const _schema2 = string().optional()
    const _schema3 = string().optional().required()
    const _schema4 = string().optional().required().nullable()
    const _schema5 = string().optional().required().nullable().nullish()
    const _schema6 = string().optional().required().nullable().nullish().required()

    expectTypeOf<InferOutput<typeof _schema1>>().toEqualTypeOf<string>()
    expectTypeOf<InferOutput<typeof _schema2>>().toEqualTypeOf<string | undefined>()
    expectTypeOf<InferOutput<typeof _schema3>>().toEqualTypeOf<string>()
    expectTypeOf<InferOutput<typeof _schema4>>().toEqualTypeOf<string | null>()
    expectTypeOf<InferOutput<typeof _schema5>>().toEqualTypeOf<string | undefined | null>()
    expectTypeOf<InferOutput<typeof _schema6>>().toEqualTypeOf<string>()
  })

  it('default chain stress test', () => {
    const _schema1 = string().default('a')
    const _schema2 = string().default('a').default('b')
    const _schema3 = string().default('a').default('b')
    const _schema4 = string().default('a').default('b').default('c')
    const _schema5 = string().default('a').optional().default('b').nullable().default('c')

    expectTypeOf<InferOutput<typeof _schema1>>().toEqualTypeOf<string>()
    expectTypeOf<InferOutput<typeof _schema2>>().toEqualTypeOf<string>()
    expectTypeOf<InferOutput<typeof _schema3>>().toEqualTypeOf<string>()
    expectTypeOf<InferOutput<typeof _schema4>>().toEqualTypeOf<string>()
    expectTypeOf<InferOutput<typeof _schema5>>().toEqualTypeOf<string>()
  })

  it('validation chain with optionality', () => {
    const _schema = string()
      .minLength(1)
      .maxLength(100)
      .startsWith('prefix')
      .endsWith('suffix')
      .optional()
      .default('prefixsomethingsuffix')
      .nullable()
      .required()
      .nullish()
      .minLength(5)
      .maxLength(50)

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined | null>()
  })
})

describe('edge cases - large object schemas', () => {
  it('object with 20+ properties of different types', () => {
    const _schema = object({
      prop1: string(),
      prop2: string().optional(),
      prop3: string().nullable(),
      prop4: string().nullish(),
      prop5: string().default('default'),
      prop6: number(),
      prop7: number().optional(),
      prop8: number().nullable(),
      prop9: number().nullish(),
      prop10: number().default(42),
      prop11: boolean(),
      prop12: boolean().optional(),
      prop13: boolean().nullable(),
      prop14: boolean().nullish(),
      prop15: boolean().default(true),
      prop16: array(string()),
      prop17: array(string()).optional(),
      prop18: array(string()).nullable(),
      prop19: array(number()),
      prop20: array(boolean()),
      prop21: object({ nested: string() }),
      prop22: object({ nested: string() }).optional(),
      prop23: object({ nested: string() }).nullable(),
    })

    interface ExpectedType {
      prop1: string
      prop3: string | null
      prop4: string | undefined | null
      prop5: string
      prop6: number
      prop8: number | null
      prop9: number | undefined | null
      prop10: number
      prop11: boolean
      prop13: boolean | null
      prop14: boolean | undefined | null
      prop15: boolean
      prop16: string[]
      prop18: string[] | null
      prop19: number[]
      prop20: boolean[]
      prop21: { nested: string }
      prop23: { nested: string } | null
      prop2?: string
      prop7?: number
      prop12?: boolean
      prop17?: string[]
      prop22?: { nested: string }
    }

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<ExpectedType>()
  })
})

describe('edge cases - circular-like references simulation', () => {
  it('pseudo-circular object structure', () => {
    // Simulating circular references with deep nesting
    const _nodeSchema = object({
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

    interface ExpectedNodeType {
      id: string
      value: number
      children: Array<{
        id: string
        value: number
        children: Array<{
          id: string
          value: number
          children: Array<{
            id: string
            value: number
          }>
        }>
      }>
    }

    expectTypeOf<InferOutput<typeof _nodeSchema>>().toEqualTypeOf<ExpectedNodeType>()
  })

  it('tree-like structure with all optionality types', () => {
    const _schema = object({
      root: object({
        required: object({
          id: string(),
          children: array(object({
            id: string(),
            data: string(),
          })),
        }),
        optional: object({
          id: string(),
          children: array(object({
            id: string(),
            data: string(),
          })),
        }).optional(),
        nullable: object({
          id: string(),
          children: array(object({
            id: string(),
            data: string(),
          })),
        }).nullable(),
        nullish: object({
          id: string(),
          children: array(object({
            id: string(),
            data: string(),
          })),
        }).nullish(),
      }),
    })

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      root: {
        required: {
          id: string
          children: Array<{
            id: string
            data: string
          }>
        }
        nullable: {
          id: string
          children: Array<{
            id: string
            data: string
          }>
        } | null
        nullish: {
          id: string
          children: Array<{
            id: string
            data: string
          }>
        } | undefined | null
        optional?: {
          id: string
          children: Array<{
            id: string
            data: string
          }>
        }
      }
    }>()
  })
})

describe('edge cases - extreme validation combinations', () => {
  it('string with all validation methods', () => {
    const _schema = string()
      .minLength(10)
      .maxLength(50)
      .length(25) // This should override minLength/maxLength
      .startsWith('start')
      .endsWith('end')
      .default(`start${'a'.repeat(19)}end`) // 25 chars total

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
  })

  it('number with all validation methods', () => {
    const _schema = number()
      .min(-100)
      .max(100)
      .min(0) // Should override previous min
      .max(50) // Should override previous max
      .default(25)

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
  })

  it('array with all validation methods and complex elements', () => {
    const _schema = array(
      object({
        id: string().minLength(1).maxLength(10),
        value: number().min(0).max(100).default(50),
        active: boolean().default(true),
        tags: array(string().minLength(1)).optional(),
      }),
    )
      .minLength(1)
      .maxLength(10)
      .length(5) // Should override min/max

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<{
      id: string
      value: number
      active: boolean
      tags?: string[]
    }>>()
  })
})

describe('edge cases - type inference edge cases', () => {
  it('empty arrays and objects', () => {
    const _emptyObject = object({})
    const _emptyArray = array(string()).minLength(0).maxLength(0)

    // eslint-disable-next-line ts/no-empty-object-type
    expectTypeOf<InferOutput<typeof _emptyObject>>().toEqualTypeOf<{}>()
    expectTypeOf<InferOutput<typeof _emptyArray>>().toEqualTypeOf<string[]>()
  })

  it('conflicting validations', () => {
    // These should technically be impossible but test type system handling
    const _conflictingString = string().minLength(10).maxLength(5) // min > max
    const _conflictingNumber = number().min(100).max(50) // min > max
    const _conflictingArray = array(string()).minLength(10).maxLength(5) // min > max

    expectTypeOf<InferOutput<typeof _conflictingString>>().toEqualTypeOf<string>()
    expectTypeOf<InferOutput<typeof _conflictingNumber>>().toEqualTypeOf<number>()
    expectTypeOf<InferOutput<typeof _conflictingArray>>().toEqualTypeOf<string[]>()
  })

  it('mixed optionality in complex structure', () => {
    const _schema = object({
      a: string().optional().nullable().required().nullish(),
      b: number().nullable().optional().required(),
      c: boolean().nullish().required().optional(),
      d: array(string().optional().required()).nullable().optional(),
      e: object({
        nested: string().required().optional().nullable(),
      }).optional().required().nullish(),
    })

    type OutputType = InferOutput<typeof _schema>

    // This will likely have many type errors showing the complexity issues
    expectTypeOf<OutputType>().toEqualTypeOf<{
      a: string | undefined | null
      b: number
      c?: boolean
      d?: string[]
      e: {
        nested: string | null
      } | undefined | null
    }>()
  })
})

describe('edge cases - performance stress tests', () => {
  it('deeply nested array of objects', () => {
    const _schema = array(array(array(
      object({
        data: array(array(
          object({
            values: array(number()),
            metadata: object({
              info: array(string()),
            }),
          }),
        )),
      }),
    )))

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<Array<Array<{
      data: Array<Array<{
        values: number[]
        metadata: {
          info: string[]
        }
      }>>
    }>>>>()
  })

  it('wide object with many nested levels', () => {
    const _schema = object({
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

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      branch1: { leaf: string }
      branch2: { leaf: number }
      branch3: { leaf: boolean }
      branch4: { leaf: string[] }
      branch5: { leaf: { subleaf: string } }
      branch6: { leaf: { subleaf: number } }
      branch7: { leaf: { subleaf: boolean } }
      branch8: { leaf: { subleaf: string[] } }
      branch9: { leaf: { subleaf: { deepleaf: string } } }
      branch10: { leaf: { subleaf: { deepleaf: number } } }
    }>()
  })

  it('undefinable through all optionality states', () => {
    const _schema1 = string().undefinable()
    const _schema2 = string().undefinable().required()
    const _schema3 = string().undefinable().required().nullable()
    const _schema4 = string().undefinable().required().nullable().nullish()
    const _schema5 = string().undefinable().required().nullable().nullish().required()
    const _schema6 = string().undefinable().optional()

    expectTypeOf<InferOutput<typeof _schema1>>().toEqualTypeOf<string | undefined>()
    expectTypeOf<InferOutput<typeof _schema2>>().toEqualTypeOf<string>()
    expectTypeOf<InferOutput<typeof _schema3>>().toEqualTypeOf<string | null>()
    expectTypeOf<InferOutput<typeof _schema4>>().toEqualTypeOf<string | undefined | null>()
    expectTypeOf<InferOutput<typeof _schema5>>().toEqualTypeOf<string>()
    expectTypeOf<InferOutput<typeof _schema6>>().toEqualTypeOf<string | undefined>()
  })

  it('undefinable with defaults stress test', () => {
    const _schema1 = string().undefinable().default('test')
    const _schema2 = string().default('test').undefinable()
    const _schema3 = string().undefinable().default('a').default('b')
    const _schema4 = string().default('a').undefinable().default('b')
    const _schema5 = string().undefinable().default('a').required().undefinable()

    expectTypeOf<InferOutput<typeof _schema1>>().toEqualTypeOf<string>()
    expectTypeOf<InferOutput<typeof _schema2>>().toEqualTypeOf<string | undefined>()
    expectTypeOf<InferOutput<typeof _schema3>>().toEqualTypeOf<string>()
    expectTypeOf<InferOutput<typeof _schema4>>().toEqualTypeOf<string>()
    expectTypeOf<InferOutput<typeof _schema5>>().toEqualTypeOf<string | undefined>()
  })

  it('undefinable in complex nested structures', () => {
    const _schema = object({
      level1: object({
        level2: object({
          level3: object({
            value: string().undefinable(),
            data: array(number().undefinable()).undefinable(),
          }).undefinable(),
        }).undefinable(),
      }).undefinable(),
      parallel: array(
        object({
          items: array(
            object({
              prop: boolean().undefinable(),
            }).undefinable(),
          ).undefinable(),
        }).undefinable(),
      ).undefinable(),
    }).undefinable()

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      level1: {
        level2: {
          level3: {
            value: string | undefined
            data: Array<number | undefined> | undefined
          } | undefined
        } | undefined
      } | undefined
      parallel: Array<{
        items: Array<{
          prop: boolean | undefined
        } | undefined> | undefined
      } | undefined> | undefined
    } | undefined>()
  })

  it('undefinable with all schema types', () => {
    const _schema = object({
      stringUndef: string().undefinable(),
      numberUndef: number().undefinable(),
      booleanUndef: boolean().undefinable(),
      literalUndef: literal('test').undefinable(),
      enumUndef: enum_(['a', 'b', 'c']).undefinable(),
      arrayUndef: array(string()).undefinable(),
      objectUndef: object({ nested: string() }).undefinable(),
      unionUndef: union([string(), number()]).undefinable(),
    })

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      stringUndef: string | undefined
      numberUndef: number | undefined
      booleanUndef: boolean | undefined
      literalUndef: 'test' | undefined
      enumUndef: 'a' | 'b' | 'c' | undefined
      arrayUndef: string[] | undefined
      objectUndef: { nested: string } | undefined
      unionUndef: string | number | undefined
    }>()
  })

  it('undefinable validation combinations', () => {
    const _schema = object({
      stringValidated: string().minLength(5).maxLength(20).undefinable(),
      numberValidated: number().min(0).max(100).undefinable(),
      arrayValidated: array(string().minLength(1)).minLength(1).maxLength(10).undefinable(),
      stringWithDefault: string().minLength(3).undefinable().default('hello'),
      numberWithDefault: number().min(0).undefinable().default(42),
    })

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      stringValidated: string | undefined
      numberValidated: number | undefined
      arrayValidated: string[] | undefined
      stringWithDefault: string
      numberWithDefault: number
    }>()
  })

  it('undefinable extreme chaining', () => {
    const _schema1 = string().undefinable().undefinable().undefinable().undefinable()
    const _schema2 = number().optional().undefinable().required().undefinable().nullable().undefinable()
    const _schema3 = boolean().default(true).undefinable().optional().undefinable().required().undefinable()

    expectTypeOf<InferOutput<typeof _schema1>>().toEqualTypeOf<string | undefined>()
    expectTypeOf<InferOutput<typeof _schema2>>().toEqualTypeOf<number | undefined>()
    expectTypeOf<InferOutput<typeof _schema3>>().toEqualTypeOf<boolean | undefined>()
  })

  it('undefinable mixed with all other optionality types', () => {
    const _schema = object({
      required: string(),
      optional: string().optional(),
      undefinable: string().undefinable(),
      nullable: string().nullable(),
      nullish: string().nullish(),
      defaulted: string().default('default'),
      optionalDefaulted: string().optional().default('default'),
      undefinableDefaulted: string().undefinable().default('default'),
      nullableDefaulted: string().nullable().default('default'),
      nullishDefaulted: string().nullish().default('default'),
      mixed1: string().optional().undefinable(),
      mixed2: string().undefinable().nullable(),
      mixed3: string().undefinable().nullish(),
      mixed4: string().nullable().undefinable(),
      mixed5: string().nullish().undefinable(),
      complex: string().optional().undefinable().nullable().nullish().required().undefinable(),
    })

    type OutputType = InferOutput<typeof _schema>

    expectTypeOf<OutputType>().toEqualTypeOf<{
      required: string
      optional?: string
      nullable: string | null
      mixed2: string | null
      nullish: string | undefined | null
      mixed3: string | undefined | null
      defaulted: string
      optionalDefaulted: string
      undefinableDefaulted: string
      nullableDefaulted: string
      nullishDefaulted: string
      undefinable: string | undefined
      mixed1: string | undefined
      mixed4: string | undefined
      mixed5: string | undefined
      complex: string | undefined
    }>()
  })

  it('undefinable performance stress test', () => {
    const _schema = array(
      object({
        a: string().undefinable(),
        b: number().undefinable(),
        c: boolean().undefinable(),
        d: array(string().undefinable()).undefinable(),
        e: object({
          f: string().undefinable(),
          g: number().undefinable(),
          h: array(
            object({
              i: string().undefinable(),
              j: number().undefinable(),
            }).undefinable(),
          ).undefinable(),
        }).undefinable(),
      }).undefinable(),
    ).undefinable()

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<{
      a: string | undefined
      b: number | undefined
      c: boolean | undefined
      d: Array<string | undefined> | undefined
      e: {
        f: string | undefined
        g: number | undefined
        h: Array<{
          i: string | undefined
          j: number | undefined
        } | undefined> | undefined
      } | undefined
    } | undefined> | undefined>()
  })
})

// ---------------------------------------------------------------------------
// ADDITIONAL EDGE CASES - defaults & chaining across ALL schemas
// ---------------------------------------------------------------------------
describe('edge cases - defaults & chaining across schemas', () => {
  it('root object default after complex optionality + shape chain', () => {
    const _schema = object({
      a: string().optional().default('A'),
      b: number().nullable().default(1),
      c: boolean().nullish().default(true),
      d: array(string().default('x')).optional(),
      e: object({ inner: string().default('in') }).optional(),
    })
      .passthrough()
      .optional()
      .nullable()
      .strip()
      .default({ a: 'A', b: 1, c: true })

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      a: string
      b: number
      c: boolean
      d?: string[]
      e?: { inner: string }
    }>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<{
      a?: string | undefined | null
      b?: number | undefined | null
      c?: boolean | undefined | null
      d?: Array<string | undefined | null>
      e?: { inner?: string | undefined | null }
    } | undefined | null>()
  })

  it('default then optional/nullable/nullish reintroduces optionality on object', () => {
    const base = object({ x: string(), y: number().optional() }).default({ x: 'x' })
    const _opt = base.optional()
    const _nul = base.nullable()
    const _nil = base.nullish()
    expectTypeOf<InferOutput<typeof _opt>>().toEqualTypeOf<{ x: string, y?: number } | undefined>()
    expectTypeOf<InferInput<typeof _opt>>().toEqualTypeOf<{ x: string, y?: number } | undefined>()
    expectTypeOf<InferOutput<typeof _nul>>().toEqualTypeOf<{ x: string, y?: number } | null>()
    expectTypeOf<InferInput<typeof _nul>>().toEqualTypeOf<{ x: string, y?: number } | null>()
    expectTypeOf<InferOutput<typeof _nil>>().toEqualTypeOf<{ x: string, y?: number } | undefined | null>()
    expectTypeOf<InferInput<typeof _nil>>().toEqualTypeOf<{ x: string, y?: number } | undefined | null>()
  })

  it('array root default with element defaults and post optionality', () => {
    const _schema = array(string().default('z')).default([]).optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[] | undefined>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<Array<string | undefined | null> | undefined>()
  })

  it('array nullish before root default collapses nullish in output', () => {
    const _schema = array(number().optional()).nullish().default([])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<number | undefined>>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<Array<number | undefined> | undefined | null>()
  })

  it('union with default after optional chain (normalizes output)', () => {
    const _schema = union([
      string().default('s'),
      number().optional(),
      object({ v: boolean().default(false) }),
      array(boolean().default(true)).optional(),
    ])
      .optional()
      .nullable()
      .optional()
      .default('s')

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<
      string | number | { v: boolean } | boolean[] | undefined
    >()

    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<
      | string | number | { v?: boolean | undefined | null } | Array<boolean | undefined | null>
      | undefined | null
    >()
  })

  it('union default then nullish reintroduces null | undefined', () => {
    const _schema = union([literal('a'), number().default(1)]).default('a').nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'a' | number | undefined | null>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<'a' | number | undefined | null>()
  })

  it('nested union inside object with root default', () => {
    const _schema = object({
      payload: union([
        object({ kind: literal('x'), data: string().default('x') }),
        object({ kind: literal('y'), value: number().nullable() }),
        array(object({ kind: literal('z'), flag: boolean().default(true) })).optional(),
      ]).optional(),
    }).default({
      payload: [{
        kind: 'z',
        flag: true,
      }],
    })

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      payload?:
        | { kind: 'x', data: string }
        | { kind: 'y', value: number | null }
        | Array<{ kind: 'z', flag: boolean }>
    }>()

    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<{
      payload?:
        | { kind: 'x', data?: string | undefined | null }
        | { kind: 'y', value: number | null }
        | Array<{ kind: 'z', flag?: boolean | undefined | null }>
    } | undefined | null>()
  })

  it('object root default with deeply nested array/object defaults', () => {
    const _schema = object({
      meta: object({
        id: string().default('id'),
        rev: number().default(1),
      }).default({ id: 'id' }),
      items: array(object({
        key: string(),
        attrs: object({
          enabled: boolean().default(true),
        }).optional(),
        tags: array(string().default('t')).default([]),
      })).default([]),
    }).default({
      meta: {
        id: 'id',
      },
    })

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      meta: { id: string, rev: number }
      items: Array<{
        key: string
        attrs?: { enabled: boolean }
        tags: string[]
      }>
    }>()

    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<{
      meta?: { id?: string | undefined | null, rev?: number | undefined | null } | undefined | null
      items?: Array<{
        key: string
        attrs?: { enabled?: boolean | undefined | null } | undefined
        tags?: Array<string | undefined | null> | undefined | null
      }> | undefined | null
    } | undefined | null>()
  })

  it('multi-level defaults: array.default + object.default + property.default ordering', () => {
    const element = object({ label: string().default('lbl'), count: number().optional() }).default({ label: 'lbl' })
    const _schema = array(element).default([]).nullable().default([])

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<{ label: string, count?: number | undefined }>>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<Array<{ label?: string | undefined | null, count?: number | undefined } | undefined | null> | undefined | null>()
  })

  it('multiple defaults (stress) on object & array (last wins)', () => {
    const _arr = array(string()).default([])
    const _obj = object({ v: number().default(1) }).default({ v: 1 }).default({ v: 1 })

    expectTypeOf<InferOutput<typeof _arr>>().toEqualTypeOf<string[]>()
    expectTypeOf<InferInput<typeof _arr>>().toEqualTypeOf<string[] | undefined | null>()
    expectTypeOf<InferOutput<typeof _obj>>().toEqualTypeOf<{ v: number }>()
    expectTypeOf<InferInput<typeof _obj>>().toEqualTypeOf<{ v?: number | undefined | null } | undefined | null>()
  })

  it('union of defaulted object | defaulted array | defaulted primitive', () => {
    const Obj = object({ id: string().default('id') }).default({ id: 'id' })
    const Arr = array(number().default(0)).default([])
    const Prim = string().default('s')
    const _U = union([Obj, Arr, Prim]).default('s')

    expectTypeOf<InferOutput<typeof _U>>().toEqualTypeOf<{
      id: string
    } | number[] | string>()
    expectTypeOf<InferInput<typeof _U>>().toEqualTypeOf<{
      id?: string | undefined | null
    } | Array<number | undefined | null> | string | undefined | null>()
  })
})
