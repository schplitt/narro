import type { SchemaReport } from './types/report'
import type { BuildableSchema, EvaluableSchema } from './types/schema'
import type { InferOutput } from './types/utils'

export function parse<TSchema extends EvaluableSchema<any>>(schema: TSchema, data: unknown): InferOutput<TSchema> {
  if ('parse' in schema) {
    return schema.parse(data) as InferOutput<TSchema>
  }
  throw new Error('Sync parse requires a pre-built schema')
}

export function safeParse<TSchema extends EvaluableSchema<any>>(schema: TSchema, data: unknown): SchemaReport {
  if ('safeParse' in schema) {
    return schema.safeParse(data)
  }
  throw new Error('Sync safeParse requires a pre-built schema')
}

// Re-export the schema builders for sync usage
export * from './leitplanken/number'
export * from './leitplanken/string'