import type { InferInput, InferOutput } from '../../types/utils'

import { describe, expectTypeOf, it } from 'vitest'

import { number } from '../../schemas/number'

describe('numberSchema - basic types', () => {
  it('basic number schema', () => {
    const _schema = number()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
  })

  it('optional number schema', () => {
    const _schema = number().optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | undefined>()
  })

  it('undefinable number schema', () => {
    const _schema = number().undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | undefined>()
  })

  it('nullable number schema', () => {
    const _schema = number().nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | null>()
  })

  it('nullish number schema', () => {
    const _schema = number().nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | undefined | null>()
  })

  it('required number schema (explicit)', () => {
    const _schema = number().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
  })
})

describe('numberSchema - with defaults', () => {
  it('number with default', () => {
    const _schema = number().default(42)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<number | undefined | null>()
  })

  it('number with default then unset', () => {
    const _schema = number().default(42)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<number | undefined | null>()
  })

  it('optional number with default', () => {
    const _schema = number().optional().default(42)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<number | undefined | null>()
  })

  it('number with lazy default function', () => {
    const _schema = number().default(() => 7)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<number | undefined | null>()
  })

  it('nullable then default removes null', () => {
    const _schema = number().nullable().default(1)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<number | undefined | null>()
  })

  it('nullish then default removes null & undefined', () => {
    const _schema = number().nullish().default(1)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<number | undefined | null>()
  })

  it('default then optional reintroduces undefined', () => {
    const _schema = number().default(1).optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | undefined>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<number | undefined>()
  })

  it('default then nullable reintroduces null', () => {
    const _schema = number().default(1).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | null>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<number | null>()
  })

  it('default then nullish reintroduces null | undefined', () => {
    const _schema = number().default(1).nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | undefined | null>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<number | undefined | null>()
  })
})

describe('numberSchema - with validation', () => {
  it('number with min', () => {
    const _schema = number().min(0)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
  })

  it('undefinable number with validation', () => {
    const _schema = number().min(0).max(100).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | undefined>()
  })

  it('number with max', () => {
    const _schema = number().max(100)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
  })

  it('number with min and max', () => {
    const _schema = number().min(0).max(100)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
  })
})

describe('numberSchema - chained operations', () => {
  it('optional number with validation', () => {
    const _schema = number().min(0).max(150).optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | undefined>()
  })

  it('nullable number with validation', () => {
    const _schema = number().min(0).max(150).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | null>()
  })

  it('nullish number with validation', () => {
    const _schema = number().min(0).max(150).nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | undefined | null>()
  })

  it('number with default and validation', () => {
    const _schema = number().min(0).max(150).default(18)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<number | undefined | null>()
  })

  it('complex chaining with default', () => {
    const _schema = number().min(0).max(150).default(18)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
  })
})

describe('numberSchema - complex chaining with defaults', () => {
  it('nullable number with default', () => {
    const _schema = number().nullable().default(42)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<number | undefined | null>()
  })

  it('nullish number with default', () => {
    const _schema = number().nullish().default(42)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<number | undefined | null>()
  })

  it('optional number with default and validation', () => {
    const _schema = number().optional().min(0).max(100).default(50)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<number | undefined | null>()
  })

  it('undefinable number with default and validation', () => {
    const _schema = number().undefinable().min(0).max(100).default(50)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<number | undefined | null>()
  })

  it('nullable number with default and validation', () => {
    const _schema = number().nullable().min(0).max(100).default(50)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<number | undefined | null>()
  })

  it('nullish number with default and validation', () => {
    const _schema = number().nullish().min(0).max(100).default(50)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<number | undefined | null>()
  })

  it('number with default then made optional', () => {
    const _schema = number().default(42).optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | undefined>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<number | undefined>()
  })

  it('number with default then made nullable', () => {
    const _schema = number().default(42).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | null>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<number | null>()
  })

  it('number with default then made nullish', () => {
    const _schema = number().default(42).nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | undefined | null>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<number | undefined | null>()
  })

  it('number with default then made undefinable', () => {
    const _schema = number().default(42).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | undefined>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<number | undefined>()
  })
})

describe('numberSchema - complex validation chains', () => {
  it('validation then optionality', () => {
    const _schema = number().min(-100).max(100).optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | undefined>()
  })

  it('validation then nullable', () => {
    const _schema = number().min(-100).max(100).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | null>()
  })

  it('validation then nullish', () => {
    const _schema = number().min(-100).max(100).nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | undefined | null>()
  })

  it('validation with default and optionality', () => {
    const _schema = number().min(-100).max(100).default(0).optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | undefined>()
  })

  it('validation with default and nullable', () => {
    const _schema = number().min(-100).max(100).default(0).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | null>()
  })

  it('validation with default and nullish', () => {
    const _schema = number().min(-100).max(100).default(0).nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | undefined | null>()
  })
})

describe('numberSchema - default manipulation chains', () => {
  it('default then unset then optional', () => {
    const _schema = number().default(42).optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | undefined>()
  })

  it('default then unset then nullable', () => {
    const _schema = number().default(42).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | null>()
  })

  it('default then unset then nullish', () => {
    const _schema = number().default(42).nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | undefined | null>()
  })

  it('optional then default then required', () => {
    const _schema = number().optional().default(42).required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
  })

  it('nullable then default then required', () => {
    const _schema = number().nullable().default(42).required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
  })

  it('nullish then default then required', () => {
    const _schema = number().nullish().default(42).required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
  })

  it('ultra complex chain', () => {
    const _schema = number().min(0).max(100).optional().default(50).min(10).max(90).nullable().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
  })
})

describe('numberSchema - undefinable', () => {
  it('undefinable number schema', () => {
    const _schema = number().undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | undefined>()
  })

  it('undefinable number with validation', () => {
    const _schema = number().min(0).max(100).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | undefined>()
  })

  it('undefinable number with default', () => {
    const _schema = number().undefinable().default(42)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
  })

  it('number with default then undefinable', () => {
    const _schema = number().default(42).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | undefined>()
  })

  it('undefinable then required', () => {
    const _schema = number().undefinable().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
  })

  it('undefinable then nullable', () => {
    const _schema = number().undefinable().nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | null>()
  })

  it('undefinable then nullish', () => {
    const _schema = number().undefinable().nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | undefined | null>()
  })

  it('undefinable with all validation methods', () => {
    const _schema = number().min(-100).max(100).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | undefined>()
  })

  it('undefinable with default and validation', () => {
    const _schema = number().undefinable().min(0).max(100).default(50)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number>()
  })

  it('undefinable then optional (should stay undefinable)', () => {
    const _schema = number().undefinable().optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | undefined>()
  })

  it('complex undefinable chaining', () => {
    const _schema = number().min(0).undefinable().max(100).default(50).required().undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | undefined>()
  })

  it('ultra complex undefinable chain', () => {
    const _schema = number().min(0).max(100).undefinable().default(50).min(10).max(90).nullable().required().undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<number | undefined>()
  })
})
