import type { CommonOptions, DefaultCommonOptions, MakeDefaulted, MakeNullable, MakeNullish, MakeOptional, MakeRequired, MakeUndefinable } from '../../options/options'
import type { BuildableSchema, CheckableImport } from '../../types/schema'
import { build } from '../../build'

// TODO: could have typesafe default with (string & {}) | <default>

export interface StringSchema<TOutput = string, TInput = string, TCommonOptions extends CommonOptions = DefaultCommonOptions> extends BuildableSchema<TOutput, TInput, TCommonOptions> {
  minLength: (minLength: number) => StringSchema<TOutput, TInput, TCommonOptions>
  maxLength: (maxLength: number) => StringSchema<TOutput, TInput, TCommonOptions>
  length: (length: number) => StringSchema<TOutput, TInput, TCommonOptions>
  endsWith: (end: string) => StringSchema<TOutput, TInput, TCommonOptions>
  startsWith: (start: string) => StringSchema<TOutput, TInput, TCommonOptions>

  default: (v: string) => StringSchema<string, string | undefined, MakeDefaulted<TCommonOptions>>
  optional: () => StringSchema<string | undefined, string | undefined, MakeOptional<TCommonOptions>>
  undefinable: () => StringSchema<string | undefined, string | undefined, MakeUndefinable<TCommonOptions>>
  required: () => StringSchema<string, string, MakeRequired<TCommonOptions>>
  nullable: () => StringSchema<string | null, string | null, MakeNullable<TCommonOptions>>
  nullish: () => StringSchema<string | undefined | null, string | undefined | null, MakeNullish<TCommonOptions>>
}

export function string(): StringSchema {
  const options: CommonOptions = {
    optionality: 'required',
  }

  // eslint-disable-next-line ts/explicit-function-return-type
  const sourceCheckableImport = () => import('./string').then(m => m.createStringCheckable())

  const checkableImports: CheckableImport<string>[] = [
  ]

  const s: StringSchema = {
    '@build': () => {
      return build(sourceCheckableImport, checkableImports, options)
    },

    length(length: number) {
      checkableImports.push(() => import('../_shared/length').then(m => m.createLengthCheck(length)))
      return s
    },

    minLength(minLength: number) {
      checkableImports.push(() => import('../_shared/minLength').then(m => m.createMinLengthCheck(minLength)))
      return s
    },

    maxLength(maxLength: number) {
      checkableImports.push(() => import('../_shared/maxLength').then(m => m.createMaxLengthCheck(maxLength)))
      return s
    },

  }

  return s
}
