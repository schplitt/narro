export type ValueTypes = 'string' | 'number' | 'boolean' | 'bigint' | 'symbol' | 'undefined' | 'object' | 'function' | 'null' | 'array'

export function typeOf(value: unknown): ValueTypes {
  if (value === null) {
    return 'null'
  }
  if (Array.isArray(value)) {
    return 'array'
  }
  return typeof value as ValueTypes
}
