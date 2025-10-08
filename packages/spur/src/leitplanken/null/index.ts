import type { BuildableSchema, EvaluableSchema, SourceCheckableImport } from '../../types/schema'

export interface NullSchema extends BuildableSchema<null, null> {

}

export function _null(): NullSchema {
  const sourceCheckableImport: SourceCheckableImport<null> = () => import('./null').then(m => m.nullCheckable)

  return {
    '~build': () => {
      return import('../../build/build').then(({ buildEvaluableSchema }) => {
        return buildEvaluableSchema(
          sourceCheckableImport,
        ) as Promise<EvaluableSchema<null>>
      })
    },
  }
}

export { _null as null }
