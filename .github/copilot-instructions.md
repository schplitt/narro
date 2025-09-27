# Spur Copilot Instructions

## Title & Mission
Spur is a next‑generation, chainable TypeScript schema validation library focused on minimal bundle size,
dynamic (on‑demand) loading of checks, and heuristic reporting that helps users understand the *most
plausible* intended shape of their data. This document instructs humans and AI assistants how to extend,
refactor, and maintain Spur safely, consistently, and efficiently. You MUST follow every rule herein.

## Core Goals & Differentiators
- Dynamic / lazy import of constraints: you only pay (in bytes & execution) when a schema is first evaluated.
- Heuristic scoring: instead of dumping every failure, Spur computes scores to highlight the most plausible
	validation path (branch) and can surface alternative union / optionality paths via `unionReports`.
- Strong static type inference through generics (`InferOutput<T>`, input vs output propagation, optionality
	transformations).
- Chainable, ergonomic API (familiar to users of other schema libs) while remaining tree‑shake friendly.
- Predictable, minimal runtime surface: pure, side‑effect‑free checks (except the internal build cache map).
- Explicit optionality operators with well‑defined precedence: last applied optionality wins (MANDATORY rule).

## High-Level Architecture
- A schema is built from exactly one `SourceCheckable` plus zero or more `Checkable` constraint units.
- `SourceCheckable['~c'](input)` is a type guard deciding basic shape / kind and narrowing input.
- Each `Checkable['~c'](value)` returns a `SchemaReport` with `{ passed, score, maxScore, value? }`.
- Checks are referenced by unique `symbol` identifiers stored in their `~id` property.
- During build (`build.ts`):
	1. Import source check lazily.
	2. Import all requested checkables.
	3. Deduplicate by `~id` (last occurrence wins) to avoid redundant or overridden constraints.
	4. Construct a cache key: `sourceSymbol | uniqueCheckSymbols | sortedJSON(options)`.
	5. Return an `EvaluableSchema` with `safeParse` + `parse`.
- `safeParse` orchestrates source guard + sequential constraint evaluation, aggregating score / maxScore.
- Union or alternative branches (e.g., `union([...])`, optionality layering) may attach `unionReports` for heuristics.

## Design Principles (CRITICAL)
- Purity: Each check MUST be referentially transparent (no hidden mutable state or time / randomness dependency).
- Minimalism: No eagerly importing siblings; preserve tree shaking.
- Orthogonality: Each constraint addresses a single concern (length, min, default, nullability, etc.).
- Explicitness: Optionality transformations are explicit and override prior ones (last call wins).
- Deterministic Heuristics: Scoring MUST NOT depend on evaluation order beyond defined accumulation logic.
- Stability: Symbols MUST remain stable once published; replacing a symbol changes cache identity.
- Safety First: Fail fast in `parse`; never partially mutate outputs. Return consistent `SchemaReport` shapes.
- Composability: New primitives & constraints slot into the same build path without special cases.
- Performance Conscious: Avoid O(n) dynamic allocations when trivial constants suffice; keep loops tight.
- Separation of Concerns: Type-level transformations live in generics; runtime logic stays minimal.

## Schema / Check System Specification
- `SourceCheckable`:
	- Shape: `{ '~id': symbol; '~c': (input: unknown) => input is NarrowedType }`.
	- MUST return a boolean type guard; no scoring occurs here—failing short-circuits constraints.
- `Checkable`:
	- Shape: `{ '~id': symbol; '~c': (value) => SchemaReport }`.
	- MUST return a `SchemaReport` with `passed`, `score`, `maxScore`, and (if success) `value`.
	- `score` is typically 1 for pass / 0 for fail unless more granular weighting is intentionally documented.
- Evaluation Flow:
	1. Run source guard. If false → failure report (aggregate derived maxScore) without value.
	2. Sequentially run unique checkables keeping a running aggregation: `score += r.score`, `maxScore += r.maxScore`, `passed = passed && r.passed`.
	3. Optionally attach `unionReports` if alternative branches are explored (e.g., union path scoring).
- `SchemaReport` invariants:
	- Failure: `passed: false`, `value: undefined`.
	- Success: `passed: true`, `value` present.
	- `score <= maxScore` always.
	- No side effects.

## Optionality Semantics
You MUST treat optionality as an overlay that rewrites the *resulting output type* and (sometimes) runtime behavior.
Last applied optionality wins (MANDATORY) except `defaulted`, which injects a value and then remains stable unless a
later optionality removes its guarantee (avoid doing so—designers SHOULD prefer default last).

