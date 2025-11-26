import type { Checkable } from '../../types/schema'

export const maxSymbol = Symbol('max')

export function createMaxCheckable(max: number): Checkable<number> {
  return {
    '~id': maxSymbol,
    '~c': (v: number) => v <= max,
    '~e': (v: unknown) => `Expected number <= ${max} but received ${v}`,
  }
}

export default createMaxCheckable
