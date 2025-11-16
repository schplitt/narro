import type { InferInput, InferOutput } from '../../types/utils'

import { describe, expectTypeOf, it } from 'vitest'

import { boolean } from '../../leitplanken/boolean'
import { enum_ } from '../../leitplanken/enum'
import { literal } from '../../leitplanken/literal'
import { number } from '../../leitplanken/number'
import { string } from '../../leitplanken/string'
import { union } from '../../leitplanken/union'

describe('unionSchema - basic types', () => {
  it('union of string and number', () => {
    const _schema = union([string(), number()])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number>()
  })

  it('union with a defaulted member (string default)', () => {
    const _schema = union([string().default('x'), number()])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string | number | undefined | null>()
  })

  it('union of string, number, and boolean', () => {
    const _schema = union([string(), number(), boolean()])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number | boolean>()
  })

  it('union of literals', () => {
    const _schema = union([literal('hello'), literal(42), literal('world')])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'hello' | 42 | 'world'>()
  })

  it('union of literals with a defaulted literal', () => {
    const _schema = union([literal('hello').default('hello'), literal(42), literal('world')])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'hello' | 42 | 'world'>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<'hello' | 42 | 'world' | undefined | null>()
  })

  it('union of enum schemas', () => {
    const _schema = union([
      enum_(['red', 'green']),
      enum_([1, 2, 3]),
    ])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'red' | 'green' | 1 | 2 | 3>()
  })

  it('union of mixed schema types', () => {
    const _schema = union([
      string(),
      literal(42),
      enum_(['active', 'inactive']),
      boolean(),
    ])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | 42 | 'active' | 'inactive' | boolean>()
  })

  it('single schema union', () => {
    const _schema = union([string()])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string>()
  })
})

describe('unionSchema - with validation', () => {
  it('union of validated schemas', () => {
    const _schema = union([
      string().minLength(3),
      number().min(0).max(100),
    ])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number>()
  })

  it('union of schemas with defaults', () => {
    const _schema = union([
      string().default('hello'),
      number().default(42),
    ])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<string | number | undefined | null>()
  })

  it('union of optional schemas', () => {
    const _schema = union([
      string().optional(),
      number().optional(),
    ])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined | number>()
  })

  it('union of nullable schemas', () => {
    const _schema = union([
      string().nullable(),
      boolean().nullable(),
    ])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | null | boolean>()
  })

  it('union of nullish schemas', () => {
    const _schema = union([
      literal('test').nullish(),
      literal(123).nullish(),
    ])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'test' | undefined | null | 123>()
  })
})

describe('unionSchema - optionality', () => {
  it('optional union schema', () => {
    const _schema = union([string(), number()]).optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number | undefined>()
  })

  it('undefinable union schema', () => {
    const _schema = union([string(), number()]).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number | undefined>()
  })

  it('nullable union schema', () => {
    const _schema = union([string(), boolean()]).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | boolean | null>()
  })

  it('nullish union schema', () => {
    const _schema = union([literal('a'), literal(1)]).nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'a' | 1 | undefined | null>()
  })

  it('required union schema (explicit)', () => {
    const _schema = union([string(), number()]).required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number>()
  })
})

