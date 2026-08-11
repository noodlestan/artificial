# Implementation Instructions

## Plan: workspace-cli

## Section: config-refactor

## commit.Id: `feat(workspace-cli): inject config params instead of records`

## ::switch agent-worker

## Working Agreements

1. **Implement exactly what is specified** — do not redesign, rename, or "improve" beyond the scope below.
2. **Follow the workspace conventions** — plan status vocabulary (`PREPARING` → `WORKING` on delegation), commit-status vocabulary, path placeholders, report templates.
3. **Report back** — fill the report template at the end; include every validation result and the exact commit hashes.

## Path Placeholders

- `$ROOT` — workspace root (git repo `context-workspace`); where `.art-workspace.mts`, `ops/records/*`, `.agents/domains/workspace/*` live.
- `$CLI` — `$ROOT/repos/artificial/art-domains/cli/workspace` — the CLI package (inside the separate `artificial` git repo).

## Goals

Refactor the config contract from **records injection** to **config params (paths only)**: the manifest declares where things live, commands load repositories and checkouts from their record files via helper functions, and the workspace record is no longer tracked. Bump to `0.0.9`, publish, bump the workspace root devDependency.

## Mandatory Reading

- `$ROOT/ops/_backlog/3-now/plan-workspace-cli/plan.md` → `config-refactor` section
- `$ROOT/ops/_backlog/3-now/plan-workspace-cli/plan__pseudo__config.md` → paths-only schema + record loaders (BDD spec at the end)
- `$ROOT/ops/_backlog/3-now/plan-workspace-cli/plan__pseudo__clone.md` → `resolveTarget` using loaded repositories/checkouts
- `$ROOT/ops/_backlog/3-now/plan-workspace-cli/plan__pseudo__sanity.md` → checkouts from `loadCheckouts`
- `$ROOT/.agents/domains/workspace/structures/checkout__structure.md` and `$ROOT/.agents/domains/workspace/templates/checkout.art.njk` → template target for `records.checkouts.template`
- Existing CLI source under `$CLI/src/**` (config, sanity, clone, private/records)

## Changes

**CLI package (`$CLI`) — source:**

| File | Change |
|---|---|
| `src/config/types.ts` | `WorkspaceConfig` = paths-only shape (`clone.path`, `records.repositories.path`, `records.checkouts.path`/`template`); drop `records.workspace`, `records.repos`, `CheckoutConfig`; `RepositoryRecord.consumers` becomes raw `string` |
| `src/config/define-config.ts` | `defineConfig` type-checks the new shape (identity); remove `locateCheckouts` (superseded) |
| `src/config/load-config.ts` | mechanism unchanged |
| `src/config/index.ts` | export the new types; drop `locateCheckouts` export |
| `src/private/records/repository-record.ts` (new) | `readRepositoryRecord(file)` + `loadRepositories(config, root)` |
| `src/private/records/checkout-record.ts` | `saveCheckoutRecord` reads the template from `config.records.checkouts.template` (fallback: current hardcoded template if the file is missing); add `loadCheckouts(config, root)` |
| `src/sanity.ts` | checkouts from `loadCheckouts(config, root)` |
| `src/clone.ts` | targets from `loadRepositories(config, root)`; default location `join(config.clone.path, name)`; overrides from `loadCheckouts(config, root)` |
| tests | update config/sanity/clone tests; add `repository-record` + `loadRepositories`/`loadCheckouts` unit tests |
| `package.json` | version `0.0.9` |

**Workspace (`$ROOT`) — authoring (commit after validation):**

| File | Change |
|---|---|
| `.art-workspace.mts` | rewritten to the paths-only shape; `checkouts: []` and `records.repos`/`records.workspace` removed |
| `ops/records/*` | untouched (records are the source of truth; `ops/records/workspace.art` stays as a domain record) |

## Rules

- Do **not** touch `branch`, `link`, `publish`, `unlink` commands — DRAFT sections, out of scope.
- `console.info` is lint-allowed (eslint `no-console` allow-list) — never re-add `eslint-disable` comments.
- Keep the coverage floor: lines 70 / functions 70 / branches 60 / statements 70 (global).
- `verifyCheckouts` and the clone/sanity behaviors stay **exactly the same** — this iteration only changes where the data comes from.
- `consumers` in repository records stays raw text (structured parsing is a follow-up).
- **Commits:** commit `$CLI` changes in the `artificial` git repo and push. Leave `$ROOT` authoring changes (manifest) **uncommitted** — the architect commits them after validation.

