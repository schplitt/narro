import { safeParse as safeParseAsync, string as spurStringAsync } from 'spur'
import { safeParse as safeParseInlined, string as spurStringInline } from 'spur/inline'
import { safeParse as safeParseSync, string as spurStringSync } from 'spur/sync'

import { maxLength, minLength, pipe, safeParse as vSafeParse, string as vString } from 'valibot'
import { bench, describe } from 'vitest'
import { z } from 'zod'

// Data
const validString = 'hello'
const invalidString = 'a'

const spurAsyncUnbuild = spurStringAsync().minLength(3).maxLength(12)

// Async spur schemas (built once)
const spurAsyncBuilt = await spurStringAsync().minLength(3).maxLength(12)['~build']()

// Sync spur schemas
const spurSyncBuilt = await spurStringSync().minLength(3).maxLength(12)['~build']()

// Inline spur schemas
const spurInlineBuilt = await spurStringInline().minLength(3).maxLength(12)['~build']()

// Zod
const zValid = z.string().min(3).max(12)

// Valibot schema (with constraints for fair comparison)
const vSchema = pipe(vString(), minLength(3), maxLength(12))

describe('string: valid parse', () => {
  bench('spur unbuild async valid', () => {
    safeParseAsync(spurAsyncUnbuild, validString)
  })
  bench('spur async valid', () => {
    safeParseAsync(spurAsyncBuilt, validString)
  })
  bench('spur sync valid', () => {
    safeParseSync(spurSyncBuilt, validString)
  })
  bench('spur inline valid', () => {
    safeParseInlined(spurInlineBuilt, validString)
  })
  bench('zod valid', () => {
    zValid.safeParse(validString)
  })
  bench('valibot valid', () => {
    vSafeParse(vSchema, validString)
  })
})

describe('string: invalid parse', () => {
  bench('spur unbuild async invalid', () => {
    safeParseAsync(spurAsyncUnbuild, invalidString)
  })
  bench('spur async invalid', () => {
    safeParseAsync(spurAsyncBuilt, invalidString)
  })
  bench('spur sync invalid', () => {
    safeParseSync(spurSyncBuilt, invalidString)
  })
  bench('spur inline invalid', () => {
    safeParseInlined(spurInlineBuilt, invalidString)
  })
  bench('zod invalid', () => {
    zValid.safeParse(invalidString)
  })
  bench('valibot invalid', () => {
    vSafeParse(vSchema, invalidString)
  })
})
