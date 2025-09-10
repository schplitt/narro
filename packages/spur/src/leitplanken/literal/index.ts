import type { CommonOptions, DefaultCommonOptions, MakeDefaulted, MakeNullable, MakeNullish, MakeOptional, MakeRequired, MakeUndefinable } from '../../types/common'
import type { BuildableSchema } from '../../types/schema'

export interface LiteralSchema<TLiteral extends string | number, TOutput = TLiteral, TInput = TLiteral, TCommonOptions extends CommonOptions = DefaultCommonOptions> extends BuildableSchema<TOutput, TInput, TCommonOptions> {
  default: <TDefault extends TLiteral>(v: TDefault) => LiteralSchema<TLiteral, TLiteral, TLiteral | undefined, MakeDefaulted<TCommonOptions>>
  optional: () => LiteralSchema<TLiteral, TLiteral | undefined, TLiteral | undefined, MakeOptional<TCommonOptions>>
  undefinable: () => LiteralSchema<TLiteral, TLiteral | undefined, TLiteral | undefined, MakeUndefinable<TCommonOptions>>
  required: () => LiteralSchema<TLiteral, TLiteral, TLiteral, MakeRequired<TCommonOptions>>
  nullable: () => LiteralSchema<TLiteral, TLiteral | null, TLiteral | null, MakeNullable<TCommonOptions>>
  nullish: () => LiteralSchema<TLiteral, TLiteral | null | undefined, TLiteral | null | undefined, MakeNullish<TCommonOptions>>
}

export function literal<TLiteral extends string | number>(_value: TLiteral): LiteralSchema<TLiteral> {
  return 1 as any
}
