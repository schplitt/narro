import type { BuildableSchema, EvaluableSchema } from './schema'

export type Prettify<T> = { [K in keyof T]: T[K] extends object ? Prettify<T[K]> : T[K] } & {}

export type InferOutput<T extends BuildableSchema<any, any, any> | EvaluableSchema<any> | Promise<EvaluableSchema<any>>> = T extends BuildableSchema<infer TOutput, any, any> ? Prettify<TOutput> : T extends EvaluableSchema<infer TOutput> ? Prettify<TOutput> : T extends Promise<EvaluableSchema<infer TOutput>> ? Prettify<TOutput> : never
// TODO: input type has to be preserved in evaluable schemas as well
export type InferInput<T extends BuildableSchema<any, any, any> | EvaluableSchema<any> | Promise<EvaluableSchema<any>>> = T extends BuildableSchema<any, infer TInput, any> ? Prettify<TInput> : T extends EvaluableSchema<any> ? Prettify<unknown> : T extends Promise<EvaluableSchema<any>> ? Prettify<unknown> : never
