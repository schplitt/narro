import type { SchemaReport } from '../../../types/report'
import type { BranchCheckable } from '../../../types/schema'

export const nullableSymbol = Symbol('nullable')

export const nullableCheckable: BranchCheckable<null | undefined> = {
  '~id': nullableSymbol,
  '~c': (v) => {
    const passed = v === null || v === undefined
    return {
      passed,
      value: passed ? v : undefined,
      score: passed ? 1 : 0,
    } as SchemaReport<null | undefined>
  },
}

export default nullableCheckable
