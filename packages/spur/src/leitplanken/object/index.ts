import type { CommonOptions, DefaultCommonOptions, ExtractNullableSchema, ExtractNullishSchema, ExtractOptionalSchema, ExtractRequiredSchema, MakeNullable, MakeNullish, MakeOptional, MakeRequired } from '../../types/common'
import type { BuildableSchema } from '../../types/schema'
import type { ExtractOutputType } from '../../types/utils'

export type ObjectEntries = Record<string, BuildableSchema<unknown, unknown, CommonOptions>>

type InferObjectOutput<T extends ObjectEntries> = {
  [K in keyof T as T[K] extends ExtractRequiredSchema<T[K]> ? K : never]: ExtractOutputType<T[K]> & {}
} & {
  //                                                                                      ! "& {}" is used in favor of "NonNullable<...>" to preserve literal types
  [K in keyof T as T[K] extends ExtractOptionalSchema<T[K]> ? K : never]?: ExtractOutputType<T[K]> & {}
} & {
  [K in keyof T as T[K] extends ExtractNullableSchema<T[K]> ? K : never]: ExtractOutputType<T[K]> | null
} & {
  [K in keyof T as T[K] extends ExtractNullishSchema<T[K]> ? K : never]: ExtractOutputType<T[K]> | undefined | null
}

export interface ObjectSchema<TOutput = object, TInput = object, TCommonOptions extends CommonOptions = DefaultCommonOptions> extends BuildableSchema<TOutput, TInput, TCommonOptions> {
  optional: () => ObjectSchema<TOutput | undefined, TInput | undefined, MakeOptional<TCommonOptions>>
  required: () => ObjectSchema<NonNullable<TOutput>, NonNullable<TInput>, MakeRequired<TCommonOptions>>
  nullable: () => ObjectSchema<TOutput | null, TInput | null, MakeNullable<TCommonOptions>>
  nullish: () => ObjectSchema<TOutput | null | undefined, TInput | null | undefined, MakeNullish<TCommonOptions>>
}

export function object<TEntries extends ObjectEntries>(structure: TEntries): ObjectSchema<InferObjectOutput<TEntries>> {
  return 1 as any
}
