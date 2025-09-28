import type { DefaultObjectOptions, MakeObjectPassthrough, MakeObjectStrict, MakeObjectStrip, ObjectOptions } from '../../options/objectOptions'
import type { CommonOptions, ExtractDefaultedSchema, ExtractExactOptionalSchema, ExtractOptionalSchema, InferOptionalityInputType, InferOptionalityOutputType, MakeDefaulted, MakeExactOptional, MakeNullable, MakeNullish, MakeOptional, MakeRequired, MakeUndefinable } from '../../options/options'
import type { BuildableSchema, DefaultInput } from '../../types/schema'
import type { InferInput, InferOutput, Prettify } from '../../types/utils'

export type ObjectEntries = Record<string, BuildableSchema<unknown, unknown, CommonOptions>>

type InferObjectOutput<T extends ObjectEntries> = {
  [K in keyof T as T[K] extends ExtractOptionalSchema<T[K]> | ExtractExactOptionalSchema<T[K]> ? never : K]: InferOutput<T[K]>
} & {
  [K in keyof T as T[K] extends ExtractOptionalSchema<T[K]> ? K : never]?: InferOutput<T[K]> | undefined
} & {
  //                                                                                      ! "& {}" is used in favor of "NonNullable<...>" to preserve literal types in type hints
  [K in keyof T as T[K] extends ExtractExactOptionalSchema<T[K]> ? K : never]?: InferOutput<T[K]> & {}
}

type InferObjectInput<T extends ObjectEntries> = {
  [K in keyof T as T[K] extends ExtractOptionalSchema<T[K]> | ExtractDefaultedSchema<T[K]> | ExtractExactOptionalSchema<T[K]> ? never : K]: InferInput<T[K]>
} & {
  [K in keyof T as T[K] extends ExtractOptionalSchema<T[K]> ? K : never]?: InferInput<T[K]> | undefined
} & {
  //                                                                                      ! "& {}" is used in favor of "NonNullable<...>" to preserve literal types
  [K in keyof T as T[K] extends ExtractExactOptionalSchema<T[K]> ? K : never]?: InferInput<T[K]> & {}
} & {
  // ! Defaulted is only in Input
  [K in keyof T as T[K] extends ExtractDefaultedSchema<T[K]> ? K : never]?: InferInput<T[K]> | undefined | null
}

export type InferShapeType<TOptions extends ObjectOptions> = TOptions extends { shape: infer TShape }
  // eslint-disable-next-line ts/no-empty-object-type
  ? (TShape extends 'passthrough' ? { [key: string]: any } : {}) : never

/**
 * Utility type to create an ObjectSchema with correct Inferred types based on entries and options
 */
export type CreateObjectSchema<TEntries extends ObjectEntries, TOptions extends ObjectOptions> = ObjectSchema<TEntries, InferObjectOutput<TEntries> & InferShapeType<TOptions> | InferOptionalityOutputType<TOptions>, InferObjectInput<TEntries> & InferShapeType<TOptions> | InferOptionalityInputType<TOptions>, TOptions>

export interface ObjectSchema<TEntries extends ObjectEntries, TOutput = InferObjectOutput<TEntries>, TInput = InferObjectInput<TEntries>, TOptions extends ObjectOptions = DefaultObjectOptions> extends BuildableSchema<TOutput, TInput, TOptions> {

  optional: () => CreateObjectSchema<TEntries, MakeOptional<TOptions>>
  exactOptional: () => CreateObjectSchema<TEntries, MakeExactOptional<TOptions>>
  undefinable: () => CreateObjectSchema<TEntries, MakeUndefinable<TOptions>>
  required: () => CreateObjectSchema<TEntries, MakeRequired<TOptions>>
  nullable: () => CreateObjectSchema<TEntries, MakeNullable<TOptions>>
  nullish: () => CreateObjectSchema<TEntries, MakeNullish<TOptions>>

  // TODO: default value should be dependent on Input not output
  default: (value: DefaultInput<TInput>) => CreateObjectSchema<TEntries, MakeDefaulted<TOptions>>

  strict: () => CreateObjectSchema<TEntries, MakeObjectStrict<TOptions>>
  strip: () => CreateObjectSchema<TEntries, MakeObjectStrip<TOptions>>
  passthrough: () => CreateObjectSchema<TEntries, MakeObjectPassthrough<TOptions>>

  transform: <TTransformOutput>(fn: (input: Prettify<TOutput>) => TTransformOutput) => BuildableSchema<TTransformOutput, TInput, TOptions>
}

export function object<TEntries extends ObjectEntries>(_structure: TEntries): ObjectSchema<TEntries> {
  return 1 as any
}