- required:
	- Pass Condition: `value !== null && value !== undefined`.
	- Output: original value.
	- Note: Default baseline; may be explicitly reasserted.
- optional:
	- Pass Condition: always passes if the value is `undefined`; otherwise defer to other checks.
	- Output Type Effect: `T | undefined`.
	- Implemented via undefinable semantics.
- undefinable:
	- Pass Condition: `value === undefined` → pass; else fail (score 0) but other constraints may make overall fail.
	- Output Type Effect: `T | undefined` (when applied at schema root of T). Returns `undefined` on pass.
	- Distinction: Stricter than optional (only accepts undefined).
- nullable:
	- Pass Condition: `value === null`.
	- Output Type Effect: `T | null`.
- nullish:
	- Pass Condition: `value === null || value === undefined`.
	- Output Type Effect: `T | null | undefined`.
- defaulted(defaultValue):
	- Pass Condition: always passes; if `value == null` or `value === undefined`, substitute default.
	- Output Type Effect: `T` (nullish removed because filled).
	- NOTE: Default resolution occurs before other constraints expecting a concrete value.

Precedence Rule (MANDATORY): last optionality method call in the chain defines the final optional shape, overriding
earlier optionality states, except that `defaulted` supplies a concrete value and typically should be last.

## Adding New Primitive or Derived Schemas (MANDATORY Workflow)
Follow this exact sequence for a new primitive (e.g., `date()`) or derived schema (wrapping existing ones):
1. Define Symbol: Create a unique `const dateSourceSymbol = Symbol('spur.date.source')`.
2. Implement Source Guard: Provide a narrow type guard ensuring the base runtime shape.
3. Create Factory: `export function date(): BuildableSchema<Date, InputCandidate, DefaultCommonOptions>` returning a
	 build object that lazy-imports the source check + any internal default constraints.
4. Dynamic Boundary: Place the source check in its own file (no side-effect imports) to allow tree shaking.
5. Checkables (Optional): Add constraint factories (e.g., `.min(time)`, `.max(time)`) each with its own symbol.
6. Chain Integration: Extend the returned object with constraint methods; each method returns a new cloned
	 buildable schema with appended checkable import function.
7. Type Inference: Ensure generics propagate input/output; add type tests validating `InferOutput<typeof date()>`.
8. Optionality Compatibility: Confirm that `.optional()`, `.nullable()` etc. alter the output as expected.
9. Runtime Smoke Tests: Validate success and failure cases with minimal data (no exhaustive property tests).
10. Performance Review: Verify no large dependencies; guard against accidental eager imports.
11. Export: Add re-export path at the package public surface (e.g., `src/index.ts`).
12. Documentation: Add brief usage example and mention optionality interplay.
13. Commit: Use conventional message (e.g., `feat(date): add date primitive`).
14. PR Checklist: Confirm Change Safety Checklist (see section) + bundle delta + tests green.

When to introduce a NEW `Checkable` vs extend existing:
- Create NEW if: behavior is orthogonal, cannot be expressed by parameterizing an existing check, or would bloat an
	existing module with unrelated logic.
- Extend existing ONLY if: same semantic family (e.g., string length variants), identical input assumptions, no
	added cross-cutting complexity.
- NEVER overload one check with multiple unrelated responsibilities.

Hypothetical `date()` Primitive (micro example):
```ts
// date/source.ts
export const dateSourceSymbol = Symbol('spur.date.source')
export function createDateSource(): SourceCheckable<Date, Date> {
	return {
		'~id': dateSourceSymbol,
		'~c': (input: unknown): input is Date => {
			if (input instanceof Date && !isNaN(input.getTime())) return true
			return false
		},
	}
}
```
```ts
// date/index.ts (factory)
export function date() {
	const checkables: CheckableImport<Date>[] = []
	return {
		'@build': async () => build(
			async () => import('./path/to/source').then((m) => m.createDateSource()),
			checkables,
		),
		min(ts: number) {
            // should come from a seprate file, inlined here for brevity
            // ususally would be like import('./min').then(m => m.createMinDateCheck(ts))
			const minSymbol = Symbol('spur.date.min')
			checkables.push(async () => ({
				'~id': minSymbol,
				'~c': (v) => {
					const d = v instanceof Date ? v : new Date(v as any)
					const passed = d.getTime() >= ts
					return { passed, score: passed ? 1 : 0, maxScore: 1, value: passed ? d : undefined }
				},
			}))
			return this
		},
	}
}
```

