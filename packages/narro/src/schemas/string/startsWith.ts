import type { Checkable } from '../../types/schema'
import { formatString, stringifyIfNeeded } from '../../helpers/stringifyIfNeeded'

export const startsWithSymbol = Symbol('startsWith')

export function createStartsWithCheckable(start: string): Checkable<string> {
  return {
    '~id': startsWithSymbol,
    '~c': (v: string) => v.startsWith(start),
    '~e': (v: unknown) => `Expected string starting with ${formatString(start)} but received ${formatString(v as string)}`,
  }
}

export default createStartsWithCheckable
