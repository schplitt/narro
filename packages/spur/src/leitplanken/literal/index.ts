import type { CommonOptions, DefaultCommonOptions, MakeDefaulted, MakeNullable, MakeNullish, MakeOptional, MakeRequired, MakeUndefinable } from '../../types/common'
import type { BuildableSchema } from '../../types/schema'

export interface LiteralSchema<TLiteral extends string | number, TOutput = TLiteral, TInput = TLiteral, TCommonOptions extends CommonOptions = DefaultCommonOptions> extends BuildableSchema<TOutput, TInput, TCommonOptions> {
  default: <TDefault extends TLiteral>(v: TDefault) => LiteralSchema<TLiteral, TLiteral, TLiteral | undefined, MakeDefaulted<TCommonOptions>>
  optional: () => LiteralSchema<TLiteral, NonNullable<TOutput> | undefined, NonNullable<TInput> | undefined, MakeOptional<TCommonOptions>>
  undefinable: () => LiteralSchema<TLiteral, NonNullable<TOutput> | undefined, NonNullable<TInput> | undefined, MakeUndefinable<TCommonOptions>>
  required: () => LiteralSchema<TLiteral, NonNullable<TOutput>, NonNullable<TInput>, MakeRequired<TCommonOptions>>
  nullable: () => LiteralSchema<TLiteral, NonNullable<TOutput> | null, NonNullable<TInput> | null, MakeNullable<TCommonOptions>>
  nullish: () => LiteralSchema<TLiteral, NonNullable<TOutput> | null | undefined, NonNullable<TInput> | null | undefined, MakeNullish<TCommonOptions>>
}

export function literal<TLiteral extends string | number>(_value: TLiteral): LiteralSchema<TLiteral> {
  return 1 as any
}
