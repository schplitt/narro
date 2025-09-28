import type { SourceCheck, SourceCheckable } from '../../types/schema'

export const numberSymbol = Symbol('number')

const checkNumber: SourceCheck<number> = (v): v is number => typeof v === 'number'

export const numberCheckable: SourceCheckable<number> = {
  '~id': numberSymbol,
  '~c': checkNumber,
}

export default numberCheckable
