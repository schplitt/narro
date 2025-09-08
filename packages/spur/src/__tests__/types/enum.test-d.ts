import type { ExtractOutputType } from '../../types/utils'

import { describe, expectTypeOf, it } from 'vitest'

import { oneOf } from '../../leitplanken/enum'

describe('oneOfSchema - basic types', () => {
  it('string enum schema', () => {
    const _schema = oneOf(['red', 'green', 'blue'] as const)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'red' | 'green' | 'blue'>()
  })

  it('number enum schema', () => {
    const _schema = oneOf([1, 2, 3] as const)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<1 | 2 | 3>()
  })

  it('mixed enum schema', () => {
    const _schema = oneOf(['hello', 42, 'world'] as const)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'hello' | 42 | 'world'>()
  })

  it('single value enum schema', () => {
    const _schema = oneOf(['only'] as const)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'only'>()
  })

  it('optional string enum schema', () => {
    const _schema = oneOf(['red', 'green', 'blue'] as const).optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'red' | 'green' | 'blue' | undefined>()
  })

  it('optional number enum schema', () => {
    const _schema = oneOf([1, 2, 3] as const).optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<1 | 2 | 3 | undefined>()
  })

  it('nullable string enum schema', () => {
    const _schema = oneOf(['red', 'green', 'blue'] as const).nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'red' | 'green' | 'blue' | null>()
  })

  it('nullable number enum schema', () => {
    const _schema = oneOf([1, 2, 3] as const).nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<1 | 2 | 3 | null>()
  })

  it('nullish string enum schema', () => {
    const _schema = oneOf(['red', 'green', 'blue'] as const).nullish()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'red' | 'green' | 'blue' | null | undefined>()
  })

  it('nullish number enum schema', () => {
    const _schema = oneOf([1, 2, 3] as const).nullish()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<1 | 2 | 3 | null | undefined>()
  })

  it('required string enum schema (explicit)', () => {
    const _schema = oneOf(['red', 'green', 'blue'] as const).required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'red' | 'green' | 'blue'>()
  })

  it('required number enum schema (explicit)', () => {
    const _schema = oneOf([1, 2, 3] as const).required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<1 | 2 | 3>()
  })
})

describe('oneOfSchema - with defaults', () => {
  it('string enum with default', () => {
    const _schema = oneOf(['red', 'green', 'blue'] as const).default('red')
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'red' | 'green' | 'blue'>()
  })

  it('number enum with default', () => {
    const _schema = oneOf([1, 2, 3] as const).default(2)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<1 | 2 | 3>()
  })

  it('mixed enum with string default', () => {
    const _schema = oneOf(['hello', 42, 'world'] as const).default('hello')
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'hello' | 42 | 'world'>()
  })

  it('mixed enum with number default', () => {
    const _schema = oneOf(['hello', 42, 'world'] as const).default(42)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'hello' | 42 | 'world'>()
  })

  it('string enum with default then optional', () => {
    const _schema = oneOf(['a', 'b', 'c'] as const).default('a').optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'a' | 'b' | 'c' | undefined>()
  })

  it('number enum with default then nullable', () => {
    const _schema = oneOf([10, 20, 30] as const).default(10).nullable()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<10 | 20 | 30 | null>()
  })

  it('enum with default then nullish', () => {
    const _schema = oneOf(['x', 'y'] as const).default('x').nullish()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'x' | 'y' | null | undefined>()
  })

  it('optional enum then default then required', () => {
    const _schema = oneOf(['foo', 'bar'] as const).optional().default('foo').required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'foo' | 'bar'>()
  })
})

describe('oneOfSchema - chained operations', () => {
  it('string enum optional then required', () => {
    const _schema = oneOf(['a', 'b'] as const).optional().required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'a' | 'b'>()
  })

  it('number enum nullable then required', () => {
    const _schema = oneOf([10, 20] as const).nullable().required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<10 | 20>()
  })

  it('mixed enum nullish then required', () => {
    const _schema = oneOf(['test', 99] as const).nullish().required()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'test' | 99>()
  })

  it('string enum required then optional', () => {
    const _schema = oneOf(['x', 'y', 'z'] as const).required().optional()
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'x' | 'y' | 'z' | undefined>()
  })
})

describe('oneOfSchema - edge cases', () => {
  it('enum with empty string', () => {
    const _schema = oneOf(['', 'non-empty'] as const)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'' | 'non-empty'>()
  })

  it('enum with zero', () => {
    const _schema = oneOf([0, 1, 2] as const)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<0 | 1 | 2>()
  })

  it('enum with negative numbers', () => {
    const _schema = oneOf([-1, 0, 1] as const)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<-1 | 0 | 1>()
  })

  it('enum with floats', () => {
    const _schema = oneOf([1.5, 2.7, 3.14] as const)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<1.5 | 2.7 | 3.14>()
  })

  it('very long enum', () => {
    const _schema = oneOf(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'] as const)
    expectTypeOf<ExtractOutputType<typeof _schema>>().toEqualTypeOf<'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j'>()
  })
})
