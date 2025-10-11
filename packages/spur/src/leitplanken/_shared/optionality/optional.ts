import type { BranchCheckable } from '../../../types/schema'

export const optionalSymbol = Symbol('optional')

export const optionalCheckable: BranchCheckable<undefined> = {
  '~id': optionalSymbol,
  '~c': (v) => {
    // key can be there and value undefined OR key can be missing
    // -> NO own logic needed for object!!
    const passed = v === undefined
    if (passed) {
      return {
        success: true,
        data: undefined,
        metaData: {
          passedIds: new Set([optionalSymbol]),
          score: 1,
        },
      }
    }

    return {
      success: false,
      metaData: {
        failedIds: new Set([optionalSymbol]),
        score: 0,
      },
    }
  },
}

export default optionalCheckable
