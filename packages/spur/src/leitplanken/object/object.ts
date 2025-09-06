import type { Check } from '../../types/schema'

export const objectSymbol = Symbol('object')

export const checkObject: Check<object> = v => (typeof v === 'object' && v !== null && !Array.isArray(v))
