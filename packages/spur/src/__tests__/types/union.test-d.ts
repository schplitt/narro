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
    const _schema = union([string(), number()] )
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number>()
  })

  it('union of string, number, and boolean', () => {
    const _schema = union([string(), number(), boolean()] )
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number | boolean>()
  })

  it('union of literals', () => {
    const _schema = union([literal('hello'), literal(42), literal('world')] )
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'hello' | 42 | 'world'>()
  })

  it('union of oneOf schemas', () => {
    const _schema = union([
      oneOf(['red', 'green'] ),
      oneOf([1, 2, 3] ),
    ] )
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'red' | 'green' | 1 | 2 | 3>()
  })

  it('union of mixed schema types', () => {
    const _schema = union([
      string(),
      literal(42),
      oneOf(['active', 'inactive'] ),
      boolean(),
    ] )
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | 42 | 'active' | 'inactive' | boolean>()
  })

  it('single schema union', () => {
    const _schema = union([string()] )
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
  })
})

describe('unionSchema - with validation', () => {
  it('union of validated schemas', () => {
    const _schema = union([
      string().minLength(3),
      number().min(0).max(100),
    ] )
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number>()
  })

  it('union of schemas with defaults', () => {
    const _schema = union([
      string().default('hello'),
      number().default(42),
    ] )
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number>()
  })

  it('union of optional schemas', () => {
    const _schema = union([
      string().optional(),
      number().optional(),
    ] )
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined | number>()
  })

  it('union of nullable schemas', () => {
    const _schema = union([
      string().nullable(),
      boolean().nullable(),
    ] )
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | null | boolean>()
  })

  it('union of nullish schemas', () => {
    const _schema = union([
      literal('test').nullish(),
      literal(123).nullish(),
    ] )
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'test' | null | undefined | 123>()
  })
})

describe('unionSchema - optionality', () => {
  it('optional union schema', () => {
    const _schema = union([string(), number()] ).optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number | undefined>()
  })

  it('undefinable union schema', () => {
    const _schema = union([string(), number()] ).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number | undefined>()
  })

  it('nullable union schema', () => {
    const _schema = union([string(), boolean()] ).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | boolean | null>()
  })

  it('nullish union schema', () => {
    const _schema = union([literal('a'), literal(1)] ).nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'a' | 1 | null | undefined>()
  })

  it('required union schema (explicit)', () => {
    const _schema = union([string(), number()] ).required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number>()
  })
})

describe('unionSchema - chained operations', () => {
  it('union optional then required', () => {
    const _schema = union([string(), number()] ).optional().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number>()
  })

  it('union nullable then required', () => {
    const _schema = union([boolean(), literal('test')] ).nullable().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | 'test'>()
  })

  it('union nullish then required', () => {
    const _schema = union([oneOf(['x', 'y'] ), number()] ).nullish().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'x' | 'y' | number>()
  })

  it('union required then optional', () => {
    const _schema = union([string(), literal(42)] ).required().optional()
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
      oneOf(['red', 'green', 'blue'] ),
      oneOf([1, 2, 3] ),
    ] )
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
      oneOf(['a', 'b'] ).default('a'),
    ] )
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
    ] )
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<
      'a' | 'b' | 'c' | 'd' | 'e' | 1 | 2 | 3 | 4 | 5
    >()
  })

  it('union of complex oneOf schemas', () => {
    const _schema = union([
      oneOf(['error', 'warn', 'info'] ),
      oneOf([100, 200, 300, 400, 500] ),
      oneOf(['GET', 'POST', 'PUT', 'DELETE'] ),
    ] )
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<
      'error' | 'warn' | 'info' | 100 | 200 | 300 | 400 | 500 | 'GET' | 'POST' | 'PUT' | 'DELETE'
    >()
  })

  it('union with overlapping literal and oneOf types', () => {
    const _schema = union([
      literal('test'),
      oneOf(['test', 'other'] ),
      literal(42),
      oneOf([42, 100] ),
    ] )
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<
      'test' | 'other' | 42 | 100
    >()
  })
})

describe('unionSchema - edge cases', () => {
  it('union with empty string and zero', () => {
    const _schema = union([literal(''), literal(0), string(), number()] )
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'' | 0 | string | number>()
  })

  it('union with negative numbers and special strings', () => {
    const _schema = union([
      literal(-1),
      literal(-3.14),
      literal('null'),
      literal('undefined'),
    ] )
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<-1 | -3.14 | 'null' | 'undefined'>()
  })

  it('union through multiple optionality changes', () => {
    const _schema = union([string(), number()] )
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
      oneOf(['x', 'y', 'z'] ),
      oneOf([10, 20, 30] ),
    ] ).optional()

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<
      string | number | boolean | 'a' | 'b' | 'c' | 1 | 2 | 3 | 'x' | 'y' | 'z' | 10 | 20 | 30 | undefined
    >()
  })
})

describe('unionSchema - undefinable', () => {
  it('undefinable union schema', () => {
    const _schema = union([string(), number()] ).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number | undefined>()
  })

  it('undefinable union of literals', () => {
    const _schema = union([literal('hello'), literal(42)] ).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'hello' | 42 | undefined>()
  })

  it('undefinable union of mixed schemas', () => {
    const _schema = union([string(), literal(42), boolean()] ).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | 42 | boolean | undefined>()
  })

  it('union of undefinable schemas', () => {
    const _schema = union([string().undefinable(), number().undefinable()] )
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined | number>()
  })

  it('undefinable then required', () => {
    const _schema = union([string(), number()] ).undefinable().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number>()
  })

  it('undefinable then nullable', () => {
    const _schema = union([string(), boolean()] ).undefinable().nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | boolean | null>()
  })

  it('undefinable then nullish', () => {
    const _schema = union([literal('a'), literal(1)] ).undefinable().nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'a' | 1 | null | undefined>()
  })

  it('undefinable then optional (should stay undefinable)', () => {
    const _schema = union([string(), number()] ).undefinable().optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number | undefined>()
  })

  it('complex undefinable chaining', () => {
    const _schema = union([string(), number()] ).undefinable().required().nullable().undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number | undefined>()
  })

  it('undefinable with complex union types', () => {
    const _schema = union([
      string(),
      number(),
      boolean(),
      literal('exact'),
      oneOf(['red', 'green'] ),
    ] ).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<
      string | number | boolean | 'exact' | 'red' | 'green' | undefined
    >()
  })

  it('multiple undefinable calls', () => {
    const _schema = union([string(), number()] ).undefinable().undefinable().undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number | undefined>()
  })

  it('ultra complex undefinable scenario', () => {
    const _schema = union([
      string().undefinable(),
      number().nullable(),
      boolean().nullish(),
      literal('test').undefinable(),
      oneOf(['a', 'b']).default('a'),
    ]).undefinable()

    type Output = InferOutput<typeof _schema>

    expectTypeOf<Output>().toEqualTypeOf<
      string | undefined | number | null | boolean | null | undefined | 'test' | undefined | 'a' | 'b' | undefined
    >()
  })
})
