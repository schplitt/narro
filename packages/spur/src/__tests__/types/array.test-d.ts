import type { ExtractOutputType } from '../../types/utils'

import { describe, expectTypeOf, it } from 'vitest'

import { array } from '../../leitplanken/array'
import { boolean } from '../../leitplanken/boolean'
import { oneOf } from '../../leitplanken/enum'
import { literal } from '../../leitplanken/literal'
import { number } from '../../leitplanken/number'
import { object } from '../../leitplanken/object'
import { string } from '../../leitplanken/string'

describe('arraySchema - basic types', () => {
  it('array of strings', () => {
    const _schema = array(string())
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string[]>()
  })

  it('array of numbers', () => {
    const _schema = array(number())
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number[]>()
  })

  it('array of booleans', () => {
    const _schema = array(boolean())
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<boolean[]>()
  })

  it('array of string literals', () => {
    const _schema = array(literal('hello'))
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'hello'[]>()
  })

  it('array of number literals', () => {
    const _schema = array(literal(42))
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<42[]>()
  })

  it('array of oneOf strings', () => {
    const _schema = array(oneOf(['red', 'green', 'blue'] as const))
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<('red' | 'green' | 'blue')[]>()
  })

  it('array of oneOf numbers', () => {
    const _schema = array(oneOf([1, 2, 3] as const))
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<(1 | 2 | 3)[]>()
  })

  it('array of mixed oneOf', () => {
    const _schema = array(oneOf(['hello', 42, 'world'] as const))
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<('hello' | 42 | 'world')[]>()
  })

  it('optional array of strings', () => {
    const _schema = array(string()).optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string[] | undefined>()
  })

  it('nullable array of strings', () => {
    const _schema = array(string()).nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string[] | null>()
  })

  it('nullish array of strings', () => {
    const _schema = array(string()).nullish()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string[] | null | undefined>()
  })

  it('required array of strings (explicit)', () => {
    const _schema = array(string()).required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string[]>()
  })
})

describe('arraySchema - with validation', () => {
  it('array with minLength', () => {
    const _schema = array(string()).minLength(1)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string[]>()
  })

  it('array with maxLength', () => {
    const _schema = array(string()).maxLength(10)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string[]>()
  })

  it('array with exact length', () => {
    const _schema = array(string()).length(5)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string[]>()
  })

  it('array with min and max length', () => {
    const _schema = array(string()).minLength(1).maxLength(10)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string[]>()
  })
})

describe('arraySchema - with element validation', () => {
  it('array of optional strings', () => {
    const _schema = array(string().optional())
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<Array<string | undefined>>()
  })

  it('array of nullable strings', () => {
    const _schema = array(string().nullable())
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<Array<string | null>>()
  })

  it('array of strings with validation', () => {
    const _schema = array(string().minLength(3).maxLength(25))
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string[]>()
  })

  it('array of numbers with validation', () => {
    const _schema = array(number().min(0).max(100))
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number[]>()
  })

  it('array of booleans with default', () => {
    const _schema = array(boolean().default(false))
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<boolean[]>()
  })

  it('array of strings with default', () => {
    const _schema = array(string().default('hello'))
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string[]>()
  })

  it('array of optional literals', () => {
    const _schema = array(literal('test').optional())
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<Array<'test' | undefined>>()
  })

  it('array of nullable literals', () => {
    const _schema = array(literal(42).nullable())
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<Array<42 | null>>()
  })

  it('array of oneOf with defaults', () => {
    const _schema = array(oneOf(['a', 'b', 'c'] as const).default('a'))
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<('a' | 'b' | 'c')[]>()
  })

  it('array of optional oneOf', () => {
    const _schema = array(oneOf([1, 2, 3] as const).optional())
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<Array<1 | 2 | 3 | undefined>>()
  })

  it('array of nullish oneOf', () => {
    const _schema = array(oneOf(['x', 'y'] as const).nullish())
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<Array<'x' | 'y' | null | undefined>>()
  })
})

describe('arraySchema - chained operations', () => {
  it('optional array with validation', () => {
    const _schema = array(string().minLength(3).maxLength(25)).optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string[] | undefined>()
  })

  it('nullable array with validation', () => {
    const _schema = array(number().min(0).max(100)).nullable().maxLength(10)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number[] | null>()
  })

  it('nullish array with validation', () => {
    const _schema = array(string()).nullish().minLength(1).maxLength(5)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string[] | null | undefined>()
  })

  it('complex chaining', () => {
    const _schema = array(string().minLength(3).maxLength(25)).minLength(1).maxLength(10).optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string[] | undefined>()
  })
})

