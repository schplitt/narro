1. DeepPartial should be easily implementable:
    - Type level -> we just go through each schema and add a deepPartial method that simply calls deepPartial on each child schema if it is one of the supported ones (every one that could take another schema  as an argument like object, array, union)
    - Runtime -> just set the option to partial for all obect schemas and  go iup the tree and set it for all object schemas
2. Think about correct types for "default", "optional", "undefinable", "nullable"
   1. We night need an "exactOptional" type as optional currently just adds ? without | undefined which might not be the best user experience
