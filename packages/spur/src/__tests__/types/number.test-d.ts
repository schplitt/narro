import type { ExtractOutputType } from '../../types/utils'

import { describe, expectTypeOf, it } from 'vitest'

import { number } from '../../leitplanken/number'

describe('numberSchema - basic types', () => {
  it('basic number schema', () => {
    const _schema = number()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number>()
  })

  it('optional number schema', () => {
    const _schema = number().optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number | undefined>()
  })

  it('nullable number schema', () => {
    const _schema = number().nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number | null>()
  })

  it('nullish number schema', () => {
    const _schema = number().nullish()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number | null | undefined>()
  })

  it('required number schema (explicit)', () => {
    const _schema = number().required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number>()
  })
})

describe('numberSchema - with defaults', () => {
  it('number with default', () => {
    const _schema = number().default(42)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number>()
  })

  it('number with default then unset', () => {
    const _schema = number().default(42)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number>()
  })

  it('optional number with default', () => {
    const _schema = number().optional().default(42)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number>()
  })
})

describe('numberSchema - with validation', () => {
  it('number with min', () => {
    const _schema = number().min(0)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number>()
  })

  it('number with max', () => {
    const _schema = number().max(100)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number>()
  })

  it('number with min and max', () => {
    const _schema = number().min(0).max(100)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number>()
  })
})

describe('numberSchema - chained operations', () => {
  it('optional number with validation', () => {
    const _schema = number().min(0).max(150).optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number | undefined>()
  })

  it('nullable number with validation', () => {
    const _schema = number().min(0).max(150).nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number | null>()
  })

  it('nullish number with validation', () => {
    const _schema = number().min(0).max(150).nullish()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number | null | undefined>()
  })

  it('number with default and validation', () => {
    const _schema = number().min(0).max(150).default(18)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number>()
  })

  it('complex chaining with default', () => {
    const _schema = number().min(0).max(150).default(18)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number>()
  })
})

describe('numberSchema - complex chaining with defaults', () => {
  it('nullable number with default', () => {
    const _schema = number().nullable().default(42)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number>()
  })

  it('nullish number with default', () => {
    const _schema = number().nullish().default(42)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number>()
  })

  it('optional number with default and validation', () => {
    const _schema = number().optional().min(0).max(100).default(50)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number>()
  })

  it('nullable number with default and validation', () => {
    const _schema = number().nullable().min(0).max(100).default(50)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number>()
  })

  it('nullish number with default and validation', () => {
    const _schema = number().nullish().min(0).max(100).default(50)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number>()
  })

  it('number with default then made optional', () => {
    const _schema = number().default(42).optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number | undefined>()
  })

  it('number with default then made nullable', () => {
    const _schema = number().default(42).nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number | null>()
  })

  it('number with default then made nullish', () => {
    const _schema = number().default(42).nullish()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number | null | undefined>()
  })
})

describe('numberSchema - complex validation chains', () => {
  it('validation then optionality', () => {
    const _schema = number().min(-100).max(100).optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number | undefined>()
  })

  it('validation then nullable', () => {
    const _schema = number().min(-100).max(100).nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number | null>()
  })

  it('validation then nullish', () => {
    const _schema = number().min(-100).max(100).nullish()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number | null | undefined>()
  })

  it('validation with default and optionality', () => {
    const _schema = number().min(-100).max(100).default(0).optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number | undefined>()
  })

  it('validation with default and nullable', () => {
    const _schema = number().min(-100).max(100).default(0).nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number | null>()
  })

  it('validation with default and nullish', () => {
    const _schema = number().min(-100).max(100).default(0).nullish()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number | null | undefined>()
  })
})

describe('numberSchema - default manipulation chains', () => {
  it('default then unset then optional', () => {
    const _schema = number().default(42).optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number | undefined>()
  })

  it('default then unset then nullable', () => {
    const _schema = number().default(42).nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number | null>()
  })

  it('default then unset then nullish', () => {
    const _schema = number().default(42).nullish()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number | null | undefined>()
  })

  it('optional then default then required', () => {
    const _schema = number().optional().default(42).required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number>()
  })

  it('nullable then default then required', () => {
    const _schema = number().nullable().default(42).required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number>()
  })

  it('nullish then default then required', () => {
    const _schema = number().nullish().default(42).required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number>()
  })

  it('ultra complex chain', () => {
    const _schema = number().min(0).max(100).optional().default(50).min(10).max(90).nullable().required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<number>()
  })
})
