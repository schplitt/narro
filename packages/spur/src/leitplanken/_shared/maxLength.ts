import type { SchemaReport } from '../../types/report'
import type { Checkable } from '../../types/schema'

export const maxLengthSymbol = Symbol('maxLength')

export function createMaxLengthCheck<TInput extends string | any[]>(maxLength: number): Checkable<TInput> {
  return {
    '~id': maxLengthSymbol,
    '~c': (v: TInput) => {
      const passed = v.length <= maxLength
      return {
        passed,
        score: passed ? 1 : 0,
        maxScore: 1,
        value: passed ? v : undefined,
      } as SchemaReport<TInput>
    },
  }
}
