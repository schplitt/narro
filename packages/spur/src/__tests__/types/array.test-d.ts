import type { ExtractOutputType } from '../../types/utils'

import { describe, expectTypeOf, it } from 'vitest'

import { array } from '../../leitplanken/array'
import { boolean } from '../../leitplanken/boolean'
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
