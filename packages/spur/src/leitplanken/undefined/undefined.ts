import type { SourceCheck, SourceCheckable } from '../../types/schema'

const undefinedSymbol = Symbol('undefined')

const checkUndefined: SourceCheck<undefined> = v => typeof v === 'undefined'

export function createUndefinedCheckable(): SourceCheckable<undefined> {
  return {
    '~id': undefinedSymbol,
    '~c': checkUndefined,
  }
}

export default createUndefinedCheckable
