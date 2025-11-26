export type SchemaReport<T = any> = SchemaReportSuccess<T> | SchemaReportFailure

/**
 * Path for object structures
 */
export interface ObjectPropertyPath {
  pathType: 'objectProperty'
  key: string
}

/**
 * Path for array-like structures like arrays or tuples
 */
export interface ArrayLikeElementPath {
  pathType: 'arrayLikeElement'
  index: number
}

/**
 * When no path is present, it is a primitive value (string, number, ...) or the root of the schema
 */
export type SchemaPath = ObjectPropertyPath | ArrayLikeElementPath

export interface SchemaReportSuccess<T> {
  success: true

  data: T

  metaData: {
    /**
     * To keep track of what checkables passed
     */
    passedIds: Set<symbol>

    /**
     * Aggregated score of all checks
     * Can be negative
     */
    score: number

    /**
     * Union reports
     * Only if present if a different "path" could be taken to validate the input
     * e.g. in case of union schemas like `union([string(), number()])` or `.nullable()`
     */
    unionReports?: SchemaReport[]

    childReports?: SchemaReport[]

    path?: SchemaPath
  }
}

export interface SchemaReportFailure {
  success: false

  data?: undefined

  metaData: {
    passedIds?: Set<symbol>
    failedIds: Set<symbol>

    /**
     * Aggregated score of all checks
     * Can be negative
     */
    score: number

    unionReports?: SchemaReport[]

    childReports?: SchemaReport[]

    path?: SchemaPath

    getErrorMessages: () => string[]
  }
}
