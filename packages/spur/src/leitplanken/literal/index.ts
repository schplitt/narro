import type { CommonOptions, DefaultCommonOptions, MakeDefaulted, MakeExactOptional, MakeNullable, MakeNullish, MakeOptional, MakeRequired, MakeUndefinable } from '../../options/options'
import type { BuildableSchema, DefaultInput } from '../../types/schema'

export interface LiteralSchema<TLiteral extends string | number, TOutput = TLiteral, TInput = TLiteral, TCommonOptions extends CommonOptions = DefaultCommonOptions> extends BuildableSchema<TOutput, TInput, TCommonOptions> {
  default: (value: DefaultInput<TOutput>) => LiteralSchema<TLiteral, TLiteral, TLiteral | undefined | null, MakeDefaulted<TCommonOptions>>
  optional: () => LiteralSchema<TLiteral, TLiteral | undefined, TLiteral | undefined, MakeOptional<TCommonOptions>>
  exactOptional: () => LiteralSchema<TLiteral, TLiteral | undefined, TLiteral | undefined, MakeExactOptional<TCommonOptions>>
  undefinable: () => LiteralSchema<TLiteral, TLiteral | undefined, TLiteral | undefined, MakeUndefinable<TCommonOptions>>
  required: () => LiteralSchema<TLiteral, TLiteral, TLiteral, MakeRequired<TCommonOptions>>
  nullable: () => LiteralSchema<TLiteral, TLiteral | null, TLiteral | null, MakeNullable<TCommonOptions>>
  nullish: () => LiteralSchema<TLiteral, TLiteral | undefined | null, TLiteral | undefined | null, MakeNullish<TCommonOptions>>
}

// NOTE: overload keeps default generics when schema is contextually typed inside
// object/array/union entries. Without it TS infers <unknown, unknown, CommonOptions>.
export function literal<TLiteral extends string | number>(_value: TLiteral): LiteralSchema<TLiteral, TLiteral, TLiteral, DefaultCommonOptions>
export function literal<TLiteral extends string | number, TOutput, TInput, TCommonOptions extends CommonOptions>(_value: TLiteral): LiteralSchema<TLiteral, TOutput, TInput, TCommonOptions>
export function literal<TLiteral extends string | number, TOutput = TLiteral, TInput = TLiteral, TCommonOptions extends CommonOptions = DefaultCommonOptions>(_value: TLiteral): LiteralSchema<TLiteral, TOutput, TInput, TCommonOptions> {
  return 1 as any
}
