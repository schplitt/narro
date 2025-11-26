import type { SourceCheck, SourceCheckable } from '../../types/schema'
import { createErrorFactory } from '../../helpers/createErrorFactory'

const booleanSymbol = Symbol('boolean')

const checkBoolean: SourceCheck<boolean> = (value): value is boolean => typeof value === 'boolean'

export const booleanCheckable: SourceCheckable<boolean> = {
  '~id': booleanSymbol,
  '~c': checkBoolean,
  '~e': createErrorFactory('boolean'),
}

export default booleanCheckable
