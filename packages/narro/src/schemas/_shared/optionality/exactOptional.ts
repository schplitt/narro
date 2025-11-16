import type { BranchCheckable } from '../../../types/schema'

export const exactOptionalSymbol = Symbol('exactOptional')

export const exactOptionalCheckable: BranchCheckable<undefined> = {
  // is the same as undefinable (unless for object properties which has its own logic)
  // own logic for object needed!!
  '~id': exactOptionalSymbol,
  '~c': (v) => {
    const passed = v === undefined
    if (passed) {
      return {
        success: true,
        data: undefined,
        metaData: {
          passedIds: new Set([exactOptionalSymbol]),
          score: 1,
        },
      }
    }

    return {
      success: false,
      metaData: {
        failedIds: new Set([exactOptionalSymbol]),
        score: 0,
      },
    }
  },
}

export default exactOptionalCheckable
