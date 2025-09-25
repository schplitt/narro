import type { SourceCheck, SourceCheckable } from '../../types/schema'

const stringSymbol = Symbol('string')

const checkString: SourceCheck<string> = v => typeof v === 'string'

export function createStringCheckable(): SourceCheckable<string> {
  return {
    '~id': stringSymbol,
    '~c': checkString,
  }
}

export default createStringCheckable
