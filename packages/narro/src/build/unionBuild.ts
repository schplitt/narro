import type { SchemaReport } from '../types/report'
import type { BranchCheckable, BranchCheckableImport, BuildableSchema, EvaluableSchema } from '../types/schema'
import { flattenUnionReportCandidates, selectPreferredUnionReport } from './utils'

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

    const consolidatedReports = flattenUnionReportCandidates(reports)

    return selectPreferredUnionReport(consolidatedReports)
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

// in unions schema it might make sense to consolidate all the union reports and the union reports of the union reports into the top level array
// Are there any issues that could occurre from doing this?
// it could make the trace harder to follow as the union is then not in the schema that originally produced that report
// though those unions dont really add any "real" value anyway as it does not REALLY add value to know that the undefined was added through string().undefinable()
// we could add another part to the metadata afterwards to add through which the expected values were, error message and from which call chain it originated from
// if the above is done, there is nothing "lost" in the trace and we can consolidate all union reports into one array at the top level

// Implementation plan:
// - implement union report consolidation in the union build function
// - add tests in a new file unionBuild.test.ts to verify that the consolidation works as expected
// - add logic to check if the checkIds in objectBuild fails, there is another union schema to promote (starting with the one with the highest score) and execute the checkIds on that schema
//   if it passes, promote that report as the selected one and demote the one that failed

// no better, to have correctness, we should check the report and all its union reports in the object and change them accordingly
// afterwards we promote the passed one with the highest score or the first one if multiple have the same score add all other reports to its union reports
// so we build an array of all the reports (originally passed one + its union reports) and then check each of them if they pass the checkIds, adjust their score accordingly, delete data if necessary
// afterwards we select the best report again and return that
// if none passed, we return the original report (which is the one with the highest score)

// Plan summary:
// - unionBuild.ts: consolidate unionReports recursively into a flat array, reselect best report after consolidation, and add a comment for future feature where we ensure metadata continues to track original branches.
// - unionBuild.ts: when a promoted report fails downstream (e.g. object checkIds), iterate promoted + stored union reports to find the highest scoring passing candidate, demote failing ones, and update unionReports accordingly.
// - objectBuild.ts: extend checkIds handling to walk the selected union report set, run checkIds against each candidate, adjust scores, remove invalid data, and bubble updated unionReports back into the chosen result.
// - tests/__tests__/narro: add unionBuild.test.ts covering union report consolidation edge cases and object schema interactions; add targeted object schema tests for optionality/union promotion scenarios.
