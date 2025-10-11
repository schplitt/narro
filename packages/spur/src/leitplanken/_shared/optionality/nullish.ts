import type { BranchCheckable } from '../../../types/schema'

export const nullishSymbol = Symbol('nullish')

export const nullishCheckable: BranchCheckable<null | undefined> = {
  '~id': nullishSymbol,
  '~c': (v) => {
    // key MUST be present here for an object
    // own logic for object needed!!
    const passed = v === null || v === undefined
    if (passed) {
      return {
        success: true,
        data: v as null | undefined,
        metaData: {
          passedIds: new Set([nullishSymbol]),
          score: 1,
        },
      }
    }

    return {
      success: false,
      metaData: {
        failedIds: new Set([nullishSymbol]),
        score: 0,
      },
    }
  },
}

export default nullishCheckable
