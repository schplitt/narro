import type { BuildableSchema } from './schema'

export type Prettify<T> = { [K in keyof T]: T[K] } & {}

export type ExtractOutputType<T extends BuildableSchema<any, any, any>> = T extends BuildableSchema<infer TOutput, any, any> ? Prettify<TOutput> : never
export type ExtractInputType<T extends BuildableSchema<any, any, any>> = T extends BuildableSchema<any, infer TInput, any> ? Prettify<TInput> : never