describe('arraySchema - extensive chaining operations', () => {
  it('array optionality then validation then back to optionality', () => {
    const _schema = array(string()).optional().minLength(1).maxLength(10).nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string[] | null>()
  })

  it('array with multiple optionality state changes', () => {
    const _schema = array(string()).optional().required().nullable().nullish().required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string[]>()
  })

  it('array validation chain with optionality changes', () => {
    const _schema = array(number())
      .minLength(1)
      .maxLength(20)
      .optional()
      .length(10)
      .nullable()
      .minLength(5)
      .maxLength(15)
      .required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number[]>()
  })

  it('array with conflicting length validations', () => {
    const _schema = array(string())
      .minLength(10)
      .maxLength(5)
      .length(7)
      .optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string[] | undefined>()
  })

  it('array nullish then required then nullable', () => {
    const _schema = array(boolean()).nullish().required().nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<boolean[] | null>()
  })

  it('array with overriding length constraints', () => {
    const _schema = array(string())
      .minLength(1)
      .minLength(5) // should override previous min
      .maxLength(20)
      .maxLength(10) // should override previous max
      .length(7) // should override both min and max
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string[]>()
  })

  it('array ultra complex chaining', () => {
    const _schema = array(string().minLength(1).maxLength(50))
      .minLength(1)
      .maxLength(100)
      .optional()
      .minLength(2)
      .nullable()
      .maxLength(50)
      .required()
      .nullish()
      .length(25)
      .optional()
      .required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string[]>()
  })
})

describe('arraySchema - element chaining with array chaining', () => {
  it('array of complex chained elements with array chaining', () => {
    const _schema = array(
      string()
        .minLength(3)
        .maxLength(25)
        .startsWith('prefix')
        .endsWith('suffix')
        .default('prefixdefaultsuffix'),
    )
      .minLength(1)
      .maxLength(10)
      .optional()
      .nullable()
      .required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string[]>()
  })

  it('array of numbers with defaults and array optionality', () => {
    const _schema = array(
      number()
        .min(0)
        .max(100)
        .default(50),
    )
      .minLength(1)
      .optional()
      .maxLength(5)
      .nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number[] | null>()
  })

  it('array of booleans with chaining and array state changes', () => {
    const _schema = array(
      boolean()
        .default(true),
    )
      .optional()
      .minLength(0)
      .maxLength(100)
      .required()
      .nullable()
      .length(10)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<boolean[] | null>()
  })

  it('array of objects with property chaining and array chaining', () => {
    const _schema = array(
      object({
        name: string().minLength(1).maxLength(50).default('default'),
        age: number().min(0).max(150).optional(),
        active: boolean().default(true),
      }),
    )
      .minLength(1)
      .maxLength(20)
      .optional()
      .length(10)
      .nullable()
      .required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<Array<{
      name: string
      active: boolean
      age?: number
    }>>()
  })
})

describe('arraySchema - nested array chaining', () => {
  it('nested arrays with independent chaining', () => {
    const _schema = array(
      array(string().minLength(1))
        .minLength(1)
        .maxLength(5)
        .optional(),
    )
      .minLength(1)
      .maxLength(10)
      .nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<Array<string[] | undefined> | null>()
  })

  it('triple nested arrays with chaining at each level', () => {
    const _schema = array(
      array(
        array(number().min(0).max(100))
          .minLength(1)
          .maxLength(5)
          .optional(),
      )
        .minLength(1)
        .maxLength(3)
        .nullable(),
    )
      .minLength(1)
      .maxLength(2)
      .nullish()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<Array<Array<number[] | undefined> | null> | null | undefined>()
  })

  it('mixed nested structure with extensive chaining', () => {
    const _schema = array(
      object({
        data: array(
          object({
            values: array(number().min(0).max(1))
              .minLength(1)
              .maxLength(100)
              .optional(),
            labels: array(string().minLength(1))
              .minLength(0)
              .nullable(),
          }),
        )
          .minLength(1)
          .optional(),
        metadata: object({
          id: string().minLength(1),
          version: number().default(1),
        }).nullable(),
      }),
    )
      .minLength(1)
      .maxLength(50)
      .optional()
      .required()
      .nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<Array<{
      metadata: {
        id: string
        version: number
      } | null
      data?: Array<{
        values?: number[]
        labels: string[] | null
      }>
    }> | null>()
  })
})

