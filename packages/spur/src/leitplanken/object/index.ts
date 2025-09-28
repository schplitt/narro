import type { DefaultObjectOptions, MakeObjectPassthrough, MakeObjectStrict, MakeObjectStrip, ObjectOptions } from '../../options/objectOptions'
import type { CommonOptions, ExtractOptionalSchema, InferOptionalityType, MakeDefaulted, MakeNullable, MakeNullish, MakeOptional, MakeRequired, MakeUndefinable } from '../../options/options'
import type { BuildableSchema } from '../../types/schema'
import type { InferInput, InferOutput } from '../../types/utils'

export type ObjectEntries = Record<string, BuildableSchema<unknown, unknown, CommonOptions>>

type InferObjectOutput<T extends ObjectEntries> = {
  [K in keyof T as T[K] extends ExtractOptionalSchema<T[K]> ? never : K]: InferOutput<T[K]>
} & {
  //                                                                                      ! "& {}" is used in favor of "NonNullable<...>" to preserve literal types
  [K in keyof T as T[K] extends ExtractOptionalSchema<T[K]> ? K : never]?: InferOutput<T[K]> & {}
}

type InferObjectInput<T extends ObjectEntries> = {
  [K in keyof T]: InferInput<T[K]>
}

// TODO: test alone and in combination with InferOptionalityType
export type InferShapeType<TOptions extends ObjectOptions> = TOptions extends { shape: infer TShape }
  // eslint-disable-next-line ts/no-empty-object-type
  ? (TShape extends 'passthrough' ? { [key: string]: any } : {}) : never

/**
 * Utility type to create an ObjectSchema with correct Inferred types based on entries and options
 */
export type CreateObjectSchema<TEntries extends ObjectEntries, TOptions extends ObjectOptions> = ObjectSchema<TEntries, InferObjectOutput<TEntries> & InferShapeType<TOptions> | InferOptionalityType<TOptions>, InferObjectInput<TEntries> & InferShapeType<TOptions> | InferOptionalityType<TOptions>, TOptions>

export interface ObjectSchema<TEntries extends ObjectEntries, TOutput = InferObjectOutput<TEntries>, TInput = InferObjectInput<TEntries>, TOptions extends ObjectOptions = DefaultObjectOptions> extends BuildableSchema<TOutput, TInput, TOptions> {

  optional: () => CreateObjectSchema<TEntries, MakeOptional<TOptions>>
  undefinable: () => CreateObjectSchema<TEntries, MakeUndefinable<TOptions>>
  required: () => CreateObjectSchema<TEntries, MakeRequired<TOptions>>
  nullable: () => CreateObjectSchema<TEntries, MakeNullable<TOptions>>
  nullish: () => CreateObjectSchema<TEntries, MakeNullish<TOptions>>
  default: (value: TOutput) => CreateObjectSchema<TEntries, MakeDefaulted<TOptions>>

  strict: () => CreateObjectSchema<TEntries, MakeObjectStrict<TOptions>>
  strip: () => CreateObjectSchema<TEntries, MakeObjectStrip<TOptions>>
  passthrough: () => CreateObjectSchema<TEntries, MakeObjectPassthrough<TOptions>>

}

export function object<TEntries extends ObjectEntries>(_structure: TEntries): ObjectSchema<TEntries> {
  return 1 as any
}
