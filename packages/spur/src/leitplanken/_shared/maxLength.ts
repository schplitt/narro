import type { Check } from '../../types/schema'

export const maxLengthSymbol = Symbol('maxLength')

export function buildMaxLengthCheck(maxLength: number): Check<string | any[]> {
  return (v: string | any[]) => v.length <= maxLength
}
