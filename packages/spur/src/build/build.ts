import type { SchemaReport, SchemaReportFailure } from '../types/report'
import type { BranchCheckable, BranchCheckableImport, Checkable, CheckableImport, EvaluableSchema, SourceCheckable, SourceCheckableImport } from '../types/schema'
import { deduplicateCheckables, mergeOptionality } from './utils'

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
        success: false,
        metaData: {
          failedIds,
          score: 0,
        },
      }
    }
    else {
      const passedIds = new Set<symbol>()
      passedIds.add(sourceCheckable['~id'])
      // if the source checkable passed, we continue with the child checkables and add 1 to the score for each valid
      sourceReport = deduplicatedChildCheckables.reduce((acc, checkable) => {
        const result = checkable['~c'](input)
        if (result) {
          acc.metaData.score += 1
          acc.metaData.passedIds!.add(checkable['~id'])
        }
        else {
          if (!(acc as SchemaReportFailure).metaData.failedIds) {
            (acc as SchemaReportFailure).metaData.failedIds = new Set<symbol>()
          }
          (acc as SchemaReportFailure).metaData.failedIds.add(checkable['~id'])

          acc.success = false
        }
        return acc
      }, {
        success: true,
        data: input,
        metaData: {
          passedIds,
          score: 1,
        },
      } as SchemaReport<TOutput>)
    }

    // remove the data from the report if it did not pass
    if (!sourceReport.success) {
      delete sourceReport.data
    }

    // now after the checks are done, we continue with the optionality checkable if present
    return mergeOptionality(input, sourceReport, optionalityBranchCheckable)
  }

  return {
    safeParse,
    parse: (input) => {
      const report = safeParse(input)
      if (report.success) {
        return report.data as TOutput
      }
      throw new Error('Input did not pass schema checks')
    },
  }
}
