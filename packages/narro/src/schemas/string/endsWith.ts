import type { Checkable } from '../../types/schema'
import { formatString } from '../../helpers/stringifyIfNeeded'

export const endsWithSymbol = Symbol('endsWith')

export function createEndsWithCheckable(end: string): Checkable<string> {
  return {
    '~id': endsWithSymbol,
    '~c': (v: string) => v.endsWith(end),
    '~e': (v: unknown) => `Expected string ending with ${formatString(end)} but received ${formatString(v as string)}`,
  }
}

export default createEndsWithCheckable
