import type { CommonOptions, DefaultCommonOptions, MakeNullable, MakeNullish, MakeOptional, MakeRequired, MakeUndefinable } from '../../options/options'
import type { BuildableSchema } from '../../types/schema'
import type { InferInput, InferOutput } from '../../types/utils'

// TODO: primitives like string and number could be extended to have like "1" | "2" | (string & {}) as output to keep typehints

type InferUnionOutput<T extends readonly BuildableSchema<unknown, unknown, CommonOptions>[]> = InferOutput<T[number]>
type InferUnionInput<T extends readonly BuildableSchema<unknown, unknown, CommonOptions>[]> = InferInput<T[number]>

export interface UnionSchema<TSchemas extends readonly BuildableSchema<unknown, unknown, CommonOptions>[], TOutput = InferUnionOutput<TSchemas>, TInput = InferUnionInput<TSchemas>, TCommonOptions extends CommonOptions = DefaultCommonOptions> extends BuildableSchema<TOutput, TInput, TCommonOptions> {
  optional: () => UnionSchema<TSchemas, InferUnionOutput<TSchemas> | undefined, InferUnionInput<TSchemas> | undefined, MakeOptional<TCommonOptions>>
  undefinable: () => UnionSchema<TSchemas, InferUnionOutput<TSchemas> | undefined, InferUnionInput<TSchemas> | undefined, MakeUndefinable<TCommonOptions>>
  required: () => UnionSchema<TSchemas, InferUnionOutput<TSchemas>, InferUnionInput<TSchemas>, MakeRequired<TCommonOptions>>
  nullable: () => UnionSchema<TSchemas, InferUnionOutput<TSchemas> | null, InferUnionInput<TSchemas> | null, MakeNullable<TCommonOptions>>
  nullish: () => UnionSchema<TSchemas, InferUnionOutput<TSchemas> | null | undefined, InferUnionInput<TSchemas> | null | undefined, MakeNullish<TCommonOptions>>
}

export function union<TSchemas extends readonly BuildableSchema<unknown, unknown, CommonOptions>[]>(_schemas: TSchemas): UnionSchema<TSchemas> {
  return 1 as any
}
