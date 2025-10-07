# Conventional Commit Guidelines

## Format
`<type><(scope)>(!): <description>`

- **type**: one of
  - `feat` – New features and enhancements
  - `perf` – Performance improvements
  - `fix` – (Bug) fixes
  - `refactor` – Code refactors that keep old behavior
  - `docs` – Documentation-only changes
  - `build` – Build tool adjustments (not CI)
  - `types` – Internal typing changes
  - `chore` – Non-dev tasks (deps, linting, workflow tweaks)
  - `examples` – Add code examples
  - `test` – Add/adjust tests
  - `style` – Style-only changes
  - `ci` – CI workflow changes
  - `ai` – AI prompt or usage changes
- **scope** *(optional)*: a noun for the affected area/module (e.g., `devices`, `auth`, `api`).
- **!** *(optional)*: mark breaking changes.
- **description**: imperative mood, short and specific.

## Rules
- Be descriptive: explain **what** changed and **why**.
- Only use scope when it helps users (mostly for `feat`, `fix`, `refactor`).
- Avoid redundant scopes like `docs(readme)`: if it isn’t a real module/domain, skip the scope.
- Derive scope hints from filenames/paths when obvious (often the first path segment).

## Examples
feat(devices): add support for <device_type>
fix: interpret header case-insensitively
feat(auth): support SSO login via SAML
fix(config)!: change default behavior to host: `false`
ci: update tool versions in workflow
