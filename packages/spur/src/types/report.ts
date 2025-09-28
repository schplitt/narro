export type SchemaReport<T = any> = SchemaReportSuccess<T> | SchemaReportFailure

export interface SchemaReportSuccess<T> {
  passed: true

  value: T

  /**
   * Aggregated score of all checks
   * Can be negative
   */
  score: number

  // TODO: currently unsure what we should do with the child reports
  // to be honest, they do not really have any use as we can see what failed due to heuristics
  // but might be able i guess we should keep it for now

  /**
   * Union reports
   * Only if present if a different "path" could be taken to validate the input
   * e.g. in case of union schemas like `union([string(), number()])` or `.nullable()`
   */
  unionReports?: SchemaReport[]

  // TODO: in any schema of any kind i would need to know what the maximum score, BEFORE we compile it, so at build time, what means we have to have this in the return of the build function
  // or we could tranverse up the tree WHEN we need it as this might not be needed all the time
}

export interface SchemaReportFailure {
  passed: false

  value?: undefined

  /**
   * Aggregated score of all checks
   * Can be negative
   */
  score: number

  unionReports?: SchemaReport[]

}
