import type { StandardSchemaV1 } from '@standard-schema/spec'
import type { CommonOptions, DefaultCommonOptions } from '../options/options'
import type { SchemaReport } from './report'

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

export type BranchCheckableImport<TOutput, TInput = TOutput> = () => Promise<BranchCheckable<TInput>>

export interface BuildableSchema<TOutput = unknown, TInput = TOutput, TOptions extends CommonOptions = DefaultCommonOptions> {
  '~build': () => Promise<EvaluableSchema<TOutput>>
  '~types'?: {
    // necessary to keep TS from bailing out on complex generics
    options: TOptions
    output: TOutput
    input: TInput
  }

}

export interface EvaluableSchema<TOutput = unknown> /* extends StandardSchemaV1<unknown, TOutput>  */ {
  parse: (input: unknown) => TOutput
  safeParse: (input: unknown) => SchemaReport

  /**
   * Necessary as we need to know the max score of a schema when we are not able to evaluate it
   * Though this does not work for something like a union schema where the max score depends on which branch is taken
   * and if the union cannot be evaluated a "maxScore" cannot be determined, though we could make it an array of possible maxScores
   * but actually should be totally irrelevant as then this property or entry point is where the schema fails
   * and if it fails on all then there is actually no "branch" to take as all fail
   * but in this case giving the User back a "score" and "maxScore" is not very usefull as maxscore could then again here be multiple
   * but we could just give the range with a hint and say the score is between x and y or so
   *
   * SOLUTION: maxScore is unecessary (for now) we can chose the path the gives the highest score
   * We can then also determain if a schema with more "potential" failed as we just check
   */
  // readonly maxScore: number
}

// TODO: if funcitons are supported in the future, it is ambiguous if a function is the default output directly OR a factory function that returns the output
export type DefaultInput<TOutput> = NonNullable<TOutput> | (() => NonNullable<TOutput>)
