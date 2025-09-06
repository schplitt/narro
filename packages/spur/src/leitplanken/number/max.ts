import type { Check } from '../../types/schema'

export const maxSymbol = Symbol('max')

export function buildMaxCheck(max: number): Check<number> {
  return (v: number) => v <= max
}
