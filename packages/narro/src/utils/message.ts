import type { SchemaReport, SchemaReportFailure } from '../types/report'

/**
 * Prettify a schema report into a human-readable string
 * @param report The schema report to prettify
 * @returns A human-readable string representation of the report
 */
export function prettifyReport(report: SchemaReportFailure): string {
  throw new Error('Not implemented yet')
  return ''
}
// here we define how we would like to show the report in a pretty way.
// via the scores we KNOW what failed and what passed, where it failed and where it passed
// also what the most likely cause of the failure is

// we need a way to get the corresponding error message FROM everything that went wrong.
// however this is not so easy in an object as the error message for when an exactOptional fails it is that the key had the value undefined and not missing
// but this is checked on another level
// so we cannot just add a function to the chackable that returns the error message for a given value
// though we could just say in the error message that either OR went wrong but that doesnt really make sense

// BUT we could create a generic input parameter for said function that has 1 the actual value AND a 2nd object
// that object has if it comes from an object and if the key was present or not

// then we could use that to create better error messages
// we would only just need to collect that information during the checking phase
// but that would not be too hard either
