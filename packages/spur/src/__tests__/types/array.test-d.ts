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

describe('arraySchema - basic types', () => {
  it('array of strings', () => {
    const _schema = array(string())
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[]>()
  })

  it('array of numbers', () => {
    const _schema = array(number())
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number[]>()
  })

  it('array of booleans', () => {
    const _schema = array(boolean())
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean[]>()
  })

  it('array of string literals', () => {
    const _schema = array(literal('hello'))
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'hello'[]>()
  })

  it('array of number literals', () => {
    const _schema = array(literal(42))
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<42[]>()
  })

  it('array of oneOf strings', () => {
    const _schema = array(oneOf(['red', 'green', 'blue']))
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<('red' | 'green' | 'blue')[]>()
  })

  it('array of oneOf numbers', () => {
    const _schema = array(oneOf([1, 2, 3]))
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<(1 | 2 | 3)[]>()
  })

  it('array of mixed oneOf', () => {
    const _schema = array(oneOf(['hello', 42, 'world']))
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<('hello' | 42 | 'world')[]>()
  })

  it('array of union schemas', () => {
    const _schema = array(union([string(), number()]))
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<(string | number)[]>()
  })

  it('array of complex union', () => {
    const _schema = array(union([literal('test'), oneOf([1, 2, 3]), boolean()]))
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<('test' | 1 | 2 | 3 | boolean)[]>()
  })

  it('optional array of strings', () => {
    const _schema = array(string()).optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[] | undefined>()
  })

  it('undefinable array of strings', () => {
    const _schema = array(string()).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[] | undefined>()
  })

  it('nullable array of strings', () => {
    const _schema = array(string()).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[] | null>()
  })

  it('nullish array of strings', () => {
    const _schema = array(string()).nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[] | null | undefined>()
  })

  it('required array of strings (explicit)', () => {
    const _schema = array(string()).required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[]>()
  })
})

describe('arraySchema - with validation', () => {
  it('array with minLength', () => {
    const _schema = array(string()).minLength(1)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[]>()
  })

  it('array with maxLength', () => {
    const _schema = array(string()).maxLength(10)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[]>()
  })

  it('array with exact length', () => {
    const _schema = array(string()).length(5)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[]>()
  })

  it('array with min and max length', () => {
    const _schema = array(string()).minLength(1).maxLength(10)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[]>()
  })
})

describe('arraySchema - with element validation', () => {
  it('array of optional strings', () => {
    const _schema = array(string().optional())
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<string | undefined>>()
  })

  it('array of undefinable strings', () => {
    const _schema = array(string().undefinable())
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<string | undefined>>()
  })

  it('array of nullable strings', () => {
    const _schema = array(string().nullable())
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<string | null>>()
  })

  it('array of strings with validation', () => {
    const _schema = array(string().minLength(3).maxLength(25))
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[]>()
  })

  it('array of numbers with validation', () => {
    const _schema = array(number().min(0).max(100))
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number[]>()
  })

  it('array of booleans with default', () => {
    const _schema = array(boolean().default(false))
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean[]>()
  })

  it('array of strings with default', () => {
    const _schema = array(string().default('hello'))
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[]>()
  })

  it('array of optional literals', () => {
    const _schema = array(literal('test').optional())
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<'test' | undefined>>()
  })

  it('array of nullable literals', () => {
    const _schema = array(literal(42).nullable())
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<42 | null>>()
  })

  it('array of oneOf with defaults', () => {
    const _schema = array(oneOf(['a', 'b', 'c']).default('a'))
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<('a' | 'b' | 'c')[]>()
  })

  it('array of optional oneOf', () => {
    const _schema = array(oneOf([1, 2, 3]).optional())
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<1 | 2 | 3 | undefined>>()
  })

  it('array of undefinable oneOf', () => {
    const _schema = array(oneOf([1, 2, 3]).undefinable())
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<1 | 2 | 3 | undefined>>()
  })

  it('array of nullish oneOf', () => {
    const _schema = array(oneOf(['x', 'y']).nullish())
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<'x' | 'y' | null | undefined>>()
  })

  it('array of optional union', () => {
    const _schema = array(union([string(), number()]).optional())
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<string | number | undefined>>()
  })

  it('array of nullable union', () => {
    const _schema = array(union([literal('a'), literal(1)]).nullable())
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<'a' | 1 | null>>()
  })
})

