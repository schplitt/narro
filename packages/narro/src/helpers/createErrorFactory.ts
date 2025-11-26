import type { ErrorFactory } from '../types/helpers'
import type { ValueTypes } from './typeOf'
import { stringifyIfNeeded } from './stringifyIfNeeded'
import { typeOf } from './typeOf'

export function createErrorFactory(expected: ValueTypes | {
  value: string | number | boolean | null | undefined | (string | number | boolean | null | undefined)[]
}): ErrorFactory {
  if (typeof expected === 'string') {
    return (value: unknown) => `Expected type ${expected} but received type ${typeOf(value)}`
  }
  if (Array.isArray(expected.value)) {
    return (value: unknown) => `Expected one of [${(expected.value as (string | number | boolean | null | undefined)[]).map(v => stringifyIfNeeded(v)).join(', ')}] but received ${stringifyIfNeeded(value)}`
  }
  return (value: unknown) => `Expected value ${stringifyIfNeeded(expected.value)} but received ${stringifyIfNeeded(value)}`
}
