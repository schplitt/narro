export type SchemaReport<T = any> = SchemaReportSuccess<T> | SchemaReportFailure

export interface SchemaReportSuccess<T> {
  passed: true

  value: T

  /**
   * Aggregated score of all checks
   * Can be negative
   */
  score: number
  /**
   * Maximum achievable aggregated score
   */
  maxScore: number

  /**
   * Union reports
   * Only if present if a different "path" could be taken to validate the input
   * e.g. in case of union schemas like `union([string(), number()])` or `.nullable()`
   */
  unionReports?: SchemaReport[]
}

export interface SchemaReportFailure {
  passed: false

  value?: undefined

  /**
   * Aggregated score of all checks
   * Can be negative
   */
  score: number
  /**
   * Maximum achievable aggregated score
   */
  maxScore: number
}
