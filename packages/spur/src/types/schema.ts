import type { StandardSchemaV1 } from '@standard-schema/spec'

export interface Report {
  score: number
  passed: boolean
}

export type Check<TInput = any> = (input: TInput) => Report

export interface Checkable<TInput = any> {
  /**
   * Async identifier for the checkable
   */
  '~id': () => Promise<symbol>
  /**
   * Imports the checkable asynchronously
   */
  '~i': () => void
  /**
   * Imports and evaluates the checkable asynchronously
   * @param input The input to check
   * @returns A report indicating whether the input passed the check
   */
  '~c': (input: TInput) => Promise<Report>
}

export interface BuildableSchema<TOutput = unknown> {
  '~b': () => EvaluableSchema<TOutput>
}

export interface EvaluableSchema<TOutput = unknown> extends StandardSchemaV1<unknown, TOutput> {
  eval: (input: unknown) => Promise<TOutput>
  // TODO with report
  safeEval: (input: unknown) => Promise<TOutput>
}
