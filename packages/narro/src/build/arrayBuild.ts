import type { SchemaReport, SchemaReportFailure } from '../types/report'
import type { BranchCheckable, BranchCheckableImport, BuildableSchema, Checkable, CheckableImport, EvaluableSchema, SourceCheckable, SourceCheckableImport } from '../types/schema'
import { deduplicateCheckables, mergeOptionality } from './utils'

export async function buildEvaluableArraySchema<TElementOutput, TArrayOutput extends unknown[]>(
  sourceCheckableImport: SourceCheckableImport<TArrayOutput>,
  optionalityBranchCheckableImport: BranchCheckableImport<TArrayOutput> | undefined,
  childCheckableImports: CheckableImport<TArrayOutput>[],
  elementSchema: BuildableSchema<TElementOutput, any, any>,
): Promise<EvaluableSchema<TArrayOutput>> {
  const sourcePromise = sourceCheckableImport()
  const optionalityPromise = optionalityBranchCheckableImport ? optionalityBranchCheckableImport() : Promise.resolve(undefined)
  const checkablesPromise = Promise.all(childCheckableImports.map(ci => ci()))
  const elementSchemaPromise = elementSchema.build()

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
      if (report.success) {
        return {
          ...report,
          data: transformFn(report.data),
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
        success: false,
        metaData: {
          score: 0,
          failedIds,
        },
      }
    }
    else {
      const passedIds = new Set<symbol>()
      passedIds.add(sourceCheckable['~id'])

      const baseReport = {
        success: true,
        data: [] as unknown as TArrayOutput,
        metaData: {
          score: 1,
          passedIds,
        },
      } as SchemaReport<TArrayOutput>

      for (const checkable of childCheckables) {
        const result = checkable['~c'](input as TArrayOutput)
        if (result) {
          baseReport.metaData.score += 1
          baseReport.metaData.passedIds!.add(checkable['~id'])
        }
        else {
          (baseReport as unknown as SchemaReportFailure).success = false
          const failureReport = baseReport as unknown as SchemaReportFailure
          failureReport.metaData.failedIds ??= new Set<symbol>()
          failureReport.metaData.failedIds.add(checkable['~id'])
        }
      }

      if (baseReport.success) {
        const parsedElements: TElementOutput[] = []

        for (let inputIndex = 0; inputIndex < input.length; inputIndex++) {
          const element = input[inputIndex]
          const elementReport = elementSchema.safeParse(element)
          // PATH PLACEHOLDER: set array element path metadata here when available

          elementReport.metaData.path = {
            pathType: 'arrayLikeElement',
            index: inputIndex,
          }

          baseReport.metaData.score += elementReport.metaData.score

          if (elementReport.success) {
            parsedElements.push(elementReport.data)
          }
          else {
            (baseReport as unknown as SchemaReportFailure).success = false
            const failureReport = baseReport as unknown as SchemaReportFailure
            failureReport.metaData.failedIds ??= new Set<symbol>()
            if (elementReport.metaData.failedIds) {
              elementReport.metaData.failedIds.forEach(id => failureReport.metaData.failedIds!.add(id))
            }
          }
        }

        baseReport.data = parsedElements as unknown as TArrayOutput
      }

      if (!baseReport.success) {
        delete baseReport.data
      }

      sourceReport = baseReport
    }

    return mergeOptionality(input, sourceReport, optionalityBranchCheckable)
  }

  return {
    safeParse,
    parse: (input: unknown) => {
      const report = safeParse(input)
      if (report.success) {
        return report.data as TArrayOutput
      }
      throw new Error('Input did not pass schema checks')
    },
  }
}
