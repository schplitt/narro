import { string as spurStringAsync } from 'spur'
import { string as spurStringInline } from 'spur/inline'

import * as v from 'valibot'
import { bench, describe } from 'vitest'
import { z } from 'zod'

// Data
const validString = 'hello'
const invalidString = 'a'

const spurAsyncUnbuild = spurStringAsync().minLength(3).maxLength(12)

// Async spur schemas (built once)
const spurAsyncBuilt = await spurStringAsync().minLength(3).maxLength(12).build()

// Inline spur schemas
const spurInlineBuilt = await spurStringInline().minLength(3).maxLength(12).build()

// Zod
const zValid = z.string().min(3).max(12)

// Valibot schema (with constraints for fair comparison)
const vSchema = v.pipe(v.string(), v.minLength(3), v.maxLength(12))

describe('string: valid parse', () => {
  bench('spur unbuild async valid', () => {
    spurAsyncUnbuild.safeParse(validString)
  })
  bench('spur async valid', () => {
    spurAsyncBuilt.safeParse(validString)
  })
  bench('spur inline valid', () => {
    spurInlineBuilt.safeParse(validString)
  })
  bench('zod valid', () => {
    zValid.safeParse(validString)
  })
  bench('valibot valid', () => {
    v.safeParse(vSchema, validString)
  })
})

describe('string: invalid parse', () => {
  bench('spur unbuild async invalid', () => {
    spurAsyncUnbuild.safeParse(validString)
  })
  bench('spur async invalid', () => {
    spurAsyncBuilt.safeParse(validString)
  })
  bench('spur inline invalid', () => {
    spurInlineBuilt.safeParse(invalidString)
  })
  bench('zod invalid', () => {
    zValid.safeParse(invalidString)
  })
  bench('valibot invalid', () => {
    v.safeParse(vSchema, invalidString)
  })
})
