export interface Report {
  passed: boolean
  /**
   * Aggregated score of all checks
   * Can be negative
   */
  score: number
  /**
   * Maximum achievable aggregated score
   */
  maxScore: number

  subReports?: {
    [key: string]: Report
  }
}