describe('unionSchema - chained operations', () => {
  it('union optional then required', () => {
    const _schema = union([string(), number()]).optional().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number>()
  })

  it('union nullable then required', () => {
    const _schema = union([boolean(), literal('test')]).nullable().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | 'test'>()
  })

  it('union nullish then required', () => {
    const _schema = union([enum_(['x', 'y']), number()]).nullish().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'x' | 'y' | number>()
  })

  it('union required then optional', () => {
    const _schema = union([string(), literal(42)]).required().optional()
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
      enum_(['red', 'green', 'blue']),
      enum_([1, 2, 3]),
    ])
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
      enum_(['a', 'b']).default('a'),
    ])
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
    ])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<
      'a' | 'b' | 'c' | 'd' | 'e' | 1 | 2 | 3 | 4 | 5
    >()
  })

  it('union of complex enum schemas', () => {
    const _schema = union([
      enum_(['error', 'warn', 'info']),
      enum_([100, 200, 300, 400, 500]),
      enum_(['GET', 'POST', 'PUT', 'DELETE']),
    ])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<
      'error' | 'warn' | 'info' | 100 | 200 | 300 | 400 | 500 | 'GET' | 'POST' | 'PUT' | 'DELETE'
    >()
  })

  it('union with overlapping literal and enum types', () => {
    const _schema = union([
      literal('test'),
      enum_(['test', 'other']),
      literal(42),
      enum_([42, 100]),
    ])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<
      'test' | 'other' | 42 | 100
    >()
  })
})

describe('unionSchema - edge cases', () => {
  it('union with empty string and zero', () => {
    const _schema = union([literal(''), literal(0), string(), number()])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'' | 0 | string | number>()
  })

  it('union with negative numbers and special strings', () => {
    const _schema = union([
      literal(-1),
      literal(-3.14),
      literal('null'),
      literal('undefined'),
    ])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<-1 | -3.14 | 'null' | 'undefined'>()
  })

  it('union through multiple optionality changes', () => {
    const _schema = union([string(), number()])
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
      enum_(['x', 'y', 'z']),
      enum_([10, 20, 30]),
    ]).optional()

    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<
      string | number | boolean | 'a' | 'b' | 'c' | 1 | 2 | 3 | 'x' | 'y' | 'z' | 10 | 20 | 30 | undefined
    >()
  })
})

describe('unionSchema - undefinable', () => {
  it('undefinable union schema', () => {
    const _schema = union([string(), number()]).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number | undefined>()
  })

  it('undefinable union of literals', () => {
    const _schema = union([literal('hello'), literal(42)]).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'hello' | 42 | undefined>()
  })

  it('undefinable union of mixed schemas', () => {
    const _schema = union([string(), literal(42), boolean()]).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | 42 | boolean | undefined>()
  })

  it('union of undefinable schemas', () => {
    const _schema = union([string().undefinable(), number().undefinable()])
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | undefined | number>()
  })

  it('undefinable then required', () => {
    const _schema = union([string(), number()]).undefinable().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number>()
  })

  it('undefinable then nullable', () => {
    const _schema = union([string(), boolean()]).undefinable().nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | boolean | null>()
  })

  it('undefinable then nullish', () => {
    const _schema = union([literal('a'), literal(1)]).undefinable().nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<'a' | 1 | undefined | null>()
  })

  it('undefinable then optional (should stay undefinable)', () => {
    const _schema = union([string(), number()]).undefinable().optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number | undefined>()
  })

  it('complex undefinable chaining', () => {
    const _schema = union([string(), number()]).undefinable().required().nullable().undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number | undefined>()
  })

  it('undefinable with complex union types', () => {
    const _schema = union([
      string(),
      number(),
      boolean(),
      literal('exact'),
      enum_(['red', 'green']),
    ]).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<
      string | number | boolean | 'exact' | 'red' | 'green' | undefined
    >()
  })

  it('multiple undefinable calls', () => {
    const _schema = union([string(), number()]).undefinable().undefinable().undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<string | number | undefined>()
  })

  it('ultra complex undefinable scenario', () => {
    const _schema = union([
      string().undefinable(),
      number().nullable(),
      boolean().nullish(),
      literal('test').undefinable(),
      enum_(['a', 'b']).default('a'),
    ]).undefinable()

    type Output = InferOutput<typeof _schema>

    expectTypeOf<Output>().toEqualTypeOf<
      string | undefined | number | null | boolean | undefined | null | 'test' | undefined | 'a' | 'b' | undefined
    >()
  })
})

