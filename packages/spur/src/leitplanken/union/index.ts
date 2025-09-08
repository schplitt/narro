import type { CommonOptions, DefaultCommonOptions, MakeNullable, MakeNullish, MakeOptional, MakeRequired } from '../../types/common'
import type { BuildableSchema } from '../../types/schema'
import type { ExtractInputType, ExtractOutputType } from '../../types/utils'

// TODO: primitives like string and number could be extended to have like "1" | "2" | (string & {}) as output to keep typehints

type InferUnionOutput<T extends readonly BuildableSchema<unknown, unknown, CommonOptions>[]> = ExtractOutputType<T[number]>
type InferUnionInput<T extends readonly BuildableSchema<unknown, unknown, CommonOptions>[]> = ExtractInputType<T[number]>

export interface UnionSchema<TSchemas extends readonly BuildableSchema<unknown, unknown, CommonOptions>[], TOutput = InferUnionOutput<TSchemas>, TInput = InferUnionInput<TSchemas>, TCommonOptions extends CommonOptions = DefaultCommonOptions> extends BuildableSchema<TOutput, TInput, TCommonOptions> {
  optional: () => UnionSchema<TSchemas, NonNullable<TOutput> | undefined, NonNullable<TInput> | undefined, MakeOptional<TCommonOptions>>
  required: () => UnionSchema<TSchemas, NonNullable<TOutput>, NonNullable<TInput>, MakeRequired<TCommonOptions>>
  nullable: () => UnionSchema<TSchemas, NonNullable<TOutput> | null, NonNullable<TInput> | null, MakeNullable<TCommonOptions>>
  nullish: () => UnionSchema<TSchemas, NonNullable<TOutput> | null | undefined, NonNullable<TInput> | null | undefined, MakeNullish<TCommonOptions>>
}

export function union<TSchemas extends readonly BuildableSchema<unknown, unknown, CommonOptions>[]>(_schemas: TSchemas): UnionSchema<TSchemas> {
  return 1 as any
}
