import type { CommonOptions, DefaultCommonOptions, MakeDefaulted, MakeExactOptional, MakeNullable, MakeNullish, MakeOptional, MakeRequired, MakeUndefinable } from '../../options/options'
import type { BranchCheckableImport, BuildableSchema, DefaultInput, EvaluableSchema, SourceCheckableImport } from '../../types/schema'

export interface BooleanSchema<TOutput = boolean, TInput = boolean, TCommonOptions extends CommonOptions = DefaultCommonOptions> extends BuildableSchema<TOutput, TInput, TCommonOptions> {

  default: (value: DefaultInput<TOutput>) => BooleanSchema<boolean, boolean | undefined | null, MakeDefaulted<TCommonOptions>>
  optional: () => BooleanSchema<boolean | undefined, boolean | undefined, MakeOptional<TCommonOptions>>
  exactOptional: () => BooleanSchema<boolean | undefined, boolean | undefined, MakeExactOptional<TCommonOptions>>
  undefinable: () => BooleanSchema<boolean | undefined, boolean | undefined, MakeUndefinable<TCommonOptions>>
  required: () => BooleanSchema<boolean, boolean, MakeRequired<TCommonOptions>>
  nullable: () => BooleanSchema<boolean | null, boolean | null, MakeNullable<TCommonOptions>>
  nullish: () => BooleanSchema<boolean | undefined | null, boolean | undefined | null, MakeNullish<TCommonOptions>>
}

// NOTE: overload keeps default generics when schema is contextually typed inside
// object/array/union entries. Without it TS infers <unknown, unknown, CommonOptions>.
export function boolean(): BooleanSchema<boolean, boolean, DefaultCommonOptions>
export function boolean<TOutput, TInput, TCommonOptions extends CommonOptions>(): BooleanSchema<TOutput, TInput, TCommonOptions>
export function boolean<TOutput = boolean, TInput = boolean, TCommonOptions extends CommonOptions = DefaultCommonOptions>(): BooleanSchema<TOutput, TInput, TCommonOptions> {
  let optionalityBranchCheckableImport: BranchCheckableImport<any> | undefined

  const sourceCheckableImport: SourceCheckableImport<boolean> = () => import('./boolean').then(m => m.booleanCheckable)

  const b: BooleanSchema<TOutput, TInput, TCommonOptions> = {

    'default': (value) => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/defaulted').then(m => m.default(value))
      return b as any as BooleanSchema<boolean, boolean | undefined | null, MakeDefaulted<TCommonOptions>>
    },

    'optional': () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/optional').then(m => m.default)
      return b as any as BooleanSchema<boolean | undefined, boolean | undefined, MakeOptional<TCommonOptions>>
    },

    'exactOptional': () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/exactOptional').then(m => m.default)
      return b as any as BooleanSchema<boolean | undefined, boolean | undefined, MakeExactOptional<TCommonOptions>>
    },

    'undefinable': () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/undefinable').then(m => m.default)
      return b as any as BooleanSchema<boolean | undefined, boolean | undefined, MakeUndefinable<TCommonOptions>>
    },

    'required': () => {
      optionalityBranchCheckableImport = undefined
      return b as any as BooleanSchema<boolean, boolean, MakeRequired<TCommonOptions>>
    },

    'nullable': () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/nullable').then(m => m.default)
      return b as any as BooleanSchema<boolean | null, boolean | null, MakeNullable<TCommonOptions>>
    },

    'nullish': () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/nullish').then(m => m.default)
      return b as any as BooleanSchema<boolean | undefined | null, boolean | undefined | null, MakeNullish<TCommonOptions>>
    },

    '~build': () => {
      return import('../../build/build').then(({ buildEvaluableSchema }) => {
        return buildEvaluableSchema(
          sourceCheckableImport,
          optionalityBranchCheckableImport,
          [],
        ) as Promise<EvaluableSchema<TOutput>>
      })
    },
  }

  return b
}
