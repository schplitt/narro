import type { BuildableSchema } from '../types/schema'
import type { SetCommonOption } from './utils'
/**
 * Defines how optional/nullable a schema is
 * If used on a non-object schema their types will be transformed like this:
 * - optional: adds `| undefined` to input and output types
 * - exactOptional: adds `| undefined` to input and output types (same as optional)
 * - undefinable: adds `| undefined` to input and output types (same as optional)
 * - nullable: adds `| null` to input and output types
 * - nullish: adds `| undefined | null` to input and output types
 * - defaulted: adds `| undefined | null` to input type, output type stays the same
 * - required: transforms input and output types to source types
 *
 * However if these schemas are then used in an object, their types will differ:
 * - optional: adds `?` **AND** ` | undefined` to input and output types
 * - exactOptional: adds **ONLY** `?` to input and output types (key is OPTIONAL, but if present value MUST BE of source type, cannot be `undefined`)
 * - undefinable: adds ** ONLY** ` | undefined` to input and output types (key is REQUIRED)
 * - nullable: adds **ONLY** ` | null` to input and output types (key is REQUIRED)
 * - nullish: adds **ONLY** ` | undefined | null` to input and output types (key is REQUIRED)
 * - defaulted: adds `?` **AND** ` | undefined | null` to input type, output type stays the same
 * - required: key is REQUIRED, input and output types stay the same
 */
export type Optionality = 'optional' | 'required' | 'nullable' | 'nullish' | 'defaulted' | 'undefinable' | 'exactOptional'

export interface CommonOptions {
  optionality: Optionality
}

export interface DefaultCommonOptions extends CommonOptions {
  optionality: 'required'
}

export type InferOptionalityOutputType<T extends CommonOptions> = T extends { optionality: infer TOptionality }
  ? (
      TOptionality extends 'optional' | 'undefinable' ? undefined
        : TOptionality extends 'nullable' ? null
          : TOptionality extends 'nullish' ? null | undefined
            : TOptionality extends 'defaulted' | 'required' ? never
              : never
    )
  : never

export type InferOptionalityInputType<T extends CommonOptions> = T extends { optionality: infer TOptionality }
  ? (
      TOptionality extends 'optional' | 'undefinable' ? undefined
        : TOptionality extends 'nullable' ? null
          : TOptionality extends 'nullish' | 'defaulted' ? null | undefined
            : TOptionality extends 'required' ? never
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

export type MakeExactOptional<TOptions extends CommonOptions> = SetCommonOption<TOptions, 'optionality', 'exactOptional'>
export type ExtractExactOptionalSchema<T extends BuildableSchema<any, any, CommonOptions>> = ExtractSchemas<T, 'optionality', 'exactOptional'>
