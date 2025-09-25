import type { SchemaReport } from '../../types/report'
import type { Check, Checkable, CheckableImport } from '../../types/schema'

export const lengthSymbol = Symbol('length')

export function createLengthCheck<TInput extends string | any[]>(length: number): Checkable<TInput> {
  return {
    '~id': lengthSymbol,
    '~c': (v: TInput) => {
      const passed = v.length === length
      return {
        passed,
        score: passed ? 1 : 0,
        maxScore: 1,
        value: passed ? v : undefined,
      } as SchemaReport<TInput>
    },
  }
}
