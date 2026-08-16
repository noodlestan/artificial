# Execution Sequence — MD Art Roundtrip (phases 0–2)

Delegate in this order:

1. **phase 0 — Rename packages** — `plan-rename-packages/plan.md` (instruction: `plan-rename-packages/instructions/rename-packages.md`)
2. **phase 1 — Bootstrap packages** — `plan-bootstrap-packages/plan.md` (instruction: `plan-bootstrap-packages/instructions/bootstrap-primitives-and-parse-libs.md`)
3. **phase 2 — Migrate testing fixtures** — `plan-migrate-testing-fixtures/plan.md` (instruction: `plan-migrate-testing-fixtures/instructions/migrate-testing-fixtures.md`)

Each phase blocks the next: phase 0 singularizes the package names that phases 1–2 depend on; phase 1 must land before phase 2 migrates fixtures into the new packages.
