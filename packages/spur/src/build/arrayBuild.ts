import type { SchemaReport, SchemaReportFailure } from '../types/report'
import type { BranchCheckable, BranchCheckableImport, BuildableSchema, Checkable, CheckableImport, EvaluableSchema, SourceCheckable, SourceCheckableImport } from '../types/schema'
import { deduplicateCheckables } from './utils'

export async function buildEvaluableArraySchema<TElementOutput, TArrayOutput extends unknown[]>(
  sourceCheckableImport: SourceCheckableImport<TArrayOutput>,
  optionalityBranchCheckableImport: BranchCheckableImport<TArrayOutput> | undefined,
  childCheckableImports: CheckableImport<TArrayOutput>[],
  elementSchema: BuildableSchema<TElementOutput, any, any>,
): Promise<EvaluableSchema<TArrayOutput>> {
  const sourcePromise = sourceCheckableImport()
  const optionalityPromise = optionalityBranchCheckableImport ? optionalityBranchCheckableImport() : Promise.resolve(undefined)
  const checkablesPromise = Promise.all(childCheckableImports.map(ci => ci()))
  const elementSchemaPromise = elementSchema['~build']()

  const [sourceCheckable, optionalityCheckable, checkables, evaluableElementSchema] = await Promise.all([
    sourcePromise,
    optionalityPromise,
    checkablesPromise,
    elementSchemaPromise,
  ])

  const deduplicatedCheckables = deduplicateCheckables(checkables)

  return buildArraySchema(sourceCheckable, optionalityCheckable, deduplicatedCheckables, evaluableElementSchema)
}

export async function buildEvaluableArraySchemaWithTransform<TElementOutput, TArrayOutput extends unknown[], TTransformOutput>(
  sourceCheckableImport: SourceCheckableImport<TArrayOutput>,
  optionalityBranchCheckableImport: BranchCheckableImport<TArrayOutput> | undefined,
  childCheckableImports: CheckableImport<TArrayOutput>[],
  elementSchema: BuildableSchema<TElementOutput, any, any>,
  transformFn: (input: TArrayOutput) => TTransformOutput,
): Promise<EvaluableSchema<TTransformOutput>> {
  const baseSchema = await buildEvaluableArraySchema(
    sourceCheckableImport,
    optionalityBranchCheckableImport,
    childCheckableImports,
    elementSchema,
  )

  return {
    safeParse: (input: unknown) => {
      const report = baseSchema.safeParse(input)
      if (report.passed) {
        return {
          ...report,
          value: transformFn(report.value),
        }
      }
      return report as SchemaReport<TTransformOutput>
    },
    parse: (input: unknown) => {
      const result = baseSchema.parse(input)
      return transformFn(result)
    },
  }
}

export function buildArraySchema<TElementOutput, TArrayOutput extends unknown[]>(
  sourceCheckable: SourceCheckable<TArrayOutput>,
  optionalityBranchCheckable: BranchCheckable<TArrayOutput> | undefined,
  childCheckables: Checkable<TArrayOutput>[],
  elementSchema: EvaluableSchema<TElementOutput>,
): EvaluableSchema<TArrayOutput> {
  function safeParse(input: unknown): SchemaReport<TArrayOutput> {
    const failedIds = new Set<symbol>()
    failedIds.add(sourceCheckable['~id'])

    const isSourceValid = sourceCheckable['~c'](input)
    let sourceReport: SchemaReport<TArrayOutput>

    if (!isSourceValid) {
      sourceReport = {
        passed: false,
        score: 0,
        failedIds,
      }
    }
    else {
      const passedIds = new Set<symbol>()
      passedIds.add(sourceCheckable['~id'])

      const baseReport = {
        passed: true,
        value: [] as unknown as TArrayOutput,
        score: 1,
        passedIds,
      } as SchemaReport<TArrayOutput>

      for (const checkable of childCheckables) {
        const result = checkable['~c'](input as TArrayOutput)
        if (result) {
          baseReport.score += 1
          baseReport.passedIds!.add(checkable['~id'])
        }
        else {
          (baseReport as unknown as SchemaReportFailure).passed = false
          const failureReport = baseReport as unknown as SchemaReportFailure
          failureReport.failedIds ??= new Set<symbol>()
          failureReport.failedIds.add(checkable['~id'])
        }
      }

      if (baseReport.passed) {
        const parsedElements: TElementOutput[] = []

        for (const element of input as unknown[]) {
          const elementReport = elementSchema.safeParse(element)
          baseReport.score += elementReport.score

          if (elementReport.passed) {
            parsedElements.push(elementReport.value)
          }
          else {
            (baseReport as unknown as SchemaReportFailure).passed = false
            const failureReport = baseReport as unknown as SchemaReportFailure
            failureReport.failedIds ??= new Set<symbol>()
            if (elementReport.failedIds) {
              elementReport.failedIds.forEach(id => failureReport.failedIds!.add(id))
            }
          }
        }

        if (baseReport.passed) {
          baseReport.value = parsedElements as unknown as TArrayOutput
        }
        else {
          delete (baseReport as SchemaReportFailure).value
        }
      }
      else {
        delete (baseReport as SchemaReportFailure).value
      }

      sourceReport = baseReport
    }

    const optionalityReport = optionalityBranchCheckable ? optionalityBranchCheckable['~c'](input) : undefined
    if (optionalityReport && !optionalityReport.passed) {
      delete optionalityReport.value
    }

    if (sourceReport.passed && optionalityReport?.passed) {
      throw new Error('Both source and optionality checkables passed, this should never happen')
    }

    if (sourceReport.passed) {
      if (optionalityReport) {
        sourceReport.unionReports = [optionalityReport]
      }
      return sourceReport
    }

    if (optionalityReport?.passed) {
      optionalityReport.unionReports = [sourceReport]
      return optionalityReport
    }

    const higherScoreReport = sourceReport.score >= (optionalityReport?.score ?? -1) ? sourceReport : optionalityReport!
    const lowerScoreReport = higherScoreReport === sourceReport ? optionalityReport : sourceReport

    if (lowerScoreReport) {
      higherScoreReport.unionReports = [lowerScoreReport]
    }

    return higherScoreReport
  }

  return {
    safeParse,
    parse: (input: unknown) => {
      const report = safeParse(input)
      if (report.passed) {
        return report.value as TArrayOutput
      }
      throw new Error('Input did not pass schema checks')
    },
  }
}
