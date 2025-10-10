import type { CommonOptions, DefaultCommonOptions, MakeDefaulted, MakeExactOptional, MakeNullable, MakeNullish, MakeOptional, MakeRequired, MakeUndefinable } from '../../options/options'
import type { BranchCheckableImport, BuildableSchema, CheckableImport, DefaultInput, EvaluableSchema } from '../../types/schema'
import type { InferInput, InferOutput } from '../../types/utils'

type InferArrayOutput<T extends BuildableSchema<unknown, unknown, CommonOptions>> = Array<InferOutput<T>>
type InferArrayInput<T extends BuildableSchema<unknown, unknown, CommonOptions>> = Array<InferInput<T>>

export interface ArraySchema<TSchema extends BuildableSchema<unknown, unknown, CommonOptions>, TOutput = InferArrayOutput<TSchema>, TInput = InferArrayInput<TSchema>, TCommonOptions extends CommonOptions = DefaultCommonOptions> extends BuildableSchema<TOutput, TInput, TCommonOptions> {
  minLength: (min: number) => ArraySchema<TSchema, TOutput, TInput, TCommonOptions>
  maxLength: (max: number) => ArraySchema<TSchema, TOutput, TInput, TCommonOptions>
  length: (length: number) => ArraySchema<TSchema, TOutput, TInput, TCommonOptions>

  default: (value: DefaultInput<InferArrayOutput<TSchema>>) => ArraySchema<TSchema, InferArrayOutput<TSchema>, InferArrayInput<TSchema> | undefined | null, MakeDefaulted<TCommonOptions>>
  optional: () => ArraySchema<TSchema, InferArrayOutput<TSchema> | undefined, InferArrayInput<TSchema> | undefined, MakeOptional<TCommonOptions>>
  exactOptional: () => ArraySchema<TSchema, InferArrayOutput<TSchema> | undefined, InferArrayInput<TSchema> | undefined, MakeExactOptional<TCommonOptions>>
  undefinable: () => ArraySchema<TSchema, InferArrayOutput<TSchema> | undefined, InferArrayInput<TSchema> | undefined, MakeUndefinable<TCommonOptions>>
  required: () => ArraySchema<TSchema, InferArrayOutput<TSchema>, InferArrayInput<TSchema>, MakeRequired<TCommonOptions>>
  nullable: () => ArraySchema<TSchema, InferArrayOutput<TSchema> | null, InferArrayInput<TSchema> | null, MakeNullable<TCommonOptions>>
  nullish: () => ArraySchema<TSchema, InferArrayOutput<TSchema> | undefined | null, InferArrayInput<TSchema> | undefined | null, MakeNullish<TCommonOptions>>

  transform: <TTransformOutput>(fn: (input: TOutput) => TTransformOutput) => BuildableSchema<TTransformOutput, TInput, TCommonOptions>
}

// NOTE: overload keeps default generics when schema is contextually typed inside
// object/array/union entries. Without it TS infers <unknown, unknown, CommonOptions>.
export function array<TSchema extends BuildableSchema<unknown, unknown, CommonOptions>>(_schema: TSchema): ArraySchema<TSchema, InferArrayOutput<TSchema>, InferArrayInput<TSchema>, DefaultCommonOptions>
export function array<TSchema extends BuildableSchema<unknown, unknown, CommonOptions>, TOutput, TInput, TCommonOptions extends CommonOptions>(_schema: TSchema): ArraySchema<TSchema, TOutput, TInput, TCommonOptions>
export function array<TSchema extends BuildableSchema<unknown, unknown, CommonOptions>, TOutput = InferArrayOutput<TSchema>, TInput = InferArrayInput<TSchema>, TCommonOptions extends CommonOptions = DefaultCommonOptions>(_schema: TSchema): ArraySchema<TSchema, TOutput, TInput, TCommonOptions> {
  const elementSchema = _schema

  // eslint-disable-next-line ts/explicit-function-return-type
  const sourceCheckableImport = () => import('./array').then(m => m.default)

  let optionalityBranchCheckableImport: BranchCheckableImport<any> | undefined

  const childCheckableImports: CheckableImport<any>[] = []

  const a: ArraySchema<TSchema, TOutput, TInput, TCommonOptions> = {
    minLength: (minLength) => {
      childCheckableImports.push(() => import('../_shared/minLength').then(m => m.default(minLength)))
      return a
    },

    maxLength: (maxLength) => {
      childCheckableImports.push(() => import('../_shared/maxLength').then(m => m.default(maxLength)))
      return a
    },

    length: (length) => {
      childCheckableImports.push(() => import('../_shared/length').then(m => m.default(length)))
      return a
    },

    default: (value) => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/defaulted').then(m => m.default(value))
      return a as any as ArraySchema<TSchema, InferArrayOutput<TSchema>, InferArrayInput<TSchema> | undefined | null, MakeDefaulted<TCommonOptions>>
    },

    optional: () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/optional').then(m => m.default)
      return a as any as ArraySchema<TSchema, InferArrayOutput<TSchema> | undefined, InferArrayInput<TSchema> | undefined, MakeOptional<TCommonOptions>>
    },

    exactOptional: () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/exactOptional').then(m => m.default)
      return a as any as ArraySchema<TSchema, InferArrayOutput<TSchema> | undefined, InferArrayInput<TSchema> | undefined, MakeExactOptional<TCommonOptions>>
    },

    undefinable: () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/undefinable').then(m => m.default)
      return a as any as ArraySchema<TSchema, InferArrayOutput<TSchema> | undefined, InferArrayInput<TSchema> | undefined, MakeUndefinable<TCommonOptions>>
    },

    required: () => {
      optionalityBranchCheckableImport = undefined
      return a as any as ArraySchema<TSchema, InferArrayOutput<TSchema>, InferArrayInput<TSchema>, MakeRequired<TCommonOptions>>
    },

    nullable: () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/nullable').then(m => m.default)
      return a as any as ArraySchema<TSchema, InferArrayOutput<TSchema> | null, InferArrayInput<TSchema> | null, MakeNullable<TCommonOptions>>
    },

    nullish: () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/nullish').then(m => m.default)
      return a as any as ArraySchema<TSchema, InferArrayOutput<TSchema> | undefined | null, InferArrayInput<TSchema> | undefined | null, MakeNullish<TCommonOptions>>
    },

    build: async () => {
      return import('../../build/arrayBuild').then(m => m.buildEvaluableArraySchema(
        sourceCheckableImport,
        optionalityBranchCheckableImport,
        childCheckableImports,
        elementSchema,
      ))
    },

    parse: async (input) => {
      const built = await a.build()
      return built.parse(input)
    },

    safeParse: async (input) => {
      const built = await a.build()
      return built.safeParse(input)
    },

    transform: <TTransformOutput>(fn: (input: TOutput) => TTransformOutput) => {
      const transformed: BuildableSchema<TTransformOutput, TInput, TCommonOptions> = {
        build: async () => {
          return import('../../build/arrayBuild').then(m => m.buildEvaluableArraySchemaWithTransform(
            sourceCheckableImport,
            optionalityBranchCheckableImport,
            childCheckableImports,
            elementSchema,
            fn,
          ))
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

  return a
}
