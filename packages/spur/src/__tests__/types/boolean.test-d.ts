import type { InferOutput } from '../../types/utils'

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

  it('nullable boolean schema', () => {
    const _schema = boolean().nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | null>()
  })

  it('nullish boolean schema', () => {
    const _schema = boolean().nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | null | undefined>()
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
  })

  it('boolean with default true', () => {
    const _schema = boolean().default(true)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean>()
  })

  it('boolean with default then unset', () => {
    const _schema = boolean().default(false)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean>()
  })

  it('optional boolean with default', () => {
    const _schema = boolean().optional().default(false)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean>()
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
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | null | undefined>()
  })

  it('boolean with default and optionality', () => {
    const _schema = boolean().default(false)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean>()
  })
})

describe('booleanSchema - complex chaining with defaults', () => {
  it('nullable boolean with default', () => {
    const _schema = boolean().nullable().default(true)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean>()
  })

  it('nullish boolean with default', () => {
    const _schema = boolean().nullish().default(false)
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean>()
  })

  it('boolean with default then made optional', () => {
    const _schema = boolean().default(true).optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | undefined>()
  })

  it('boolean with default then made nullable', () => {
    const _schema = boolean().default(false).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | null>()
  })

  it('boolean with default then made nullish', () => {
    const _schema = boolean().default(true).nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | null | undefined>()
  })
})

describe('booleanSchema - default manipulation chains', () => {
  it('default then unset then optional', () => {
    const _schema = boolean().default(true).optional()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | undefined>()
  })

  it('default then unset then nullable', () => {
    const _schema = boolean().default(false).nullable()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | null>()
  })

  it('default then unset then nullish', () => {
    const _schema = boolean().default(true).nullish()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | null | undefined>()
  })

  it('optional then default then required', () => {
    const _schema = boolean().optional().default(false).required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean>()
  })

  it('nullable then default then required', () => {
    const _schema = boolean().nullable().default(true).required()
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean>()
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
    expectTypeOf<InferOutput<typeof _schema>>().toEqualTypeOf<boolean | null | undefined>()
  })
})