## Performance & Bundle Size Strategy
- Defer all non-essential imports until the first `.@build()` invocation.
- Keep each constraint in its own lightweight module (one symbol per file preferred for high-value primitives).
- Avoid large regex precompilations or data tables at module top-level.
- Use simple integer scoring; avoid floating point for micro-optimizations unless justified.
- Measure added bytes for new features; if larger than expected, consider optional export gating.
- Ensure tree shaking by not creating accidental side-effect exports (pure functions only).
- Reuse shared utility helpers only if they do not force importing unrelated constraints.

## Type System & Generics Guidelines
- `BuildableSchema<TOutput, TInput, TCommonOptions>` encapsulates deferred building; track options in `~types`.
- Always propagate generics when chaining (return a new widened or narrowed schema type).
- Optionality rewrites output type: applying `.nullable()` changes `T` to `T | null`; applying `.optional()` → `T | undefined`.
- Overwriting Optionality: last call wins—update the `~types.options.optionality` accordingly.
- `InferOutput<T>` extracts final output union; use in type-level tests to guard regressions.
- Prefer minimal conditional types; flatten intersections with `Prettify<T>`.
- NEVER broaden a type silently; any widening MUST be deliberate and covered by tests.

## Runtime & Parsing Semantics
- `safeParse(input)` returns a `SchemaReport` (success or failure) and MUST NOT throw.
- `parse(input)` calls `safeParse` and throws if `passed` is false.
- Constraints MUST NOT transform values except those explicitly allowed (e.g., `defaulted` substitutes default).
- If transformation is introduced (e.g., normalizing dates), you MUST document and test it.
- No mutation of user-provided objects; treat inputs as immutable.
- Union handling: each candidate branch produces a report; heuristics pick highest `(score / maxScore)` ratio.

## Caching & Build Pipeline Rules
- Cache key = Concatenated string: `sourceId|checkId...|sortedJSON(options)`.
- NEVER mutate objects used for the cache key after build insertion (CRITICAL).
- Deduplication rule: last occurrence of a checkable symbol in the chain is retained.
- Re-building the same logical schema with identical key MUST return cached `EvaluableSchema` instance.
- If altering cache logic, document invariants and provide migration notes for symbol changes.
- Avoid storing large objects in cache; only store evaluable schema functions.

## File & Naming Conventions
- Filenames: one conceptual unit per file (e.g., `minLength.ts`, `nullable.ts`).
- Symbols: prefix with domain path (e.g., `spur.string.minLength`).
- Export barrels: keep shallow; avoid deep re-export chains that could hinder tree shaking.
- Internal shared optionality in `leitplanken/_shared/optionality/*`.
- DO keep test files colocated in `__tests__` directories for type-level tests.

## Testing Strategy (Type-Level + Runtime)
Layers:
1. Type-Level Tests (using `expectTypeOf`): Ensure output unions, optionality overrides, chaining precedence.
2. Runtime Smoke Tests: Minimal positive & negative inputs; verify scoring boundaries (score 1 pass, 0 fail by default).
3. Edge Optionality Chains: Sequences of `.optional().nullable().required()...` confirm last-call precedence.
4. Heuristic Branching: For unions, ensure higher ratio `(score / maxScore)` branch is recognized.

Guidelines:
- Add type tests BEFORE implementing new primitives/constraints (MANDATORY).
- Runtime tests MUST avoid exhaustive fuzzing—focus on semantic correctness.
- If scoring weights change, add explicit assertions for new ratios.

## Documentation & Examples Guidance
- Provide one concise example per new primitive or constraint; avoid verbose repetition.
- Show optionality interaction with at most two transformations.
- Emphasize heuristic benefit (why a report points to a likely intended branch) without overexplaining internals.
- Mark hypothetical examples clearly (e.g., `// hypothetical composite`).
- Keep README examples copy-paste runnable after installing the package.

## Commit & PR Guidance
- Use Conventional Commits (see `./.github/instructions/commits.instructions.md`).
- Typical types: `feat`, `fix`, `perf`, `refactor`, `types`, `test`, `docs`, `chore`, etc.
- Provide rationale in body when touching cache, scoring, or optionality.
- BREAKING changes: append `!` and explain migration.
- PR Description MUST list: motivation, API surface changed, bundle delta (if measurable), tests added.

