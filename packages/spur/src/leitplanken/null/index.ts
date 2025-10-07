import type { BuildableSchema } from '../../types/schema'

export interface NullSchema extends BuildableSchema<null, null> {

}

/* export function _null(): NullSchema {
  return {
    '@build': () => {
    },
  }
}
 */
