import type { CommonOptions, DefaultCommonOptions, MakeNullable, MakeNullish, MakeOptional, MakeRequired } from '../../types/common'
import type { BuildableSchema } from '../../types/schema'
import type { ExtractOutputType } from '../../types/utils'

type InferArrayOutput<T extends BuildableSchema<unknown, unknown, CommonOptions>> = Array<ExtractOutputType<T>>
type InferArrayInput<T extends BuildableSchema<unknown, unknown, CommonOptions>> = Array<ExtractOutputType<T>>

export interface ArraySchema<TOutput = object, TInput = object, TCommonOptions extends CommonOptions = DefaultCommonOptions> extends BuildableSchema<TOutput, TInput, TCommonOptions> {
  minLength: (min: number) => ArraySchema<TOutput, TInput, TCommonOptions>
  maxLength: (max: number) => ArraySchema<TOutput, TInput, TCommonOptions>
  length: (length: number) => ArraySchema<TOutput, TInput, TCommonOptions>

  optional: () => ArraySchema<TOutput | undefined, TInput | undefined, MakeOptional<TCommonOptions>>
  required: () => ArraySchema<NonNullable<TOutput>, NonNullable<TInput>, MakeRequired<TCommonOptions>>
  nullable: () => ArraySchema<TOutput | null, TInput | null, MakeNullable<TCommonOptions>>
  nullish: () => ArraySchema<TOutput | null | undefined, TInput | null | undefined, MakeNullish<TCommonOptions>>
}

export function array<TSchema extends BuildableSchema<unknown, unknown, CommonOptions>>(schema: TSchema): ArraySchema<InferArrayOutput<TSchema>, InferArrayInput<TSchema>> {
  return 1 as any
}