// ---------------------------------------------------------------------------
// TRANSFORM TESTS (union)
// ---------------------------------------------------------------------------
describe('unionSchema - transform: basic mapping', () => {
  it('map union to boolean discriminator', () => {
    const base = union([string(), number()])
    const _mapped = base.transform(v => typeof v === 'string')
    expectTypeOf<InferOutput<typeof _mapped>>().toEqualTypeOf<boolean>()
  })
  it('map union to narrowed literal union', () => {
    const base = union([literal('x'), literal('y'), number()])
    const _mapped = base.transform(v => (typeof v === 'number' ? 'num' as const : v))
    expectTypeOf<InferOutput<typeof _mapped>>().toEqualTypeOf<'x' | 'y' | 'num'>()
  })
  it('map union with defaulted member', () => {
    const base = union([string().default('a'), number()])
    const _mapped = base.transform(v => (typeof v === 'string' ? v.length : v))
    expectTypeOf<InferOutput<typeof _mapped>>().toEqualTypeOf<number>()
  })
})

describe('unionSchema - transform: optional / nullable roots', () => {
  it('optional union to primitive', () => {
    const base = union([string(), number()]).optional()
    const _mapped = base.transform(v => (v ? (typeof v === 'string' ? v.length : v) : 0))
    expectTypeOf<InferOutput<typeof _mapped>>().toEqualTypeOf<number>()
  })
  it('nullable union preserving null', () => {
    const base = union([boolean(), literal('t')]).nullable()
    const _mapped = base.transform(v => (v === null ? null : (typeof v === 'boolean' ? v : v === 't'))) // boolean | null
    expectTypeOf<InferOutput<typeof _mapped>>().toEqualTypeOf<boolean | null>()
  })
  it('nullish union broad mapping', () => {
    const base = union([enum_(['a', 'b']), number()]).nullish()
    const _mapped = base.transform(v => (v == null ? v : typeof v === 'number' ? v : (v.length as number)))
    expectTypeOf<InferOutput<typeof _mapped>>().toEqualTypeOf<number | undefined | null>()
  })
})

describe('unionSchema - transform: chained transforms', () => {
  it('single transform refine type (no chained transform support on mapped result)', () => {
    const base = union([string(), number()])
    const _mapped = base.transform(v => (typeof v === 'string' ? v.length : v))
    expectTypeOf<InferOutput<typeof _mapped>>().toEqualTypeOf<number>()
  })
  it('transform after optionality oscillation', () => {
    const base = union([string(), number()]).optional().nullable().required().nullish()
    const _mapped = base.transform(v => (v == null ? null : typeof v === 'string' ? v.toUpperCase() : v.toFixed(2)))
    expectTypeOf<InferOutput<typeof _mapped>>().toEqualTypeOf<string | null>()
  })
})

describe('unionSchema - transform: complex unions', () => {
  it('large literal union collapsed to number', () => {
    const base = union([
      literal('p'),
      literal('q'),
      literal('r'),
      literal('s'),
      literal('t'),
      number(),
    ])
    const _mapped = base.transform(v => typeof v === 'number' ? v : v.length)
    expectTypeOf<InferOutput<typeof _mapped>>().toEqualTypeOf<number>()
  })
})

describe('unionSchema - transform: defaulted root chain', () => {
  it('default then transform', () => {
    const base = union([string(), number()]).default(1)
    const _mapped = base.transform(v => (typeof v === 'string' ? v : v + 1))
    expectTypeOf<InferOutput<typeof _mapped>>().toEqualTypeOf<string | number>()
  })
  it('default + optional then transform preserves reintroduced undefined if explicit', () => {
    const base = union([string(), number()]).default(2).optional()
    const _mapped = base.transform(v => (v ? (typeof v === 'string' ? v.length : v) : undefined as number | undefined))
    expectTypeOf<InferOutput<typeof _mapped>>().toEqualTypeOf<number | undefined>()
  })
})
