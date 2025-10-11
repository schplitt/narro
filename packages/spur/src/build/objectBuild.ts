import type { ObjectEntries } from '../leitplanken/object'
import type { ObjectShape } from '../options/objectOptions'
import type { SchemaReport, SchemaReportFailure } from '../types/report'
import type { BranchCheckable, BranchCheckableImport, EvaluableSchema, SourceCheckable, SourceCheckableImport } from '../types/schema'
import { exactOptionalSymbol } from '../leitplanken/_shared/optionality/exactOptional'
import { nullishSymbol } from '../leitplanken/_shared/optionality/nullish'
import { undefinableSymbol } from '../leitplanken/_shared/optionality/undefinable'
import { undefinedSymbol } from '../leitplanken/undefined/undefined'
import { mergeOptionality } from './utils'

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
      const builtSchema = await schema.build()
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
      if (result.success) {
        return {
          ...result,
          data: transformFn(result.data),
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
        success: false,
        metaData: {
          score: 0,
          failedIds,
        },
      }
    }
    else {
      // if the source checkable passed, we continue with the object entries and add 1 to the score for each valid
      sourceReport = objectSchemas.reduce((acc, value) => {
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
        result.metaData.path = {
          pathType: 'objectProperty',
          key,
        }
        // PATH PLACEHOLDER: set object path metadata here when available
        // add their score in any case
        acc.metaData.score += result.metaData.score

        if (result.success) {
          // TODO: do we really want to "count them twice"?
          // for now dont do it
          // acc.score += 1
          if (!result.metaData.passedIds) {
            result.metaData.passedIds = new Set<symbol>()
          }

          const ids = checkIds(result.metaData.passedIds, key, input as object)
          if (ids) {
            // we have a failure here as the ids check failed
            acc.success = false
            // TODO: think about what we want to do with the 4 special cases here
            ids.forEach(() => {
              // reduce the score by 1 for each failed id (to compensate them pass on the upper level)
              acc.metaData.score -= 1
            })
          }
          else {
            // TODO: do we add them to the passed set?
            // if we
            // concat the value to the object
            (acc.data as any)[key] = result.data
          }
        }
        else {
          acc.success = false
        }

        acc.metaData.childReports!.push(result)

        return acc
      }, {
        success: true,
        // empty object as we will fill it with the valid entries
        data: {},
        // start with 1 for the source checkable
        metaData: {
          score: 1,
          passedIds: new Set<symbol>(),
          childReports: [] as any,
        },
      } as SchemaReport<TOutput>)
    }

    if (!sourceReport.success) {
      delete sourceReport.data
    }

    // ---- PUT INTO OWN SHAPE FUNCTION ----
    else {
      // if it passed, we apply the shape transform
      switch (shapeTransform) {
        case 'passthrough':
          // we add the extra keys of the input object to the value
          Object.entries(input as object).forEach(([key, value]) => {
            if (!(key in (sourceReport.data as object))) {
              (sourceReport.data as any)[key] = value
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
            if (!(key in (sourceReport.data as object))) {
              hasExtraKeys = true
            }
            if (hasExtraKeys) {
              break
            }
          }
          // we have an extra key, so we fail the report
          (sourceReport as any as SchemaReportFailure).success = false
          // we add the source checkable id to the failed ids
          if (!(sourceReport as any as SchemaReportFailure).metaData.failedIds) {
            (sourceReport as any as SchemaReportFailure).metaData.failedIds = new Set<symbol>()
          }
          // TODO?: think about if we want extra IDs for the shapes
          (sourceReport as any as SchemaReportFailure).metaData.failedIds.add(sourceCheckable['~id'])
          // we remove the value as it is now invalid
          delete (sourceReport as any as SchemaReportFailure).data
          break
        }
      }
    }

    // ---- PUT INTO OWN SHAPE FUNCTION END ----

    return mergeOptionality(input, sourceReport, optionalityBranchCheckable)
  }

  return {
    safeParse,
    parse: (input: unknown) => {
      const result = safeParse(input)
      if (result.success) {
        return result.data as TOutput
      }
      else {
        throw new Error('Invalid input')
      }
    },
  }
}

export function checkIds(passedIds: Set<symbol>, key: string, source: object): symbol[] | void {
  // we check if the passed ids include any of the special ones
  // ids that end up in the array were CORRECTLY parsed
  // but we need to verify
  const incorrectlyParsedIds: symbol[] = []
  const isKeyInSource = key in source

  // exactOptional needs the key to NOT be present
  // therefor if the key IS present, it means the value was actually "undefined" and the key was present -> fail
  if (passedIds.has(exactOptionalSymbol) && isKeyInSource)
    incorrectlyParsedIds.push(exactOptionalSymbol)
  // nullish, undefinable and undefined all need the key to be present
  // therefor if the key is NOT present, it means the value was undefined as a result of the key not being present -> fail
  if (passedIds.has(nullishSymbol) && !isKeyInSource)
    incorrectlyParsedIds.push(nullishSymbol)
  if (passedIds.has(undefinableSymbol) && !isKeyInSource)
    incorrectlyParsedIds.push(undefinableSymbol)
  if (passedIds.has(undefinedSymbol) && !isKeyInSource)
    incorrectlyParsedIds.push(undefinedSymbol)

  if (incorrectlyParsedIds.length > 0)
    return incorrectlyParsedIds
}
