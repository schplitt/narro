import type { BuildableSchema, EvaluableSchema, SourceCheckableImport } from '../../types/schema'

export interface UndefinedSchema extends BuildableSchema<undefined, undefined> {

}

function _undefined(): UndefinedSchema {
  const sourceCheckableImport: SourceCheckableImport<undefined> = () => import('./undefined').then(m => m.undefinedCheckable)

  return {
    '~build': () => {
      return import('../../build/build').then(({ buildEvaluableSchema }) => {
        return buildEvaluableSchema(
          sourceCheckableImport,
        ) as Promise<EvaluableSchema<undefined>>
      })
    },
  }
}

export { _undefined as undefined }
