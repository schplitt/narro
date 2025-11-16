import type { InferInput, InferOutput } from '../../types/utils'

import { describe, expectTypeOf, it } from 'vitest'

import { literal } from '../../schemas/literal'

describe('literalSchema - basic types', () => {
  it('string literal schema', () => {
    const _schema = literal('hello')
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'hello'>()
  })

  it('number literal schema', () => {
    const _schema = literal(42)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<42>()
  })

  it('optional string literal schema', () => {
    const _schema = literal('hello').optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'hello' | undefined>()
  })

  it('undefinable string literal schema', () => {
    const _schema = literal('hello').undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'hello' | undefined>()
  })

  it('optional number literal schema', () => {
    const _schema = literal(42).optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<42 | undefined>()
  })

  it('undefinable number literal schema', () => {
    const _schema = literal(42).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<42 | undefined>()
  })

  it('nullable string literal schema', () => {
    const _schema = literal('hello').nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'hello' | null>()
  })

  it('nullable number literal schema', () => {
    const _schema = literal(42).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<42 | null>()
  })

  it('nullish string literal schema', () => {
    const _schema = literal('hello').nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'hello' | undefined | null>()
  })

  it('nullish number literal schema', () => {
    const _schema = literal(42).nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<42 | undefined | null>()
  })

  it('required string literal schema (explicit)', () => {
    const _schema = literal('hello').required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'hello'>()
  })

  it('required number literal schema (explicit)', () => {
    const _schema = literal(42).required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<42>()
  })
})

describe('literalSchema - with defaults', () => {
  it('string literal with default', () => {
    const _schema = literal('hello').default('hello')
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'hello'>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<'hello' | undefined | null>()
  })

  it('number literal with default', () => {
    const _schema = literal(42).default(42)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<42>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<42 | undefined | null>()
  })

  it('string literal with default then optional', () => {
    const _schema = literal('world').default('world').optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'world' | undefined>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<'world' | undefined>()
  })

  it('string literal with default then undefinable', () => {
    const _schema = literal('world').default('world').undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'world' | undefined>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<'world' | undefined>()
  })

  it('number literal with default then nullable', () => {
    const _schema = literal(123).default(123).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<123 | null>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<123 | null>()
  })

  it('string literal with default then nullish', () => {
    const _schema = literal('test').default('test').nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'test' | undefined | null>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<'test' | undefined | null>()
  })

  it('optional literal then default then required', () => {
    const _schema = literal('foo').optional().default('foo').required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'foo'>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<'foo'>()
  })
})

describe('literalSchema - chained operations', () => {
  it('string literal optional then required', () => {
    const _schema = literal('hello').optional().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'hello'>()
  })

  it('number literal nullable then required', () => {
    const _schema = literal(42).nullable().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<42>()
  })

  it('string literal nullish then required', () => {
    const _schema = literal('world').nullish().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'world'>()
  })

  it('number literal required then optional', () => {
    const _schema = literal(123).required().optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<123 | undefined>()
  })
})

describe('literalSchema - edge cases', () => {
  it('empty string literal', () => {
    const _schema = literal('')
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<''>()
  })

  it('zero literal', () => {
    const _schema = literal(0)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<0>()
  })

  it('negative number literal', () => {
    const _schema = literal(-42)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<-42>()
  })

  it('float literal', () => {
    const _schema = literal(3.14)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<3.14>()
  })
})

describe('literalSchema - undefinable', () => {
  it('undefinable string literal', () => {
    const _schema = literal('hello').undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'hello' | undefined>()
  })

  it('undefinable number literal', () => {
    const _schema = literal(42).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<42 | undefined>()
  })

  it('undefinable literal with default', () => {
    const _schema = literal('test').undefinable().default('test')
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'test'>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<'test' | undefined | null>()
  })

  it('literal with default then undefinable', () => {
    const _schema = literal('hello').default('hello').undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'hello' | undefined>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<'hello' | undefined>()
  })

  it('undefinable then required', () => {
    const _schema = literal('test').undefinable().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'test'>()
  })

  it('undefinable then nullable', () => {
    const _schema = literal(123).undefinable().nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<123 | null>()
  })

  it('undefinable then nullish', () => {
    const _schema = literal('world').undefinable().nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'world' | undefined | null>()
  })

  it('undefinable then optional (should stay undefinable)', () => {
    const _schema = literal('test').undefinable().optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'test' | undefined>()
  })

  it('complex undefinable chaining', () => {
    const _schema = literal(42).default(42).undefinable().required().nullable().undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<42 | undefined>()
  })

  it('undefinable with edge case literals', () => {
    const _schema1 = literal('').undefinable()
    const _schema2 = literal(0).undefinable()
    const _schema3 = literal(-1).undefinable()
    expectTypeOf<InferOutput<typeof _schema1>>().toEqualTypeOf<'' | undefined>()
    expectTypeOf<InferOutput<typeof _schema2>>().toEqualTypeOf<0 | undefined>()
    expectTypeOf<InferOutput<typeof _schema3>>().toEqualTypeOf<-1 | undefined>()
  })
})

describe('literalSchema - boolean literals', () => {
  it('true literal schema', () => {
    const _schema = literal(true)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<true>()
  })

  it('false literal schema', () => {
    const _schema = literal(false)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<false>()
  })

  it('optional true literal schema', () => {
    const _schema = literal(true).optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<true | undefined>()
  })

  it('nullable false literal schema', () => {
    const _schema = literal(false).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<false | null>()
  })

  it('nullish true literal schema', () => {
    const _schema = literal(true).nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<true | undefined | null>()
  })

  it('true literal with default', () => {
    const _schema = literal(true).default(true)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<true>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<true | undefined | null>()
  })

  it('false literal with default', () => {
    const _schema = literal(false).default(false)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<false>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<false | undefined | null>()
  })
})
