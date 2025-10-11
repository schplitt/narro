import type { SchemaReport } from '../types/report'
import type { BranchCheckable, BranchCheckableImport, BuildableSchema, EvaluableSchema } from '../types/schema'

export async function buildEvaluableUnionSchema<TSchemas extends readonly BuildableSchema<any, any, any>[], TOutput>(
  schemas: TSchemas,
  optionalityBranchCheckableImport: BranchCheckableImport<any> | undefined,
): Promise<EvaluableSchema<TOutput>> {
  if (schemas.length === 0) {
    throw new Error('Union requires at least one schema')
  }

  const optionalityPromise = optionalityBranchCheckableImport?.() ?? undefined
  const evaluableSchemasPromise = Promise.all(schemas.map(schema => schema.build()))

  const [optionalityBranchCheckable, evaluableSchemas] = await Promise.all([optionalityPromise, evaluableSchemasPromise])

  return buildUnionSchema<TOutput>(evaluableSchemas, optionalityBranchCheckable)
}

export async function buildEvaluableUnionSchemaWithTransform<
  TSchemas extends readonly BuildableSchema<any, any, any>[],
  TOutput,
  TTransformOutput,
>(
  schemas: TSchemas,
  optionalityBranchCheckableImport: BranchCheckableImport<any> | undefined,
  transformFn: (input: TOutput) => TTransformOutput,
): Promise<EvaluableSchema<TTransformOutput>> {
  const baseSchema = await buildEvaluableUnionSchema<TSchemas, TOutput>(schemas, optionalityBranchCheckableImport)

  return {
    safeParse: (input: unknown) => {
      const report = baseSchema.safeParse(input) as SchemaReport<TOutput>
      if (report.success) {
        return {
          ...report,
          data: transformFn(report.data),
        } as SchemaReport<TTransformOutput>
      }

      return report as SchemaReport<TTransformOutput>
    },
    parse: (input: unknown) => {
      const value = baseSchema.parse(input)
      return transformFn(value)
    },
  }
}

export function buildUnionSchema<TOutput>(
  evaluableSchemas: readonly EvaluableSchema<any>[],
  optionalityBranchCheckable: BranchCheckable<any> | undefined,
): EvaluableSchema<TOutput> {
  if (evaluableSchemas.length === 0 && !optionalityBranchCheckable) {
    throw new Error('Union requires at least one schema')
  }

  function safeParse(input: unknown): SchemaReport<TOutput> {
    const reports: SchemaReport<TOutput>[] = []

    for (const schema of evaluableSchemas) {
      const report = schema.safeParse(input) as SchemaReport<TOutput>
      if (!report.success) {
        delete (report as any).data
      }
      reports.push(report)
    }

    if (optionalityBranchCheckable) {
      const optionalityReport = optionalityBranchCheckable['~c'](input) as SchemaReport<TOutput>
      if (!optionalityReport.success) {
        delete optionalityReport.data
      }
      reports.push(optionalityReport)
    }

    if (reports.length === 0) {
      throw new Error('Union requires at least one schema')
    }

    let bestReport: SchemaReport<TOutput> | undefined
    for (const report of reports) {
      bestReport = bestReport ? selectBetterReport(bestReport, report) : report
    }

    if (!bestReport) {
      throw new Error('Union requires at least one schema')
    }

    const remainingReports = reports.filter(report => report !== bestReport)
    if (remainingReports.length > 0) {
      const existingUnionReports = bestReport.metaData.unionReports ?? []
      bestReport.metaData.unionReports = existingUnionReports.length > 0
        ? [...existingUnionReports, ...remainingReports]
        : remainingReports
    }

    return bestReport
  }

  return {
    safeParse,
    parse: (input: unknown) => {
      const report = safeParse(input)
      if (report.success) {
        return report.data as TOutput
      }
      throw new Error('Input did not match any union branch')
    },
  }
}

function selectBetterReport<TOutput>(
  currentBest: SchemaReport<TOutput>,
  candidate: SchemaReport<TOutput>,
): SchemaReport<TOutput> {
  if (candidate.success) {
    if (!currentBest.success) {
      return candidate
    }
    return candidate.metaData.score > currentBest.metaData.score ? candidate : currentBest
  }

  if (currentBest.success) {
    return currentBest
  }

  return candidate.metaData.score > currentBest.metaData.score ? candidate : currentBest
}
