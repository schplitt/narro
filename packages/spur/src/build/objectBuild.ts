import type { ObjectEntries } from '../leitplanken/object'
import type { ObjectShape } from '../options/objectOptions'
import type { SchemaReport, SchemaReportFailure } from '../types/report'
import type { BranchCheckable, BranchCheckableImport, EvaluableSchema, SourceCheckable, SourceCheckableImport } from '../types/schema'
import { exactOptionalSymbol } from '../leitplanken/_shared/optionality/exactOptional'
import { nullishSymbol } from '../leitplanken/_shared/optionality/nullish'
import { undefinableSymbol } from '../leitplanken/_shared/optionality/undefinable'
import { undefinedSymbol } from '../leitplanken/undefined/undefined'

interface ObjectSchemas {
  key: string
  schema: EvaluableSchema<any>
}

export async function buildEvaluableObjectSchema<TOutput extends object>(
  sourceCheckableImport: SourceCheckableImport<TOutput>,
  optionalityBranchCheckableImport: BranchCheckableImport<TOutput> | undefined,
  objectEntries: ObjectEntries,
  shapeTransform: ObjectShape,

): Promise<EvaluableSchema<TOutput>> {
  // we start with importing the source checkable and then all other checkables
  const sourcePromise = sourceCheckableImport()
  const optionalityPromise = optionalityBranchCheckableImport ? optionalityBranchCheckableImport() : Promise.resolve(undefined)
  const objectSchemasPromise: Promise<ObjectSchemas[]> = Promise.all(
    Object.entries(objectEntries).map(async ([key, schema]) => {
      const builtSchema = await schema['~build']()
      return { key, schema: builtSchema }
    }),
  )
  const [sourceCheckable, optionalityCheckable, objectSchemas] = await Promise.all([sourcePromise, optionalityPromise, objectSchemasPromise])

  // TODO: we could include a cache here but we need to test if computing the cache key is cheaper than just building the schema
  // ! TRANSFORM should have unique id as we dont want to share the same transform between different objects

  return buildObjectSchema(sourceCheckable, optionalityCheckable, objectSchemas, shapeTransform)
}

export async function buildEvaluableObjectSchemaWithTransform<TOutput extends object, TTransformOutput>(
  sourceCheckableImport: SourceCheckableImport<TOutput>,
  optionalityBranchCheckableImport: BranchCheckableImport<TOutput> | undefined,
  objectEntries: ObjectEntries,
  shapeTransform: ObjectShape,
  transformFn: (input: TOutput) => TTransformOutput,
): Promise<EvaluableSchema<TTransformOutput>> {
  const baseSchema = await buildEvaluableObjectSchema(sourceCheckableImport, optionalityBranchCheckableImport, objectEntries, shapeTransform)
  return {
    safeParse: (input: unknown) => {
      const result = baseSchema.safeParse(input)
      if (result.passed) {
        return {
          ...result,
          value: transformFn(result.value),
        }
      }
      return result as any as SchemaReport<TTransformOutput>
    },
    parse: (input: unknown) => {
      const result = baseSchema.parse(input)
      return transformFn(result)
    },
  }
}

