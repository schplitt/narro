import type { CommonOptions, DefaultCommonOptions } from '../options/options'
import type { SchemaReport } from './report'
import type { Prettify } from './utils'

export type Check<TInput> = (input: TInput) => boolean

export type SourceCheck<TOutput, TInput = TOutput> = (input: unknown) => input is TInput

export type BranchCheck<TOutput> = (input: unknown) => SchemaReport<TOutput>

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
export interface SourceCheckable<TOutput, TInput = TOutput> {
  '~id': symbol
  '~c': SourceCheck<TOutput, TInput>
}

export interface BranchCheckable<TOutput> {
  '~id': symbol
  '~c': BranchCheck<TOutput>
}

export type SourceCheckableImport<TOutput, TInput = TOutput> = () => Promise<SourceCheckable<TInput>>

export type CheckableImport<TOutput, TInput = TOutput> = () => Promise<Checkable<TInput>>

export type BranchCheckableImport<TOutput> = () => Promise<BranchCheckable<TOutput>>

export interface BuildableSchema<TOutput = unknown, TInput = TOutput, TOptions extends CommonOptions = DefaultCommonOptions> {
  'build': () => Promise<EvaluableSchema<TOutput>>
  'parse': (input: unknown) => Promise<TOutput>
  'safeParse': (input: unknown) => Promise<SchemaReport<TOutput>>
  '~types'?: {
    // necessary to keep TS from bailing out on complex generics
    options: TOptions
    output: TOutput
    input: TInput
  }
}

export interface EvaluableSchema<TOutput = unknown, TInput = unknown, TOptions extends CommonOptions = DefaultCommonOptions> /* extends StandardSchemaV1<unknown, TOutput>  */ {
  'parse': (input: unknown) => TOutput
  'safeParse': (input: unknown) => SchemaReport
  '~types'?: {
    // necessary to keep TS from bailing out on complex generics
    options: TOptions
    output: TOutput
    input: TInput
  }

}

// TODO: if funcitons are supported in the future, it is ambiguous if a function is the default output directly OR a factory function that returns the output
export type DefaultInput<TOutput> = Prettify<TOutput> | (() => Prettify<TOutput>)
