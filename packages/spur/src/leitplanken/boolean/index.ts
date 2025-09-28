import type { CommonOptions, DefaultCommonOptions, MakeDefaulted, MakeExactOptional, MakeNullable, MakeNullish, MakeOptional, MakeRequired, MakeUndefinable } from '../../options/options'
import type { BuildableSchema, DefaultInput } from '../../types/schema'

export interface BooleanSchema<TOutput = boolean, TInput = boolean, TCommonOptions extends CommonOptions = DefaultCommonOptions> extends BuildableSchema<TOutput, TInput, TCommonOptions> {

  default: (value: DefaultInput<TOutput>) => BooleanSchema<boolean, boolean | undefined | null, MakeDefaulted<TCommonOptions>>
  optional: () => BooleanSchema<boolean | undefined, boolean | undefined, MakeOptional<TCommonOptions>>
  exactOptional: () => BooleanSchema<boolean | undefined, boolean | undefined, MakeExactOptional<TCommonOptions>>
  undefinable: () => BooleanSchema<boolean | undefined, boolean | undefined, MakeUndefinable<TCommonOptions>>
  required: () => BooleanSchema<boolean, boolean, MakeRequired<TCommonOptions>>
  nullable: () => BooleanSchema<boolean | null, boolean | null, MakeNullable<TCommonOptions>>
  nullish: () => BooleanSchema<boolean | undefined | null, boolean | undefined | null, MakeNullish<TCommonOptions>>
}

export function boolean(): BooleanSchema {
  return 1 as any
}
