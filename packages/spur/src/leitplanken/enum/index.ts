import type { CommonOptions, DefaultCommonOptions, MakeDefaulted, MakeExactOptional, MakeNullable, MakeNullish, MakeOptional, MakeRequired, MakeUndefinable } from '../../options/options'
import type { BranchCheckableImport, BuildableSchema, DefaultInput, EvaluableSchema, SourceCheckableImport } from '../../types/schema'

export type Enum = [string | number | boolean, ...(string | number | boolean)[]]

type InferEnumType<T extends Enum> = T[number]

export interface EnumSchema<TEnum extends Enum, TOutput = InferEnumType<TEnum>, TInput = InferEnumType<TEnum>, TCommonOptions extends CommonOptions = DefaultCommonOptions> extends BuildableSchema<TOutput, TInput, TCommonOptions> {
  default: (value: DefaultInput<TOutput>) => EnumSchema<TEnum, InferEnumType<TEnum>, InferEnumType<TEnum> | undefined | null, MakeDefaulted<TCommonOptions>>
  optional: () => EnumSchema<TEnum, InferEnumType<TEnum> | undefined, InferEnumType<TEnum> | undefined, MakeOptional<TCommonOptions>>
  exactOptional: () => EnumSchema<TEnum, InferEnumType<TEnum> | undefined, InferEnumType<TEnum> | undefined, MakeExactOptional<TCommonOptions>>
  undefinable: () => EnumSchema<TEnum, InferEnumType<TEnum> | undefined, InferEnumType<TEnum> | undefined, MakeUndefinable<TCommonOptions>>
  required: () => EnumSchema<TEnum, InferEnumType<TEnum>, InferEnumType<TEnum>, MakeRequired<TCommonOptions>>
  nullable: () => EnumSchema<TEnum, InferEnumType<TEnum> | null, InferEnumType<TEnum> | null, MakeNullable<TCommonOptions>>
  nullish: () => EnumSchema<TEnum, InferEnumType<TEnum> | undefined | null, InferEnumType<TEnum> | undefined | null, MakeNullish<TCommonOptions>>
}

// NOTE: overload keeps default generics when schema is contextually typed inside
// object/array/union entries. Without it TS infers <unknown, unknown, CommonOptions>.
export function enum_<const TEnum extends Enum>(_values: TEnum): EnumSchema<TEnum, InferEnumType<TEnum>, InferEnumType<TEnum>, DefaultCommonOptions>
export function enum_<const TEnum extends Enum, TOutput, TInput, TCommonOptions extends CommonOptions>(_values: TEnum): EnumSchema<TEnum, TOutput, TInput, TCommonOptions>
export function enum_<const TEnum extends Enum, TOutput = InferEnumType<TEnum>, TInput = InferEnumType<TEnum>, TCommonOptions extends CommonOptions = DefaultCommonOptions>(_values: TEnum): EnumSchema<TEnum, TOutput, TInput, TCommonOptions> {
  if (_values.length === 0) {
    throw new Error('Enum requires at least one value')
  }

  let optionalityBranchCheckableImport: BranchCheckableImport<any> | undefined

  const values = [..._values] as Enum

  const sourceCheckableImport: SourceCheckableImport<InferEnumType<TEnum>> = () => import('./enum').then(m => m.default(values))

  const e: EnumSchema<TEnum, TOutput, TInput, TCommonOptions> = {
    'default': (value) => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/defaulted').then(m => m.default(value))
      return e as any as EnumSchema<TEnum, InferEnumType<TEnum>, InferEnumType<TEnum> | undefined | null, MakeDefaulted<TCommonOptions>>
    },

    'optional': () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/optional').then(m => m.default)
      return e as any as EnumSchema<TEnum, InferEnumType<TEnum> | undefined, InferEnumType<TEnum> | undefined, MakeOptional<TCommonOptions>>
    },

    'exactOptional': () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/exactOptional').then(m => m.default)
      return e as any as EnumSchema<TEnum, InferEnumType<TEnum> | undefined, InferEnumType<TEnum> | undefined, MakeExactOptional<TCommonOptions>>
    },

    'undefinable': () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/undefinable').then(m => m.default)
      return e as any as EnumSchema<TEnum, InferEnumType<TEnum> | undefined, InferEnumType<TEnum> | undefined, MakeUndefinable<TCommonOptions>>
    },

    'required': () => {
      optionalityBranchCheckableImport = undefined
      return e as any as EnumSchema<TEnum, InferEnumType<TEnum>, InferEnumType<TEnum>, MakeRequired<TCommonOptions>>
    },

    'nullable': () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/nullable').then(m => m.default)
      return e as any as EnumSchema<TEnum, InferEnumType<TEnum> | null, InferEnumType<TEnum> | null, MakeNullable<TCommonOptions>>
    },

    'nullish': () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/nullish').then(m => m.default)
      return e as any as EnumSchema<TEnum, InferEnumType<TEnum> | undefined | null, InferEnumType<TEnum> | undefined | null, MakeNullish<TCommonOptions>>
    },

    '~build': () => {
      return import('../../build/build').then(({ buildEvaluableSchema }) => {
        return buildEvaluableSchema(
          sourceCheckableImport,
          optionalityBranchCheckableImport,
        ) as Promise<EvaluableSchema<TOutput>>
      })
    },
  }

  return e
}

export { enum_ as enum }
