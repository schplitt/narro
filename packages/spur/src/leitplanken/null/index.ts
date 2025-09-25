import type { BuildableSchema } from '../../types/schema'
import { build } from '../../build'

export interface NullSchema extends BuildableSchema<null, null> {

}

export function _null(): NullSchema {
  return {
    '@build': () => {
      return build(() => import('./null').then(m => m.default()))
    },
  }
}
