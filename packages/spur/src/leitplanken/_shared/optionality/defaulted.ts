import type { SchemaReport } from '../../../types/report'
import type { BranchCheckable, DefaultInput } from '../../../types/schema'

export const defaultedSymbol = Symbol('defaulted')

export function createDefaultedCheckable<TOutput>(d: DefaultInput<TOutput>): BranchCheckable<TOutput> {
  return {
    '~id': defaultedSymbol,
    '~c': (v) => {
      // If the value is undefined or null, use the default value
      const passed = v === undefined || v === null
      return {
        passed,
        value: passed ? typeof d === 'function' ? (d as () => TOutput)() : d : undefined,
        score: passed ? 1 : 0,
      } as SchemaReport<TOutput>
    },
  }
}

export default createDefaultedCheckable
