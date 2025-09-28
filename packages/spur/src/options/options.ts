import type { BuildableSchema } from '../types/schema'
import type { SetCommonOption } from './utils'

export type Optionality = 'optional' | 'required' | 'nullable' | 'nullish' | 'defaulted' | 'undefinable'

export interface CommonOptions {
  optionality: Optionality
}

export interface DefaultCommonOptions extends CommonOptions {
  optionality: 'required'
}

export type InferOptionalityType<T extends CommonOptions> = T extends { optionality: infer TOptionality }
  ? (
      TOptionality extends 'optional' | 'undefinable' ? undefined
        : TOptionality extends 'nullable' ? null
          : TOptionality extends 'nullish' ? null | undefined
            : TOptionality extends 'defaulted' | 'required' ? never
              : never
    )
  : never

/**
 * Extracts all schemas from T that have the option TKey set to TValue
 * E.g. to extract all optional schemas from a union of schemas
 */
export type ExtractSchemas<T extends BuildableSchema<any, any, CommonOptions>, TKey extends string, TValue> = T extends BuildableSchema<any, any, infer TCommonOptions> ? TCommonOptions extends { [K in TKey]: TValue } ? T : never : never

/**
 * Extracts the options from a schema
 */
export type ExtractOptions<T extends BuildableSchema<any, any, CommonOptions>> = T extends BuildableSchema<any, any, infer TCommonOptions> ? TCommonOptions : never

export type MakeOptional<TOptions extends CommonOptions> = SetCommonOption<TOptions, 'optionality', 'optional'>
export type ExtractOptionalSchema<T extends BuildableSchema<any, any, CommonOptions>> = ExtractSchemas<T, 'optionality', 'optional'>

export type MakeRequired<TOptions extends CommonOptions> = SetCommonOption<TOptions, 'optionality', 'required'>
export type ExtractRequiredSchema<T extends BuildableSchema<any, any, CommonOptions>> = ExtractSchemas<T, 'optionality', 'required'>

export type MakeNullable<TOptions extends CommonOptions> = SetCommonOption<TOptions, 'optionality', 'nullable'>
export type ExtractNullableSchema<T extends BuildableSchema<any, any, CommonOptions>> = ExtractSchemas<T, 'optionality', 'nullable'>

export type MakeNullish<TOptions extends CommonOptions> = SetCommonOption<TOptions, 'optionality', 'nullish'>
export type ExtractNullishSchema<T extends BuildableSchema<any, any, CommonOptions>> = ExtractSchemas<T, 'optionality', 'nullish'>

export type MakeDefaulted<TOptions extends CommonOptions> = SetCommonOption<TOptions, 'optionality', 'defaulted'>
export type ExtractDefaultedSchema<T extends BuildableSchema<any, any, CommonOptions>> = ExtractSchemas<T, 'optionality', 'defaulted'>

export type MakeUndefinable<TOptions extends CommonOptions> = SetCommonOption<TOptions, 'optionality', 'undefinable'>
export type ExtractUndefinableSchema<T extends BuildableSchema<any, any, CommonOptions>> = ExtractSchemas<T, 'optionality', 'undefinable'>
