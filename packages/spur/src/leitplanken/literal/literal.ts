import type { SourceCheckable } from '../../types/schema'

export const literalSymbol = Symbol('literal')

export function createLiteralCheckable<TLiteral extends string | number | boolean>(value: TLiteral): SourceCheckable<TLiteral> {
  return {
    '~id': literalSymbol,
    '~c': (input: unknown): input is TLiteral => input === value,
  }
}

export default createLiteralCheckable
