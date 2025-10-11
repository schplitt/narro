import type { BranchCheckable } from '../../../types/schema'

export const nullableSymbol = Symbol('nullable')

export const nullableCheckable: BranchCheckable<null> = {
  '~id': nullableSymbol,
  '~c': (v) => {
    // null can only be when the value was explicitly set to null
    // NO own logic for object needed!!
    const passed = v === null
    if (passed) {
      return {
        success: true,
        data: null,
        metaData: {
          passedIds: new Set([nullableSymbol]),
          score: 1,
        },
      }
    }

    return {
      success: false,
      metaData: {
        failedIds: new Set([nullableSymbol]),
        score: 0,
      },
    }
  },
}

export default nullableCheckable
