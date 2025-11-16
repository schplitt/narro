import type { InferInput, InferOutput } from '../../types/utils'
import { describe, expectTypeOf, it } from 'vitest'
import { enum_ } from '../../schemas/enum'

describe('enumSchema - basic types', () => {
  it('string enum schema', () => {
    const _schema = enum_(['red', 'green', 'blue'])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'red' | 'green' | 'blue'>()
  })

  it('number enum schema', () => {
    const _schema = enum_([1, 2, 3])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<1 | 2 | 3>()
  })

  it('mixed enum schema', () => {
    const _schema = enum_(['hello', 42, 'world'])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'hello' | 42 | 'world'>()
  })

  it('single value enum schema', () => {
    const _schema = enum_(['only'])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'only'>()
  })

  it('optional string enum schema', () => {
    const _schema = enum_(['red', 'green', 'blue']).optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'red' | 'green' | 'blue' | undefined>()
  })

  it('undefinable string enum schema', () => {
    const _schema = enum_(['red', 'green', 'blue']).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'red' | 'green' | 'blue' | undefined>()
  })

  it('optional number enum schema', () => {
    const _schema = enum_([1, 2, 3]).optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<1 | 2 | 3 | undefined>()
  })

  it('undefinable number enum schema', () => {
    const _schema = enum_([1, 2, 3]).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<1 | 2 | 3 | undefined>()
  })

  it('nullable string enum schema', () => {
    const _schema = enum_(['red', 'green', 'blue']).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'red' | 'green' | 'blue' | null>()
  })

  it('nullable number enum schema', () => {
    const _schema = enum_([1, 2, 3]).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<1 | 2 | 3 | null>()
  })

  it('nullish string enum schema', () => {
    const _schema = enum_(['red', 'green', 'blue']).nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'red' | 'green' | 'blue' | undefined | null>()
  })

  it('nullish number enum schema', () => {
    const _schema = enum_([1, 2, 3]).nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<1 | 2 | 3 | undefined | null>()
  })

  it('required string enum schema (explicit)', () => {
    const _schema = enum_(['red', 'green', 'blue']).required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'red' | 'green' | 'blue'>()
  })

  it('required number enum schema (explicit)', () => {
    const _schema = enum_([1, 2, 3]).required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<1 | 2 | 3>()
  })
})

describe('enumSchema - with defaults', () => {
  it('string enum with default', () => {
    const _schema = enum_(['red', 'green', 'blue']).default('red')
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'red' | 'green' | 'blue'>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<'red' | 'green' | 'blue' | undefined | null>()
  })

  it('number enum with default', () => {
    const _schema = enum_([1, 2, 3]).default(2)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<1 | 2 | 3>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<1 | 2 | 3 | undefined | null>()
  })

  it('mixed enum with string default', () => {
    const _schema = enum_(['hello', 42, 'world']).default('hello')
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'hello' | 42 | 'world'>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<'hello' | 42 | 'world' | undefined | null>()
  })

  it('mixed enum with number default', () => {
    const _schema = enum_(['hello', 42, 'world']).default(42)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'hello' | 42 | 'world'>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<'hello' | 42 | 'world' | undefined | null>()
  })

  it('string enum with default then optional', () => {
    const _schema = enum_(['a', 'b', 'c']).default('a').optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'a' | 'b' | 'c' | undefined>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<'a' | 'b' | 'c' | undefined>()
  })

  it('number enum with default then nullable', () => {
    const _schema = enum_([10, 20, 30]).default(10).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<10 | 20 | 30 | null>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<10 | 20 | 30 | null>()
  })

  it('enum with default then nullish', () => {
    const _schema = enum_(['x', 'y']).default('x').nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'x' | 'y' | undefined | null>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<'x' | 'y' | undefined | null>()
  })

  it('optional enum then default then required', () => {
    const _schema = enum_(['foo', 'bar']).optional().default('foo').required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'foo' | 'bar'>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<'foo' | 'bar'>()
  })
})

describe('enumSchema - chained operations', () => {
  it('string enum optional then required', () => {
    const _schema = enum_(['a', 'b']).optional().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'a' | 'b'>()
  })

  it('number enum nullable then required', () => {
    const _schema = enum_([10, 20]).nullable().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<10 | 20>()
  })

  it('mixed enum nullish then required', () => {
    const _schema = enum_(['test', 99]).nullish().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'test' | 99>()
  })

  it('string enum required then optional', () => {
    const _schema = enum_(['x', 'y', 'z']).required().optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'x' | 'y' | 'z' | undefined>()
  })
})

