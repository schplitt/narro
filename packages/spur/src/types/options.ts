import type { BuildableSchema } from './schema'

export type Optionality = 'optional' | 'required' | 'nullable' | 'nullish' | 'defaulted' | 'undefinable'

export interface CommonOptions {
  optionality: Optionality
}

export interface DefaultCommonOptions extends CommonOptions {
  optionality: 'required'
}

export type SetCommonOption<TOptions extends CommonOptions, TKey extends keyof CommonOptions, TNewValue extends CommonOptions[TKey]> = Omit<TOptions, TKey> & {
  [K in TKey]: TNewValue
}
export type ExtractSchemas<T extends BuildableSchema<any, any, CommonOptions>, TKey extends keyof CommonOptions, TValue extends CommonOptions[TKey]> = T extends BuildableSchema<any, any, infer TCommonOptions> ? TCommonOptions extends { [K in TKey]: TValue } ? T : never : never
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
