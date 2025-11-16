import type { SourceCheckable } from '../../types/schema'

export const objectSymbol = Symbol('object')

export const objectCheckable: SourceCheckable<object> = {
  '~id': objectSymbol,
  '~c': (v): v is object => typeof v === 'object' && v !== null && !Array.isArray(v),
}

export default objectCheckable
