import type { BuildableSchema, Checkable, Report } from '../../types/schema'

export interface StringSchema<TOutput extends string> extends BuildableSchema<TOutput> {
  minLength: (minLength: number) => StringSchema<TOutput>
  maxLength: (maxLength: number) => StringSchema<TOutput>
  length: (length: number) => StringSchema<TOutput>

}

export function string(): StringSchema<string> {
  const initialCheck: Checkable<string> = {
    '~i': () => import('./string'),
    '~id': () => import('./string').then(m => m.stringSymbol),
    '~c': v => import('./string').then(m => m.checkString(v)),
  }

  const cs: Checkable<string>[] = []
  const schema: StringSchema<string> = {
    'minLength': (minLength: number) => {
      cs.push({
        '~i': () => import('../_shared/minLength'),
        '~id': () => import('../_shared/minLength').then(m => m.minLengthSymbol),
        '~c': (input: string) => import('../_shared/minLength').then(m => m.buildMinLengthCheck(minLength)(input)),
      })
      return schema
    },

    'length': (length: number) => {
      // simple inline check: exact length
      cs.push({
        '~i': () => import('./string'),
        '~id': () => Promise.resolve(Symbol('length')),
        '~c': (input: string) => import('../_shared/length').then(m => m.buildLengthCheck(length)(input)),
      })
      return schema
    },

    'maxLength': (maxLength: number) => {
      cs.push({
        '~i': () => import('../_shared/maxLength'),
        '~id': () => import('../_shared/maxLength').then(m => m.maxLengthSymbol),
        '~c': (input: string) => import('../_shared/maxLength').then(m => m.buildMaxLengthCheck(maxLength)(input)),
      })
      return schema
    },

    '~b': () => 7,
  }

  return schema
}
