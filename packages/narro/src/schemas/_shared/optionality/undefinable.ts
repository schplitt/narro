import type { ErrorFactory } from '../../../types/helpers'
import type { BranchCheckable } from '../../../types/schema'
import { stringifyIfNeeded } from '../../../helpers/stringifyIfNeeded'

export const undefinableSymbol = Symbol('undefinable')

export const undefinableErrorFactory: ErrorFactory = (value, info) => {
  const keyInfo = info ? (info.keyPresent ? ' with key present' : ' with key missing') : ''
  return `Expected property to be undefinable (key present with value undefined) but received value ${stringifyIfNeeded(value)}${keyInfo}`
}

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
        getErrorMessages: () => [undefinableErrorFactory(v)],
      },
    }
  },
}

export default undefinableCheckable
