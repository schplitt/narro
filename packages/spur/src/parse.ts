import type { SchemaReport } from './types/report'
import type { BuildableSchema, EvaluableSchema } from './types/schema'
import type { InferOutput } from './types/utils'

export async function parse<TSchema extends BuildableSchema<any, any, any> | EvaluableSchema<any> | Promise<EvaluableSchema<any>>>(schema: TSchema, data: unknown): Promise<InferOutput<TSchema>> {
  schema = await schema
  if ('parse' in schema) {
    return schema.parse(data) as InferOutput<TSchema>
  }

  return schema['~build']().then(s => s.parse(data)) as Promise<InferOutput<TSchema>>
}

export async function safeParse<TSchema extends BuildableSchema<any, any, any> | EvaluableSchema<any> | Promise<EvaluableSchema<any>>>(schema: TSchema, data: unknown): Promise<SchemaReport<InferOutput<TSchema>>> {
  schema = await schema
  if ('safeParse' in schema) {
    return schema.safeParse(data)
  }
  return schema['~build']().then(s => s.safeParse(data))
}
