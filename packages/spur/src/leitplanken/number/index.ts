import type { CommonOptions, DefaultCommonOptions, MakeDefaulted, MakeExactOptional, MakeNullable, MakeNullish, MakeOptional, MakeRequired, MakeUndefinable } from '../../options/options'
import type { BranchCheckableImport, BuildableSchema, CheckableImport, DefaultInput, EvaluableSchema } from '../../types/schema'

// TODO: could have typesafe default with (number & {}) | <default>

export interface NumberSchema<TOutput = number, TInput = number, TCommonOptions extends CommonOptions = DefaultCommonOptions> extends BuildableSchema<TOutput, TInput, TCommonOptions> {
  min: (min: number) => NumberSchema<TOutput, TInput, TCommonOptions>
  max: (max: number) => NumberSchema<TOutput, TInput, TCommonOptions>

  default: (value: DefaultInput<TOutput>) => NumberSchema<number, number | undefined | null, MakeDefaulted<TCommonOptions>>
  optional: () => NumberSchema<number | undefined, number | undefined, MakeOptional<TCommonOptions>>
  exactOptional: () => NumberSchema<number | undefined, number | undefined, MakeExactOptional<TCommonOptions>>
  undefinable: () => NumberSchema<number | undefined, number | undefined, MakeUndefinable<TCommonOptions>>
  required: () => NumberSchema<number, number, MakeRequired<TCommonOptions>>
  nullable: () => NumberSchema<number | null, number | null, MakeNullable<TCommonOptions>>
  nullish: () => NumberSchema<number | undefined | null, number | undefined | null, MakeNullish<TCommonOptions>>
}

// NOTE: overload keeps default generics when schema is contextually typed inside
// object/array/union entries. Without it TS infers <unknown, unknown, CommonOptions>.
export function number(): NumberSchema<number, number, DefaultCommonOptions>
export function number<TOutput, TInput, TCommonOptions extends CommonOptions>(): NumberSchema<TOutput, TInput, TCommonOptions>
export function number<TOutput = number, TInput = number, TCommonOptions extends CommonOptions = DefaultCommonOptions>(): NumberSchema<TOutput, TInput, TCommonOptions> {
  let optionalityBranchCheckableImport: BranchCheckableImport<any> | undefined

  // eslint-disable-next-line ts/explicit-function-return-type
  const sourceCheckableImport = () => import('./number').then(m => m.numberCheckable)

  const childCheckableImports: CheckableImport<number>[] = []

  const n: NumberSchema<TOutput, TInput, TCommonOptions> = {
    min: (min) => {
      childCheckableImports.push(() => import('./min').then(m => m.default(min)))
      return n
    },
    max: (max) => {
      childCheckableImports.push(() => import('./max').then(m => m.default(max)))
      return n
    },
    default: (value) => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/defaulted').then(m => m.default(value))
      return n as any as NumberSchema<number, number | undefined | null, MakeDefaulted<TCommonOptions>>
    },
    optional: () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/optional').then(m => m.default)
      return n as any as NumberSchema<number | undefined, number | undefined, MakeOptional<TCommonOptions>>
    },
    exactOptional: () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/exactOptional').then(m => m.default)
      return n as any as NumberSchema<number | undefined, number | undefined, MakeExactOptional<TCommonOptions>>
    },
    undefinable: () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/undefinable').then(m => m.default)
      return n as any as NumberSchema<number | undefined, number | undefined, MakeUndefinable<TCommonOptions>>
    },
    required: () => {
      optionalityBranchCheckableImport = undefined
      return n as any as NumberSchema<number, number, MakeRequired<TCommonOptions>>
    },
    nullable: () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/nullable').then(m => m.default)
      return n as any as NumberSchema<number | null, number | null, MakeNullable<TCommonOptions>>
    },
    nullish: () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/nullish').then(m => m.default)
      return n as any as NumberSchema<number | undefined | null, number | undefined | null, MakeNullish<TCommonOptions>>
    },

    // @ts-expect-error - Output type does not match as type could have been overwritten
    build: async () => {
      return import('../../build/build').then(({ buildEvaluableSchema }) => {
        return buildEvaluableSchema(
          sourceCheckableImport,
          optionalityBranchCheckableImport,
          childCheckableImports,
        )
      })
    },

    parse: async (input) => {
      const built = await n.build()
      return built.parse(input)
    },

    safeParse: async (input) => {
      const built = await n.build()
      return built.safeParse(input)
    },
  }

  return n
}
