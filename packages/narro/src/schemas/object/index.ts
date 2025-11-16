import type { DefaultObjectOptions, MakeObjectPassthrough, MakeObjectStrict, MakeObjectStrip, ObjectOptions } from '../../options/objectOptions'
import type { ExtractDefaultedSchema, ExtractExactOptionalSchema, ExtractOptionalSchema, InferOptionalityInputType, InferOptionalityOutputType, MakeDefaulted, MakeExactOptional, MakeNullable, MakeNullish, MakeOptional, MakeRequired, MakeUndefinable } from '../../options/options'
import type { BranchCheckableImport, BuildableSchema, DefaultInput, EvaluableSchema } from '../../types/schema'
import type { InferInput, InferOutput, Prettify } from '../../types/utils'

export interface ObjectEntries {
  [key: string]: BuildableSchema<any, any, any>

}

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

  default: (value: DefaultInput<TInput>) => CreateObjectSchema<TEntries, MakeDefaulted<TOptions>>

  strict: () => CreateObjectSchema<TEntries, MakeObjectStrict<TOptions>>
  strip: () => CreateObjectSchema<TEntries, MakeObjectStrip<TOptions>>
  passthrough: () => CreateObjectSchema<TEntries, MakeObjectPassthrough<TOptions>>

  transform: <TTransformOutput>(fn: (input: Prettify<TOutput>) => TTransformOutput) => BuildableSchema<TTransformOutput, TInput, TOptions>
}

export function object<TEntries extends ObjectEntries>(entries: TEntries): CreateObjectSchema<TEntries, DefaultObjectOptions>
export function object<TEntries extends ObjectEntries, TOutput = InferObjectOutput<TEntries>, TInput = InferObjectInput<TEntries>, TOptions extends ObjectOptions = DefaultObjectOptions>(entries: TEntries): ObjectSchema<TEntries, TOutput, TInput, TOptions> {
  // eslint-disable-next-line ts/explicit-function-return-type
  const sourceCheckableImport = () => import('./object').then(m => m.default)

  let optionalityBranchCheckableImport: BranchCheckableImport<any> | undefined

  let shapeTransform: 'strip' | 'strict' | 'passthrough' = 'strip'

  const o: ObjectSchema<TEntries> = {
    default: (value) => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/defaulted').then(m => m.default(value))
      return o as any
    },

    optional: () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/optional').then(m => m.default)
      return o as any
    },

    exactOptional: () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/exactOptional').then(m => m.default)
      return o as any
    },

    undefinable: () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/undefinable').then(m => m.default)
      return o as any
    },

    required: () => {
      optionalityBranchCheckableImport = undefined
      return o as any
    },

    nullable: () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/nullable').then(m => m.default)
      return o as any
    },

    nullish: () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/nullish').then(m => m.default)
      return o as any
    },

    strict: () => {
      shapeTransform = 'strict'
      return o as any
    },

    strip: () => {
      shapeTransform = 'strip'
      return o as any
    },

    passthrough: () => {
      shapeTransform = 'passthrough'
      return o as any
    },

    build: async () => {
      return import('../../build/objectBuild').then(m => m.buildEvaluableObjectSchema(sourceCheckableImport, optionalityBranchCheckableImport, entries, shapeTransform))
    },

    parse: async (input) => {
      const built = await o.build()
      return built.parse(input)
    },

    safeParse: async (input) => {
      const built = await o.build()
      return built.safeParse(input)
    },

    // @ts-expect-error - TODO: Currently the types are not correct as TOutput can be different due to shape and optionality
    transform: <TTransformOutput>(fn: (input: Prettify<TOutput>) => TTransformOutput) => {
      const transformed: BuildableSchema<TTransformOutput, TInput, TOptions> = {
        build: async () => {
          return import('../../build/objectBuild').then(m => m.buildEvaluableObjectSchemaWithTransform(sourceCheckableImport, optionalityBranchCheckableImport, entries, shapeTransform, fn as any)) as Promise<EvaluableSchema<TTransformOutput>>
        },
        parse: async (input) => {
          const built = await transformed.build()
          return built.parse(input)
        },
        safeParse: async (input) => {
          const built = await transformed.build()
          return built.safeParse(input)
        },
      }

      return transformed
    },
  }
  // @ts-expect-error - TODO: Currently the types are not correct as TOutput can be different due to shape and optionality
  return o
}
