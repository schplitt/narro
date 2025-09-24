export interface SchemaReport {
  'passed': boolean
  /**
   * Aggregated score of all checks
   * Can be negative
   */
  'score': number
  /**
   * Maximum achievable aggregated score
   */
  'maxScore': number

  '~id': symbol

  'subReports'?: {
    [key: string]: SchemaReport
  }
}
