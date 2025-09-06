import type { BuildableSchema } from './types/schema'
import type { ExtractOutputType } from './types/utils'

export function parse<TSchema extends BuildableSchema>(schema: TSchema, data: unknown): ExtractOutputType<TSchema> {
  return 1 as any
}
