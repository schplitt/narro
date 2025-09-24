import type { BuildableSchema } from './types/schema'
import type { InferOutput } from './types/utils'

export function parse<TSchema extends BuildableSchema>(schema: TSchema, data: unknown): InferOutput<TSchema> {
  return 1 as any
}
