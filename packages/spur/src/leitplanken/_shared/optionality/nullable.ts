import type { SchemaReport } from '../../../types/report'
import type { Checkable } from '../../../types/schema'

export const nullableSymbol = Symbol('nullable')

export function createNullableCheck(): Checkable<null, any> {
  return {
    '~id': nullableSymbol,
    '~c': (v) => {
      const passed = v === null
      return {
        passed,
        score: passed ? 1 : 0,
        maxScore: 1,
        value: passed ? v : undefined,
      } as SchemaReport<null>
    },
  }
}
