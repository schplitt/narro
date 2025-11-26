import type { Checkable } from '../../types/schema'

export const minSymbol = Symbol('min')

export function createMinCheckable(min: number): Checkable<number> {
  return {
    '~id': minSymbol,
    '~c': (v: number) => v >= min,
  }
}

export default createMinCheckable
