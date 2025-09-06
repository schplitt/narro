import type { BuildableSchema, Checkable } from '../../types/schema'
import { number } from '../number'
import { string } from '../string'

export interface ObjectSchema<TOutput extends object> extends BuildableSchema<TOutput> {

}

type InferObjectOutput<T extends ObjectStructure> = {
  [K in keyof T]: T[K] extends BuildableSchema<infer U> ? U : never
}

export type ObjectStructure = Record<string, BuildableSchema>

export function object<const TStructure extends ObjectStructure>(structure: TStructure): ObjectSchema<InferObjectOutput<TStructure>> {
  const initialCheck: Checkable<object> = {
    '~i': () => import('./object'),
    '~id': () => import('./object').then(m => m.objectSymbol),
    '~c': v => import('./object').then(m => m.checkObject(v)),
  }

  return {} as any
}

const s = object({
  name: string().minLength(3).maxLength(30),
  age: number().min(0).max(150),
})
