# Implementation Instructions

## Plan: workspace-cli

## Section: clone-command

## commit.Id: `feat(workspace-cli): implement clone command`

## ::switch agent-worker

## Working Agreements

1. **Implement exactly what is specified** — do not redesign, rename, or "improve" beyond the scope below.
2. **Follow the workspace conventions** — plan status vocabulary (`PLANNED` → `WORKING` on delegation), commit-status vocabulary, path placeholders, report templates.
3. **Report back** — fill the report template at the end; include every validation result and the exact commit hashes.

## Path Placeholders

- `$ROOT` — workspace root (git repo `context-workspace`); where `.art-workspace.mts`, `ops/records/*`, `.agents/domains/workspace/*` live.
- `$CLI` — `$ROOT/repos/artificial/art-domains/cli/workspace` — the CLI package (inside the separate `artificial` git repo).

## Goals

Implement the `art-workspace clone` command (idempotent) with CLI-managed checkout records, including the config contract shift, in `$CLI`. Bump to `0.0.8`, publish, and bump the workspace root devDependency.

## Mandatory Reading

- `$ROOT/ops/_backlog/3-now/plan-workspace-cli/plan.md` → `clone-command` section
- `$ROOT/ops/_backlog/3-now/plan-workspace-cli/plan__pseudo__clone.md` → command procedure + BDD spec
- `$ROOT/ops/_backlog/3-now/plan-workspace-cli/plan__pseudo__config.md` → manifest contract (`WorkspaceConfig.checkouts`, `RepositoryRecord`, `locateCheckouts`)
- `$ROOT/ops/_backlog/3-now/plan-workspace-cli/plan__pseudo__sanity.md` → sanity flow to mirror (shared private helpers)
- `$ROOT/.agents/domains/workspace/structures/checkout__structure.md` → `Structure: Checkout` (new)
- `$ROOT/.agents/domains/workspace/templates/checkout.art.njk` → checkout record template (new)
- Existing CLI source under `$CLI/src/**` (config, sanity, tests)

## Changes

**CLI package (`$CLI`) — source:**

| File | Change |
|---|---|
| `src/config/types.ts` | `WorkspaceConfig` gains `checkouts: CheckoutConfig[]`; new `CheckoutConfig { repo, location, branch }`; `RepositoryRecord` drops `checkout?`/`branch?`; `RepositoryCheckout.repo` resolved by name from `CheckoutConfig.repo` |
| `src/config/define-config.ts` | `locateCheckouts` resolves from `config.checkouts` (one `RepositoryCheckout` per entry; unknown repo → warn + skip); empty list → empty result |
| `src/config/index.ts` | export the new types |
| `src/types.ts` | move shared types used by 2+ modules (repo status, verify needs, ...) here |
| `src/private/validate/*.ts` | extracted checks (dir exists, git status/clean, branch match) shared by sanity + clone |
| `src/private/branching/*.ts` | branch helpers (current branch, branch match) |
| `src/private/records/checkout-record.ts` | `saveCheckoutRecord(file, data)` — render the checkout template (HARDCODED resolution for now); `readCheckoutRecord(file)` — regex name/location/branch |
| `src/clone.ts` (new) | clone command per `plan__pseudo__clone.md` |
| `src/index.ts` | wire `clone` (remove the TODO stub) |
| `src/sanity.ts` | derive checkouts from `config.checkouts`; use the private helpers; `console.log` → `console.info`; delete `eslint-disable-next-line no-console` comments |
| `src/sanity.test.ts` | spies → `console.info`; remove the file-level `eslint-disable no-console` comment |
| tests (new) | unit: record IO, `resolveTarget`, clone decisions; integration: temp repo + temp root |
| `package.json` | version `0.0.8` |

**Workspace (`$ROOT`) — authoring (commit after validation):**

| File | Change |
|---|---|
| `.art-workspace.mts` | add `checkouts: []`; drop per-repo `checkout`/`branch` fields |
| `ops/records/repositories/*.art` | drop `**Checkout:**`/`**Branch:**` lines (records mirror the Repository structure) |
| `ops/records/checkouts/*.art` | created by `clone` at runtime; not committed by hand |

## Rules

- Do **not** touch `branch`, `link`, `publish`, `unlink` commands — DRAFT sections, out of scope.
- `console.info` is lint-allowed (eslint `no-console` allow-list) — never re-add `eslint-disable` comments.
- Keep the coverage floor: lines 70 / functions 70 / branches 60 / statements 70 (global).
- `clone` must never modify an existing dirty working tree — report issues only.
- **Commits:** commit `$CLI` changes in the `artificial` git repo and push. Leave `$ROOT` authoring changes (manifest, records, root devDependency) **uncommitted** — the architect commits them after validation.