describe('arraySchema - chained operations', () => {
  it('optional array with validation', () => {
    const _schema = array(string().minLength(3).maxLength(25)).optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[] | undefined>()
  })

  it('undefinable array with validation', () => {
    const _schema = array(string().minLength(3).maxLength(25)).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[] | undefined>()
  })

  it('nullable array with validation', () => {
    const _schema = array(number().min(0).max(100)).nullable().maxLength(10)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number[] | null>()
  })

  it('nullish array with validation', () => {
    const _schema = array(string()).nullish().minLength(1).maxLength(5)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[] | null | undefined>()
  })

  it('complex chaining', () => {
    const _schema = array(string().minLength(3).maxLength(25)).minLength(1).maxLength(10).optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[] | undefined>()
  })
})

describe('arraySchema - extensive chaining operations', () => {
  it('array optionality then validation then back to optionality', () => {
    const _schema = array(string()).optional().minLength(1).maxLength(10).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[] | null>()
  })

  it('array with multiple optionality state changes', () => {
    const _schema = array(string()).optional().required().nullable().nullish().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[]>()
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
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number[]>()
  })

  it('array with conflicting length validations', () => {
    const _schema = array(string())
      .minLength(10)
      .maxLength(5)
      .length(7)
      .optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[] | undefined>()
  })

  it('array nullish then required then nullable', () => {
    const _schema = array(boolean()).nullish().required().nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean[] | null>()
  })

  it('array with overriding length constraints', () => {
    const _schema = array(string())
      .minLength(1)
      .minLength(5) // should override previous min
      .maxLength(20)
      .maxLength(10) // should override previous max
      .length(7) // should override both min and max
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[]>()
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
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[]>()
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
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[]>()
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
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number[] | null>()
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
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean[] | null>()
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
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<{
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
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<string[] | undefined> | null>()
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
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<Array<number[] | undefined> | null> | null | undefined>()
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
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<{
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

describe('arraySchema - objects with shape modes inside arrays', () => {
  it('array of passthrough objects (index signature only on element)', () => {
    const _schema = array(object({ key: string(), value: number().optional() }).passthrough())
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<{ key: string, value?: number, [key: string]: any }>>()
  })

  it('array of mixed shape mode objects via union', () => {
    const _schema = array(union([
      object({ kind: literal('strict'), a: string() }).strict(),
      object({ kind: literal('pass'), b: number() }).passthrough(),
      object({ kind: literal('strip'), c: boolean() }).passthrough().strip(),
    ]))

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<
      | { kind: 'strict', a: string }
      | { kind: 'pass', b: number, [key: string]: any }
      | { kind: 'strip', c: boolean }
    >>()
  })

  it('optional array of passthrough objects', () => {
    const _schema = array(object({ id: string(), meta: number().nullable() }).passthrough()).optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<{ id: string, meta: number | null, [key: string]: any }> | undefined>()
  })

  it('nullable array of strip objects derived from passthrough', () => {
    const _schema = array(object({ name: string().optional(), age: number() }).passthrough().strip()).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<{ name?: string, age: number }> | null>()
  })

  it('array of objects with deep nested passthrough child', () => {
    const _schema = array(object({
      outer: object({
        inner: object({ value: string() }).passthrough(),
      }).strip(),
    }).passthrough())

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<{
      outer: { inner: { value: string, [key: string]: any } }
      [key: string]: any
    }>>()
  })

  it('array chaining after element shape transitions', () => {
    const _schema = array(
      object({ id: string(), flag: boolean().optional() })
        .strict()
        .passthrough()
        .strip(), // final element shape: strip
    ).minLength(0).optional()

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<{ id: string, flag?: boolean }> | undefined>()
  })

  it('array of objects final element passthrough with root nullish', () => {
    const _schema = array(
      object({ code: string(), data: object({ v: number() }).passthrough() })
        .strip()
        .passthrough(),
    ).nullish()

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<{
      code: string
      data: { v: number, [key: string]: any }
      [key: string]: any
    }> | null | undefined>()
  })

  it('multi-level nested arrays of mixed shape objects', () => {
    const _schema = array(array(object({
      tag: literal('node'),
      info: object({ label: string().optional() }).passthrough(),
      meta: object({ created: number() }).passthrough().strip(),
    }).passthrough()))

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<Array<{
      tag: 'node'
      info: { label?: string, [key: string]: any }
      meta: { created: number }
      [key: string]: any
    }>>>()
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
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[] | null>()
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
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean[]>()
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
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[] | undefined>()
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
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[]>()
  })
})

describe('arraySchema - undefinable', () => {
  it('undefinable array of strings', () => {
    const _schema = array(string()).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[] | undefined>()
  })

  it('array of undefinable strings', () => {
    const _schema = array(string().undefinable())
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<string | undefined>>()
  })

  it('undefinable array of undefinable strings', () => {
    const _schema = array(string().undefinable()).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<string | undefined> | undefined>()
  })

  it('undefinable array with validation', () => {
    const _schema = array(string().minLength(3).maxLength(25)).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[] | undefined>()
  })

  it('undefinable array with element validation', () => {
    const _schema = array(string().minLength(3).undefinable()).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<string | undefined> | undefined>()
  })

  it('undefinable then required', () => {
    const _schema = array(string()).undefinable().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[]>()
  })

  it('undefinable then nullable', () => {
    const _schema = array(number()).undefinable().nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number[] | null>()
  })

  it('undefinable then nullish', () => {
    const _schema = array(boolean()).undefinable().nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean[] | null | undefined>()
  })

  it('undefinable then optional (should stay undefinable)', () => {
    const _schema = array(string()).undefinable().optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[] | undefined>()
  })

  it('complex undefinable chaining', () => {
    const _schema = array(string()).minLength(1).undefinable().maxLength(10).required().nullable().undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[] | undefined>()
  })

  it('array of undefinable literals', () => {
    const _schema = array(literal('test').undefinable())
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<'test' | undefined>>()
  })

  it('array of undefinable oneOf', () => {
    const _schema = array(oneOf([1, 2, 3]).undefinable())
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<1 | 2 | 3 | undefined>>()
  })

  it('array of undefinable union', () => {
    const _schema = array(union([string(), number()]).undefinable())
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<string | number | undefined>>()
  })

  it('nested undefinable arrays', () => {
    const _schema = array(array(string()).undefinable()).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<string[] | undefined> | undefined>()
  })

  it('triple nested undefinable arrays', () => {
    const _schema = array(array(array(number()).undefinable()).undefinable()).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<Array<number[] | undefined> | undefined> | undefined>()
  })

  it('undefinable array with complex elements', () => {
    const _schema = array(
      object({
        name: string().undefinable(),
        age: number().nullable(),
      }),
    ).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<{
      name: string | undefined
      age: number | null
    }> | undefined>()
  })

  it('multiple undefinable calls', () => {
    const _schema = array(string()).undefinable().undefinable().undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[] | undefined>()
  })

  it('ultra complex undefinable scenario', () => {
    const _schema = array(
      object({
        data: array(string().undefinable()).undefinable(),
        metadata: object({
          id: string(),
          optional: number().undefinable(),
        }).undefinable(),
      }),
    ).undefinable().minLength(1).maxLength(5).required().undefinable()

    type Output = InferOutput<typeof _schema>

    expectTypeOf<Output>().toEqualTypeOf<Array<{
      data: Array<string | undefined> | undefined
      metadata: {
        id: string
        optional: number | undefined
      } | undefined
    }> | undefined>()
  })
})

describe('arraySchema - nested arrays', () => {
  it('array of arrays of strings', () => {
    const _schema = array(array(string()))
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[][]>()
  })

  it('array of arrays of numbers', () => {
    const _schema = array(array(number().min(0).max(100)))
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number[][]>()
  })

  it('optional array of optional arrays', () => {
    const _schema = array(array(string()).optional()).optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<string[] | undefined> | undefined>()
  })

  it('nullable array of nullable arrays', () => {
    const _schema = array(array(string()).nullable()).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<string[] | null> | null>()
  })

  it('three-dimensional array', () => {
    const _schema = array(array(array(number())))
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number[][][]>()
  })
})

describe('arraySchema - arrays with objects', () => {
  it('array of simple objects', () => {
    const _schema = array(object({
      id: number(),
      name: string(),
    }))
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<{
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
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<{
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
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<{
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
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<{
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
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string[]>()
  })

  it('array with complex validation and optionality', () => {
    const _schema = array(number().min(0).max(100).default(50)).minLength(1).maxLength(10).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number[] | null>()
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

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<Array<{
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
