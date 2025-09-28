import type { Checkable } from '../types/schema'

export function deduplicateCheckables<TOutput>(checkables: Checkable<TOutput>[]): Checkable<TOutput>[] {
  const checkableMap = new Map<symbol, Checkable<TOutput>>()
  for (const checkable of checkables) {
    checkableMap.set(checkable['~id'], checkable)
  }
  return Array.from(checkableMap.values())
}
