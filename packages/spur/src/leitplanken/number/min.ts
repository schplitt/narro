import type { Check } from '../../types/schema'

export const minSymbol = Symbol('min')

export function buildMinCheck(min: number): Check<number> {
  return (v: number) => v >= min
}
