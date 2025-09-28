import type { Checkable } from '../../types/schema'

export const endsWithSymbol = Symbol('endsWith')

export function createEndsWithCheckable(start: string): Checkable<string> {
  return {
    '~id': endsWithSymbol,
    '~c': (v: string) => v.endsWith(start),
  }
}

export default createEndsWithCheckable
