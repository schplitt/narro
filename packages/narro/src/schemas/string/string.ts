import type { SourceCheck, SourceCheckable } from '../../types/schema'
import { createErrorFactory } from '../../helpers/createErrorFactory'

const stringSymbol = Symbol('string')

const checkString: SourceCheck<string> = v => typeof v === 'string'

export const stringCheckable: SourceCheckable<string> = {
  '~id': stringSymbol,
  '~c': checkString,
  '~e': createErrorFactory('string'),
}

export default stringCheckable
