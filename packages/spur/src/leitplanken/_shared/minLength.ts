import type { Checkable } from '../../types/schema'

export const minLengthSymbol = Symbol('minLength')

export function createMinLengthCheck<TInput extends string | any[]>(minLength: number): Checkable<TInput> {
  return {
    '~id': minLengthSymbol,
    'maxScore': 1,
    '~c': (v: TInput) => {
      const passed = v.length >= minLength
      return {
        passed,
        'score': passed ? 1 : 0,
        'maxScore': 1,
        '~id': minLengthSymbol,
      }
    },
  }
}
