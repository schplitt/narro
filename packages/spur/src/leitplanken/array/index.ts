import type { CommonOptions, DefaultCommonOptions, MakeDefaulted, MakeExactOptional, MakeNullable, MakeNullish, MakeOptional, MakeRequired, MakeUndefinable } from '../../options/options'
import type { BuildableSchema, DefaultInput } from '../../types/schema'
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
  return 1 as any
}
