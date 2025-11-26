import type { SourceCheck, SourceCheckable } from '../../types/schema'
import { createErrorFactory } from '../../helpers/createErrorFactory'

export const undefinedSymbol = Symbol('undefined')

const checkUndefined: SourceCheck<undefined> = value => typeof value === 'undefined'

export const undefinedCheckable: SourceCheckable<undefined> = {
  '~id': undefinedSymbol,
  '~c': checkUndefined,
  '~e': createErrorFactory('undefined'),
}

export default undefinedCheckable
