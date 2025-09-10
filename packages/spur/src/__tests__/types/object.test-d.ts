import type { InferOutput } from '../../types/utils'

import { describe, expectTypeOf, it } from 'vitest'

import { array } from '../../leitplanken/array'
import { boolean } from '../../leitplanken/boolean'
import { oneOf } from '../../leitplanken/enum'
import { literal } from '../../leitplanken/literal'
import { number } from '../../leitplanken/number'
import { object } from '../../leitplanken/object'
import { string } from '../../leitplanken/string'
import { union } from '../../leitplanken/union'

describe('objectSchema - basic types', () => {
  it('empty object', () => {
    const _schema = object({})
    // eslint-disable-next-line ts/no-empty-object-type
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{}>()
  })

  it('object with required string property', () => {
    const _schema = object({
      name: string(),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ name: string }>()
  })

  it('object with required number property', () => {
    const _schema = object({
      age: number(),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ age: number }>()
  })

  it('object with required boolean property', () => {
    const _schema = object({
      isActive: boolean(),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ isActive: boolean }>()
  })

  it('object with multiple required properties', () => {
    const _schema = object({
      name: string(),
      age: number(),
      isActive: boolean(),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      name: string
      age: number
      isActive: boolean
    }>()
  })

  it('object with literal property', () => {
    const _schema = object({
      status: literal('active'),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ status: 'active' }>()
  })

  it('object with number literal property', () => {
    const _schema = object({
      version: literal(1),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ version: 1 }>()
  })

  it('object with oneOf property', () => {
    const _schema = object({
      color: oneOf(['red', 'green', 'blue'] as const),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ color: 'red' | 'green' | 'blue' }>()
  })

  it('object with mixed oneOf property', () => {
    const _schema = object({
      value: oneOf(['none', 42, 'all'] as const),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ value: 'none' | 42 | 'all' }>()
  })

  it('object with union property', () => {
    const _schema = object({
      data: union([string(), number()] as const),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ data: string | number }>()
  })

  it('object with complex union property', () => {
    const _schema = object({
      field: union([literal('exact'), oneOf(['a', 'b'] as const), boolean()] as const),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ field: 'exact' | 'a' | 'b' | boolean }>()
  })
})

describe('objectSchema - optional properties', () => {
  it('object with optional string property', () => {
    const _schema = object({
      description: string().optional(),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ description?: string }>()
  })

  it('object with optional number property', () => {
    const _schema = object({
      score: number().optional(),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ score?: number }>()
  })

  it('object with optional boolean property', () => {
    const _schema = object({
      isDraft: boolean().optional(),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ isDraft?: boolean }>()
  })

  it('object with mixed required and optional properties', () => {
    const _schema = object({
      name: string(),
      description: string().optional(),
      age: number(),
      score: number().optional(),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      name: string
      age: number
      description?: string
      score?: number
    }>()
  })

  it('object with optional literal property', () => {
    const _schema = object({
      theme: literal('dark').optional(),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ theme?: 'dark' }>()
  })

  it('object with optional oneOf property', () => {
    const _schema = object({
      priority: oneOf(['low', 'medium', 'high'] as const).optional(),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ priority?: 'low' | 'medium' | 'high' }>()
  })

  it('object with optional union property', () => {
    const _schema = object({
      content: union([string(), number(), boolean()] as const).optional(),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ content?: string | number | boolean }>()
  })
})

describe('objectSchema - nullable properties', () => {
  it('object with nullable string property', () => {
    const _schema = object({
      nickname: string().nullable(),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ nickname: string | null }>()
  })

  it('object with nullable number property', () => {
    const _schema = object({
      rating: number().nullable(),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ rating: number | null }>()
  })

  it('object with nullable boolean property', () => {
    const _schema = object({
      isVerified: boolean().nullable(),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ isVerified: boolean | null }>()
  })
})

describe('objectSchema - nullish properties', () => {
  it('object with nullish string property', () => {
    const _schema = object({
      petName: string().nullish(),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ petName: string | null | undefined }>()
  })

  it('object with nullish number property', () => {
    const _schema = object({
      weight: number().nullish(),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ weight: number | null | undefined }>()
  })

  it('object with nullish boolean property', () => {
    const _schema = object({
      isDeleted: boolean().nullish(),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ isDeleted: boolean | null | undefined }>()
  })
})

describe('objectSchema - with defaults', () => {
  it('object with property with default', () => {
    const _schema = object({
      age: number().default(18),
      isAdmin: boolean().default(false),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      age: number
      isAdmin: boolean
    }>()
  })

  it('object mixing required, optional, and defaults', () => {
    const _schema = object({
      name: string(),
      description: string().optional(),
      age: number().default(18),
      isActive: boolean().default(true),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      name: string
      age: number
      isActive: boolean
      description?: string
    }>()
  })

  it('object with literal defaults', () => {
    const _schema = object({
      mode: literal('development').default('development'),
      port: literal(3000).default(3000),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      mode: 'development'
      port: 3000
    }>()
  })

  it('object with oneOf defaults', () => {
    const _schema = object({
      level: oneOf(['debug', 'info', 'warn', 'error'] as const).default('info'),
      size: oneOf([1, 2, 3, 4, 5] as const).default(3),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      level: 'debug' | 'info' | 'warn' | 'error'
      size: 1 | 2 | 3 | 4 | 5
    }>()
  })
})

describe('objectSchema - nested objects', () => {
  it('object with nested object', () => {
    const _schema = object({
      user: object({
        name: string(),
        age: number(),
      }),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      user: {
        name: string
        age: number
      }
    }>()
  })

  it('object with optional nested object', () => {
    const _schema = object({
      metadata: object({
        created: string(),
        updated: string().optional(),
      }).optional(),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      metadata?: {
        created: string
        updated?: string
      }
    }>()
  })
})

describe('objectSchema - with arrays', () => {
  it('object with array property', () => {
    const _schema = object({
      tags: array(string()),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ tags: string[] }>()
  })

  it('object with optional array property', () => {
    const _schema = object({
      friends: array(string().minLength(3).maxLength(25)).optional(),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ friends?: string[] }>()
  })

  it('object with nullable array property', () => {
    const _schema = object({
      scores: array(number().min(0).max(100)).nullable().maxLength(10),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ scores: number[] | null }>()
  })
})

describe('objectSchema - object optionality', () => {
  it('optional object', () => {
    const _schema = object({
      name: string(),
    }).optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ name: string } | undefined>()
  })

  it('undefinable object', () => {
    const _schema = object({
      name: string(),
    }).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ name: string } | undefined>()
  })

  it('nullable object', () => {
    const _schema = object({
      name: string(),
    }).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ name: string } | null>()
  })

  it('nullish object', () => {
    const _schema = object({
      name: string(),
    }).nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ name: string } | null | undefined>()
  })

  it('required object (explicit)', () => {
    const _schema = object({
      name: string(),
    }).required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ name: string }>()
  })
})

describe('objectSchema - extensive chaining operations', () => {
  it('object optionality state changes', () => {
    const _schema = object({
      name: string(),
      age: number(),
    })
      .optional()
      .required()
      .nullable()
      .nullish()
      .required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      name: string
      age: number
    }>()
  })

  it('object oscillating between states', () => {
    const _schema = object({
      value: string(),
    })
      .optional() // -> optional
      .required() // -> required
      .nullable() // -> nullable
      .required() // -> required (but nullable?)
      .optional() // -> optional
      .nullish() // -> nullish
      .required() // -> required (but nullish?)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      value: string
    }>()
  })

  it('object with properties having extensive chains', () => {
    const _schema = object({
      stringProp: string()
        .minLength(1)
        .maxLength(100)
        .startsWith('pre')
        .endsWith('suf')
        .optional()
        .default('presuf')
        .required()
        .nullable(),

      numberProp: number()
        .min(0)
        .max(1000)
        .default(500)
        .optional()
        .min(100)
        .max(900)
        .required()
        .nullish(),

      booleanProp: boolean()
        .default(true)
        .optional()
        .default(false)
        .nullable()
        .required(),
    })
      .optional()
      .nullable()
      .required()

    type Output = InferOutput<typeof _schema>

    expectTypeOf<Output>().toEqualTypeOf<{
      stringProp: string | null
      numberProp: number | null | undefined
      booleanProp: boolean
    }>()
  })

  it('object state changes with complex properties', () => {
    const _schema = object({
      user: object({
        name: string().minLength(1),
        email: string().optional(),
      }).optional(),
      settings: object({
        theme: string().default('light'),
        notifications: boolean().default(true),
      }).nullable(),
    })
      .optional()
      .required()
      .nullable()
      .nullish()
      .required()

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      user?: {
        name: string
        email?: string
      }
      settings: {
        theme: string
        notifications: boolean
      } | null
    }>()
  })

  it('object with nested objects having their own chaining', () => {
    const _schema = object({
      level1: object({
        data: string(),
      })
        .optional()
        .nullable()
        .required(),

      level2: object({
        nested: object({
          value: number(),
        })
          .nullable()
          .required(),
      })
        .nullish()
        .optional(),
    })
      .nullable()
      .required()

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      level1: {
        data: string
      }
      level2?: {
        nested: {
          value: number
        }
      } | undefined
    }>()
  })

  it('object with arrays having chaining and object chaining', () => {
    const _schema = object({
      tags: array(string().minLength(1))
        .minLength(0)
        .maxLength(10)
        .optional(),

      scores: array(number().min(0).max(100))
        .minLength(1)
        .nullable()
        .maxLength(5),

      flags: array(boolean().default(false))
        .optional()
        .required()
        .nullish(),
    })
      .optional()
      .nullable()
      .required()

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      scores: number[] | null
      flags: boolean[] | null | undefined
      tags?: string[]
    }>()
  })
})

describe('objectSchema - property chaining patterns', () => {
  it('object with all property types having defaults and chaining', () => {
    const _schema = object({
      defaultString: string()
        .default('default')
        .optional()
        .required()
        .nullable(),

      defaultNumber: number()
        .default(42)
        .nullable()
        .optional()
        .required(),

      defaultBoolean: boolean()
        .default(true)
        .nullish()
        .required()
        .optional(),

      defaultArray: array(string())
        .optional()
        .required()
        .nullable(),

      defaultObject: object({
        nested: string().default('nested'),
      })
        .nullable()
        .required()
        .optional(),
    })

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      defaultString: string | null
      defaultNumber: number
      defaultArray: string[] | null
      defaultBoolean?: boolean
      defaultObject?: {
        nested: string
      }
    }>()
  })

  it('object with conflicting property requirements', () => {
    const _schema = object({
      confusing: string()
        .optional()
        .required()
        .nullable()
        .optional()
        .nullish()
        .required()
        .default('confused')
        .nullable(),
    })

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      confusing: string | null
    }>()
  })

  it('object with nested chaining hell', () => {
    const _schema = object({
      deep: object({
        deeper: object({
          deepest: object({
            value: string()
              .minLength(1)
              .maxLength(50)
              .startsWith('start')
              .endsWith('end')
              .default('startdefaultend')
              .optional()
              .required()
              .nullable(),
          })
            .optional()
            .nullable()
            .required(),
        })
          .nullable()
          .nullish()
          .required(),
      })
        .optional()
        .required()
        .nullable(),
    })
      .nullable()
      .nullish()
      .required()

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      deep: {
        deeper: {
          deepest: {
            value: string | null
          }
        }
      } | null
    }>()
  })
})

describe('objectSchema - extreme chaining scenarios', () => {
  it('object with 10+ optionality state changes', () => {
    const _schema = object({
      value: string(),
    })
      .optional()
      .required()
      .nullable()
      .nullish()
      .required()
      .optional()
      .required()
      .nullable()
      .required()
      .nullish()
      .required()

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      value: string
    }>()
  })

  it('object with mixed array and object properties all chained', () => {
    const _schema = object({
      arrays: object({
        strings: array(string().minLength(1).default('default'))
          .minLength(1)
          .maxLength(5)
          .optional(),
        numbers: array(number().min(0).max(100).default(50))
          .nullable()
          .required(),
        booleans: array(boolean().default(true))
          .nullish()
          .optional()
          .required(),
      })
        .optional()
        .nullable()
        .required(),

      objects: object({
        nested1: object({
          value: string().default('default'),
        })
          .optional()
          .required(),
        nested2: object({
          value: number().default(42),
        })
          .nullable()
          .optional(),
      })
        .nullish()
        .required(),
    })
      .optional()
      .nullable()
      .nullish()
      .required()

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      arrays: {
        numbers: number[]
        booleans: boolean[]
        strings?: string[]
      }
      objects: {
        nested1: {
          value: string
        }
        nested2?: {
          value: number
        }
      }
    }>()
  })

  it('ultra complex object chain with everything', () => {
    const _schema = object({
      meta: object({
        id: string().minLength(1).maxLength(50).default('generated-id'),
        version: number().min(1).max(999).default(1),
        active: boolean().default(true),
        tags: array(string().minLength(1).maxLength(20))
          .minLength(0)
          .maxLength(10)
          .optional(),
        config: object({
          settings: object({
            theme: string().default('light'),
            lang: string().default('en'),
          }).nullable(),
          features: array(boolean().default(false))
            .optional()
            .required()
            .nullable(),
        })
          .optional()
          .required()
          .nullish(),
      })
        .optional()
        .nullable()
        .required(),

      data: array(
        object({
          values: array(number().min(0).max(1))
            .minLength(1)
            .optional(),
          metadata: object({
            type: string().minLength(1),
            description: string().optional().maxLength(200),
          })
            .nullable()
            .required(),
        }),
      )
        .minLength(1)
        .maxLength(100)
        .nullable()
        .optional()
        .required(),
    })
      .optional()
      .required()
      .nullable()
      .nullish()
      .required()
      .optional()
      .required()

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      meta: {
        id: string
        version: number
        active: boolean
        config: {
          settings: {
            theme: string
            lang: string
          } | null
          features: boolean[] | null
        } | null | undefined
        tags?: string[]
      }
      data: Array<{
        metadata: {
          type: string
          description?: string
        }
        values?: number[]
      }>
    }>()
  })
})

describe('objectSchema - complex examples', () => {
  it('complex object from test.ts example', () => {
    const _schema = object({
      name: string().minLength(3).maxLength(25),
      description: string().optional().maxLength(100),
      age: number().min(0).max(150).default(18),
      friends: array(string().minLength(3).maxLength(25)).optional(),
      nickname: string().minLength(3).maxLength(25).nullable(),
      petName: string().minLength(3).maxLength(25).nullish(),
      isAdmin: boolean().default(false),
      isVerified: boolean().nullable(),
      isDeleted: boolean().nullish(),
      isSomething: boolean().optional(),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      name: string
      age: number
      isAdmin: boolean
      isVerified: boolean | null
      isDeleted: boolean | null | undefined
      nickname: string | null
      petName: string | null | undefined
      description?: string
      friends?: string[]
      isSomething?: boolean
    }>()
  })

  it('nested object with array of objects', () => {
    const _schema = object({
      foo: object({
        bar: string().minLength(3).maxLength(25).optional(),
        baz: number().min(0).max(150).default(18),
        nestedArray: array(object({
          nestedString: string().minLength(3).maxLength(25),
          nestedNumber: number().min(0).max(150).default(18),
        })),
      }).optional(),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      foo?: {
        baz: number
        nestedArray: Array<{
          nestedString: string
          nestedNumber: number
        }>
        bar?: string
      }
    }>()
  })
})

describe('objectSchema - ultra complex nesting', () => {
  it('deeply nested objects', () => {
    const _schema = object({
      level1: object({
        level2: object({
          level3: object({
            level4: object({
              deepValue: string(),
            }),
          }),
        }),
      }),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      level1: {
        level2: {
          level3: {
            level4: {
              deepValue: string
            }
          }
        }
      }
    }>()
  })

  it('mixed array and object nesting', () => {
    const _schema = object({
      users: array(object({
        profile: object({
          personal: object({
            name: string(),
            age: number().optional(),
          }),
          preferences: object({
            theme: string().default('light'),
            notifications: array(object({
              type: string(),
              enabled: boolean().default(true),
            })),
          }).optional(),
        }),
        permissions: array(string()),
        metadata: object({
          created: string(),
          updated: string().optional(),
          tags: array(string()).nullable(),
        }).nullable(),
      })),
      settings: object({
        global: object({
          defaultLanguage: string().default('en'),
          features: array(object({
            name: string(),
            enabled: boolean(),
            config: object({
              options: array(string()).optional(),
            }).optional(),
          })).optional(),
        }),
      }).optional(),
    })

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      users: Array<{
        profile: {
          personal: {
            name: string
            age?: number
          }
          preferences?: {
            theme: string
            notifications: Array<{
              type: string
              enabled: boolean
            }>
          }
        }
        permissions: string[]
        metadata: {
          created: string
          tags: string[] | null
          updated?: string
        } | null
      }>
      settings?: {
        global: {
          defaultLanguage: string
          features?: Array<{
            name: string
            enabled: boolean
            config?: {
              options?: string[]
            }
          }>
        }
      }
    }>()
  })

  it('recursive-like structure', () => {
    const _schema = object({
      id: string(),
      data: object({
        value: number(),
        children: array(object({
          id: string(),
          data: object({
            value: number(),
            children: array(object({
              id: string(),
              data: object({
                value: number(),
              }),
            })),
          }),
        })),
      }),
    })

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      id: string
      data: {
        value: number
        children: Array<{
          id: string
          data: {
            value: number
            children: Array<{
              id: string
              data: {
                value: number
              }
            }>
          }
        }>
      }
    }>()
  })
})

describe('objectSchema - property optionality combinations', () => {
  it('object with all possible property optionalities', () => {
    const _schema = object({
      required: string(),
      defaulted: string().default('default'),
      optional: string().optional(),
      undefinable: string().undefinable(),
      optionalDefaulted: string().optional().default('default'),
      nullable: string().nullable(),
      nullableDefaulted: string().nullable().default('default'),
      nullish: string().nullish(),
      nullishDefaulted: string().nullish().default('default'),
    })

    type Output = InferOutput<typeof _schema>

    interface Expected {
      required: string
      defaulted: string
      optional?: string
      undefinable: string | undefined
      optionalDefaulted: string
      nullable: string | null
      nullableDefaulted: string
      nullish: string | null | undefined
      nullishDefaulted: string
    }

    expectTypeOf<Output>().toEqualTypeOf<Expected>()
  })

  it('object chain with optionality changes', () => {
    const _schema = object({
      prop: string(),
    }).optional().undefinable().nullable().required()

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      prop: string
    }>()
  })

  it('ultra complex mixed types', () => {
    const _schema = object({
      stringArrays: array(array(string().minLength(1).maxLength(10))),
      numberMatrices: array(array(array(number().min(0).max(1)))),
      booleanSets: array(boolean().default(false)).nullable(),
      objectMaps: object({
        keyA: array(object({
          nestedArrays: array(array(string())),
          nestedObjects: object({
            deepArray: array(number().min(0).max(100).default(50)),
          }).optional(),
        })),
        keyB: object({
          value: string().nullable(),
          metadata: array(object({
            type: string(),
            data: array(boolean()).optional(),
          })).optional(),
        }).nullish(),
      }).optional(),
    })

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      stringArrays: string[][]
      numberMatrices: number[][][]
      booleanSets: boolean[] | null
      objectMaps?: {
        keyA: Array<{
          nestedArrays: string[][]
          nestedObjects?: {
            deepArray: number[]
          }
        }>
        keyB: {
          value: string | null
          metadata?: Array<{
            type: string
            data?: boolean[]
          }>
        } | null | undefined
      }
    }>()
  })
})

describe('objectSchema - undefinable', () => {
  it('undefinable object', () => {
    const _schema = object({
      name: string(),
    }).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ name: string } | undefined>()
  })

  it('object with undefinable properties', () => {
    const _schema = object({
      name: string().undefinable(),
      age: number().undefinable(),
      active: boolean().undefinable(),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      name: string | undefined
      age: number | undefined
      active: boolean | undefined
    }>()
  })

  it('undefinable object with undefinable properties', () => {
    const _schema = object({
      name: string().undefinable(),
      description: string().optional(),
    }).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      name: string | undefined
      description?: string
    } | undefined>()
  })

  it('undefinable then required', () => {
    const _schema = object({
      value: string(),
    }).undefinable().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ value: string }>()
  })

  it('undefinable then nullable', () => {
    const _schema = object({
      data: number(),
    }).undefinable().nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ data: number } | null>()
  })

  it('undefinable then nullish', () => {
    const _schema = object({
      info: boolean(),
    }).undefinable().nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ info: boolean } | null | undefined>()
  })

  it('undefinable then optional (should stay undefinable)', () => {
    const _schema = object({
      test: string(),
    }).undefinable().optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ test: string } | undefined>()
  })

  it('complex undefinable property chaining', () => {
    const _schema = object({
      field: string().default('test').undefinable().required().nullable().undefinable(),
    })
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      field: string | undefined
    }>()
  })

  it('nested undefinable objects', () => {
    const _schema = object({
      nested: object({
        value: string().undefinable(),
      }).undefinable(),
    }).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      nested: {
        value: string | undefined
      } | undefined
    } | undefined>()
  })

  it('undefinable object with arrays', () => {
    const _schema = object({
      tags: array(string().undefinable()).undefinable(),
      scores: array(number()).undefinable(),
    }).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{
      tags: Array<string | undefined> | undefined
      scores: Array<number> | undefined
    } | undefined>()
  })

  it('object with all optionality variants including undefinable', () => {
    const _schema = object({
      required: string(),
      defaulted: string().default('default'),
      optional: string().optional(),
      undefinable: string().undefinable(),
      optionalDefaulted: string().optional().default('default'),
      undefinableDefaulted: string().undefinable().default('default'),
      nullable: string().nullable(),
      nullableDefaulted: string().nullable().default('default'),
      nullish: string().nullish(),
      nullishDefaulted: string().nullish().default('default'),
    })

    type Output = InferOutput<typeof _schema>

    interface Expected {
      required: string
      defaulted: string
      optional?: string
      undefinable: string | undefined
      optionalDefaulted: string
      undefinableDefaulted: string
      nullable: string | null
      nullableDefaulted: string
      nullish: string | null | undefined
      nullishDefaulted: string
    }

    expectTypeOf<Output>().toEqualTypeOf<Expected>()
  })

  it('multiple undefinable calls', () => {
    const _schema = object({
      value: string(),
    }).undefinable().undefinable().undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<{ value: string } | undefined>()
  })

  it('ultra complex undefinable scenario', () => {
    const _schema = object({
      meta: object({
        id: string().undefinable(),
        data: array(
          object({
            value: number().undefinable(),
            tags: array(string().undefinable()).undefinable(),
          }).undefinable(),
        ).undefinable(),
      }).undefinable(),
      config: object({
        settings: object({
          theme: string().default('light').undefinable(),
        }).undefinable(),
      }).undefinable(),
    }).undefinable()

    type Output = InferOutput<typeof _schema>

    expectTypeOf<Output>().toEqualTypeOf<{
      meta: {
        id: string | undefined
        data: Array<{
          value: number | undefined
          tags: Array<string | undefined> | undefined
        } | undefined> | undefined
      } | undefined
      config: {
        settings: {
          theme: string | undefined
        } | undefined
      } | undefined
    } | undefined>()
  })
})
