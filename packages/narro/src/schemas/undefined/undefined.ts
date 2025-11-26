import type { SourceCheck, SourceCheckable } from '../../types/schema'

export const undefinedSymbol = Symbol('undefined')

const checkUndefined: SourceCheck<undefined> = value => typeof value === 'undefined'

export const undefinedCheckable: SourceCheckable<undefined> = {
  '~id': undefinedSymbol,
  '~c': checkUndefined,
}

export default undefinedCheckable
