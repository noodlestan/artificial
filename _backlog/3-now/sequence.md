# Execution Sequence — MD Art Roundtrip (phases 0–2)

Delegate in this order:

- PLACEHOLDER: next items here

Each phase blocks the next: phase 0 singularizes the package names that phases 1–2 depend on; phase 1 must land before phase 2 migrates fixtures into the new packages.

Phase 1 bootstraps the parser entry point to export `parse(): void { return undefined }` (a stub). Phase 2's fixture runner imports that `parse` from the parser entry point and calls `parse()` — so the fixture tests pass but **nothing is really parsed until a later step**: the stub returns `undefined` and never throws, so every fixture passes vacuously (the harness proves the runner works and the fixtures are wired, not that parsing is correct). Phase 3 (`migrate-and-verify`) replaces the stub call with the real `parse(content)`; only then are the fixtures genuinely exercised.

## DONE

1. **phase 0 — Rename packages** — `plan-rename-packages/plan.md` (instruction: `plan-rename-packages/instructions/rename-packages.md`)
2. **phase 1 — Bootstrap packages** — `plan-bootstrap-packages/plan.md` (instruction: `plan-bootstrap-packages/instructions/bootstrap-primitives-and-parse-libs.md`)
3. **phase 2 — Migrate testing fixtures** — `plan-migrate-testing-fixtures/plan.md` (instruction: `plan-migrate-testing-fixtures/instructions/migrate-testing-fixtures.md`)
