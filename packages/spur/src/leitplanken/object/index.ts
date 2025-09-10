import type { CommonOptions, DefaultCommonOptions, ExtractDefaultedSchema, ExtractNullableSchema, ExtractNullishSchema, ExtractOptionalSchema, ExtractRequiredSchema, ExtractUndefinableSchema, MakeNullable, MakeNullish, MakeOptional, MakeRequired, MakeUndefinable } from '../../types/common'
import type { BuildableSchema } from '../../types/schema'
import type { InferInput, InferOutput } from '../../types/utils'

export type ObjectEntries = Record<string, BuildableSchema<unknown, unknown, CommonOptions>>

// TODO: as the schemas should take care of their returntypes themselves, only the optional should be handled differently here as we need to make the property optional in the object and remove undefined from the type
type InferObjectOutput<T extends ObjectEntries> = {
  [K in keyof T as T[K] extends ExtractRequiredSchema<T[K]> ? K : never]: InferOutput<T[K]> & {}
} & {
  //                                                                                      ! "& {}" is used in favor of "NonNullable<...>" to preserve literal types
  [K in keyof T as T[K] extends ExtractOptionalSchema<T[K]> ? K : never]?: InferOutput<T[K]> & {}
} & {
  [K in keyof T as T[K] extends ExtractNullableSchema<T[K]> ? K : never]: InferOutput<T[K]> | null
} & {
  [K in keyof T as T[K] extends ExtractNullishSchema<T[K]> ? K : never]: InferOutput<T[K]> | undefined | null
} & {
  [K in keyof T as T[K] extends ExtractDefaultedSchema<T[K]> ? K : never]: InferOutput<T[K]> & {}
} & {
  [K in keyof T as T[K] extends ExtractUndefinableSchema<T[K]> ? K : never]: InferOutput<T[K]> | undefined
}

type InferObjectInput<T extends ObjectEntries> = {
  [K in keyof T]: InferInput<T[K]>
}

export interface ObjectSchema<TEntries extends ObjectEntries, TOutput = InferObjectOutput<TEntries>, TInput = InferObjectInput<TEntries>, TCommonOptions extends CommonOptions = DefaultCommonOptions> extends BuildableSchema<TOutput, TInput, TCommonOptions> {
  optional: () => ObjectSchema<TEntries, InferObjectOutput<TEntries> | undefined, InferObjectInput<TEntries> | undefined, MakeOptional<TCommonOptions>>
  undefinable: () => ObjectSchema<TEntries, InferObjectOutput<TEntries> | undefined, InferObjectInput<TEntries> | undefined, MakeUndefinable<TCommonOptions>>
  required: () => ObjectSchema<TEntries, InferObjectOutput<TEntries>, InferObjectInput<TEntries>, MakeRequired<TCommonOptions>>
  nullable: () => ObjectSchema<TEntries, InferObjectOutput<TEntries> | null, InferObjectInput<TEntries> | null, MakeNullable<TCommonOptions>>
  nullish: () => ObjectSchema<TEntries, InferObjectOutput<TEntries> | null | undefined, InferObjectInput<TEntries> | null | undefined, MakeNullish<TCommonOptions>>
}

export function object<TEntries extends ObjectEntries>(_structure: TEntries): ObjectSchema<TEntries> {
  return 1 as any
}
