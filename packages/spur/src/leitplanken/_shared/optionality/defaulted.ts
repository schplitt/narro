import type { BranchCheckable, DefaultInput } from '../../../types/schema'

export const defaultedSymbol = Symbol('defaulted')

export function createDefaultedCheckable<TOutput>(d: DefaultInput<TOutput>): BranchCheckable<TOutput> {
  return {
    '~id': defaultedSymbol,
    '~c': (v) => {
      // If the value is undefined or null, use the default value
      // missing key is ALSO allowed
      // NO own logic for object needed!!
      const passed = v === undefined || v === null
      if (passed) {
        const data = typeof d === 'function' ? (d as () => TOutput)() : d
        return {
          success: true,
          data,
          metaData: {
            passedIds: new Set([defaultedSymbol]),
            score: 1,
          },
        }
      }

      return {
        success: false,
        metaData: {
          failedIds: new Set([defaultedSymbol]),
          score: 0,
        },
      }
    },
  }
}

export default createDefaultedCheckable