## Workflow

### Step Validation

Read the referenced pseudo/spec before each step; the validation at the end of each step must pass before the next.

### Steps

1. **Config contract (paths-only)**
   - `types.ts`: `WorkspaceConfig { clone: { path }, records: { repositories: { path }, checkouts: { path, template } } }`; drop `records.workspace`, `records.repos`, `CheckoutConfig`; `RepositoryRecord.consumers?: string` (raw text).
   - `define-config.ts`: keep `defineConfig` identity for the new shape; remove `locateCheckouts`.
   - **Validation:** `npm run build` green; config unit tests updated and green.

2. **Record loaders**
   - `src/private/records/repository-record.ts`: `readRepositoryRecord(file)` (regex: `## Repository:`, `**Remote:**`, `**Purpose:**`, `**Description:**`, `**Consumers:**`; defaults + warn on missing name/remote) and `loadRepositories(config, root)` (all `*.art` in `records.repositories.path`).
   - `src/private/records/checkout-record.ts`: `saveCheckoutRecord` renders `config.records.checkouts.template` (read the template file; fallback to the existing hardcoded template when missing); add `loadCheckouts(config, root)` (all `*.art` in `records.checkouts.path`, resolve `repo` by name, warn + skip unknown).
   - Unit tests per the config BDD spec (readRepositoryRecord, loadRepositories, loadCheckouts).
   - **Validation:** new unit tests pass; `npm run lint` green.

3. **Rewire sanity + clone**
   - `sanity.ts`: `checkouts = loadCheckouts(config, root)` (empty dir → vacuous green).
   - `clone.ts`: `repositories = loadRepositories(config, root)`; `resolveTarget` uses `join(config.clone.path, name)` as the default location and `loadCheckouts` entries as overrides.
   - Update existing tests that referenced `locateCheckouts`/`config.checkouts`/`records.repos`.
   - **Validation:** `npm test` green (full suite), `npm run test:coverage` above the floor.

4. **Authoring + version + publish**
   - `.art-workspace.mts`: rewrite to the paths-only shape (see config pseudo manifest example); remove `checkouts: []` and `records.repos`/`records.workspace`.
   - Bump `package.json` to `0.0.9`; `npm run build`; publish; bump the workspace root devDependency to `0.0.9`.
   - **Validation:** `npm run build` + `npm publish` succeed; root `npm ls @art-domains/workspace-cli` resolves `0.0.9`.

### Final Verification

**Sanity check:**

- `npm run build && npm test && npm run lint && npm run test:coverage` in `$CLI` — all green, coverage floor met.
- `npx art-workspace sanity` at `$ROOT` — loads checkouts from `ops/records/checkouts/` records (currently `no-comply`, `purrception`); no errors.
- `npx art-workspace clone artificial` at `$ROOT` — exists-path check: `repos/artificial` exists and is clean → reports "exists"; checkout record `ops/records/checkouts/artificial.art` created (keep it — CLI-managed data).

**Verification steps:**

1. Build/test/lint/coverage green in `$CLI`.
2. `sanity` + `clone artificial` run clean at `$ROOT`.
3. Publish `0.0.9` + root devDependency resolves `0.0.9`.
4. Commit + push `$CLI` changes in the `artificial` repo with the commit message; report the hash. Leave `$ROOT` changes (manifest) uncommitted for the architect.

## How to Report Back

- Use the `render-template` skill with the sanity-report pattern → `$ROOT/ops/_backlog/3-now/plan-workspace-cli/instructions/config-refactor__report.md`
- Include: what was refactored; files changed (CLI commit hash + uncommitted workspace files); validation results (test/lint/coverage numbers, manual runs); issues/deviations; follow-ups.

## DIRECTIVE FEEDBACK

- **Architect decisions (flagged):** config declares paths only — `clone.path`, `records.repositories.path`, `records.checkouts.path`/`template`; `records.workspace` is dropped from the config (the record file stays on disk); `consumers` stays raw text for now; `saveCheckoutRecord` falls back to the current hardcoded template if the template file is missing; `locateCheckouts` is removed (superseded by `loadCheckouts`).
- **Deferred follow-ups ("later"):** real `art` parser for records; template-engine governance; structured consumers parsing; `delete` command.
