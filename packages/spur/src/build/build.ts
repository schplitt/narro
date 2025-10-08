import type { SchemaReport, SchemaReportFailure } from '../types/report'
import type { BranchCheckable, BranchCheckableImport, Checkable, CheckableImport, EvaluableSchema, SourceCheckable, SourceCheckableImport } from '../types/schema'
import { deduplicateCheckables } from './utils'

export async function buildEvaluableSchema<TOutput>(
  sourceCheckableImport: SourceCheckableImport<TOutput>,
  optionalityBranchCheckableImport: BranchCheckableImport<TOutput> | undefined = undefined,
  childCheckableImports: CheckableImport<TOutput>[] = [],
): Promise<EvaluableSchema<TOutput>> {
  // we start with importing the source checkable and then all other checkables
  const sourcePromise = sourceCheckableImport()
  const optionalityPromise = optionalityBranchCheckableImport ? optionalityBranchCheckableImport() : Promise.resolve(undefined)
  const importPromises = Promise.all(childCheckableImports.map(ci => ci()))

  const [sourceCheckable, optionalityCheckable, checkables] = await Promise.all([sourcePromise, optionalityPromise, importPromises])

  // now we need to deduplicate the import promises via the ids to only keep the latest e.g. if two checkables have the same id, we keep the last one
  const deduplicatedCheckables = deduplicateCheckables(checkables)

  // TODO: we could include a cache here but we need to test if computing the cache key is cheaper than just building the schema

  return buildSchema(sourceCheckable, optionalityCheckable, deduplicatedCheckables)
}

export function buildSchema<TOutput>(
  sourceCheckable: SourceCheckable<TOutput>,
  optionalityBranchCheckable: BranchCheckable<TOutput> | undefined,
  deduplicatedChildCheckables: Checkable<TOutput>[],
): EvaluableSchema<TOutput> {
  function safeParse(input: unknown): SchemaReport<TOutput> {
    let sourceReport: SchemaReport<TOutput>

    const sourceResult = sourceCheckable['~c'](input)
    // when the source is not of the type we expect, we cannot continue with the child checkables
    const failedIds = new Set<symbol>()
    failedIds.add(sourceCheckable['~id'])
    if (!sourceResult) {
      // here we build the sourceReport from the checkables
      sourceReport = {
        passed: false,
        score: 0,
        failedIds,
      }
    }
    else {
      const passedIds = new Set<symbol>()
      passedIds.add(sourceCheckable['~id'])
      // if the source checkable passed, we continue with the child checkables and add 1 to the score for each valid
      sourceReport = deduplicatedChildCheckables.reduce((acc, checkable) => {
        const result = checkable['~c'](input)
        if (result) {
          acc.score += 1
          acc.passedIds!.add(checkable['~id'])
        }
        else {
          if (!(acc as SchemaReportFailure).failedIds) {
            (acc as SchemaReportFailure).failedIds = new Set<symbol>()
          }
          (acc as SchemaReportFailure).failedIds.add(checkable['~id'])

          acc.passed = false
        }
        return acc
      }, {
        passed: true,
        value: input,
        score: 1,
        passedIds,
      } as SchemaReport<TOutput>)

      // remove the value from the report if it did not pass
      if (!sourceReport.passed) {
        delete sourceReport.value
      }
    }

    // now after the checks are done, we continue with the optionality checkable if present
    const optionalityReport = optionalityBranchCheckable ? optionalityBranchCheckable['~c'](input) : undefined
    // remove the value prop if the optionality report did not pass
    if (optionalityReport && !optionalityReport.passed) {
      delete optionalityReport.value
    }

    // now we return the report that "passed" and put the other report into the unionReports
    // if none passed, we return the one with the higher score and put the other into the unionReports
    // if both passed (for whatever reason), we should throw an error as this should not happen
    if (sourceReport.passed && optionalityReport?.passed) {
      throw new Error('Both source and optionality checkables passed, this should never happen')
    }

    // if only one passed, return that one
    if (sourceReport.passed) {
      if (optionalityReport) {
        sourceReport.unionReports = [optionalityReport]
      }
      return sourceReport
    }
    if (optionalityReport?.passed) {
      if (sourceReport) {
        optionalityReport.unionReports = [sourceReport]
      }
      return optionalityReport
    }

    // both failed, return the one with the higher score and put the other into the unionReports
    const higherScoreReport = sourceReport.score >= (optionalityReport?.score ?? -1) ? sourceReport : optionalityReport!
    const lowerScoreReport = higherScoreReport === sourceReport ? optionalityReport : sourceReport

    if (lowerScoreReport) {
      higherScoreReport.unionReports = [lowerScoreReport]
    }

    return higherScoreReport
  }

  return {
    safeParse,
    parse: (input) => {
      const report = safeParse(input)
      if (report.passed) {
        return report.value as TOutput
      }
      throw new Error('Input did not pass schema checks')
    },
  }
}
