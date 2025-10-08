import type { Enum } from '.'
import type { SourceCheckable } from '../../types/schema'

export const enumSymbol = Symbol('enum')

export function createEnumCheckable<TEnum extends Enum>(values: TEnum): SourceCheckable<TEnum[number]> {
  return {
    '~id': enumSymbol,
    '~c': (input: unknown): input is TEnum[number] => values.includes(input as any),
  }
}

export default createEnumCheckable
