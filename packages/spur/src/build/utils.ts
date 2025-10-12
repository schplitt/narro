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

  if (!optionalityReport.success) {
    delete optionalityReport.data
  }

  if (sourceReport.success && optionalityReport.success) {
    throw new Error('Both source and optionality checkables passed, this should never happen')
  }

  if (sourceReport.success) {
    sourceReport.metaData.unionReports = [optionalityReport]
    return sourceReport
  }

  if (optionalityReport.success) {
    optionalityReport.metaData.unionReports = [sourceReport]
    return optionalityReport
  }

  const higherScoreReport = sourceReport.metaData.score >= optionalityReport.metaData.score ? sourceReport : optionalityReport
  const lowerScoreReport = higherScoreReport === sourceReport ? optionalityReport : sourceReport

  higherScoreReport.metaData.unionReports = [lowerScoreReport]

  return higherScoreReport
}

/**
 * Flatten a union report tree into a list of candidates, removing nested union metadata in-place.
 */
export function flattenUnionReportCandidates<TOutput>(reports: SchemaReport<TOutput>[]): SchemaReport<TOutput>[] {
  const flattened: SchemaReport<TOutput>[] = []

  function collect(report: SchemaReport<TOutput>): void {
    flattened.push(report)
    const unionReports = report.metaData.unionReports
    if (!unionReports) {
      return
    }
    delete report.metaData.unionReports
    for (const nested of unionReports) {
      collect(nested)
    }
  }

  for (const report of reports) {
    collect(report)
  }

  return flattened
}

/**
 * Pick the preferred report from a flattened candidate list, prioritizing successful reports with the highest score.
 * Remaining candidates are reattached as union reports on the selected report.
 */
export function selectPreferredUnionReport<TOutput>(reports: SchemaReport<TOutput>[]): SchemaReport<TOutput> {
  let bestSuccessful: SchemaReport<TOutput> | undefined
  let bestSuccessfulScore = -Infinity
  let bestOverall: SchemaReport<TOutput> | undefined
  let bestOverallScore = -Infinity

  for (const report of reports) {
    const score = report.metaData.score

    if (score > bestOverallScore) {
      bestOverall = report
      bestOverallScore = score
    }

    if (report.success && score > bestSuccessfulScore) {
      bestSuccessful = report
      bestSuccessfulScore = score
    }
  }

  const selected = bestSuccessful ?? bestOverall

  const remainder: SchemaReport<TOutput>[] = []
  for (const report of reports) {
    if (report !== selected) {
      remainder.push(report)
    }
  }

  if (remainder.length > 0) {
    selected!.metaData.unionReports = remainder
  }
  else if (selected!.metaData.unionReports) {
    delete selected!.metaData.unionReports
  }

  return selected!
}
