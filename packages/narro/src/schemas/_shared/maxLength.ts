import type { Checkable } from '../../types/schema'

export const maxLengthSymbol = Symbol('maxLength')

export function createMaxLengthCheckable<TInput extends string | any[]>(maxLength: number): Checkable<TInput> {
  return {
    '~id': maxLengthSymbol,
    '~c': (v: TInput) => v.length <= maxLength,
    '~e': (v: unknown) => `Expected length <= ${maxLength} but received length ${(v as string | any[]).length}`,
  }
}

export default createMaxLengthCheckable
