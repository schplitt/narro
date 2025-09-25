import type { SchemaReport } from '../../../types/report'
import type { Checkable } from '../../../types/schema'

export const nullishSymbol = Symbol('nullish')

export function createNullishCheck(): Checkable<null | undefined, any> {
  return {
    '~id': nullishSymbol,
    '~c': (v) => {
      // Nullish allows the value to be null or undefined, so it always passes
      const passed = v === null || v === undefined
      return {
        passed,
        score: passed ? 1 : 0,
        maxScore: 1,
        value: passed ? v : undefined,
      } as SchemaReport<null | undefined>
    },
  }
}
