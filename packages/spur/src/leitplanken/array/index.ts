import type { CommonOptions, DefaultCommonOptions, MakeNullable, MakeNullish, MakeOptional, MakeRequired } from '../../types/common'
import type { BuildableSchema } from '../../types/schema'
import type { InferOutput } from '../../types/utils'

type InferArrayOutput<T extends BuildableSchema<unknown, unknown, CommonOptions>> = Array<InferOutput<T>>
type InferArrayInput<T extends BuildableSchema<unknown, unknown, CommonOptions>> = Array<InferOutput<T>>

export interface ArraySchema<TOutput = any, TInput = any, TCommonOptions extends CommonOptions = DefaultCommonOptions> extends BuildableSchema<TOutput, TInput, TCommonOptions> {
  minLength: (min: number) => ArraySchema<TOutput, TInput, TCommonOptions>
  maxLength: (max: number) => ArraySchema<TOutput, TInput, TCommonOptions>
  length: (length: number) => ArraySchema<TOutput, TInput, TCommonOptions>

  optional: () => ArraySchema<NonNullable<TOutput> | undefined, NonNullable<TInput> | undefined, MakeOptional<TCommonOptions>>
  required: () => ArraySchema<NonNullable<TOutput>, NonNullable<TInput>, MakeRequired<TCommonOptions>>
  nullable: () => ArraySchema<NonNullable<TOutput> | null, NonNullable<TInput> | null, MakeNullable<TCommonOptions>>
  nullish: () => ArraySchema<NonNullable<TOutput> | null | undefined, NonNullable<TInput> | null | undefined, MakeNullish<TCommonOptions>>
}

export function array<TSchema extends BuildableSchema<unknown, unknown, CommonOptions>>(schema: TSchema): ArraySchema<InferArrayOutput<TSchema>, InferArrayInput<TSchema>> {
  return 1 as any
}
