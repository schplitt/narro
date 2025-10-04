import type { SchemaReport } from '../../../types/report'
import type { BranchCheckable } from '../../../types/schema'

export const undefinableSymbol = Symbol('undefinable')

export const undefinableCheckable: BranchCheckable<undefined> = {
  '~id': undefinableSymbol,
  '~c': (v) => {
    // key MUST be there and value MUST be undefined
    // own logic needed for object!!
    const passed = v === undefined
    return {
      passed,
      value: undefined,
      score: passed ? 1 : 0,
    } as SchemaReport<undefined>
  },
}

export default undefinableCheckable
