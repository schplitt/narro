import type { CommonOptions, DefaultCommonOptions, MakeDefaulted, MakeExactOptional, MakeNullable, MakeNullish, MakeOptional, MakeRequired, MakeUndefinable } from '../../options/options'
import type { BuildableSchema, DefaultInput } from '../../types/schema'

type InferEnumType<T extends (string | number)[]> = T[number]

export interface EnumSchema<TEnum extends (string | number)[], TOutput = InferEnumType<TEnum>, TInput = InferEnumType<TEnum>, TCommonOptions extends CommonOptions = DefaultCommonOptions> extends BuildableSchema<TOutput, TInput, TCommonOptions> {
  default: (value: DefaultInput<TOutput>) => EnumSchema<TEnum, InferEnumType<TEnum>, InferEnumType<TEnum> | undefined | null, MakeDefaulted<TCommonOptions>>
  optional: () => EnumSchema<TEnum, InferEnumType<TEnum> | undefined, InferEnumType<TEnum> | undefined, MakeOptional<TCommonOptions>>
  exactOptional: () => EnumSchema<TEnum, InferEnumType<TEnum> | undefined, InferEnumType<TEnum> | undefined, MakeExactOptional<TCommonOptions>>
  undefinable: () => EnumSchema<TEnum, InferEnumType<TEnum> | undefined, InferEnumType<TEnum> | undefined, MakeUndefinable<TCommonOptions>>
  required: () => EnumSchema<TEnum, InferEnumType<TEnum>, InferEnumType<TEnum>, MakeRequired<TCommonOptions>>
  nullable: () => EnumSchema<TEnum, InferEnumType<TEnum> | null, InferEnumType<TEnum> | null, MakeNullable<TCommonOptions>>
  nullish: () => EnumSchema<TEnum, InferEnumType<TEnum> | undefined | null, InferEnumType<TEnum> | undefined | null, MakeNullish<TCommonOptions>>
}

function _enum<const TEnum extends (string | number)[]>(_values: TEnum): EnumSchema<TEnum> {
  return 1 as any
}

export { _enum as enum }
