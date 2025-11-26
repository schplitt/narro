import type { SourceCheckable } from '../../types/schema'
import { createErrorFactory } from '../../helpers/createErrorFactory'

export const arraySymbol = Symbol('array')

export const arrayCheckable: SourceCheckable<unknown[]> = {
  '~id': arraySymbol,
  '~c': (value): value is unknown[] => Array.isArray(value),
  '~e': createErrorFactory('array'),
}

export default arrayCheckable
