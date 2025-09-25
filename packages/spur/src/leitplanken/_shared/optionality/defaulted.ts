import type { SchemaReport } from '../../../types/report'
import type { Checkable } from '../../../types/schema'

export const defaultedSymbol = Symbol('defaulted')

export function createDefaultedCheck<TInput, TDefault extends TInput>(defaultValue: TDefault): Checkable<TInput, TInput | undefined | null> {
  return {
    '~id': defaultedSymbol,
    '~c': (v) => {
      // If the value is undefined or null, use the default value
      const actualValue = v === undefined || v === null ? defaultValue : v
      return {
        passed: true,
        score: 1,
        maxScore: 1,
        value: actualValue,
      } as SchemaReport<TInput>
    },
  }
}
