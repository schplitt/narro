import type { SourceCheckable } from '../../types/schema'
import { createErrorFactory } from '../../helpers/createErrorFactory'

export const literalSymbol = Symbol('literal')

export function createLiteralCheckable<TLiteral extends string | number | boolean>(value: TLiteral): SourceCheckable<TLiteral> {
  return {
    '~id': literalSymbol,
    '~c': (input: unknown): input is TLiteral => input === value,
    '~e': createErrorFactory({ value }),
  }
}

export default createLiteralCheckable
