import type { ErrorFactory } from '../../../types/helpers'
import type { BranchCheckable } from '../../../types/schema'
import { stringifyIfNeeded } from '../../../helpers/stringifyIfNeeded'

export const optionalSymbol = Symbol('optional')

export const optionalErrorFactory: ErrorFactory = value => `Expected property to be optional (missing or undefined) but received value ${stringifyIfNeeded(value)}`

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
        getErrorMessages: () => [optionalErrorFactory(v)],
      },
    }
  },
}

export default optionalCheckable
