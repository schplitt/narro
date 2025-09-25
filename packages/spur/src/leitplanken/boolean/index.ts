import type { CommonOptions, DefaultCommonOptions, MakeDefaulted, MakeNullable, MakeNullish, MakeOptional, MakeRequired, MakeUndefinable } from '../../types/options'
import type { BuildableSchema } from '../../types/schema'

export interface BooleanSchema<TOutput = boolean, TInput = boolean, TCommonOptions extends CommonOptions = DefaultCommonOptions> extends BuildableSchema<TOutput, TInput, TCommonOptions> {

  default: (v: boolean) => BooleanSchema<boolean, boolean | undefined, MakeDefaulted<TCommonOptions>>
  optional: () => BooleanSchema<boolean | undefined, boolean | undefined, MakeOptional<TCommonOptions>>
  undefinable: () => BooleanSchema<boolean | undefined, boolean | undefined, MakeUndefinable<TCommonOptions>>
  required: () => BooleanSchema<boolean, boolean, MakeRequired<TCommonOptions>>
  nullable: () => BooleanSchema<boolean | null, boolean | null, MakeNullable<TCommonOptions>>
  nullish: () => BooleanSchema<boolean | undefined | null, boolean | undefined | null, MakeNullish<TCommonOptions>>
}

export function boolean(): BooleanSchema {
  return 1 as any
}
