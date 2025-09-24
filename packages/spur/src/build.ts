import type { CommonOptions } from './types/common'
import type { BuildableSchema, Checkable, CheckableImport, EvaluableSchema, SourceCheckable, SourceCheckableImport } from './types/schema'

const cache = new Map<string, any>()

export async function createSchemaCacheKey(sourceId: symbol, importIds: symbol[], options: CommonOptions): Promise<string> {
  const hashInput = [sourceId, ...importIds]
    .map(id => id.toString())
    .concat([JSON.stringify(options, Object.keys(options).sort())])
    .join('|')

  const encoder = new TextEncoder()
  const data = encoder.encode(hashInput)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function buildSchema<TOutput, TSchema extends BuildableSchema<TOutput>>(schema: TSchema): Promise<EvaluableSchema<TOutput>> {
  return schema['@build']()
}

export async function build<TOutput>(sourceCheckableImport: SourceCheckableImport<TOutput>, checkableImports: CheckableImport<TOutput>[], options: CommonOptions): Promise<EvaluableSchema<TOutput>> {
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

  const cacheKey = await createSchemaCacheKey(sourceCheckable['~id'], Array.from(checkableMap.keys()), options)

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }

  // if not in cache we build the schema
  const evaluableSchema = await buildEvaluableSchema(sourceCheckable, Array.from(checkableMap.values()), options)
  cache.set(cacheKey, evaluableSchema)
  return evaluableSchema
}

/**
 *
 * @param sourceCheckable
 * @param uniqueCheckables Already deduplicated checkables
 * @param options
 */
export async function buildEvaluableSchema<TOutput>(sourceCheckable: SourceCheckable<TOutput>, uniqueCheckables: Checkable<TOutput>[], options: CommonOptions): Promise<EvaluableSchema<TOutput>> {
  function saveEval(input: unknown) {
    const sourceResult = sourceCheckable['~c'](input)
    if (!sourceResult) {
      // create report
      return
    }

    const results = uniqueCheckables.map(c => c['~c'](input))
  }

  return {
    eval: (input) => {

    },
  }
}
