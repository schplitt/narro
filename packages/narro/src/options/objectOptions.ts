import type { CommonOptions, DefaultCommonOptions } from './options'
import type { SetCommonOption } from './utils'

export type ObjectShape = 'strict' | 'strip' | 'passthrough'

export interface ObjectOptions extends CommonOptions {
  shape: ObjectShape
}

export interface DefaultObjectOptions extends DefaultCommonOptions, Omit<ObjectOptions, keyof CommonOptions> {
  shape: 'strip'
}

export type MakeObjectStrip<TOptions extends ObjectOptions> = SetCommonOption<TOptions, 'shape', 'strip'>

export type MakeObjectPassthrough<TOptions extends ObjectOptions> = SetCommonOption<TOptions, 'shape', 'passthrough'>

export type MakeObjectStrict<TOptions extends ObjectOptions> = SetCommonOption<TOptions, 'shape', 'strict'>
