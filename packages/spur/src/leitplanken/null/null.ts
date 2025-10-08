import type { SourceCheck, SourceCheckable } from '../../types/schema'

export const nullSymbol = Symbol('null')

const checkNull: SourceCheck<null> = value => value === null

export const nullCheckable: SourceCheckable<null> = {
  '~id': nullSymbol,
  '~c': checkNull,
}

export default nullCheckable
