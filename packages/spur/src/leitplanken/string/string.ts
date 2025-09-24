import type { SourceCheck, SourceCheckable } from '../../types/schema'

const stringSymbol = Symbol('string')

const checkString: SourceCheck<string> = v => typeof v === 'string'

export function createStringCheckable(): SourceCheckable<string> {
  return {
    '~id': stringSymbol,
    '~c': checkString,
    'maxScore': 1,
  }
}

export default createStringCheckable
