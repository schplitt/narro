import type { SourceCheck, SourceCheckable } from '../../types/schema'

const booleanSymbol = Symbol('boolean')

const checkBoolean: SourceCheck<boolean> = (value): value is boolean => typeof value === 'boolean'

export const booleanCheckable: SourceCheckable<boolean> = {
  '~id': booleanSymbol,
  '~c': checkBoolean,
}

export default booleanCheckable
