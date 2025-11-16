# Spur

Lightweight TypeScript schema validation library with a Zod-like API that keeps bundle sizes minimal.

> **⚠️ Development Status:** Spur is in early development with no stable release yet. The API may change in future builds.

## Why Spur

- **Tiny bundles** – constraint logic lazy-loads on first build, so unused checks never ship
- **Zod-like API** – familiar, chainable schema composition
- **Heuristic insights** – built-in scoring highlights the most plausible schema branch and pinpoints failures
- **Performance options** – choose between minimal bundles or maximum throughput

## Runtime Modes

- **`safeParse` (lazy)** – validates with dynamic imports for minimal bundles
- **`build()` (eager)** – preload checks upfront for reuse in hot paths
- **`spur/inline`** – all checks bundled together for maximum throughput

## Quick Start

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

## Project Structure

This is a monorepo containing:

- **`packages/spur`** – the main validation library
- **`packages/bench`** – performance benchmarks

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm -r test

# Lint
pnpm lint

# Release spur package
pnpm release:spur
```

## License

MIT
