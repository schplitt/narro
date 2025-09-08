import type { ExtractOutputType } from '../../types/utils'

import { describe, expectTypeOf, it } from 'vitest'

import { array } from '../../leitplanken/array'
import { boolean } from '../../leitplanken/boolean'
import { number } from '../../leitplanken/number'
import { object } from '../../leitplanken/object'
import { string } from '../../leitplanken/string'

describe('objectSchema - basic types', () => {
  it('empty object', () => {
    const _schema = object({})
    // eslint-disable-next-line ts/no-empty-object-type
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{}>()
  })

  it('object with required string property', () => {
    const _schema = object({
      name: string(),
    })
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{ name: string }>()
  })

  it('object with required number property', () => {
    const _schema = object({
      age: number(),
    })
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{ age: number }>()
  })

  it('object with required boolean property', () => {
    const _schema = object({
      isActive: boolean(),
    })
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{ isActive: boolean }>()
  })

  it('object with multiple required properties', () => {
    const _schema = object({
      name: string(),
      age: number(),
      isActive: boolean(),
    })
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{
      name: string
      age: number
      isActive: boolean
    }>()
  })
})

describe('objectSchema - optional properties', () => {
  it('object with optional string property', () => {
    const _schema = object({
      description: string().optional(),
    })
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{ description?: string }>()
  })

  it('object with optional number property', () => {
    const _schema = object({
      score: number().optional(),
    })
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{ score?: number }>()
  })

  it('object with optional boolean property', () => {
    const _schema = object({
      isDraft: boolean().optional(),
    })
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{ isDraft?: boolean }>()
  })

  it('object with mixed required and optional properties', () => {
    const _schema = object({
      name: string(),
      description: string().optional(),
      age: number(),
      score: number().optional(),
    })
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{
      name: string
      age: number
      description?: string
      score?: number
    }>()
  })
})

describe('objectSchema - nullable properties', () => {
  it('object with nullable string property', () => {
    const _schema = object({
      nickname: string().nullable(),
    })
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{ nickname: string | null }>()
  })

  it('object with nullable number property', () => {
    const _schema = object({
      rating: number().nullable(),
    })
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{ rating: number | null }>()
  })

  it('object with nullable boolean property', () => {
    const _schema = object({
      isVerified: boolean().nullable(),
    })
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{ isVerified: boolean | null }>()
  })
})

describe('objectSchema - nullish properties', () => {
  it('object with nullish string property', () => {
    const _schema = object({
      petName: string().nullish(),
    })
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{ petName: string | null | undefined }>()
  })

  it('object with nullish number property', () => {
    const _schema = object({
      weight: number().nullish(),
    })
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{ weight: number | null | undefined }>()
  })

  it('object with nullish boolean property', () => {
    const _schema = object({
      isDeleted: boolean().nullish(),
    })
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{ isDeleted: boolean | null | undefined }>()
  })
})

describe('objectSchema - with defaults', () => {
  it('object with property with default', () => {
    const _schema = object({
      age: number().default(18),
      isAdmin: boolean().default(false),
    })
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{
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
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{
      name: string
      age: number
      isActive: boolean
      description?: string
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
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{
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
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{
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
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{ tags: string[] }>()
  })

  it('object with optional array property', () => {
    const _schema = object({
      friends: array(string().minLength(3).maxLength(25)).optional(),
    })
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{ friends?: string[] }>()
  })

  it('object with nullable array property', () => {
    const _schema = object({
      scores: array(number().min(0).max(100)).nullable().maxLength(10),
    })
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{ scores: number[] | null }>()
  })
})

describe('objectSchema - object optionality', () => {
  it('optional object', () => {
    const _schema = object({
      name: string(),
    }).optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{ name: string } | undefined>()
  })

  it('nullable object', () => {
    const _schema = object({
      name: string(),
    }).nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{ name: string } | null>()
  })

  it('nullish object', () => {
    const _schema = object({
      name: string(),
    }).nullish()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{ name: string } | null | undefined>()
  })

  it('required object (explicit)', () => {
    const _schema = object({
      name: string(),
    }).required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{ name: string }>()
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
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{
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
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{
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
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{
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

    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{
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

    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{
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

describe('objectSchema - extreme chaining scenarios', () => {
  it('object with all possible property optionalities', () => {
    const _schema = object({
      required: string(),
      defaulted: string().default('default'),
      optional: string().optional(),
      optionalDefaulted: string().optional().default('default'),
      nullable: string().nullable(),
      nullableDefaulted: string().nullable().default('default'),
      nullish: string().nullish(),
      nullishDefaulted: string().nullish().default('default'),
    })

    type Output = ExtractOutputType<typeof _schema>

    interface Expected {
      required: string
      defaulted: string
      optional?: string
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
    }).optional().nullable().required()

    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{
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

    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{
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
