import type { CommonOptions } from './options'

export type SetCommonOption<TOptions extends CommonOptions, TKey extends keyof TOptions, TNewValue extends TOptions[TKey]> = Omit<TOptions, TKey> & {
  [K in TKey]: TNewValue
}
