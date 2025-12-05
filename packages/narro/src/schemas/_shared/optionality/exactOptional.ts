import type { ErrorFactory } from '../../../types/helpers'
import type { BranchCheckable } from '../../../types/schema'
import { stringifyIfNeeded } from '../../../helpers/stringifyIfNeeded'

export const exactOptionalSymbol = Symbol('exactOptional')

export const exactOptionalErrorFactory: ErrorFactory = (value, info) => {
  return `Expected property to be exactly optional (i.e., either absent or undefined) but received value ${stringifyIfNeeded(value)}${info?.keyPresent ? ' with key present' : ''}`
}

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
        getErrorMessages: () => [exactOptionalErrorFactory(v)],
      },
    }
  },
}

export default exactOptionalCheckable