describe('enumSchema - edge cases', () => {
  it('enum with empty string', () => {
    const _schema = enum_(['', 'non-empty'])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'' | 'non-empty'>()
  })

  it('enum with zero', () => {
    const _schema = enum_([0, 1, 2])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<0 | 1 | 2>()
  })

  it('enum with negative numbers', () => {
    const _schema = enum_([-1, 0, 1])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<-1 | 0 | 1>()
  })

  it('enum with floats', () => {
    const _schema = enum_([1.5, 2.7, 3.14])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<1.5 | 2.7 | 3.14>()
  })

  it('very long enum', () => {
    const _schema = enum_(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j'>()
  })
})

describe('enumSchema - undefinable', () => {
  it('undefinable string enum', () => {
    const _schema = enum_(['red', 'green', 'blue']).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'red' | 'green' | 'blue' | undefined>()
  })

  it('undefinable number enum', () => {
    const _schema = enum_([1, 2, 3]).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<1 | 2 | 3 | undefined>()
  })

  it('undefinable mixed enum', () => {
    const _schema = enum_(['hello', 42, 'world']).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'hello' | 42 | 'world' | undefined>()
  })

  it('undefinable enum with default', () => {
    const _schema = enum_(['a', 'b', 'c']).undefinable().default('a')
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'a' | 'b' | 'c'>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<'a' | 'b' | 'c' | undefined | null>()
  })

  it('enum with default then undefinable', () => {
    const _schema = enum_(['x', 'y']).default('x').undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'x' | 'y' | undefined>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<'x' | 'y' | undefined>()
  })

  it('undefinable then required', () => {
    const _schema = enum_(['foo', 'bar']).undefinable().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'foo' | 'bar'>()
  })

  it('undefinable then nullable', () => {
    const _schema = enum_([10, 20]).undefinable().nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<10 | 20 | null>()
  })

  it('undefinable then nullish', () => {
    const _schema = enum_(['test', 99]).undefinable().nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'test' | 99 | undefined | null>()
  })

  it('undefinable then optional (should stay undefinable)', () => {
    const _schema = enum_(['a', 'b']).undefinable().optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'a' | 'b' | undefined>()
  })

  it('complex undefinable chaining', () => {
    const _schema = enum_(['x', 'y', 'z']).default('x').undefinable().required().nullable().undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'x' | 'y' | 'z' | undefined>()
  })

  it('undefinable with edge case enums', () => {
    const _schema1 = enum_(['', 'non-empty']).undefinable()
    const _schema2 = enum_([0, 1, 2]).undefinable()
    const _schema3 = enum_([-1, 0, 1]).undefinable()
    expectTypeOf<InferOutput<typeof _schema1>>().toEqualTypeOf<'' | 'non-empty' | undefined>()
    expectTypeOf<InferOutput<typeof _schema2>>().toEqualTypeOf<0 | 1 | 2 | undefined>()
    expectTypeOf<InferOutput<typeof _schema3>>().toEqualTypeOf<-1 | 0 | 1 | undefined>()
  })

  it('multiple undefinable calls', () => {
    const _schema = enum_(['a', 'b']).undefinable().undefinable().undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'a' | 'b' | undefined>()
  })
})

describe('enumSchema - boolean enums', () => {
  it('boolean enum schema', () => {
    const _schema = enum_([true, false])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<true | false>()
  })

  it('optional boolean enum schema', () => {
    const _schema = enum_([true, false]).optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<true | false | undefined>()
  })

  it('nullable boolean enum schema', () => {
    const _schema = enum_([true, false]).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<true | false | null>()
  })

  it('nullish boolean enum schema', () => {
    const _schema = enum_([true, false]).nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<true | false | undefined | null>()
  })

  it('boolean enum with default true', () => {
    const _schema = enum_([true, false]).default(true)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<true | false>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<true | false | undefined | null>()
  })

  it('boolean enum with default false', () => {
    const _schema = enum_([true, false]).default(false)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<true | false>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<true | false | undefined | null>()
  })

  it('mixed enum with boolean', () => {
    const _schema = enum_(['yes', 'no', true, false])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'yes' | 'no' | true | false>()
  })

  it('single boolean enum', () => {
    const _schema = enum_([true])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<true>()
  })
})
