import type { BuildableSchema, EvaluableSchema, SourceCheckableImport } from '../../types/schema'

export interface NullSchema extends BuildableSchema<null, null> {

}

export function _null(): NullSchema {
  const sourceCheckableImport: SourceCheckableImport<null> = () => import('./null').then(m => m.nullCheckable)

  const schema: NullSchema = {
    build: async () => {
      return import('../../build/build').then(({ buildEvaluableSchema }) => {
        return buildEvaluableSchema(
          sourceCheckableImport,
        )
      })
    },
    parse: async (input) => {
      const built = await schema.build()
      return built.parse(input)
    },
    safeParse: async (input) => {
      const built = await schema.build()
      return built.safeParse(input)
    },
  }

  return schema
}

export { _null as null }
