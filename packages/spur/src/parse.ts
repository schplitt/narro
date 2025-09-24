import type { SchemaReport } from './types/report'
import type { BuildableSchema, EvaluableSchema } from './types/schema'
import type { InferOutput } from './types/utils'

export async function parse<TSchema extends BuildableSchema | EvaluableSchema>(schema: TSchema, data: unknown): Promise<InferOutput<TSchema>> {
  if ('parse' in schema) {
    return schema.parse(data) as InferOutput<TSchema>
  }
  return schema['@build']().then(s => s.parse(data)) as Promise<InferOutput<TSchema>>
}

export async function safeParse<TSchema extends BuildableSchema | EvaluableSchema>(schema: TSchema, data: unknown): Promise<SchemaReport> {
  if ('safeParse' in schema) {
    return schema.safeParse(data)
  }
  return schema['@build']().then(s => s.safeParse(data))
}