## Workflow

### Step Validation

Read the referenced pseudo/spec before each step; the validation at the end of each step must pass before the next.

### Steps

1. **Contract shift (config)**
   - `types.ts`: add `CheckoutConfig { repo: string; location: string; branch: string }`; add `checkouts: CheckoutConfig[]` to `WorkspaceConfig`; remove `checkout?`/`branch?` from `RepositoryRecord`.
   - `define-config.ts`: `locateCheckouts` iterates `config.checkouts`, resolves `repo` by name from `records.repos`, warns + skips unknown names. Empty `checkouts` → empty result (vacuous green — accepted).
   - Update the config unit tests for the new contract (see config BDD spec).
   - **Validation:** `npm test` green in `$CLI`.

2. **Sanity cleanup + private abstraction**
   - Extract shared logic from `sanity.ts`/`verify-checkouts.ts` into `src/private/validate/*` and `src/private/branching/*`; move shared types to `src/types.ts`.
   - `sanity.ts`: derive checkouts from `config.checkouts`; `console.log` → `console.info`; remove the now-unneeded `eslint-disable` no-console comments.
   - `sanity.test.ts`: update spies to `console.info`; remove the file-level eslint-disable.
   - **Validation:** `npm run lint`, `npm test`, `npm run test:coverage` green (floor maintained).

3. **Checkout record IO**
   - `src/private/records/checkout-record.ts`: `saveCheckoutRecord(file, data)` renders `$ROOT/.agents/domains/workspace/templates/checkout.art.njk` (HARDCODED template resolution for now — template-engine governance is a follow-up); `readCheckoutRecord(file)` regex-parses name/location/branch (real `art` parser is a follow-up).
   - Unit tests: save/read round-trip, missing file → defaults, malformed line → warn + default.
   - **Validation:** new unit tests pass.

4. **Clone command**
   - Implement per `plan__pseudo__clone.md` and its BDD spec; wire into `src/index.ts` (replace the TODO stub).
   - **Validation:** BDD spec tests pass (unit + integration with temp repos).

5. **Authoring + version + publish**
   - `.art-workspace.mts`: add `checkouts: []`; drop per-repo `checkout`/`branch`.
   - `ops/records/repositories/*.art`: drop `**Checkout:**`/`**Branch:**` lines.
   - Bump `package.json` to `0.0.8`; `npm run build`; publish; bump the workspace root devDependency to `0.0.8`.
   - **Validation:** `npm run build` + `npm publish` succeed; root `npm ls @art-domains/workspace-cli` resolves `0.0.8`.

### Final Verification

**Sanity check:**

- `npm run build && npm test && npm run lint && npm run test:coverage` in `$CLI` — all green, coverage floor met.
- Integration tests (temp repos): first clone creates the checkout record with the actual branch; re-run is a no-op; dirty clone reports an issue; branch mismatch reports an issue with the actual branch.
- `npx art-workspace sanity` at `$ROOT` — runs without error (empty `checkouts` = vacuous green; accepted).
- `npx art-workspace clone artificial` at `$ROOT` — safe exists-path check: `repos/artificial` exists and is clean → reports "exists", creates `ops/records/checkouts/artificial.art` (keep the record; it is CLI-managed data). Do not run against any other real repo.

**Verification steps:**

1. Build/test/lint/coverage green in `$CLI`.
2. Integration scenarios (temp repos) all pass.
3. `sanity` and `clone artificial` run clean at `$ROOT`.
4. Publish `0.0.8` + root devDependency resolves `0.0.8`.
5. Commit + push `$CLI` changes in the `artificial` repo with the commit message; report the hash. Leave `$ROOT` changes uncommitted for the architect.

## How to Report Back

- Use the `render-template` skill with the sanity-report pattern → `$ROOT/ops/_backlog/3-now/plan-workspace-cli/instructions/clone-command__report.md`
- Include: what was implemented; files changed (CLI commit hash + uncommitted workspace files); validation results (test/lint/coverage numbers, integration scenarios); issues/deviations; follow-ups.

## DIRECTIVE FEEDBACK

- **Architect decisions (flagged):** checkout records are per-repo files at `ops/records/checkouts/<name>.art`; `clone` resolves targets from `records.repos` (all or named) with `config.checkouts` as overrides (`checkouts: []` is the declaration path, not a clone source); the record file is created/updated only by `clone`; sanity's vacuous green with empty `checkouts` is accepted; `Structure: Checkout` and the template already exist under `$ROOT/.agents/domains/workspace/`.
- **Deferred follow-ups ("later"):** real `art` parser for records; template-engine governance; populating `config.checkouts` (via `manifest-generator` or `clone`); `delete` command.
