export interface ParentObjectInformation {
  keyPresent: boolean
}

export type ErrorFactory = (value: unknown, info?: ParentObjectInformation) => string
