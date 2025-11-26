import type { Checkable } from '../../types/schema'

export const maxSymbol = Symbol('max')

export function createMaxCheckable(max: number): Checkable<number> {
  return {
    '~id': maxSymbol,
    '~c': (v: number) => v <= max,
  }
}

export default createMaxCheckable
