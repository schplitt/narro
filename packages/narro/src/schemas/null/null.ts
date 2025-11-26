import type { SourceCheck, SourceCheckable } from '../../types/schema'
import { createErrorFactory } from '../../helpers/createErrorFactory'

export const nullSymbol = Symbol('null')

const checkNull: SourceCheck<null> = value => value === null

export const nullCheckable: SourceCheckable<null> = {
  '~id': nullSymbol,
  '~c': checkNull,
  '~e': createErrorFactory('null'),
}

export default nullCheckable
