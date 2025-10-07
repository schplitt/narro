import { safeParse as safeParseAsync, number as spurNumberAsync } from 'spur'
import { safeParse as safeParseSync, number as spurNumberInline } from 'spur/inline'
import { safeParse as safeParseInlined, number as spurNumberSync } from 'spur/sync'

import * as v from 'valibot'
import { bench, describe } from 'vitest'
import { z } from 'zod'

// Common data
const validNumber = 42
const invalidNumber = 142

const spurAsyncUnbuild = spurNumberAsync().min(0).max(100)

// Spur async schemas (with constraints)
const spurAsyncBuilt = await (spurNumberAsync().min(0).max(100))['~build']()

// Spur sync schemas (with constraints)
const spurSyncBuilt = spurNumberSync().min(0).max(100)['~build']()

// Spur inline schemas (with constraints)
const spurInlineBuilt = await spurNumberInline().min(0).max(100)['~build']()

// Zod schemas (with constraints)
const zValid = z.number().min(0).max(100)

// Valibot schemas (with constraints for fair comparison)
const vSchema = v.pipe(v.number(), v.minValue(0), v.maxValue(100))

describe('number: valid parse', () => {
  bench('spur unbuild async valid', () => {
    safeParseAsync(spurAsyncUnbuild, validNumber)
  })
  bench('spur async valid', () => {
    safeParseAsync(spurAsyncBuilt, validNumber)
  })
  bench('spur sync valid', () => {
    safeParseSync(spurSyncBuilt, validNumber)
  })
  bench('spur inline valid', () => {
    safeParseInlined(spurInlineBuilt, validNumber)
  })
  bench('zod valid', () => {
    zValid.safeParse(validNumber)
  })
  bench('valibot valid', () => {
    v.safeParse(vSchema, validNumber)
  })
})

describe('number: invalid parse', () => {
  bench('spur unbuild async invalid', () => {
    safeParseAsync(spurAsyncUnbuild, invalidNumber)
  })
  bench('spur async invalid', () => {
    safeParseAsync(spurAsyncBuilt, invalidNumber)
  })
  bench('spur sync invalid', () => {
    safeParseSync(spurSyncBuilt, invalidNumber)
  })
  bench('spur inline invalid', () => {
    safeParseInlined(spurInlineBuilt, invalidNumber)
  })
  bench('zod invalid', () => {
    zValid.safeParse(invalidNumber)
  })
  bench('valibot invalid', () => {
    v.safeParse(vSchema, invalidNumber)
  })
})
