## Spur

Spur is a lightweight TypeScript schema validation library with a familiar, Zod-inspired API. It keeps bundle size tiny by loading constraint logic asynchronously only when a schema is built, so you get a fluent, chainable experience without paying for unused checks.

> Note: Spur is in early development with no official release yet. The API is not stable and may change in future builds.

### Why Spur
- **Tiny bundles** – constraint logic is lazy-loaded on first build, so unused checks never ship.
- **Ergonomic chains** – compose schemas with a straightforward, Zod-like API.
- **Heuristic insights** – built-in scoring highlights the most plausible schema branch and pinpoints exactly what failed, without losing data when branches overlap.

### Runtime modes
- **`safeParse` (lazy)** – call `schema.safeParse(input)` and Spur will build the schema and run validation in one step. This keeps bundles minimal thanks to on-demand dynamic imports.
- **`build()` (eager)** – build the schema once to load the required checks up front, then reuse the returned evaluator for hot paths.
- **`spur/inline` (fully bundled)** – import from `spur/inline` when throughput beats bundle size; all checks ship together, so there are no dynamic imports at runtime.

### Quick taste
```ts
import { number } from 'spur'

const ageSchema = number().min(0).max(130)
const report = await ageSchema.safeParse(input)

if (report.passed) {
  // use report.value
}
else {
  console.log(report) // heuristics explain the most likely mismatch
}
```

For more details, explore the `packages/spur` directory or run the playground in `packages/playground`.
