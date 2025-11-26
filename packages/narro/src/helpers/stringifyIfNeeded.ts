import { typeOf } from './typeOf'

export function stringifyIfNeeded(value: unknown): string {
  const t = typeOf(value)
  const needsStringification = t === 'object' || t === 'array' || t === 'function' || t === 'symbol'
  if (needsStringification) {
    return JSON.stringify(value)
  }
  if (t === 'string') {
    return `"${value}"`
  }
  return String(value)
}

export function formatString(value: string): string {
  return `"${value}"`
}
