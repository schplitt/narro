import type { BranchCheckable } from '../../../types/schema'
import { undefinableCheckable } from './undefinable'

export const exactOptionalSymbol = Symbol('exactOptional')

export const exactOptionalCheckable: BranchCheckable<undefined> = {
  // is the same as undefinable (unless for object properties which has its own logic)
  ...undefinableCheckable,
  '~id': exactOptionalSymbol,
}

export default exactOptionalCheckable
