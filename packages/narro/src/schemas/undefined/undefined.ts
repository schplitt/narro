import type { ErrorFactory } from '../../types/helpers'
import type { SourceCheck, SourceCheckable } from '../../types/schema'

export const undefinedSymbol = Symbol('undefined')

const checkUndefined: SourceCheck<undefined> = value => typeof value === 'undefined'

export const undefinedBranchErrorFactory: ErrorFactory = (_, info) => {
  if (info && !info.keyPresent) {
    return 'Expected property to be undefined with key present but key is missing'
  }
  return 'Expected property to be undefined with key present'
}

export const undefinedCheckable: SourceCheckable<undefined> = {
  '~id': undefinedSymbol,
  '~c': checkUndefined,
  '~e': undefinedBranchErrorFactory,
}

export default undefinedCheckable
