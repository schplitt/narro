import type { BuildableSchema } from '../../types/schema'

export interface UndefinedSchema extends BuildableSchema<undefined, undefined> {

}

/* function _undefined(): UndefinedSchema {
  return {
    '@build': () => {
    },
  }
}

export { _undefined as undefined } */
