# Sub-Agent REPORT (#producer)

**Plan:** `poc-parse`

**Id:** `scaffold-poc-parse`

**Outcome:** `COMPLETED`

## Evidence

### Changes

All four steps of the instruction were executed; the artificials POC step 1 goal is met: `@art-js/poc-parse` exists at `art-js/cli/poc-parse/` (module-root relative; physical path `artificials/art-js/cli/poc-parse/`), is registered in `artificials/records/packages/`, is a workspace entry, and its CLI runs cleanly. No commit was made — the instruction does not include a commit step (the plan records the `--no-verify` commit convention for the delegator/planner pass).

#### Files changed

- `artificials/art-js/cli/poc-parse/package.json` — new. `@art-js/poc-parse` v0.0.1, `type: module`, dist-shaped module/main/exports per skeleton-cli + sibling `bin`, `dev` script `node --experimental-strip-types src/index.ts`, Common Scripts (lint, lint:fix, build:clean, test; `ci` omitted — no `build` yet).
- `artificials/art-js/cli/poc-parse/src/index.ts` — new. CLI entry: prints the welcome banner and exits cleanly (no parsing logic).
- `artificials/art-js/cli/poc-parse/tsconfig.json` / `tsconfig-cjs.json` / `tsconfig-esm.json` — new. Extend `tools/configs/cli/tsconfig*.json` (see F2 — the scaffolder template's `tools/build/configs/` path does not exist).
- `artificials/art-js/cli/poc-parse/README.md` — new. Sibling-`bin` shape; banner purpose, dev script list, MIT license text.
- `artificials/art-js/cli/poc-parse/.npmignore` / `.prettierignore` / `LICENSE-MIT` — new (Package Common scaffolder files, matching sibling `bin`).
- `artificials/records/packages/artificials-poc-parse.art` — new. `Path cli/poc-parse/`, `Canonical Name @art-js/poc-parse`, `Version 0.0.1`, scaffolders `Scaffolder Skeleton: CLI Package` + `Scaffolder Skeleton: Package Common`; field layout mirrors `artificials-bin.art` / `artificials-parser.art`.
- `artificials/package.json` — single added workspace entry `art-js/cli/poc-parse/` in the `workspaces` array; nothing else touched.
- `artificials/package-lock.json` — modified by the mandated `npm install` (registers the workspace; unavoidable side effect).

Untouched but present in the working tree (pre-existing / concurrent, not mine): `artificials/_backlog/plan-poc-parse/plan.md`, `artificials/_backlog/plan-poc-parse/instructions/scaffold-poc-parse.md`, `artificials/_backlog/plan-art-mantras/instructions/mount-shell.md`, `artificials/_backlog/plan-art-mantras/instructions/load-data__report.md`, `artificials/artisans/apps/art-mantras/_pseudo.md`, `ops/_guide.md`, `ops/_module.md`, `ops/_plan.md`, `ops/_wip.md`.

#### Verification results

- Step 1: record parses; format matches the example record's conventions (`# Module` → `## Package: ...` with the same field set as `artificials-bin.art`).
- Step 2: `node -e "require('./art-js/cli/poc-parse/package.json')"` → `resolved ok: @art-js/poc-parse 0.0.1`.
- Step 3: `npm install` (in `artificials/`, the module npm root) → success, `added 2 packages ... found 0 vulnerabilities`; workspace registered (`artificials/node_modules/@art-js/poc-parse` symlink → `../../art-js/cli/poc-parse`).
- Step 4: `npm run dev` in the package → welcome banner printed, exit code 0, no errors.
- Final sanity: `git status` shows new `artificials/art-js/cli/poc-parse/**`, new `artificials/records/packages/artificials-poc-parse.art`, and exactly one added line in the `artificials/package.json` `workspaces` array (plus the package-lock side effect and the pre-existing unrelated changes listed above).

## Blockers (if any)

None.

## Feedback

Ambiguities, omissions, and contradictions found while implementing, each with `where`, `problem`, `decision`, and a READY-TO-APPLY snippet.

### For the planner

**F1 — Workspace entry path and which "root package.json".**

- where: Instruction "Changes → Add the workspace entry", Step 3, and Final Verification; mirrored in `artificials/_architect.md` Step 1 ("root `package.json`").
- problem: The art-js packages live in the `artificials/` module workspace (`artificials/package.json` is their npm workspace root; the repo-root `package.json` does not include art-js at all). A literal `cli/poc-parse/` entry matches nothing — module workspace entries are module-root-relative with the `art-js/cli/...` prefix (e.g. `art-js/cli/bin/`), and `npm install` must run in `artificials/` to register the workspace.
- decision: Added `art-js/cli/poc-parse/` (not `cli/poc-parse/`) to `artificials/package.json`, inserted alphabetically; ran `npm install` in `artificials/`. Workspace registers (symlink present).
- READY-TO-APPLY snippet for `artificials/_architect.md` Step 1:
  ```md
  - Add the workspace entry `art-js/cli/poc-parse/` to the `workspaces` array in `artificials/package.json` (the module-root package.json that owns the art-js workspaces; the repo-root `package.json` does not include art-js). Only this entry; leave the rest untouched. Run `npm install` in `artificials/` to register it.
  ```

**F2 — Scaffolder naming shorthand "Skeleton CLI".**

- where: Instruction "Goals"/"Changes"/Step 1 — "scaffolders `Skeleton CLI` + `Package Common`".
- problem: The recorded resource is named `Scaffolder Skeleton: CLI Package` (see `artificials-bin.art` and `scaffolders/skeleton-cli/scaffolder-skeleton.art`); "Skeleton CLI" is a shorthand that appears nowhere in the records.
- decision: Registered the record with the conventional names `Scaffolder Skeleton: CLI Package` + `Scaffolder Skeleton: Package Common`.
- READY-TO-APPLY snippet for `artificials/_architect.md` Step 1:
  ```md
  - Register the package in `records/packages/artificials-poc-parse.art` (Path `cli/poc-parse/`, Canonical Name `@art-js/poc-parse`, Version `0.0.1`, scaffolders: Scaffolder Skeleton: CLI Package + Scaffolder Skeleton: Package Common).
  ```

**F3 — Common Scripts `ci` requires a `build` script the POC doesn't have.**

- where: `artificials/records/scripts/common-scripts.art`; Instruction "Scaffold ... package.json".
- problem: Common Scripts includes `ci` (`npm run lint && npm run build && npm run test`), which requires a `build` script. The POC step 1 has no build tooling (substrate/build deliberately deferred), so the scaffolded package.json ships no `build` and no `ci`. Also, `lint` runs `tsc --noEmit`, which needs `@types/node` (the Cli Development dep set) — not installed at this step.
- decision: Shipped `dev` + Common Scripts minus `ci`; no devDependencies yet. The record's Scripts section lists only "Common Scripts".
- READY-TO-APPLY snippet for `artificials/_wip.md`:
  ```md
  - **POC Step 1 — scripts/deps:** `cli/poc-parse` package.json ships `dev` plus Common Scripts minus `ci` (no `build` yet — build/deps deferred). `lint` (`tsc --noEmit`) needs `@types/node` (Cli Development dep set); install dev deps when the package's lint/CI is first exercised (POC step 4+).
  ```

### For the technical writers

**F4 — Skeleton-cli tsconfig templates extend a non-existent path.**

- where: `artificials/records/scaffolders/skeleton-cli/skeleton/tsconfig.json.tart`, `tsconfig-cjs.json.tart`, `tsconfig-esm.json.tart`; also the sibling `art-js/cli/bin/tsconfig*.json`.
- problem: All extend `../../../tools/build/configs/cli/tsconfig*.json` — resolving (from `art-js/cli/<pkg>/`) to `artificials/tools/build/configs/cli/`, which does not exist. The real configs live at `artificials/tools/configs/cli/`.
- decision: Scaffolded the new tsconfigs extending `../../../tools/configs/cli/tsconfig*.json` so they resolve; kept every other field verbatim.
- READY-TO-APPLY snippet for the scaffolder templates (and the sibling `art-js/cli/bin/` tsconfigs):
  ```md
  "extends": "../../../tools/configs/cli/tsconfig.json"
  ```

**F5 — README template link targets differ from the sibling CLI package.**

- where: `artificials/records/scaffolders/skeleton-cli/skeleton/README.md.tart` vs `art-js/cli/bin/README.md`.
- problem: The template links `@artificials` to `../../../README.md` (module root), while the sibling `bin` README links both `@artificials` and "namespace README" to `../../README.md` (`art-js/README.md`).
- decision: Matched the sibling `bin` README (`../../README.md` links) since the instruction says to match sibling CLI packages.
- READY-TO-APPLY snippet (align the template with the shipped siblings):
  ```md
  This package is part of the [@artificials](../../README.md) toolkit.
  ```

### For the crew

- The POC dev loop is clean and dependency-free: `npm run dev` (Node 24 `--experimental-strip-types`) prints the banner and exits 0. No parsing, schema, or micromark introduced, per scope.
- `npm install` in `artificials/` churns `artificials/package-lock.json`; commit it alongside the workspace entry.
- The working tree contained pre-existing/concurrent edits to plan/instruction/ops/art-mantras files before this delegation; none were touched here. Verify with the user before any bulk commit.
- No commit was made by this sub-agent (the instruction has no commit step). The plan records the intended commit message `poc-parse: scaffold cli package` with `git commit --no-verify`.
