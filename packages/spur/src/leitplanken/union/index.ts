import type { CommonOptions, DefaultCommonOptions, MakeDefaulted, MakeExactOptional, MakeNullable, MakeNullish, MakeOptional, MakeRequired, MakeUndefinable } from '../../options/options'
import type { BranchCheckableImport, BuildableSchema, DefaultInput } from '../../types/schema'
import type { InferInput, InferOutput } from '../../types/utils'

// TODO: primitives like string and number could be extended to have like "1" | "2" | (string & {}) as output to keep typehints

type InferUnionOutput<T extends readonly BuildableSchema<unknown, unknown, CommonOptions>[]> = InferOutput<T[number]>
type InferUnionInput<T extends readonly BuildableSchema<unknown, unknown, CommonOptions>[]> = InferInput<T[number]>

export interface UnionSchema<TSchemas extends readonly BuildableSchema<unknown, unknown, CommonOptions>[], TOutput = InferUnionOutput<TSchemas>, TInput = InferUnionInput<TSchemas>, TCommonOptions extends CommonOptions = DefaultCommonOptions> extends BuildableSchema<TOutput, TInput, TCommonOptions> {
  default: (value: DefaultInput<TOutput>) => UnionSchema<TSchemas, InferUnionOutput<TSchemas>, TInput | undefined | null, MakeDefaulted<TCommonOptions>>
  optional: () => UnionSchema<TSchemas, InferUnionOutput<TSchemas> | undefined, InferUnionInput<TSchemas> | undefined, MakeOptional<TCommonOptions>>
  exactOptional: () => UnionSchema<TSchemas, InferUnionOutput<TSchemas> | undefined, InferUnionInput<TSchemas> | undefined, MakeExactOptional<TCommonOptions>>
  undefinable: () => UnionSchema<TSchemas, InferUnionOutput<TSchemas> | undefined, InferUnionInput<TSchemas> | undefined, MakeUndefinable<TCommonOptions>>
  required: () => UnionSchema<TSchemas, InferUnionOutput<TSchemas>, InferUnionInput<TSchemas>, MakeRequired<TCommonOptions>>
  nullable: () => UnionSchema<TSchemas, InferUnionOutput<TSchemas> | null, InferUnionInput<TSchemas> | null, MakeNullable<TCommonOptions>>
  nullish: () => UnionSchema<TSchemas, InferUnionOutput<TSchemas> | undefined | null, InferUnionInput<TSchemas> | undefined | null, MakeNullish<TCommonOptions>>

  transform: <TTransformOutput>(fn: (input: TOutput) => TTransformOutput) => BuildableSchema<TTransformOutput, TInput, TCommonOptions>
}

// NOTE: overload keeps default generics when schema is contextually typed inside
// object/array/union entries. Without it TS infers <unknown, unknown, CommonOptions>.
export function union<TSchemas extends readonly BuildableSchema<unknown, unknown, CommonOptions>[]>(_schemas: TSchemas): UnionSchema<TSchemas, InferUnionOutput<TSchemas>, InferUnionInput<TSchemas>, DefaultCommonOptions>
export function union<TSchemas extends readonly BuildableSchema<unknown, unknown, CommonOptions>[], TOutput, TInput, TCommonOptions extends CommonOptions>(_schemas: TSchemas): UnionSchema<TSchemas, TOutput, TInput, TCommonOptions>
export function union<TSchemas extends readonly BuildableSchema<unknown, unknown, CommonOptions>[], TOutput = InferUnionOutput<TSchemas>, TInput = InferUnionInput<TSchemas>, TCommonOptions extends CommonOptions = DefaultCommonOptions>(_schemas: TSchemas): UnionSchema<TSchemas, TOutput, TInput, TCommonOptions> {
  if (_schemas.length === 0) {
    throw new Error('Union requires at least one schema')
  }

  const schemas = _schemas

  let optionalityBranchCheckableImport: BranchCheckableImport<any> | undefined

  const u: UnionSchema<TSchemas, TOutput, TInput, TCommonOptions> = {
    'default': (value) => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/defaulted').then(m => m.default(value))
      return u as any as UnionSchema<TSchemas, InferUnionOutput<TSchemas>, TInput | undefined | null, MakeDefaulted<TCommonOptions>>
    },

    'optional': () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/optional').then(m => m.default)
      return u as any as UnionSchema<TSchemas, InferUnionOutput<TSchemas> | undefined, InferUnionInput<TSchemas> | undefined, MakeOptional<TCommonOptions>>
    },

    'exactOptional': () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/exactOptional').then(m => m.default)
      return u as any as UnionSchema<TSchemas, InferUnionOutput<TSchemas> | undefined, InferUnionInput<TSchemas> | undefined, MakeExactOptional<TCommonOptions>>
    },

    'undefinable': () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/undefinable').then(m => m.default)
      return u as any as UnionSchema<TSchemas, InferUnionOutput<TSchemas> | undefined, InferUnionInput<TSchemas> | undefined, MakeUndefinable<TCommonOptions>>
    },

    'required': () => {
      optionalityBranchCheckableImport = undefined
      return u as any as UnionSchema<TSchemas, InferUnionOutput<TSchemas>, InferUnionInput<TSchemas>, MakeRequired<TCommonOptions>>
    },

    'nullable': () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/nullable').then(m => m.default)
      return u as any as UnionSchema<TSchemas, InferUnionOutput<TSchemas> | null, InferUnionInput<TSchemas> | null, MakeNullable<TCommonOptions>>
    },

    'nullish': () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/nullish').then(m => m.default)
      return u as any as UnionSchema<TSchemas, InferUnionOutput<TSchemas> | undefined | null, InferUnionInput<TSchemas> | undefined | null, MakeNullish<TCommonOptions>>
    },

    '~build': async () => {
      return import('../../build/unionBuild').then(m => m.buildEvaluableUnionSchema<TSchemas, TOutput>(
        schemas,
        optionalityBranchCheckableImport,
      ))
    },

    'transform': (fn) => {
      return {
        '~build': async () => {
          return import('../../build/unionBuild').then(m => m.buildEvaluableUnionSchemaWithTransform(
            schemas,
            optionalityBranchCheckableImport,
            fn as any,
          ))
        },
      }
    },
  }

  return u
}
