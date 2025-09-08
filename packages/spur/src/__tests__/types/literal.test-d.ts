import type { ExtractOutputType } from '../../types/utils'

import { describe, expectTypeOf, it } from 'vitest'

import { literal } from '../../leitplanken/literal'

describe('literalSchema - basic types', () => {
  it('string literal schema', () => {
    const _schema = literal('hello')
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'hello'>()
  })

  it('number literal schema', () => {
    const _schema = literal(42)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<42>()
  })

  it('optional string literal schema', () => {
    const _schema = literal('hello').optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'hello' | undefined>()
  })

  it('optional number literal schema', () => {
    const _schema = literal(42).optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<42 | undefined>()
  })

  it('nullable string literal schema', () => {
    const _schema = literal('hello').nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'hello' | null>()
  })

  it('nullable number literal schema', () => {
    const _schema = literal(42).nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<42 | null>()
  })

  it('nullish string literal schema', () => {
    const _schema = literal('hello').nullish()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'hello' | null | undefined>()
  })

  it('nullish number literal schema', () => {
    const _schema = literal(42).nullish()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<42 | null | undefined>()
  })

  it('required string literal schema (explicit)', () => {
    const _schema = literal('hello').required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'hello'>()
  })

  it('required number literal schema (explicit)', () => {
    const _schema = literal(42).required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<42>()
  })
})

describe('literalSchema - with defaults', () => {
  it('string literal with default', () => {
    const _schema = literal('hello').default('hello')
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'hello'>()
  })

  it('number literal with default', () => {
    const _schema = literal(42).default(42)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<42>()
  })

  it('string literal with default then optional', () => {
    const _schema = literal('world').default('world').optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'world' | undefined>()
  })

  it('number literal with default then nullable', () => {
    const _schema = literal(123).default(123).nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<123 | null>()
  })

  it('string literal with default then nullish', () => {
    const _schema = literal('test').default('test').nullish()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'test' | null | undefined>()
  })

  it('optional literal then default then required', () => {
    const _schema = literal('foo').optional().default('foo').required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'foo'>()
  })
})

describe('literalSchema - chained operations', () => {
  it('string literal optional then required', () => {
    const _schema = literal('hello').optional().required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'hello'>()
  })

  it('number literal nullable then required', () => {
    const _schema = literal(42).nullable().required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<42>()
  })

  it('string literal nullish then required', () => {
    const _schema = literal('world').nullish().required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'world'>()
  })

  it('number literal required then optional', () => {
    const _schema = literal(123).required().optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<123 | undefined>()
  })
})

describe('literalSchema - edge cases', () => {
  it('empty string literal', () => {
    const _schema = literal('')
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<''>()
  })

  it('zero literal', () => {
    const _schema = literal(0)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<0>()
  })

  it('negative number literal', () => {
    const _schema = literal(-42)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<-42>()
  })

  it('float literal', () => {
    const _schema = literal(3.14)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<3.14>()
  })
})
