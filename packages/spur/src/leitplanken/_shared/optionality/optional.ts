import type { Checkable } from '../../../types/schema'
import { createUndefinableCheck } from './undefinable'

export const optionalSymbol = Symbol('optional')

export function createOptionalCheck(): Checkable<undefined, any> {
  // is the same as undefinable (unless for object properties which has its own logic)
  return createUndefinableCheck()
}
