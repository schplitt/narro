import type { BranchCheckable } from '../../../types/schema'
import { undefinableCheckable } from './undefinable'

export const optionalSymbol = Symbol('optional')

export const optionalCheckable: BranchCheckable<undefined> = {
  // is the same as undefinable
  // key can be there and value undefined OR key can be missing
  // -> NO own logic needed for object!!
  ...undefinableCheckable,
  '~id': optionalSymbol,
}

export default optionalCheckable
