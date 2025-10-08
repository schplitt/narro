import type { SchemaReport } from '../types/report'
import type { BranchCheckable, Checkable } from '../types/schema'

export function deduplicateCheckables<TOutput>(checkables: Checkable<TOutput>[]): Checkable<TOutput>[] {
  const checkableMap = new Map<symbol, Checkable<TOutput>>()
  for (const checkable of checkables) {
    checkableMap.set(checkable['~id'], checkable)
  }
  return Array.from(checkableMap.values())
}

export function mergeOptionality<TOutput>(
  input: unknown,
  sourceReport: SchemaReport<TOutput>,
  optionalityBranchCheckable: BranchCheckable<TOutput> | undefined,
): SchemaReport<TOutput> {
  if (!optionalityBranchCheckable) {
    return sourceReport
  }

  const optionalityReport = optionalityBranchCheckable['~c'](input) as SchemaReport<TOutput>
  if (!optionalityReport.passed) {
    delete optionalityReport.value
  }

  if (sourceReport.passed && optionalityReport.passed) {
    throw new Error('Both source and optionality checkables passed, this should never happen')
  }

  if (sourceReport.passed) {
    sourceReport.unionReports = [optionalityReport]
    return sourceReport
  }

  if (optionalityReport.passed) {
    optionalityReport.unionReports = [sourceReport]
    return optionalityReport
  }

  const higherScoreReport = sourceReport.score >= optionalityReport.score ? sourceReport : optionalityReport
  const lowerScoreReport = higherScoreReport === sourceReport ? optionalityReport : sourceReport

  if (lowerScoreReport) {
    higherScoreReport.unionReports = [lowerScoreReport]
  }

  return higherScoreReport
}
