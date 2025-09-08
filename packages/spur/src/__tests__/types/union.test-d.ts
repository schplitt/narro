import type { InferOutput } from '../../types/utils'

import { describe, expectTypeOf, it } from 'vitest'

import { boolean } from '../../leitplanken/boolean'
import { oneOf } from '../../leitplanken/enum'
import { literal } from '../../leitplanken/literal'
import { number } from '../../leitplanken/number'
import { string } from '../../leitplanken/string'
import { union } from '../../leitplanken/union'

describe('unionSchema - basic types', () => {
  it('union of string and number', () => {
    const _schema = union([string(), number()] as const)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number>()
  })

  it('union of string, number, and boolean', () => {
    const _schema = union([string(), number(), boolean()] as const)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number | boolean>()
  })

  it('union of literals', () => {
    const _schema = union([literal('hello'), literal(42), literal('world')] as const)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'hello' | 42 | 'world'>()
  })

  it('union of oneOf schemas', () => {
    const _schema = union([
      oneOf(['red', 'green'] as const),
      oneOf([1, 2, 3] as const),
    ] as const)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'red' | 'green' | 1 | 2 | 3>()
  })

  it('union of mixed schema types', () => {
    const _schema = union([
      string(),
      literal(42),
      oneOf(['active', 'inactive'] as const),
      boolean(),
    ] as const)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | 42 | 'active' | 'inactive' | boolean>()
  })

  it('single schema union', () => {
    const _schema = union([string()] as const)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
  })
})

describe('unionSchema - with validation', () => {
  it('union of validated schemas', () => {
    const _schema = union([
      string().minLength(3),
      number().min(0).max(100),
    ] as const)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number>()
  })

  it('union of schemas with defaults', () => {
    const _schema = union([
      string().default('hello'),
      number().default(42),
    ] as const)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number>()
  })

  it('union of optional schemas', () => {
    const _schema = union([
      string().optional(),
      number().optional(),
    ] as const)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined | number>()
  })

  it('union of nullable schemas', () => {
    const _schema = union([
      string().nullable(),
      boolean().nullable(),
    ] as const)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | null | boolean>()
  })

  it('union of nullish schemas', () => {
    const _schema = union([
      literal('test').nullish(),
      literal(123).nullish(),
    ] as const)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'test' | null | undefined | 123>()
  })
})

describe('unionSchema - optionality', () => {
  it('optional union schema', () => {
    const _schema = union([string(), number()] as const).optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number | undefined>()
  })

  it('nullable union schema', () => {
    const _schema = union([string(), boolean()] as const).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | boolean | null>()
  })

  it('nullish union schema', () => {
    const _schema = union([literal('a'), literal(1)] as const).nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'a' | 1 | null | undefined>()
  })

  it('required union schema (explicit)', () => {
    const _schema = union([string(), number()] as const).required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number>()
  })
})

describe('unionSchema - chained operations', () => {
  it('union optional then required', () => {
    const _schema = union([string(), number()] as const).optional().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number>()
  })

  it('union nullable then required', () => {
    const _schema = union([boolean(), literal('test')] as const).nullable().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | 'test'>()
  })

  it('union nullish then required', () => {
    const _schema = union([oneOf(['x', 'y'] as const), number()] as const).nullish().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'x' | 'y' | number>()
  })

  it('union required then optional', () => {
    const _schema = union([string(), literal(42)] as const).required().optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | 42 | undefined>()
  })
})

describe('unionSchema - complex scenarios', () => {
  it('union of many different types', () => {
    const _schema = union([
      string(),
      number(),
      boolean(),
      literal('exact'),
      literal(99),
      oneOf(['red', 'green', 'blue'] as const),
      oneOf([1, 2, 3] as const),
    ] as const)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<
      string | number | boolean | 'exact' | 99 | 'red' | 'green' | 'blue' | 1 | 2 | 3
    >()
  })

  it('union with all schemas having different optionalities', () => {
    const _schema = union([
      string(),
      number().optional(),
      boolean().nullable(),
      literal('test').nullish(),
      oneOf(['a', 'b'] as const).default('a'),
    ] as const)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<
      string | number | undefined | boolean | null | 'test' | 'a' | 'b'
    >()
  })

  it('union of literals creating large union type', () => {
    const _schema = union([
      literal('a'),
      literal('b'),
      literal('c'),
      literal('d'),
      literal('e'),
      literal(1),
      literal(2),
      literal(3),
      literal(4),
      literal(5),
    ] as const)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<
      'a' | 'b' | 'c' | 'd' | 'e' | 1 | 2 | 3 | 4 | 5
    >()
  })

  it('union of complex oneOf schemas', () => {
    const _schema = union([
      oneOf(['error', 'warn', 'info'] as const),
      oneOf([100, 200, 300, 400, 500] as const),
      oneOf(['GET', 'POST', 'PUT', 'DELETE'] as const),
    ] as const)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<
      'error' | 'warn' | 'info' | 100 | 200 | 300 | 400 | 500 | 'GET' | 'POST' | 'PUT' | 'DELETE'
    >()
  })

  it('union with overlapping literal and oneOf types', () => {
    const _schema = union([
      literal('test'),
      oneOf(['test', 'other'] as const),
      literal(42),
      oneOf([42, 100] as const),
    ] as const)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<
      'test' | 'other' | 42 | 100
    >()
  })
})

describe('unionSchema - edge cases', () => {
  it('union with empty string and zero', () => {
    const _schema = union([literal(''), literal(0), string(), number()] as const)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'' | 0 | string | number>()
  })

  it('union with negative numbers and special strings', () => {
    const _schema = union([
      literal(-1),
      literal(-3.14),
      literal('null'),
      literal('undefined'),
    ] as const)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<-1 | -3.14 | 'null' | 'undefined'>()
  })

  it('union through multiple optionality changes', () => {
    const _schema = union([string(), number()] as const)
      .optional()
      .nullable()
      .required()
      .nullish()
      .optional()
      .required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number>()
  })

  it('very large union type', () => {
    const _schema = union([
      string(),
      number(),
      boolean(),
      literal('a'),
      literal('b'),
      literal('c'),
      literal(1),
      literal(2),
      literal(3),
      oneOf(['x', 'y', 'z'] as const),
      oneOf([10, 20, 30] as const),
    ] as const).optional()

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<
      string | number | boolean | 'a' | 'b' | 'c' | 1 | 2 | 3 | 'x' | 'y' | 'z' | 10 | 20 | 30 | undefined
    >()
  })
})
