import type { SourceCheck, SourceCheckable } from '../../types/schema'
import { createErrorFactory } from '../../helpers/createErrorFactory'

export const numberSymbol = Symbol('number')

const checkNumber: SourceCheck<number> = (v): v is number => typeof v === 'number'

export const numberCheckable: SourceCheckable<number> = {
  '~id': numberSymbol,
  '~c': checkNumber,
  '~e': createErrorFactory('number'),
}

export default numberCheckable
