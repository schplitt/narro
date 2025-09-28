import type { CommonOptions, DefaultCommonOptions, MakeDefaulted, MakeExactOptional, MakeNullable, MakeNullish, MakeOptional, MakeRequired, MakeUndefinable } from '../../options/options'
import type { BuildableSchema, DefaultInput } from '../../types/schema'

// TODO: could have typesafe default with (number & {}) | <default>

export interface NumberSchema<TOutput = number, TInput = number, TCommonOptions extends CommonOptions = DefaultCommonOptions> extends BuildableSchema<TOutput, TInput, TCommonOptions> {
  min: (min: number) => NumberSchema<TOutput, TInput, TCommonOptions>
  max: (max: number) => NumberSchema<TOutput, TInput, TCommonOptions>

  default: (value: DefaultInput<TOutput>) => NumberSchema<number, number | undefined | null, MakeDefaulted<TCommonOptions>>
  optional: () => NumberSchema<number | undefined, number | undefined, MakeOptional<TCommonOptions>>
  exactOptional: () => NumberSchema<number | undefined, number | undefined, MakeExactOptional<TCommonOptions>>
  undefinable: () => NumberSchema<number | undefined, number | undefined, MakeUndefinable<TCommonOptions>>
  required: () => NumberSchema<number, number, MakeRequired<TCommonOptions>>
  nullable: () => NumberSchema<number | null, number | null, MakeNullable<TCommonOptions>>
  nullish: () => NumberSchema<number | undefined | null, number | undefined | null, MakeNullish<TCommonOptions>>
}

export function number(): NumberSchema {
  return 1 as any
}
