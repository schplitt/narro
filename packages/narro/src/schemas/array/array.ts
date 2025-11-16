import type { SourceCheckable } from '../../types/schema'

export const arraySymbol = Symbol('array')

export const arrayCheckable: SourceCheckable<unknown[]> = {
  '~id': arraySymbol,
  '~c': (value): value is unknown[] => Array.isArray(value),
}

export default arrayCheckable
