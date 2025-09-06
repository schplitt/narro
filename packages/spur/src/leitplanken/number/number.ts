import type { Check } from '../../types/schema'

export const numberSymbol = Symbol('number')

export const checkNumber: Check<number> = v => typeof v === 'number'
