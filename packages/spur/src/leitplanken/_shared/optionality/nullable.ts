import type { SchemaReport } from '../../../types/report'
import type { BranchCheckable } from '../../../types/schema'

export const nullableSymbol = Symbol('nullable')

export const nullableCheckable: BranchCheckable<null> = {
  '~id': nullableSymbol,
  '~c': (v) => {
    // null can only be when the value was explicitly set to null
    // NO own logic for object needed!!
    const passed = v === null
    return {
      passed,
      value: passed ? v : undefined,
      score: passed ? 1 : 0,
    } as SchemaReport<null>
  },
}

export default nullableCheckable
