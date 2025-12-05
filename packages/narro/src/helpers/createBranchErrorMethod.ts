import type { ErrorFactory, ParentObjectInformation } from '../types/helpers'
import { exactOptionalErrorFactory, exactOptionalSymbol } from '../schemas/_shared/optionality/exactOptional'
import { nullishErrorFactory, nullishSymbol } from '../schemas/_shared/optionality/nullish'
import { undefinableErrorFactory, undefinableSymbol } from '../schemas/_shared/optionality/undefinable'
import { undefinedBranchErrorFactory, undefinedSymbol } from '../schemas/undefined/undefined'

const idToErrorFactory: Record<symbol, ErrorFactory> = {
  [exactOptionalSymbol]: exactOptionalErrorFactory,
  [nullishSymbol]: nullishErrorFactory,
  [undefinableSymbol]: undefinableErrorFactory,
  [undefinedSymbol]: undefinedBranchErrorFactory,
}

export function createBranchErrorMethod(
  ids: symbol[],
  value: unknown,
  info: ParentObjectInformation | undefined,
): () => string[] {
  const errorFactories: ErrorFactory[] = []
  for (const id of ids) {
    const f = idToErrorFactory[id]
    if (f) {
      errorFactories.push(f)
    }
  }

  return () => errorFactories.map(f => f(value, info))
}
