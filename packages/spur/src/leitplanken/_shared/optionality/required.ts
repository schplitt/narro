import type { SchemaReport } from '../../../types/report'
import type { Checkable } from '../../../types/schema'

export const requiredSymbol = Symbol('required')

export function createRequiredCheck<TInput>(): Checkable<TInput> {
  return {
    '~id': requiredSymbol,
    '~c': (v: any) => {
      // Required means the value cannot be null or undefined
      const passed = v !== null && v !== undefined
      return {
        passed,
        score: passed ? 1 : 0,
        maxScore: 1,
        value: passed ? v : undefined,
      } as SchemaReport<TInput>
    },
  }
}

// Required check is actually not necessary as this is taken care of by the "source" check itself
