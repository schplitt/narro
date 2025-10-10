import type { CommonOptions, DefaultCommonOptions, MakeDefaulted, MakeExactOptional, MakeNullable, MakeNullish, MakeOptional, MakeRequired, MakeUndefinable } from '../../options/options'
import type { BranchCheckableImport, BuildableSchema, CheckableImport, DefaultInput, EvaluableSchema } from '../../types/schema'

export interface StringSchema<TOutput = string, TInput = string, TCommonOptions extends CommonOptions = DefaultCommonOptions> extends BuildableSchema<TOutput, TInput, TCommonOptions> {
  minLength: (minLength: number) => StringSchema<TOutput, TInput, TCommonOptions>
  maxLength: (maxLength: number) => StringSchema<TOutput, TInput, TCommonOptions>
  length: (length: number) => StringSchema<TOutput, TInput, TCommonOptions>
  endsWith: (end: string) => StringSchema<TOutput, TInput, TCommonOptions>
  startsWith: (start: string) => StringSchema<TOutput, TInput, TCommonOptions>

  default: (value: DefaultInput<TOutput>) => StringSchema<string, string | undefined | null, MakeDefaulted<TCommonOptions>>
  optional: () => StringSchema<string | undefined, string | undefined, MakeOptional<TCommonOptions>>
  exactOptional: () => StringSchema<string | undefined, string | undefined, MakeExactOptional<TCommonOptions>>
  undefinable: () => StringSchema<string | undefined, string | undefined, MakeUndefinable<TCommonOptions>>
  required: () => StringSchema<string, string, MakeRequired<TCommonOptions>>
  nullable: () => StringSchema<string | null, string | null, MakeNullable<TCommonOptions>>
  nullish: () => StringSchema<string | undefined | null, string | undefined | null, MakeNullish<TCommonOptions>>
}

// NOTE: overload keeps default generics when schema is contextually typed inside
// object/array/union entries. Without it TS infers <unknown, unknown, CommonOptions>.
export function string(): StringSchema<string, string, DefaultCommonOptions>
export function string<TOutput, TInput, TCommonOptions extends CommonOptions>(): StringSchema<TOutput, TInput, TCommonOptions>
export function string<TOutput = string, TInput = string, TCommonOptions extends CommonOptions = DefaultCommonOptions>(): StringSchema<TOutput, TInput, TCommonOptions> {
  let optionalityBranchCheckableImport: BranchCheckableImport<any> | undefined

  // eslint-disable-next-line ts/explicit-function-return-type
  const sourceCheckableImport = () => import('./string').then(m => m.stringCheckable)

  const childCheckableImports: CheckableImport<string>[] = [
  ]

  const s: StringSchema<TOutput, TInput, TCommonOptions> = {

    length: (length) => {
      childCheckableImports.push(() => import('../_shared/length').then(m => m.default(length)))
      return s
    },

    minLength: (minLength) => {
      childCheckableImports.push(() => import('../_shared/minLength').then(m => m.default(minLength)))
      return s
    },

    maxLength: (maxLength) => {
      childCheckableImports.push(() => import('../_shared/maxLength').then(m => m.default(maxLength)))
      return s
    },

    endsWith: (end) => {
      childCheckableImports.push(() => import('./endsWith').then(m => m.default(end)))
      return s
    },

    startsWith: (start) => {
      childCheckableImports.push(() => import('./startsWith').then(m => m.default(start)))
      return s
    },

    default: (value) => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/defaulted').then(m => m.default(value))
      return s as any as StringSchema<string, string | undefined | null, MakeDefaulted<TCommonOptions>>
    },

    optional: () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/optional').then(m => m.default)
      return s as any as StringSchema<string | undefined, string | undefined, MakeOptional<TCommonOptions>>
    },

    exactOptional: () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/exactOptional').then(m => m.default)
      return s as any as StringSchema<string | undefined, string | undefined, MakeExactOptional<TCommonOptions>>
    },

    undefinable: () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/undefinable').then(m => m.default)
      return s as any as StringSchema<string | undefined, string | undefined, MakeUndefinable<TCommonOptions>>
    },

    required: () => {
      optionalityBranchCheckableImport = undefined
      return s as any as StringSchema<string, string, MakeRequired<TCommonOptions>>
    },

    nullable: () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/nullable').then(m => m.default)
      return s as any as StringSchema<string | null, string | null, MakeNullable<TCommonOptions>>
    },

    nullish: () => {
      optionalityBranchCheckableImport = () => import('../_shared/optionality/nullish').then(m => m.default)
      return s as any as StringSchema<string | undefined | null, string | undefined | null, MakeNullish<TCommonOptions>>
    },

    // @ts-expect-error - TODO: Currently the types are not correct as TOutput can be different due to optionality
    build: async () => {
      return import('../../build/build').then(({ buildEvaluableSchema }) => {
        return buildEvaluableSchema(
          sourceCheckableImport,
          optionalityBranchCheckableImport,
          childCheckableImports,
        )
      })
    },

    parse: async (input: unknown) => {
      const built = await s.build()
      return built.parse(input)
    },

    safeParse: async (input: unknown) => {
      const built = await s.build()
      return built.safeParse(input)
    },
  }

  return s
}
