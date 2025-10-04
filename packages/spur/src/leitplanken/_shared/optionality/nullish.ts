import type { SchemaReport } from '../../../types/report'
import type { BranchCheckable } from '../../../types/schema'

export const nullishSymbol = Symbol('nullish')

export const nullishCheckable: BranchCheckable<null | undefined> = {
  '~id': nullishSymbol,
  '~c': (v) => {
    // key MUST be present here for an object
    // own logic for object needed!!
    const passed = v === null || v === undefined
    return {
      passed,
      value: passed ? v : undefined,
      score: passed ? 1 : 0,
    } as SchemaReport<null | undefined>
  },
}

export default nullishCheckable
