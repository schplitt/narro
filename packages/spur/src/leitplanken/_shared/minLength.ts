import type { Check } from '../../types/schema'

export const minLengthSymbol = Symbol('minLength')

export function buildMinLengthCheck(minLength: number): Check<string | any[]> {
  return (v: string | any[]) => v.length >= minLength
}
