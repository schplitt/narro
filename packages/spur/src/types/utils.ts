import type { BuildableSchema, EvaluableSchema } from './schema'

export type Prettify<T> = { [K in keyof T]: T[K] } & {}

export type InferOutput<T extends BuildableSchema<any, any, any> | EvaluableSchema<any>> = T extends BuildableSchema<infer TOutput, any, any> ? Prettify<TOutput> : T extends EvaluableSchema<infer TOutput> ? Prettify<TOutput> : never
export type InferInput<T extends BuildableSchema<any, any, any> | EvaluableSchema<any>> = T extends BuildableSchema<any, infer TInput, any> ? Prettify<TInput> : T extends EvaluableSchema<any> ? Prettify<unknown> : never
