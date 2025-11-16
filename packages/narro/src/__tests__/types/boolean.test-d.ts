import type { InferInput, InferOutput } from '../../types/utils'

import { describe, expectTypeOf, it } from 'vitest'

import { boolean } from '../../leitplanken/boolean'

describe('booleanSchema - basic types', () => {
  it('basic boolean schema', () => {
    const _schema = boolean()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean>()
  })

  it('optional boolean schema', () => {
    const _schema = boolean().optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | undefined>()
  })

  it('undefinable boolean schema', () => {
    const _schema = boolean().undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | undefined>()
  })

  it('nullable boolean schema', () => {
    const _schema = boolean().nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | null>()
  })

  it('nullish boolean schema', () => {
    const _schema = boolean().nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | undefined | null>()
  })

  it('required boolean schema (explicit)', () => {
    const _schema = boolean().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean>()
  })
})

describe('booleanSchema - with defaults', () => {
  it('boolean with default', () => {
    const _schema = boolean().default(false)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<boolean | undefined | null>()
  })

  it('boolean with default true', () => {
    const _schema = boolean().default(true)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<boolean | undefined | null>()
  })

  it('boolean with default then unset', () => {
    const _schema = boolean().default(false)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<boolean | undefined | null>()
  })

  it('optional boolean with default', () => {
    const _schema = boolean().optional().default(false)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<boolean | undefined | null>()
  })
})

describe('booleanSchema - chained operations', () => {
  it('optional boolean', () => {
    const _schema = boolean().optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | undefined>()
  })

  it('nullable boolean', () => {
    const _schema = boolean().nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | null>()
  })

  it('nullish boolean', () => {
    const _schema = boolean().nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | undefined | null>()
  })

  it('boolean with default and optionality', () => {
    const _schema = boolean().default(false)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean>()
  })

  it('boolean with default then undefinable', () => {
    const _schema = boolean().default(true).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | undefined>()
  })
})

describe('booleanSchema - complex chaining with defaults', () => {
  it('nullable boolean with default', () => {
    const _schema = boolean().nullable().default(true)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<boolean | undefined | null>()
  })

  it('nullish boolean with default', () => {
    const _schema = boolean().nullish().default(false)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<boolean | undefined | null>()
  })

  it('boolean with default then made optional', () => {
    const _schema = boolean().default(true).optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<boolean | undefined>()
  })

  it('boolean with default then made nullable', () => {
    const _schema = boolean().default(false).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | null>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<boolean | null>()
  })

  it('boolean with default then made nullish', () => {
    const _schema = boolean().default(true).nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | undefined | null>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<boolean | undefined | null>()
  })
})

describe('booleanSchema - default manipulation chains', () => {
  it('default then unset then optional', () => {
    const _schema = boolean().default(true).optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | undefined>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<boolean | undefined>()
  })

  it('default then unset then nullable', () => {
    const _schema = boolean().default(false).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | null>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<boolean | null>()
  })

  it('default then unset then nullish', () => {
    const _schema = boolean().default(true).nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | undefined | null>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<boolean | undefined | null>()
  })

  it('optional then default then required', () => {
    const _schema = boolean().optional().default(false).required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<boolean>()
  })

  it('nullable then default then required', () => {
    const _schema = boolean().nullable().default(true).required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean>()
    expectTypeOf<InferInput<typeof _schema>>().toEqualTypeOf<boolean>()
  })

  it('nullish then default then required', () => {
    const _schema = boolean().nullish().default(false).required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean>()
  })
})

describe('booleanSchema - complex state transitions', () => {
  it('required to optional to nullable to required', () => {
    const _schema = boolean().optional().nullable().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean>()
  })

  it('nullable to nullish to optional', () => {
    const _schema = boolean().nullable().nullish().optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | undefined>()
  })

  it('multiple defaults', () => {
    const _schema = boolean().default(true).default(false)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean>()
  })

  it('default, unset, default again', () => {
    const _schema = boolean().default(true).default(false)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean>()
  })

  it('ultra complex chain', () => {
    const _schema = boolean().optional().default(true).nullable().required().default(false).nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | undefined | null>()
  })
})

describe('booleanSchema - undefinable', () => {
  it('undefinable boolean schema', () => {
    const _schema = boolean().undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | undefined>()
  })

  it('undefinable boolean with default', () => {
    const _schema = boolean().undefinable().default(true)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean>()
  })

  it('boolean with default then undefinable', () => {
    const _schema = boolean().default(false).undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | undefined>()
  })

  it('undefinable then required', () => {
    const _schema = boolean().undefinable().required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean>()
  })

  it('undefinable then nullable', () => {
    const _schema = boolean().undefinable().nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | null>()
  })

  it('undefinable then nullish', () => {
    const _schema = boolean().undefinable().nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | undefined | null>()
  })

  it('undefinable then optional (should stay undefinable)', () => {
    const _schema = boolean().undefinable().optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | undefined>()
  })

  it('complex undefinable chaining', () => {
    const _schema = boolean().default(true).undefinable().required().nullable().undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | undefined>()
  })

  it('ultra complex undefinable chain', () => {
    const _schema = boolean().undefinable().default(true).nullable().required().default(false).nullish().undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | undefined>()
  })

  it('multiple undefinable calls', () => {
    const _schema = boolean().undefinable().undefinable().undefinable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | undefined>()
  })
})
