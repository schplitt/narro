# Typescript Pitfalls

Here are some of the typescript pitfalls i have encountered while working on Narro.
This would make a good blog post.

## 1. Type bailouts

Typescript will sometimes bail out on types if they are actually never used.
If we have a generic that passes its generic to another generic. AND we try to later infer that type, but have not used it inside an object or so internally, typescript will bail out and just use the default type.

For this reason there is the `~types` property where we "store" the type information. At runtime this will never be used, this is only to hint typescript to not bail out on those types (specifically options as input and output are always used).

## 2. Unexpected type widening

Typescript will try to infer generic types based on the usage. This can lead to types having inferred (generic) types having the types inserted from generic used above.
I encountered this with the ObjectEntries where each entry was a BuildableSchema<unknown, unknown, CommonOptions>. This unknown is then passed to to the actual Schema used.
So a StringSchema constructed via `string()` would become StringSchema<unknown, unknown, CommonOptions> instead of StringSchema<string, string, DefaultCommonOptions>.

To fix this we need to give string() an overload signature with NO generics where we just return StringSchema<string, string, DefaultCommonOptions>.
This way typescript will first try to match the non-generic signature and only if we actually pass generics it will use the generic signature.

### AI

ChaGPT Codex model was used to help development. What is very supprising is that even complex typescript behaiviours would be awnsered correctly,e even some i didnt know.
It correclty helped point out errors and fix complex type s that was previoulsly never possible. It could also go very hendands of nd develop schaemas correctly on its own. very intriguing and scary.
Though it still needed all the right points of what was necessary. leting it go off on its won never really resulted ion anything useful
