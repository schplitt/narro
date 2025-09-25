import type { CommonOptions } from './types/options'
import type { SchemaReport } from './types/report'
import type { BuildableSchema, Checkable, CheckableImport, EvaluableSchema, SourceCheckable, SourceCheckableImport } from './types/schema'

const cache = new Map<string, any>()

export function createSchemaCacheKey(sourceId: symbol, importIds: symbol[], options?: CommonOptions): string {
  const hashInput = [sourceId, ...importIds]
    .map(id => id.toString())
    .concat([JSON.stringify(options, Object.keys(options ?? {}).sort())])
    .join('|')

  // TODO: hashing is unecessary complex here, we can just use the string directly as key
  return hashInput
}

export async function buildSchema<TOutput, TSchema extends BuildableSchema<TOutput>>(schema: TSchema): Promise<EvaluableSchema<TOutput>> {
  return schema['@build']()
}

export async function build<TOutput>(sourceCheckableImport: SourceCheckableImport<TOutput>, checkableImports: CheckableImport<TOutput>[] = [], options?: CommonOptions): Promise<EvaluableSchema<TOutput>> {
// we start with importing the source checkable and then all other checkables
  const sourcePromise = sourceCheckableImport()
  const importPromises = checkableImports.map(ci => ci())

  const [sourceCheckable, ...checkables] = await Promise.all([sourcePromise, ...importPromises])

  // now we need to deduplicate the import promises via the ids to only keep the latest e.g. if two checkables have the same id, we keep the last one
  // we use a map for that
  const checkableMap = new Map<symbol, Checkable<any>>()
  for (const checkable of checkables) {
    checkableMap.set(checkable['~id'], checkable)
  }

  const cacheKey = createSchemaCacheKey(sourceCheckable['~id'], Array.from(checkableMap.keys()), options)

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }

  // if not in cache we build the schema
  const evaluableSchema = buildEvaluableSchema(sourceCheckable, Array.from(checkableMap.values()), options)
  cache.set(cacheKey, evaluableSchema)
  return evaluableSchema
}

/**
 *
 * @param sourceCheckable
 * @param uniqueCheckables Already deduplicated checkables
 * @param options
 */
export function buildEvaluableSchema<TOutput>(sourceCheckable: SourceCheckable<TOutput>, uniqueCheckables: Checkable<TOutput>[], options?: CommonOptions): EvaluableSchema<TOutput> {
  function safeParse(input: unknown): SchemaReport {
    const sourceResult = sourceCheckable['~c'](input)
    if (!sourceResult) {
      // create report
      return {
        passed: false,
        score: 0,
        maxScore: uniqueCheckables.reduce((acc, c) => acc + c.maxScore, 1 /** 1 for sourceCheckable */),
      }
    }

    if (uniqueCheckables.length === 0) {
      return {
        passed: true,
        score: 1,
        maxScore: 1,
      }
    }

    return uniqueCheckables.reduce((acc, c) => {
      const r = c['~c'](input)
      acc.maxScore += r.maxScore
      acc.score += r.score
      acc.passed = acc.passed && r.passed
      return acc
    }, {
      maxScore: 1 /* 1 for sourceCheckable */,
      score: 1 /* 1 for sourceCheckable */,
      passed: true,
    } as Required<SchemaReport>)
  }

  return {
    safeParse,
    parse: (input) => {
      const report = safeParse(input)
      if (report.passed) {
        return input as TOutput
      }
      throw new Error('Input did not pass schema checks')
    },
  }
}
