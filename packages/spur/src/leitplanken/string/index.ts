import type { CommonOptions, DefaultCommonOptions, MakeNullable, MakeNullish, MakeOptional, MakeRequired } from '../../types/common'
import type { BuildableSchema } from '../../types/schema'

export interface StringSchema<TOutput = string, TInput = string, TCommonOptions extends CommonOptions = DefaultCommonOptions> extends BuildableSchema<TOutput, TInput, TCommonOptions> {
  minLength: (minLength: number) => StringSchema<TOutput, TInput, TCommonOptions>
  maxLength: (maxLength: number) => StringSchema<TOutput, TInput, TCommonOptions>
  length: (length: number) => StringSchema<TOutput, TInput, TCommonOptions>

  default: <TDefault extends string>(v: TDefault) => StringSchema<string, string | undefined, TCommonOptions>
  unsetDefault: () => StringSchema<string, string, TCommonOptions>

  optional: () => StringSchema<string | undefined, string | undefined, MakeOptional<TCommonOptions>>
  required: () => StringSchema<string, string, MakeRequired<TCommonOptions>>
  nullable: () => StringSchema<string | null, string | null, MakeNullable<TCommonOptions>>
  nullish: () => StringSchema<string | undefined | null, string | undefined | null, MakeNullish<TCommonOptions>>
}

export function string(): StringSchema {
  return 1 as any
}
