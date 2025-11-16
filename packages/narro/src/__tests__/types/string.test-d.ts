import type { InferInput, InferOutput } from '../../types/utils'

import { describe, expectTypeOf, it } from 'vitest'

import { string } from '../../schemas/string'

describe('stringSchema - basic types', () => {
  it('basic string schema', () => {
    const _schema = string()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
  })

  it('optional string schema', () => {
    const _schema = string().optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined>()
  })

  it('nullable string schema', () => {
    const _schema = string().nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | null>()
  })

  it('nullish string schema', () => {
    const _schema = string().nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined | null>()
  })

  it('required string schema (explicit)', () => {
    const _schema = string().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
  })
})

describe('stringSchema - with defaults', () => {
  it('string with default', () => {
    const _schema = string().default('hello')
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string | undefined | null>()
  })

  it('string with default then unset', () => {
    const _schema = string().default('hello')
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string | undefined | null>()
  })

  it('optional string with default', () => {
    const _schema = string().optional().default('hello')
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string | undefined | null>()
  })

  it('string with lazy default function', () => {
    const _schema = string().default(() => 'gen')
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string | undefined | null>()
  })

  it('optional then lazy default collapses undefined', () => {
    const _schema = string().optional().default(() => 'later')
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string | undefined | null>()
  })

  it('nullable then default removes null', () => {
    const _schema = string().nullable().default('x')
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string | undefined | null>()
  })

  it('nullish then default removes null & undefined', () => {
    const _schema = string().nullish().default('x')
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string | undefined | null>()
  })

  it('default then optional reintroduces undefined', () => {
    const _schema = string().default('x').optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string | undefined>()
  })

  it('default then nullable reintroduces null', () => {
    const _schema = string().default('x').nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | null>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string | null>()
  })

  it('default then nullish reintroduces null | undefined', () => {
    const _schema = string().default('x').nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined | null>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string | undefined | null>()
  })
})

describe('stringSchema - with validation', () => {
  it('string with minLength', () => {
    const _schema = string().minLength(3)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
  })

  it('string with maxLength', () => {
    const _schema = string().maxLength(10)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
  })

  it('string with exact length', () => {
    const _schema = string().length(5)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
  })

  it('string with startsWith', () => {
    const _schema = string().startsWith('prefix')
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
  })

  it('string with endsWith', () => {
    const _schema = string().endsWith('suffix')
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
  })
})

describe('stringSchema - chained operations', () => {
  it('optional string with validation', () => {
    const _schema = string().minLength(3).maxLength(25).optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined>()
  })

  it('nullable string with validation', () => {
    const _schema = string().minLength(3).maxLength(25).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | null>()
  })

  it('nullish string with validation', () => {
    const _schema = string().minLength(3).maxLength(25).nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined | null>()
  })

  it('complex chaining', () => {
    const _schema = string().minLength(3).maxLength(25).startsWith('prefix').endsWith('suffix').optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined>()
  })
})

describe('stringSchema - complex chaining with defaults', () => {
  it('nullable string with default', () => {
    const _schema = string().nullable().default('default')
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string | undefined | null>()
  })

  it('nullish string with default', () => {
    const _schema = string().nullish().default('default')
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string | undefined | null>()
  })

  it('optional string with default and validation', () => {
    const _schema = string().optional().minLength(3).maxLength(25).default('hello')
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string | undefined | null>()
  })

  it('nullable string with default and validation', () => {
    const _schema = string().nullable().minLength(3).maxLength(25).default('hello')
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string | undefined | null>()
  })

  it('nullish string with default and validation', () => {
    const _schema = string().nullish().minLength(3).maxLength(25).default('hello')
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string | undefined | null>()
  })

  it('string with default then made optional', () => {
    const _schema = string().default('hello').optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined>()
  })

  it('string with default then made nullable', () => {
    const _schema = string().default('hello').nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | null>()
  })

  it('string with default then made nullish', () => {
    const _schema = string().default('hello').nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined | null>()
  })
})

describe('stringSchema - complex validation chains', () => {
  it('all validation methods chained', () => {
    const _schema = string().minLength(5).maxLength(20).startsWith('pre').endsWith('suf')
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
  })

  it('validation then optionality', () => {
    const _schema = string().minLength(5).maxLength(20).startsWith('pre').endsWith('suf').optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined>()
  })

  it('validation then nullable', () => {
    const _schema = string().minLength(5).maxLength(20).startsWith('pre').endsWith('suf').nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | null>()
  })

  it('validation then nullish', () => {
    const _schema = string().minLength(5).maxLength(20).startsWith('pre').endsWith('suf').nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined | null>()
  })

  it('validation with default and optionality', () => {
    const _schema = string().minLength(5).maxLength(20).startsWith('pre').endsWith('suf').default('presuf').optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string | undefined>()
  })

  it('validation with default and nullable', () => {
    const _schema = string().minLength(5).maxLength(20).startsWith('pre').endsWith('suf').default('presuf').nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | null>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string | null>()
  })
})

describe('stringSchema - default manipulation chains', () => {
  it('default then unset then optional', () => {
    const _schema = string().default('hello').optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string | undefined>()
  })

  it('default then unset then nullable', () => {
    const _schema = string().default('hello').nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | null>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string | null>()
  })

  it('default then unset then nullish', () => {
    const _schema = string().default('hello').nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined | null>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string | undefined | null>()
  })

  it('optional then default then required', () => {
    const _schema = string().optional().default('hello').required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string>()
  })

  it('nullable then default then required', () => {
    const _schema = string().nullable().default('hello').required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string>()
  })

  it('nullish then default then required', () => {
    const _schema = string().nullish().default('hello').required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string>()
  })
})

describe('stringSchema - undefinable', () => {
  it('undefinable string schema', () => {
    const _schema = string().undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined>()
  })

  it('undefinable string with validation', () => {
    const _schema = string().minLength(3).maxLength(25).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined>()
  })

  it('undefinable string with default', () => {
    const _schema = string().undefinable().default('hello')
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string | undefined | null>()
  })

  it('string with default then undefinable', () => {
    const _schema = string().default('hello').undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined>()
  })

  it('undefinable then required', () => {
    const _schema = string().undefinable().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
  })

  it('undefinable then nullable', () => {
    const _schema = string().undefinable().nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | null>()
  })

  it('undefinable then nullish', () => {
    const _schema = string().undefinable().nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined | null>()
  })

  it('undefinable with all validation methods', () => {
    const _schema = string().minLength(5).maxLength(20).startsWith('pre').endsWith('suf').undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined>()
  })

  it('undefinable with default and validation', () => {
    const _schema = string().undefinable().minLength(3).maxLength(25).default('hello')
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string | undefined | null>()
  })

  it('undefinable then optional (should stay undefinable)', () => {
    const _schema = string().undefinable().optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined>()
  })

  it('complex undefinable chaining', () => {
    const _schema = string().minLength(1).undefinable().maxLength(50).default('test').required().undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string | undefined>()
  })
})