export function buildObjectSchema<TOutput extends object>(
  sourceCheckable: SourceCheckable<TOutput>,
  optionalityBranchCheckable: BranchCheckable<TOutput> | undefined,
  objectSchemas: ObjectSchemas[],
  shapeTransform: ObjectShape,
): EvaluableSchema<TOutput> {
  function safeParse(input: unknown): SchemaReport<TOutput> {
    let sourceReport: SchemaReport<TOutput>

    const sourceResult = sourceCheckable['~c'](input)

    if (!sourceResult) {
      const failedIds = new Set<symbol>()
      failedIds.add(sourceCheckable['~id'])
      // here we build the sourceReport from the checkables
      sourceReport = {
        passed: false,
        score: 0,
        failedIds,
      }
    }
    else {
      // if the source checkable passed, we continue with the object entries and add 1 to the score for each valid
      sourceReport = objectSchemas.reduce((acc, value) => {
        // here we would now need to check what the actual options of the object are so we have to actually keep track of it in the schemas
        // but this would go against the source philosophy  that the user can mess with the schema after creation
        // we could differentiate the optionallity checks to be overloadable where it either takes a single "unknown" value OR an object with a key
        // but there is no way to get the object value THROUGH to the checkable
        // we could expose a function that would allow us to call it, but that would not actually be different from having the option and doing the check ourselves
        // as this is only on the object here, we can just do the check ourselves

        // we only do the check on the special cases where we know the keys should not be there?
        // though now we have the issue of not knowing if the check passed because of the schema or the modifier
        // we COULD do the check twice here? but we lose performance here
        // OR we can add the id symbol to the report and see if it passed
        // if it passed we take a look at what id it passed
        // if it is the exactOptional OR the default(? unsure actually whiche ones) as those are the ones where the key/balue paring has meaning
        // this would mean we have access to the id in the report ASWELL as the ids of the checkables. If we import the ids, we increase the default bundle size 2 always include those 2 when using objects even when they are not used by the user.
        // tbh in a real world usecase, most users WILL somewhere use an object AND the default modifier, though not the exact optional one
        // i think it is fine if we create extra files for the ids for these 2 checkables to keep the bundle size down for people not using objects
        // but have a slightly different file structure

        // the optionallity check report is present always, so we just have to convert the id set to only include the "source" like "string", "number", "optional", "default", "nullable" and not childChecks
        // child checks most likely dont need ids, though they can be useful if we would want to decide at which point the schema failed
        // so we can just check all the passed ids and if optional is in there (most likely it will be the only one but dont care) we check the KV pair
        // this way we dont need the options passed
        // so the ids in the report would be:
        // ~~passed report: [passedId, ...passedId[]]~~
        // ~~faild report would be: [faildId] | [passedId, ...(passedId | faildId)[]]~~
        // though we would care(?) about the order of the ids as we take everything anyway for the score
        // so in the failed case we can just keep passed and failed ids separate
        // in the passed case we have only passed ids anyway so we can just keep that as is
        // -> PASSED: { passedIds: Set<symbol> }
        // -> FAILED: { passedIds: Set<symbol>, failedIds: Set<symbol> }, just keep the empty set on there

        // PLAN:
        // Prerequisites:
        // - add the ids to the report
        //   - passed: { passedIds: Set<symbol> }
        //   - failed: { passedIds: Set<symbol>, failedIds: Set<symbol> }
        // - export the symbols for optional, exactOptional, undefinable, nullable, undefined(schema) from a standalone file for bundle size purposes
        // - import ONLY the symbols here
        // Process:
        // - if the schema passed, we check the passedIds
        // - if the ids of symbols below are present(are most likely the only ones) we check the KV pair
        //   - Check necessary for: "exactOptional", "nullish", "undefinable", "undefined"(extra schema)
        // - for "nullish", "undefinable", "undefined"(schema) we verify that the KEY is present
        //   - if the key is not present, it means the value was undefined as a result of the key not being present -> fail
        //   - if the key is present, it means the value was valid and the key was present -> pass
        // - for "exactOptional" we verify that the KEY is NOT present
        //   - if the key is present, it means the value was actually "undefined" and the key was present -> fail
        //   - if the key is not present, it means the value was valid and the key was not present -> pass
        const { key, schema } = value
        const result = schema.safeParse((input)[key as keyof object])
        // add their score in any case
        acc.score += result.score

        if (result.passed) {
          // TODO: do we really want to "count them twice"?
          // for now dont do it
          // acc.score += 1
          const ids = checkIds(result.passedIds, key, input as object)
          if (ids) {
            // we have a failure here as the ids check failed
            acc.passed = false
            // TODO: think about what we want to do with the 4 special cases here
            ids.forEach(() => {
              // reduce the score by 1 for each failed id (to compensate them pass on the upper level)
              acc.score -= 1
            })
          }
          else {
            // TODO: do we add them to the passed set?
            // if we
            // concat the value to the object
            (acc.value as any)[key] = result.value
          }
        }
        else {
          acc.passed = false
        }
        return acc
      }, {
        passed: true,
        // empty object as we will fill it with the valid entries
        value: {},
        // start with 1 for the source checkable
        score: 1,
      } as SchemaReport<TOutput>)
    }

    if (!sourceReport.passed) {
      delete sourceReport.value
    }

    // ---- PUT INTO OWN SHAPE FUNCTION ----
    else {
      // if it passed, we apply the shape transform
      switch (shapeTransform) {
        case 'passthrough':
          // we add the extra keys of the input object to the value
          Object.entries(input as object).forEach(([key, value]) => {
            if (!(key in (sourceReport.value as object))) {
              (sourceReport.value as any)[key] = value
            }
          })
          break
        case 'strip':
          // do nothing as we already stripped the keys
          break
        case 'strict':
        {
          // we check if there are any extra keys in the input object that are not in the value
          let hasExtraKeys = false
          for (const key in input as object) {
            if (!(key in (sourceReport.value as object))) {
              hasExtraKeys = true
            }
            if (hasExtraKeys) {
              break
            }
          }
          // we have an extra key, so we fail the report
          (sourceReport as any as SchemaReportFailure).passed = false
          // we add the source checkable id to the failed ids
          if (!(sourceReport as any as SchemaReportFailure).failedIds) {
            (sourceReport as any as SchemaReportFailure).failedIds = new Set<symbol>()
          }
          // TODO?: think about if we want extra IDs for the shapes
          (sourceReport as any as SchemaReportFailure).failedIds.add(sourceCheckable['~id'])
          // we remove the value as it is now invalid
          delete (sourceReport as any as SchemaReportFailure).value
          break
        }
      }
    }

    // ---- PUT INTO OWN SHAPE FUNCTION END ----

    // ---- PUT INTO OWN OPTIONALITY FUNCTION ----

    // now after the checks are done, we continue with the optionality checkable if present
    const optionalityReport = optionalityBranchCheckable ? optionalityBranchCheckable['~c'](input) : undefined
    // remove the value prop if the optionality report did not pass
    if (optionalityReport && !optionalityReport.passed) {
      delete optionalityReport.value
    }

    // now we return the report that "passed" and put the other report into the unionReports
    // if none passed, we return the one with the higher score and put the other into the unionReports
    // if both passed (for whatever reason), we should throw an error as this should not happen
    if (sourceReport.passed && optionalityReport?.passed) {
      throw new Error('Both source and optionality checkables passed, this should never happen')
    }

    // if only one passed, return that one
    if (sourceReport.passed) {
      if (optionalityReport) {
        sourceReport.unionReports = [optionalityReport]
      }
      return sourceReport
    }
    if (optionalityReport?.passed) {
      if (sourceReport) {
        optionalityReport.unionReports = [sourceReport]
      }
      return optionalityReport
    }

    // both failed, return the one with the higher score and put the other into the unionReports
    const higherScoreReport = sourceReport.score >= (optionalityReport?.score ?? -1) ? sourceReport : optionalityReport!
    const lowerScoreReport = higherScoreReport === sourceReport ? optionalityReport : sourceReport

    if (lowerScoreReport) {
      higherScoreReport.unionReports = [lowerScoreReport]
    }

    return higherScoreReport
    // ---- PUT INTO OWN SHAPE OPTIONALITY END ----
  }

  return {
    safeParse,
    parse: (input: unknown) => {
      const result = safeParse(input)
      if (result.passed) {
        return result.value as TOutput
      }
      else {
        throw new Error('Invalid input')
      }
    },
  }
}

export function checkIds(passedIds: Set<symbol>, key: string, source: object): symbol[] | void {
  // we check if the passed ids include any of the special ones
  const ids: symbol[] = []
  const isKeyInSource = key in source

  // exactOptional needs the key to NOT be present
  if (passedIds.has(exactOptionalSymbol) && !isKeyInSource)
    ids.push(exactOptionalSymbol)
  // nullish, undefinable and undefined all need the key to be present
  if (passedIds.has(nullishSymbol) && isKeyInSource)
    ids.push(nullishSymbol)
  if (passedIds.has(undefinableSymbol) && isKeyInSource)
    ids.push(undefinableSymbol)
  if (passedIds.has(undefinedSymbol) && isKeyInSource)
    ids.push(undefinedSymbol)

  if (ids.length > 0)
    return ids
}
