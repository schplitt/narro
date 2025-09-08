import type { ExtractOutputType } from '../../types/utils'

import { describe, expectTypeOf, it } from 'vitest'

import { string } from '../../leitplanken/string'

describe('stringSchema - basic types', () => {
  it('basic string schema', () => {
    const _schema = string()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string>()
  })

  it('optional string schema', () => {
    const _schema = string().optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string | undefined>()
  })

  it('nullable string schema', () => {
    const _schema = string().nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string | null>()
  })

  it('nullish string schema', () => {
    const _schema = string().nullish()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string | null | undefined>()
  })

  it('required string schema (explicit)', () => {
    const _schema = string().required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string>()
  })
})

describe('stringSchema - with defaults', () => {
  it('string with default', () => {
    const _schema = string().default('hello')
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string>()
  })

  it('string with default then unset', () => {
    const _schema = string().default('hello')
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string>()
  })

  it('optional string with default', () => {
    const _schema = string().optional().default('hello')
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string>()
  })
})

describe('stringSchema - with validation', () => {
  it('string with minLength', () => {
    const _schema = string().minLength(3)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string>()
  })

  it('string with maxLength', () => {
    const _schema = string().maxLength(10)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string>()
  })

  it('string with exact length', () => {
    const _schema = string().length(5)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string>()
  })

  it('string with startsWith', () => {
    const _schema = string().startsWith('prefix')
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string>()
  })

  it('string with endsWith', () => {
    const _schema = string().endsWith('suffix')
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string>()
  })
})

describe('stringSchema - chained operations', () => {
  it('optional string with validation', () => {
    const _schema = string().minLength(3).maxLength(25).optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string | undefined>()
  })

  it('nullable string with validation', () => {
    const _schema = string().minLength(3).maxLength(25).nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string | null>()
  })

  it('nullish string with validation', () => {
    const _schema = string().minLength(3).maxLength(25).nullish()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string | null | undefined>()
  })

  it('complex chaining', () => {
    const _schema = string().minLength(3).maxLength(25).startsWith('prefix').endsWith('suffix').optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string | undefined>()
  })
})

describe('stringSchema - complex chaining with defaults', () => {
  it('nullable string with default', () => {
    const _schema = string().nullable().default('default')
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string>()
  })

  it('nullish string with default', () => {
    const _schema = string().nullish().default('default')
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string>()
  })

  it('optional string with default and validation', () => {
    const _schema = string().optional().minLength(3).maxLength(25).default('hello')
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string>()
  })

  it('nullable string with default and validation', () => {
    const _schema = string().nullable().minLength(3).maxLength(25).default('hello')
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string>()
  })

  it('nullish string with default and validation', () => {
    const _schema = string().nullish().minLength(3).maxLength(25).default('hello')
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string>()
  })

  it('string with default then made optional', () => {
    const _schema = string().default('hello').optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string | undefined>()
  })

  it('string with default then made nullable', () => {
    const _schema = string().default('hello').nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string | null>()
  })

  it('string with default then made nullish', () => {
    const _schema = string().default('hello').nullish()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string | null | undefined>()
  })
})

describe('stringSchema - complex validation chains', () => {
  it('all validation methods chained', () => {
    const _schema = string().minLength(5).maxLength(20).startsWith('pre').endsWith('suf')
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string>()
  })

  it('validation then optionality', () => {
    const _schema = string().minLength(5).maxLength(20).startsWith('pre').endsWith('suf').optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string | undefined>()
  })

  it('validation then nullable', () => {
    const _schema = string().minLength(5).maxLength(20).startsWith('pre').endsWith('suf').nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string | null>()
  })

  it('validation then nullish', () => {
    const _schema = string().minLength(5).maxLength(20).startsWith('pre').endsWith('suf').nullish()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string | null | undefined>()
  })

  it('validation with default and optionality', () => {
    const _schema = string().minLength(5).maxLength(20).startsWith('pre').endsWith('suf').default('presuf').optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string | undefined>()
  })

  it('validation with default and nullable', () => {
    const _schema = string().minLength(5).maxLength(20).startsWith('pre').endsWith('suf').default('presuf').nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string | null>()
  })
})

describe('stringSchema - default manipulation chains', () => {
  it('default then unset then optional', () => {
    const _schema = string().default('hello').optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string | undefined>()
  })

  it('default then unset then nullable', () => {
    const _schema = string().default('hello').nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string | null>()
  })

  it('default then unset then nullish', () => {
    const _schema = string().default('hello').nullish()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string | null | undefined>()
  })

  it('optional then default then required', () => {
    const _schema = string().optional().default('hello').required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string>()
  })

  it('nullable then default then required', () => {
    const _schema = string().nullable().default('hello').required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string>()
  })

  it('nullish then default then required', () => {
    const _schema = string().nullish().default('hello').required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<string>()
  })
})