describe('arraySchema - extreme chaining scenarios', () => {
  it('array with 10+ method calls', () => {
    const _schema = array(string())
      .minLength(1)
      .maxLength(100)
      .optional()
      .minLength(2)
      .nullable()
      .maxLength(50)
      .required()
      .nullish()
      .length(25)
      .optional()
      .required()
      .nullable()
      .minLength(10)
      .maxLength(40)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string[] | null>()
  })

  it('array state oscillation', () => {
    const _schema = array(boolean())
      .optional() // -> optional
      .required() // -> required
      .nullable() // -> nullable
      .required() // -> required
      .optional() // -> optional
      .nullish() // -> nullish
      .required() // -> required
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<boolean[]>()
  })

  it('array with validation method spam', () => {
    const _schema = array(string())
      .minLength(1)
      .minLength(2)
      .minLength(3)
      .minLength(4)
      .minLength(5)
      .maxLength(100)
      .maxLength(90)
      .maxLength(80)
      .maxLength(70)
      .length(50)
      .length(40)
      .length(30)
      .optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string[] | undefined>()
  })

  it('complex element and array chain combination', () => {
    const _schema = array(
      string()
        .minLength(1)
        .maxLength(20)
        .startsWith('pre')
        .endsWith('suf')
        .default('presuf'),
    )
      .minLength(1)
      .maxLength(10)
      .optional()
      .minLength(2)
      .nullable()
      .maxLength(8)
      .required()
      .nullish()
      .length(5)
      .required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string[]>()
  })
})

describe('arraySchema - nested arrays', () => {
  it('array of arrays of strings', () => {
    const _schema = array(array(string()))
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string[][]>()
  })

  it('array of arrays of numbers', () => {
    const _schema = array(array(number().min(0).max(100)))
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number[][]>()
  })

  it('optional array of optional arrays', () => {
    const _schema = array(array(string()).optional()).optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<Array<string[] | undefined> | undefined>()
  })

  it('nullable array of nullable arrays', () => {
    const _schema = array(array(string()).nullable()).nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<Array<string[] | null> | null>()
  })

  it('three-dimensional array', () => {
    const _schema = array(array(array(number())))
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number[][][]>()
  })
})

describe('arraySchema - arrays with objects', () => {
  it('array of simple objects', () => {
    const _schema = array(object({
      id: number(),
      name: string(),
    }))
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<Array<{
      id: number
      name: string
    }>>()
  })

  it('array of objects with optional properties', () => {
    const _schema = array(object({
      id: number(),
      name: string(),
      description: string().optional(),
      isActive: boolean().nullable(),
    }))
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<Array<{
      id: number
      name: string
      isActive: boolean | null
      description?: string
    }>>()
  })

  it('optional array of objects', () => {
    const _schema = array(object({
      id: number(),
      name: string(),
    })).optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<Array<{
      id: number
      name: string
    }> | undefined>()
  })

  it('array of objects with nested arrays', () => {
    const _schema = array(object({
      user: object({
        id: number(),
        name: string(),
      }),
      tags: array(string()),
      scores: array(number().min(0).max(100)).optional(),
    }))
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<Array<{
      user: {
        id: number
        name: string
      }
      tags: string[]
      scores?: number[]
    }>>()
  })
})

describe('arraySchema - complex element combinations', () => {
  it('array of mixed validation elements', () => {
    const _schema = array(string().minLength(3).maxLength(25).default('hello'))
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string[]>()
  })

  it('array with complex validation and optionality', () => {
    const _schema = array(number().min(0).max(100).default(50)).minLength(1).maxLength(10).nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number[] | null>()
  })

  it('ultra complex nested structure', () => {
    const _schema = array(
      object({
        metadata: object({
          id: string(),
          version: number().default(1),
        }),
        data: array(
          object({
            values: array(number().min(0).max(100)),
            labels: array(string().minLength(1)),
          }),
        ),
        settings: object({
          enabled: boolean().default(true),
          config: array(string()).optional(),
        }).optional(),
      }),
    ).minLength(1).maxLength(5).optional()

    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<Array<{
      metadata: {
        id: string
        version: number
      }
      data: Array<{
        values: number[]
        labels: string[]
      }>
      settings?: {
        enabled: boolean
        config?: string[]
      }
    }> | undefined>()
  })
})
