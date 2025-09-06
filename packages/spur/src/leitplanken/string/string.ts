import type { Check } from '../../types/schema'

export const stringSymbol = Symbol('string')

export const checkString: Check<string> = v => typeof v === 'string'
