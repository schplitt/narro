import type { CommonOptions, DefaultCommonOptions, MakeDefaulted, MakeNullable, MakeNullish, MakeOptional, MakeRequired } from '../../types/common'
import type { BuildableSchema } from '../../types/schema'

export interface NumberSchema<TOutput = number, TInput = number, TCommonOptions extends CommonOptions = DefaultCommonOptions> extends BuildableSchema<TOutput, TInput, TCommonOptions> {
  min: (min: number) => NumberSchema<TOutput, TInput, TCommonOptions>
  max: (max: number) => NumberSchema<TOutput, TInput, TCommonOptions>

  default: <TDefault extends number>(v: TDefault) => NumberSchema<number, number | undefined, MakeDefaulted<TCommonOptions>>
  optional: () => NumberSchema<number | undefined, number | undefined, MakeOptional<TCommonOptions>>
  required: () => NumberSchema<number, number, MakeRequired<TCommonOptions>>
  nullable: () => NumberSchema<number | null, number | null, MakeNullable<TCommonOptions>>
  nullish: () => NumberSchema<number | undefined | null, number | undefined | null, MakeNullish<TCommonOptions>>
}

export function number(): NumberSchema {
  return 1 as any
}
