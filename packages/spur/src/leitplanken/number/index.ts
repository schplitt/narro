import type { BuildableSchema, Checkable } from '../../types/schema'

export interface NumberSchema<TOutput extends number = number> extends BuildableSchema<TOutput> {
  min: (min: number) => NumberSchema<TOutput>
  max: (max: number) => NumberSchema<TOutput>
}


export function number(): NumberSchema {
  const initialCheck: Checkable<number> = {
    '~i': () => import('./number'),
    '~id': () => import('./number').then(m => m.numberSymbol),
    '~c': v => import('./number').then(m => m.checkNumber(v)),
  }

  const cs: Checkable<number>[] = []
  const schema: NumberSchema = {
    'min': (min: number) => {
      cs.push({
        '~i': () => import('./min'),
        '~id': () => import('./min').then(m => m.minSymbol),
        '~c': (input: number) => import('./min').then(m => m.buildMinCheck(min)(input)),
      })
      return schema
    },

    'max': (max: number) => {
      cs.push({
        '~i': () => import('./max'),
        '~id': () => import('./max').then(m => m.maxSymbol),
        '~c': (input: number) => import('./max').then(m => m.buildMaxCheck(max)(input)),
      })
      return schema
    }

    '~b': () => 7,
  }

  return schema
}