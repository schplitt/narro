import type { SourceCheck, SourceCheckable } from '../../types/schema'

const stringSymbol = Symbol('string')

const checkString: SourceCheck<string> = v => typeof v === 'string'

export const stringCheckable: SourceCheckable<string> = {
  '~id': stringSymbol,
  '~c': checkString,
}

export default stringCheckable
