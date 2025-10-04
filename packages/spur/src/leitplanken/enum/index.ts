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

// NOTE: overload keeps default generics when schema is contextually typed inside
// object/array/union entries. Without it TS infers <unknown, unknown, CommonOptions>.
export function enum_<const TEnum extends (string | number)[]>(_values: TEnum): EnumSchema<TEnum, InferEnumType<TEnum>, InferEnumType<TEnum>, DefaultCommonOptions>
export function enum_<const TEnum extends (string | number)[], TOutput, TInput, TCommonOptions extends CommonOptions>(_values: TEnum): EnumSchema<TEnum, TOutput, TInput, TCommonOptions>
export function enum_<const TEnum extends (string | number)[], TOutput = InferEnumType<TEnum>, TInput = InferEnumType<TEnum>, TCommonOptions extends CommonOptions = DefaultCommonOptions>(_values: TEnum): EnumSchema<TEnum, TOutput, TInput, TCommonOptions> {
  return 1 as any
}

export { enum_ as enum }
