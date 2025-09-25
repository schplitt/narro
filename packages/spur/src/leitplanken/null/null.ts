import type { SourceCheck, SourceCheckable } from '../../types/schema'

const nullSymbol = Symbol('null')

const checkNull: SourceCheck<null> = v => v === null

export function createNullCheckable(): SourceCheckable<null> {
  return {
    '~id': nullSymbol,
    '~c': checkNull,
  }
}

export default createNullCheckable
