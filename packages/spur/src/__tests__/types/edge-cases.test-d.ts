import type { ExtractOutputType } from '../../types/utils'

import { describe, expectTypeOf, it } from 'vitest'

import { array } from '../../leitplanken/array'
import { boolean } from '../../leitplanken/boolean'
import { number } from '../../leitplanken/number'
import { object } from '../../leitplanken/object'
import { string } from '../../leitplanken/string'

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

    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<ExpectedType>()
  })

  it('maximum array nesting', () => {
    const _schema = array(array(array(array(array(array(array(array(string()))))))))
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string[][][][][][][][]>()
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

    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{
      required: { value: string }
      nullable: { value: string } | null
      nullish: { value: string } | null | undefined
      defaulted: { value: string }
      optional?: { value: string }
    }>()
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

    expectTypeOf<ExtractOutputType<typeof _schema1>>().toEqualTypeOf<string>()
    expectTypeOf<ExtractOutputType<typeof _schema2>>().toEqualTypeOf<string | undefined>()
    expectTypeOf<ExtractOutputType<typeof _schema3>>().toEqualTypeOf<string>()
    expectTypeOf<ExtractOutputType<typeof _schema4>>().toEqualTypeOf<string | null>()
    expectTypeOf<ExtractOutputType<typeof _schema5>>().toEqualTypeOf<string | null | undefined>()
    expectTypeOf<ExtractOutputType<typeof _schema6>>().toEqualTypeOf<string>()
  })

  it('default chain stress test', () => {
    const _schema1 = string().default('a')
    const _schema2 = string().default('a').default('b')
    const _schema3 = string().default('a').default('b')
    const _schema4 = string().default('a').default('b').default('c')
    const _schema5 = string().default('a').optional().default('b').nullable().default('c')

    expectTypeOf<ExtractOutputType<typeof _schema1>>().toEqualTypeOf<string>()
    expectTypeOf<ExtractOutputType<typeof _schema2>>().toEqualTypeOf<string>()
    expectTypeOf<ExtractOutputType<typeof _schema3>>().toEqualTypeOf<string>()
    expectTypeOf<ExtractOutputType<typeof _schema4>>().toEqualTypeOf<string>()
    expectTypeOf<ExtractOutputType<typeof _schema5>>().toEqualTypeOf<string>()
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

    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string | null | undefined>()
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
      prop4: string | null | undefined
      prop5: string
      prop6: number
      prop8: number | null
      prop9: number | null | undefined
      prop10: number
      prop11: boolean
      prop13: boolean | null
      prop14: boolean | null | undefined
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

    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<ExpectedType>()
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

    expectTypeOf<ExtractOutputType<typeof _nodeSchema>>().toEqualTypeOf<ExpectedNodeType>()
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

    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{
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
        } | null | undefined
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

    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string>()
  })

  it('number with all validation methods', () => {
    const _schema = number()
      .min(-100)
      .max(100)
      .min(0) // Should override previous min
      .max(50) // Should override previous max
      .default(25)

    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number>()
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

    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<Array<{
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
    expectTypeOf<ExtractOutputType<typeof _emptyObject>>().toEqualTypeOf<{}>()
    expectTypeOf<ExtractOutputType<typeof _emptyArray>>().toEqualTypeOf<string[]>()
  })

  it('conflicting validations', () => {
    // These should technically be impossible but test type system handling
    const _conflictingString = string().minLength(10).maxLength(5) // min > max
    const _conflictingNumber = number().min(100).max(50) // min > max
    const _conflictingArray = array(string()).minLength(10).maxLength(5) // min > max

    expectTypeOf<ExtractOutputType<typeof _conflictingString>>().toEqualTypeOf<string>()
    expectTypeOf<ExtractOutputType<typeof _conflictingNumber>>().toEqualTypeOf<number>()
    expectTypeOf<ExtractOutputType<typeof _conflictingArray>>().toEqualTypeOf<string[]>()
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

    type OutputType = ExtractOutputType<typeof _schema>

    // This will likely have many type errors showing the complexity issues
    expectTypeOf<OutputType>().toEqualTypeOf<{
      a: string | null | undefined
      b: number
      c?: boolean
      d?: string[]
      e: {
        nested: string | null
      } | null | undefined
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

    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<Array<Array<Array<{
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

    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<{
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
})
