import type { Checkable } from '../../types/schema'

export const maxLengthSymbol = Symbol('maxLength')

export function createMaxLengthCheckable<TInput extends string | any[]>(maxLength: number): Checkable<TInput> {
  return {
    '~id': maxLengthSymbol,
    '~c': (v: TInput) => v.length <= maxLength,
  }
}

export default createMaxLengthCheckable
