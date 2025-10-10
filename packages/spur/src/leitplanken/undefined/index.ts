import type { BuildableSchema, EvaluableSchema, SourceCheckableImport } from '../../types/schema'

export interface UndefinedSchema extends BuildableSchema<undefined, undefined> {

}

function _undefined(): UndefinedSchema {
  const sourceCheckableImport: SourceCheckableImport<undefined> = () => import('./undefined').then(m => m.undefinedCheckable)

  const schema: UndefinedSchema = {
    build: async () => {
      return import('../../build/build').then(({ buildEvaluableSchema }) => {
        return buildEvaluableSchema(
          sourceCheckableImport,
        ) as Promise<EvaluableSchema<undefined>>
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

export { _undefined as undefined }
