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

// NOTE: overload keeps default generics when schema is contextually typed inside
// object/array/union entries. Without it TS infers <unknown, unknown, CommonOptions>.
export function boolean(): BooleanSchema<boolean, boolean, DefaultCommonOptions>
export function boolean<TOutput, TInput, TCommonOptions extends CommonOptions>(): BooleanSchema<TOutput, TInput, TCommonOptions>
export function boolean<TOutput = boolean, TInput = boolean, TCommonOptions extends CommonOptions = DefaultCommonOptions>(): BooleanSchema<TOutput, TInput, TCommonOptions> {
  return 1 as any
}
