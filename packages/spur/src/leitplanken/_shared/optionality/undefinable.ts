import type { BranchCheckable } from '../../../types/schema'

export const undefinableSymbol = Symbol('undefinable')

export const undefinableCheckable: BranchCheckable<undefined> = {
  '~id': undefinableSymbol,
  '~c': (v) => {
    // key MUST be there and value MUST be undefined
    // own logic needed for object!!
    const passed = v === undefined
    if (passed) {
      return {
        success: true,
        data: undefined,
        metaData: {
          passedIds: new Set([undefinableSymbol]),
          score: 1,
        },
      }
    }

    return {
      success: false,
      metaData: {
        failedIds: new Set([undefinableSymbol]),
        score: 0,
      },
    }
  },
}

export default undefinableCheckable
