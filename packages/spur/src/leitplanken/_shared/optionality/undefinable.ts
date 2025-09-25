import type { SchemaReport } from '../../../types/report'
import type { Checkable } from '../../../types/schema'

export const undefinableSymbol = Symbol('undefinable')

export function createUndefinableCheck(): Checkable<undefined, any> {
  return {
    '~id': undefinableSymbol,
    '~c': (v) => {
      // Undefinable allows the value to be undefined, so it always passes
      const passed = v === undefined
      return {
        passed,
        score: passed ? 1 : 0,
        maxScore: 1,
        value: undefined,
      } as SchemaReport<undefined>
    },
  }
}