## AI Assistant Operational Rules
- ALWAYS prefer smallest diff achieving goal.
- NEVER introduce speculative APIs (no unrequested features).
- MUST add or adjust tests before modifying core logic.
- MUST verify symbol uniqueness; do not reuse existing `Symbol` descriptors for different semantics.
- MUST keep dynamic import boundaries intact—do not inline across modules.
- MUST document reasoning when changing scoring or cache logic.
- MUST NOT silently broaden output types.
- SHOULD refactor only when code duplication becomes harmful (quantify if possible).
- MUST update docs/examples when adding or altering user-facing methods.

## Preferred Patterns (DO) / Anti-Patterns (AVOID)
DO:
- Isolated, pure factory functions.
- One symbol per logical constraint.
- Clear naming aligning with behavior (`minLength`, `defaulted`).
- Sequential, explicit optionality overrides.
- Minimal object shape for `SchemaReport` (no extra fields).
AVOID:
- Monolithic constraint files bundling unrelated logic.
- Hidden caching layers or global mutable state.
- Heavy computation or I/O at module top-level.
- Silent type widening (`string` → `string | number`).
- Adding new optionality variants without strong justification.
- Overloading a single constraint with numerous unrelated parameters.

## Change Safety Checklist
(Run BEFORE merging; ≤14 bullets.)
1. New symbols are unique & descriptive.
2. Dynamic imports preserved (no eager mass import).
3. No unintended optionality changes (type tests pass).
4. Cache key logic unaffected or explicitly updated + documented.
5. Added/updated type tests precede implementation.
6. Runtime smoke tests added for new paths.
7. Scoring semantics unchanged unless documented.
8. Bundle size impact reviewed (note in PR if notable).
9. No circular imports introduced.
10. Docs/examples updated.
11. Commit message meets conventional format.
12. No silent output widening.
13. No stateful side effects added.
14. All CI (lint, type check, tests) green.

## Example Scenarios (Prompts → Expected Approach)
1. "Add an alpha-only string constraint": Create `alphaSymbol`, factory returning checkable testing `/^[A-Za-z]+$/`,
	 add chain method `.alpha()`, add type + runtime tests, minimal diff.
2. "Introduce date() primitive": Follow primitive workflow; add source guard, optional `.min()` constraint, tests,
	 docs snippet; ensure no timezone transformations unless specified.
3. "Enhance union scoring": If adjusting weighting, justify heuristic rationale, update union tests checking
	 `(score / maxScore)` selection, document in design notes.
4. "Add default to enum option": Implement `.default(value)` using existing defaulted factory; ensure value is a
	 member; adjust type inference to remove nullish from output.
5. "Optimize build cache": Provide benchmark or size rationale; do not break key stability; add migration note if
	 structure changes.
6. "Composite hypothetical nonEmptyArray(string())": Mark as hypothetical; would involve array source guard +
	 length>0 check + nested string schema; DO NOT implement unless requested.
7. "Union extension": Adding new primitive inside union requires its own buildable; union tests must reflect new
	 element in output union.

Micro Example: Adding `.alpha()` to `string()` (simplified):
```ts
export const stringAlphaSymbol = Symbol('spur.string.alpha')
export function createAlphaCheck(): Checkable<string> {
	return {
		'~id': stringAlphaSymbol,
		'~c': (v) => {
			const passed = /^[A-Za-z]+$/.test(v)
			return { passed, score: passed ? 1 : 0, maxScore: 1, value: passed ? v : undefined }
		},
	}
}
// In string factory chain method
alpha() { this._checks.push(async () => createAlphaCheck()); return this }
```

Micro Example: Union extension pattern:
```ts
// Hypothetical: union([string(), number(), date()])
// Ensure date() is itself lazy; union just aggregates buildables and merges output union.
```

## Glossary
- SourceCheckable: Type guard + symbol representing the root runtime kind of a schema.
- Checkable: A scoring constraint returning a `SchemaReport`.
- SchemaReport: Structured outcome with `passed`, `score`, `maxScore`, optional `unionReports`.
- Optionality: Set of transformations controlling null/undefined/default semantics.
- Heuristic Scoring: Aggregated scoring to indicate most plausible intended branch.
- Dynamic Import Boundary: Module separation enabling tree shaking and lazy load.
- Cache Key: Deterministic string identifying a built schema configuration.
- Symbol Identity: Unique constant ensuring correct deduplication & caching.

## Appendix (Links / References)
- (commit conventions) See `./.github/instructions/commits.instructions.md`.
- (vitest docs) Placeholder reference for test runner usage.
- (TypeScript handbook) For advanced generics & conditional types.
- (heuristic scoring notes) Internal rationale for score vs maxScore selection.
- (dynamic import rationale) Design justification for lazy boundaries.

