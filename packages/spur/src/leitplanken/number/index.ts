import type { CommonOptions, DefaultCommonOptions, MakeDefaulted, MakeNullable, MakeNullish, MakeOptional, MakeRequired, MakeUndefinable } from '../../types/options'
import type { BuildableSchema } from '../../types/schema'

// TODO: could have typesafe default with (number & {}) | <default>

export interface NumberSchema<TOutput = number, TInput = number, TCommonOptions extends CommonOptions = DefaultCommonOptions> extends BuildableSchema<TOutput, TInput, TCommonOptions> {
  min: (min: number) => NumberSchema<TOutput, TInput, TCommonOptions>
  max: (max: number) => NumberSchema<TOutput, TInput, TCommonOptions>

  default: <TDefault extends number>(v: TDefault) => NumberSchema<number, number | undefined, MakeDefaulted<TCommonOptions>>
  optional: () => NumberSchema<number | undefined, number | undefined, MakeOptional<TCommonOptions>>
  undefinable: () => NumberSchema<number | undefined, number | undefined, MakeUndefinable<TCommonOptions>>
  required: () => NumberSchema<number, number, MakeRequired<TCommonOptions>>
  nullable: () => NumberSchema<number | null, number | null, MakeNullable<TCommonOptions>>
  nullish: () => NumberSchema<number | undefined | null, number | undefined | null, MakeNullish<TCommonOptions>>
}

export function number(): NumberSchema {
  return 1 as any
}
