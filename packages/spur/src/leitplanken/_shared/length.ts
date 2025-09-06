import type { Check } from '../../types/schema'

export const lengthSymbol = Symbol('length')

export function buildLengthCheck(length: number): Check<string | any[]> {
  return (v: string | any[]) => v.length === length
}
