# Narro

Lightweight TypeScript schema validation library with a Zod-like API that keeps bundle sizes minimal.

## Features

- **Minimal runtime code** – constraint logic loads asynchronously on first build, so unused checks never ship
- **Zod-like API** – familiar, chainable schema composition
- **Inline mode** – import from `narro/inline` for performance-critical paths; all checks bundle together with no dynamic imports

## Installation

```bash
npm install narro
```

## Quick Start

```ts
import * as s from 'narro'

const userSchema = s.object({
  name: s.string().min(1),
  age: s.number().min(0).max(130),
})

const report = await userSchema.safeParse(input)

if (report.passed) {
  console.log(report.value)
}
else {
  console.log(report.issues)
}
```

## Runtime Modes

- **`safeParse` (lazy)** – validates on-demand with dynamic imports for minimal bundles
- **`build()` (eager)** – preload checks upfront for reuse in hot paths
- **`narro/inline`** – all checks bundled together for maximum throughput

## Development Status

⚠️ **Narro is in active development with no stable release yet. Expect breaking changes.**

## License

MIT
