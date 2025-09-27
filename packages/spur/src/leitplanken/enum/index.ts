import type { CommonOptions, DefaultCommonOptions, MakeDefaulted, MakeNullable, MakeNullish, MakeOptional, MakeRequired, MakeUndefinable } from '../../options/options'
import type { BuildableSchema } from '../../types/schema'

type InferEnumType<T extends (string | number)[]> = T[number]

export interface OneOfSchema<TEnum extends (string | number)[], TOutput = InferEnumType<TEnum>, TInput = InferEnumType<TEnum>, TCommonOptions extends CommonOptions = DefaultCommonOptions> extends BuildableSchema<TOutput, TInput, TCommonOptions> {
  default: <TDefault extends InferEnumType<TEnum>>(v: TDefault) => OneOfSchema<TEnum, InferEnumType<TEnum>, InferEnumType<TEnum> | undefined, MakeDefaulted<TCommonOptions>>
  optional: () => OneOfSchema<TEnum, InferEnumType<TEnum> | undefined, InferEnumType<TEnum> | undefined, MakeOptional<TCommonOptions>>
  undefinable: () => OneOfSchema<TEnum, InferEnumType<TEnum> | undefined, InferEnumType<TEnum> | undefined, MakeUndefinable<TCommonOptions>>
  required: () => OneOfSchema<TEnum, InferEnumType<TEnum>, InferEnumType<TEnum>, MakeRequired<TCommonOptions>>
  nullable: () => OneOfSchema<TEnum, InferEnumType<TEnum> | null, InferEnumType<TEnum> | null, MakeNullable<TCommonOptions>>
  nullish: () => OneOfSchema<TEnum, InferEnumType<TEnum> | null | undefined, InferEnumType<TEnum> | null | undefined, MakeNullish<TCommonOptions>>
}

export function oneOf<const TEnum extends (string | number)[]>(_values: TEnum): OneOfSchema<TEnum> {
  return 1 as any
}
