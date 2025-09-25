import type { StandardSchemaV1 } from '@standard-schema/spec'
import type { CommonOptions, DefaultCommonOptions } from './options'
import type { SchemaReport } from './report'

export type Check<TOutput, TInput = TOutput> = (input: TInput) => SchemaReport<TOutput>

export type SourceCheck<TOutput, TInput = TOutput> = (input: unknown) => input is TInput

export interface SourceCheckable<TOutput, TInput = TOutput> {
  '~id': symbol
  '~c': SourceCheck<TInput>
}

export type SourceCheckableImport<TOutput, TInput = TOutput> = () => Promise<SourceCheckable<TInput>>

export type CheckableImport<TOutput, TInput = TOutput> = () => Promise<Checkable<TInput>>

export interface Checkable<TOutput, TInput = TOutput> {
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
