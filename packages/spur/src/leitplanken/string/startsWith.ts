import type { Checkable } from '../../types/schema'

export const startsWithSymbol = Symbol('startsWith')

export function createStartsWithCheckable(start: string): Checkable<string> {
  return {
    '~id': startsWithSymbol,
    '~c': (v: string) => v.startsWith(start),
  }
}

export default createStartsWithCheckable
