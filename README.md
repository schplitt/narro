# Narro

Lightweight TypeScript schema validation library with a Zod-like API that keeps bundle sizes minimal.

> **⚠️ Development Status:** Narro is in early development with no stable release yet. The API may change in future builds.

## Why Narro

- **Tiny bundles** – constraint logic lazy-loads on first build, so unused checks never ship
- **Zod-like API** – familiar, chainable schema composition
- **Heuristic insights** – built-in scoring highlights the most plausible schema branch and pinpoints failures
- **Performance options** – choose between minimal bundles or maximum throughput

## Runtime Modes

- **`safeParse` (lazy)** – validates with dynamic imports for minimal bundles
- **`build()` (eager)** – preload checks upfront for reuse in hot paths
- **`narro/inline`** – all checks bundled together for maximum throughput

## Quick Start

```ts
import * as n from 'narro'

const ageSchema = n.number().min(0).max(130)
const report = await ageSchema.safeParse(input)

if (report.success) {
  // use report.value
}
else {
  // see why validation failed
}
```

## Project Structure

This is a monorepo containing:

- **`packages/narro`** – the main validation library
- **`packages/bench`** – performance benchmarks

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm -r test

# Lint
pnpm lint

# Release narro package
pnpm release:narro
```

## License

MIT
