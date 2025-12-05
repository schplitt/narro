import type { ErrorFactory } from '../../../types/helpers'
import type { BranchCheckable } from '../../../types/schema'
import { stringifyIfNeeded } from '../../../helpers/stringifyIfNeeded'

export const nullishSymbol = Symbol('nullish')

export const nullishErrorFactory: ErrorFactory = (value, info) => {
  const keyInfo = info ? (info.keyPresent ? ' with key present' : ' with key missing') : ''
  return `Expected property to be nullish (key present with value null or undefined) but received value ${stringifyIfNeeded(value)}${keyInfo}`
}

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
        getErrorMessages: () => [nullishErrorFactory(v)],
      },
    }
  },
}

export default nullishCheckable
