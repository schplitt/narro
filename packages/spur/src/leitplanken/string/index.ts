import type { CommonOptions, DefaultCommonOptions, MakeDefaulted, MakeNullable, MakeNullish, MakeOptional, MakeRequired, MakeUndefinable } from '../../types/common'
import type { BuildableSchema, Checkable, CheckableImport, EvaluableSchema } from '../../types/schema'
import { build } from '../../build'

// TODO: could have typesafe default with (string & {}) | <default>

export interface StringSchema<TOutput = string, TInput = string, TCommonOptions extends CommonOptions = DefaultCommonOptions> extends BuildableSchema<TOutput, TInput, TCommonOptions> {
  minLength: (minLength: number) => StringSchema<TOutput, TInput, TCommonOptions>
  maxLength: (maxLength: number) => StringSchema<TOutput, TInput, TCommonOptions>
  length: (length: number) => StringSchema<TOutput, TInput, TCommonOptions>

  // template literals might be possible in the future here, similar to templateLiteralSchema
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
  }

  return s
}
