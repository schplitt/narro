import type { StandardSchemaV1 } from '@standard-schema/spec'
import type { CommonOptions, DefaultCommonOptions } from './common'
import type { SchemaReport } from './report'

export type Check<TInput> = (input: TInput) => SchemaReport

export type SourceCheck<TInput> = (input: unknown) => input is TInput

export interface SourceCheckable<TInput> {
  '~id': symbol
  '~c': SourceCheck<TInput>
  'maxScore': number
}

export type SourceCheckableImport<TInput> = () => Promise<SourceCheckable<TInput>>

export type CheckableImport<TInput> = () => Promise<Checkable<TInput>>

export interface Checkable<TInput> {
  /**
   * Get identifier for the checkable asynchronously
   */
  '~id': symbol
  /**
   * Imports and evaluates the checkable asynchronously
   * @param input The input to check
   * @returns A report indicating whether the input passed the check
   */
  '~c': Check<TInput>
  'maxScore': number
}

export interface BuildableSchema<TOutput = unknown, TInput = TOutput, TCommonOptions extends CommonOptions = DefaultCommonOptions> {
  '@build': () => Promise<EvaluableSchema<TOutput>>
  '~types'?: {
    // necessary to keep TS from bailing out on complex generics
    options: TCommonOptions
    output: TOutput
    input: TInput
  }
}

export interface EvaluableSchema<TOutput = unknown> /* extends StandardSchemaV1<unknown, TOutput>  */ {
  parse: (input: unknown) => TOutput
  safeParse: (input: unknown) => SchemaReport
}
