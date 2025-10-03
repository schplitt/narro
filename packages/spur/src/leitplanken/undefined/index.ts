import type { BuildableSchema } from '../../types/schema'
import { build } from '../../build'

export interface UndefinedSchema extends BuildableSchema<undefined, undefined> {

}

function _undefined(): UndefinedSchema {
  return {
    '@build': () => {
      return build(() => import('./undefined').then(m => m.default()))
    },
  }
}

export { _undefined as undefined }
