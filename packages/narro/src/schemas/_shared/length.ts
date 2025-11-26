import type { Checkable } from '../../types/schema'

export const lengthSymbol = Symbol('length')

export function createLengthCheckable<TInput extends string | any[]>(length: number): Checkable<TInput> {
  return {
    '~id': lengthSymbol,
    '~c': (v: TInput) => v.length === length,
    '~e': (v: unknown) => `Expected length ${length} but received length ${(v as string | any[]).length}`,
  }
}

export default createLengthCheckable
