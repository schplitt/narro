import type { SourceCheckable } from '../../types/schema'
import { createErrorFactory } from '../../helpers/createErrorFactory'

export const objectSymbol = Symbol('object')

export const objectCheckable: SourceCheckable<object> = {
  '~id': objectSymbol,
  '~c': (v): v is object => typeof v === 'object' && v !== null && !Array.isArray(v),
  '~e': createErrorFactory('object'),
}

export default objectCheckable
