import type { CommonOptions, DefaultCommonOptions, MakeDefaulted, MakeNullable, MakeNullish, MakeOptional, MakeRequired } from '../../types/common'
import type { BuildableSchema } from '../../types/schema'

type InferEnumType<T extends (string | number)[]> = T[number]

export interface OneOfSchema<TEnum extends (string | number)[], TOutput = InferEnumType<TEnum>, TInput = InferEnumType<TEnum>, TCommonOptions extends CommonOptions = DefaultCommonOptions> extends BuildableSchema<TOutput, TInput, TCommonOptions> {
  default: <TDefault extends InferEnumType<TEnum>>(v: TDefault) => OneOfSchema<TEnum, InferEnumType<TEnum>, InferEnumType<TEnum> | undefined, MakeDefaulted<TCommonOptions>>
  optional: () => OneOfSchema<TEnum, NonNullable<TOutput> | undefined, NonNullable<TInput> | undefined, MakeOptional<TCommonOptions>>
  required: () => OneOfSchema<TEnum, NonNullable<TOutput>, NonNullable<TInput>, MakeRequired<TCommonOptions>>
  nullable: () => OneOfSchema<TEnum, NonNullable<TOutput> | null, NonNullable<TInput> | null, MakeNullable<TCommonOptions>>
  nullish: () => OneOfSchema<TEnum, NonNullable<TOutput> | null | undefined, NonNullable<TInput> | null | undefined, MakeNullish<TCommonOptions>>
}

export function oneOf<TEnum extends (string | number)[]>(_values: TEnum): OneOfSchema<TEnum> {
  return 1 as any
}
