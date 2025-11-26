import type { Checkable } from '../../types/schema'

export const minLengthSymbol = Symbol('minLength')

export function createMinLengthCheckable<TInput extends string | any[]>(minLength: number): Checkable<TInput> {
  return {
    '~id': minLengthSymbol,
    '~c': (v: TInput) => v.length >= minLength,
    '~e': (v: unknown) => `Expected length >= ${minLength} but received length ${(v as string | any[]).length}`,
  }
}

export default createMinLengthCheckable
