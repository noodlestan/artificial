# Implementation Instructions

**Plan:** `workspace-split`

**commit.Id:** `extract-artificial`

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `ops/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `extract-artificial`, created `noodlestan/artificial`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Extract the `artificials` toolchain (Art Language + artisan apps) from the `context-work` monorepo into its own standalone repository `noodlestan/artificial`, building and linting on its own with no dependency on the monorepo's hoisted install. This is the second extraction and the first project repo (the `workspace-tooling` extraction was the git-URL de-risk iteration). Rename the project `artificials` → `artificial`.

**Corrective context (read carefully — the plan's "already standalone" claim is false):**

The `artificials` directory has its own `package-lock.json`, `turbo.json`, and `lefthook.yml`, but it is **NOT standalone today**:

- Its own `node_modules` contains only its workspace packages (`@art-js/*`, `@artificials/*`, `@artisans/*`, `esbuild-plugin-file-path-extensions`).
- Its `.eslintrc.cjs` requires `@noodlestan/eslint-config` — currently resolved from the parent `context-work` install, not from its own tree.
- Its package scripts call `prettier`, `eslint`, `tsc`, `turbo`, `no-comply-build`/`no-comply-watch` — all resolved from the parent install's hoisted `node_modules/.bin`.
- Its `turbo.json` `extract` task depends on `@no-comply/meta-extract#build` — a cross-family dependency that contradicts the plan's "zero cross-family deps" claim.
- Its root `package.json` declares only a `build` script; the lefthook references `clean`/`extract`/`ci` scripts that do not exist at its root — its lefthook is dormant (the monorepo's root lefthook wins).

The extraction must therefore **declare a complete, self-contained toolchain** and **rewire every script** that silently relied on the parent install.

## Mandatory Reading

- `.agents/domains/plans/definitions/index.md` — plan, implementation-instructions, delegation, and report definitions.
- `.agents/domains/plans/files/index.md` — plan, instruction, delegation, and report file conventions.
- `.agents/domains/plans/templates/report__template.md` — the report format you render at the end.
- `ops/_backlog/plan-workspace-split/plan.md` — the plan; this commit is `extract-artificial`.
- `ops/_guide.md` — the ops documents and the planning workflow.
- `ops/_architect.md` — the split design and NFRs (every repo builds standalone; no repo builds through the workspace).
- `ops/_module.md` — Structure: Repository (remote, consumers, packages) and Structure: Workspace.
- `ops/records/repositories/workspace-tooling.art` — the record pattern for an extracted repo; `ops/records/workspace.art` — the workspace record you will extend with the new repo.
- `ops/_backlog/plan-workspace-split/instructions/init-workspace-tooling__report.md` — the first extraction report; its feedback holds the git-URL rules you must apply (root-package-only installs, `#path:` unsupported, bin linking).
- Migration source (read-only — do NOT modify):
  - `../context-work/artificials/` — the project tree to extract (package dirs, records, reference, docs).

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

Two commits, one per repo (both pushed):

1. **`noodlestan/artificial`** — the extracted standalone repo (the main commit): scaffold root, migrate the project tree (minus `tools/build`), rewire scripts and deps, wire the toolchain via git URLs, add tooling, validate standalone.
2. **`noodlestan/workspace`** (the workspace repo) — records sync: add `ops/records/repositories/artificial.art`, register the repo in `ops/records/workspace.art`.

This delegation intentionally authorises exactly these two commits: one commit in
`noodlestan/artificial` and one records-sync commit in the workspace repo. The
two-commit boundary is part of this instruction and does not violate the
plan's delegation cycle; no additional commits are allowed.

The `context-work` monorepo is **never modified** by this delegation.

## Rules

- NEVER modify the migration source: `../context-work/artificials/**` stays read-only (byte-identical before/after).
- NEVER modify the workspace repo's plan, instruction, `_architect.md`, `_guide.md`, `_module.md`, `_parking-lot_.md`, or anything under `.agents/domains/**`. The workspace repo gets exactly ONE commit in this delegation: the records sync.
- Only the two commits described under `## Changes` are made. Do NOT commit anything else in the workspace repo, and do NOT touch `.vscode/settings.json` or any other pre-existing change.
- `noodlestan/artificial` needs a `main` branch pushed with exactly ONE commit in this delegation. Use `git commit --no-verify` in the new repo if its lefthook pre-commit fails for reasons unrelated to the change, and record which you used in your report.
- The workspace repo has no lefthook hooks, so its commit runs normally.
- If a command reports errors, attempt to fix them.
- If the errors persist, inspect the cause before continuing.
- If still unable to fix it, STOP and report back following the "## How to Report Back" section.

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Pre-check the target repo and remotes
Step 2. Scaffold the `noodlestan/artificial` repo root
Step 3. Migrate the project tree (minus `tools/build`) and rename to `artificial`
Step 4. Rewire the toolchain: root deps, eslint, tsconfig, scripts, turbo
Step 5. Replace the build bins with `@noodlestan/esbuild`
Step 6. Fix the pre-commit: drop the cross-family `extract` step, working lefthook
Step 7. Install, lint, typecheck, build — standalone validation
Step 8. Commit and push `noodlestan/artificial`
Step 9. Sync the workspace records and commit the workspace repo
Step 10. Final verification

Execute all the steps autonomously, one by one, including running the **validation commands** plus any _validation command_ found at the end of the current step.

- RULE: You are FORBIDDEN from returning to a previous step.

## Step Validation commands

- RULE: After each step, execute the validation commands listed for that step.

## Steps

### Step 1 — Pre-check the target repo and remotes

- Confirm `noodlestan/artificial` exists as an empty GitHub repo (no commits). If it does not exist, try `gh repo create noodlestan/artificial --private --description "Art Language and artisan toolchain"`; if you have no `gh` access, REPORT A BLOCKER with the exact error.
- Confirm the migration source is present: `ls ../context-work/artificials/` shows the project tree (`art-js/`, `artisans/`, `records/`, `reference/`, `tools/`, `package.json`, `turbo.json`, `lefthook.yml`).

**Validation:** the remote is empty (`git ls-remote git@github.com:noodlestan/artificial.git` prints nothing) and the source tree is readable.

### Step 2 — Scaffold the `noodlestan/artificial` repo root

- Clone the empty repo into `repos/artificial/` (`repos/` is gitignored in the workspace; the clone is not committed to the workspace).
- Scaffold the root mirroring the workspace-tooling repo conventions (see `repos/workspace-tooling/` for the pattern): `LICENSE-MIT` (Noodlestan MIT — copy from the migration source), `README.md` (repo name, purpose, packages table), `.gitignore` (node_modules, dist, \*.tsbuildinfo, coverage), `.npmrc`, `.nvmrc` (`24.15.0`), `.prettierrc`, `.prettierignore`, `.eslintrc.cjs` (see Step 4), `tsconfig.json` (see Step 4), `turbo.json` (see Step 4), `lefthook.yml` (see Step 6).
- Root `package.json`: rename the package `artificials` → `artificial` (private, version 0.0.1, keep the description), `packageManager: npm@10.2.3`, engines node `>=18` (keep the migration source's engine range — the workspace-tooling repo uses `24.15.0`, but do not force it here unless the installed toolchain requires it), keep the `workspaces` list minus `tools/build/`, and add the script/toolchain changes from Step 4.

**Validation:** `repos/artificial/` exists with `origin` configured and no commits on `main`.

### Step 3 — Migrate the project tree (minus `tools/build`) and rename to `artificial`

- Copy the migration source tree into `repos/artificial/`, EXCLUDING `node_modules/`, `package-lock.json` (a fresh lockfile is generated in Step 7), and `tools/` (the `@artificials/build` package is dropped — see Step 5). Copy: `art-js/`, `artisans/`, `records/`, `reference/`, root dotfiles and docs (`README.md`, `tsconfig.json`, `turbo.json`, `lefthook.yml`, `.eslintrc.cjs`, `.prettierrc`, `.prettierignore`, `_guide.md`, `_module.md`, `_plan.md`, `_parking-lot.md`, `_backlog/`, `_temp/` if present).
- Rename the project everywhere it appears as a package/name: root `package.json` `name` → `artificial`. Keep the inner workspace package names (`@art-js/*`, `@artisans/*`) — they are namespaced to their domain, not to the root project name.
- Rename references to the old project name in docs and records that are now wrong (`artificials` → `artificial`) — but keep `records/` content byte-identical for now (the workspace records sync in Step 9 supersedes the migration; do not rewrite the `.art` files, they migrate as-is).

**Validation:** the tree is copied; `repos/artificial/package.json` name is `artificial`; no `node_modules`, no `package-lock.json`, no `tools/` remain in the clone.

### Step 4 — Rewire the toolchain: root deps, eslint, tsconfig, scripts, turbo

The project relied on the parent install for everything. Declare it all:

- Root `devDependencies` (versions matching the monorepo's root to avoid drift — verify against `../context-work/package.json`): `eslint` 8.57.1, `prettier` 3.8.4, `typescript` 5.9.3, `turbo` 2.9.18, `lefthook` 2.1.9, `vite` and `vitest` if any workspace package's scripts import them (the `art-js/libs/program` package uses `vite build` — check every `vite`/`vitest` usage under `art-js/` and `artisans/`), plus `@noodlestan/eslint-config` and `@noodlestan/esbuild` as **devDependencies** resolved via git URLs (see below).
- `@noodlestan/eslint-config` via the **legacy repo git URL** (root-level package, installable — the workspace-tooling subdir is NOT installable via git URL): `"@noodlestan/eslint-config": "git+ssh://git@github.com/noodlestan/eslint-config.git#main"`. The legacy repo is archived later, but archiving does not break git-URL installs (read-only remote). Document this choice in your report.
- `@noodlestan/esbuild` via the **workspace-tooling root git URL** (the root bridge added in the first extraction): `"@noodlestan/esbuild": "git+ssh://git@github.com/noodlestan/workspace-tooling.git#main"`.
- `.eslintrc.cjs`: keep `require('@noodlestan/eslint-config')` — it now resolves from the repo's own install.
- Root `tsconfig.json`: keep the migration source's compilerOptions; update `include` to drop `"tools/"` (the directory no longer exists); extend `@noodlestan/tsconfig` only if a workspace package already references it (the migration source's tsconfigs are self-contained — do NOT introduce a dependency that was not there).
- Root `package.json` `scripts`: define the full lifecycle the lefthook will call — `clean` (`turbo run build:clean`), `lint` (`turbo run lint`), `lint:fix`, `build` (`turbo run build`), `ci` (`turbo run ci`), `test` (`turbo run test`). Reconcile with the per-package scripts (Step 5/6).
- `turbo.json`: copy the migration source's pipeline, then remove the `extract` task entirely (it depends on `@no-comply/meta-extract#build` — a cross-family package this repo must not depend on; the `extract` step was a no-comply meta concern, see Step 6).

**Validation:** every script name called by the new lefthook and turbo pipeline exists in a `package.json` (root or workspace); `grep -rn "@no-comply" repos/artificial --include="*.json"` (excluding `node_modules` and `package-lock.json`) finds nothing.

### Step 5 — Replace the build bins with `@noodlestan/esbuild`

- The packages' `build`/`dev` scripts call `no-comply-build`/`no-comply-watch` — bins from the monorepo's `tools/build`, resolved via the parent install. In the standalone repo these resolve to nothing.
- Replace them with the `@noodlestan/esbuild` wrapper. Per the first extraction report: npm links namespaced bins by their last path segment, so `noodlestan/esbuild-cli` links as `.bin/esbuild-cli`; the wrapper takes no CLI args (validate by building, not `--help`).
- Rewire every occurrence (found via `grep -rn "no-comply-build\|no-comply-watch" repos/artificial --include="*.json"` excluding `node_modules`/lockfile — known at `art-js/cli/dev-server/` and `art-js/cli/watcher/`): `"dev": "no-comply-watch"` → `"dev": "esbuild-cli-watch"`, `"build": "no-comply-build"` → `"build": "esbuild-cli"`. Keep the `build:types:*` scripts as-is (the wrapper orchestrates them).
- Verify no package still references `@artificials/build`, `artificials-build`, or `artificials-watch`.

**Validation:** `grep -rn "no-comply-build\|no-comply-watch\|artificials-build\|artificials-watch\|@artificials/build" repos/artificial --include="*.json"` (excluding `node_modules`/lockfile) finds nothing.

### Step 6 — Fix the pre-commit: drop the cross-family `extract` step, working lefthook

- The migration source's `lefthook.yml` runs `clean` → `extract` → `ci`. The `extract` step depends on `@no-comply/meta-extract` (cross-family) and must go. Replace the pre-commit with the workspace-tooling pattern: a single scoped, turbo-cached step that runs fast. Recommended:
  ```yaml
  pre-commit:
    parallel: false
    commands:
      '0-lint':
        run: npm run lint
  ```
  (The `workspace-tooling` repo's lefthook uses exactly this pattern — `npm run lint` — and its pre-commit passes in seconds because turbo caches.)
- Ensure the scripts the lefthook references now exist (Step 4).
- Remove any stale reference to the `extract` script from root scripts, README, or docs.

**Validation:** `repos/artificial/lefthook.yml` runs only repo-local, turbo-cached commands; no `extract`, `clean`-then-`ci`, or `@no-comply` references remain in it.

### Step 7 — Install, lint, typecheck, build — standalone validation

- `npm install` at `repos/artificial/` (creates a fresh `package-lock.json`; lefthook auto-installs its pre-commit hook).
- `npm run lint` at the root passes (turbo runs the scoped graph).
- `npm run build` at the root passes — this exercises the `esbuild-cli` rewire end to end (the wrapper hard-codes `src/index.ts` entrypoints and the `build:types:*` scripts; smoke-validate at least one package that uses the wrapper, e.g. `art-js/cli/dev-server`).
- `npx tsc --noEmit` (or the repo's typecheck path) passes.
- Cross-check: every workspace package that imports a bare module name (`eslint`, `prettier`, `typescript`, `vite`, `vitest`, `@noodlestan/*`, `@art-js/*`, `@artisans/*`) has it resolvable from the repo's own install (`npm ls <name>` at the root or in the owning workspace).
- Fix any resolution errors by declaring the missing dependency in the owning workspace's `package.json` (workspace-local deps like `@art-js/*` cross-imports go in the importer's `dependencies`/`devDependencies` — the monorepo never had to declare them because hoisting hid them).

**Validation:** `npm run lint` green; `npm run build` green; `npm run ci` green at the root of `repos/artificial/` with NO reference to any parent directory (`repos/artificial` tree fully self-contained).

### Step 8 — Commit and push `noodlestan/artificial`

- `git -C repos/artificial add -A` and commit `chore: extract artificial toolchain to its own repository`.
- If the lefthook pre-commit fails on CI-heavy hooks unrelated to the change, use `git commit --no-verify` and note it in your report.
- Push to `origin main`.

**Validation:** `git -C repos/artificial status` clean; `git log --oneline -1` shows the commit; `git ls-remote origin main` shows it.

### Step 9 — Sync the workspace records and commit the workspace repo

- Write `ops/records/repositories/artificial.art` following the `workspace-tooling.art` record structure:
  - `## Repository: Artificial` — Purpose (Art Language + artisan toolchain), Description, Remote (`git@github.com:noodlestan/artificial.git`), Branch (`main`), Consumers (none yet — it depends on `workspace-tooling`, nothing consumes it), Packages (list the workspace packages as confirmed in the clone: `@art-js/*` names + the artisan apps), Migrates (`context-work/artificials` → this repo, minus `tools/build`).
- Update `ops/records/workspace.art` (`## Workspace: Noodlestan`): add `artificial` to the known repositories.
- Commit in the workspace repo: `ops: register artificial repository records` and push to `origin main`.

**Validation:** `ops/records/repositories/artificial.art` exists and matches the confirmed package names; `ops/records/workspace.art` lists `artificial`; workspace commit pushed.

### Step 10 — Final verification

- Standalone proof: from a scratch directory (`/tmp/artificial-standalone-check`), `git clone git@github.com:noodlestan/artificial.git`, `npm install`, `npm run ci` — green with zero workspace/monorepo involvement.
- `git -C repos/artificial status` clean; one commit on `main`, pushed.
- Workspace repo: exactly one new commit (`ops: register artificial repository records`); `git status` clean except pre-existing unrelated changes (e.g. `.vscode/settings.json`).
- `../context-work/artificials/**` byte-identical to before (unmodified).

## Final Verification

**Sanity check**

The goal is met: `noodlestan/artificial` is a standalone repo (root scaffold + migrated tree minus `tools/build`), renamed `artificials` → `artificial`, builds, lints, and passes CI on its own with the toolchain fully declared in its own install, the build bins rewired to `@noodlestan/esbuild`, and no `@no-comply` cross-family dependency. The workspace records list the new repo. The monorepo and the migration source are untouched.

**Verification steps**

- `repos/artificial/` has: root scaffold, the migrated `art-js/` + `artisans/` + `records/` + `reference/` trees, no `tools/`, no `@no-comply` references, root `devDependencies` declaring the full toolchain, `@noodlestan/esbuild` + `@noodlestan/eslint-config` via git URLs, `lefthook.yml` running only repo-local turbo-cached lint.
- `git -C repos/artificial status` clean; `main` pushed; the standalone clone+install+ci check passes.
- Workspace: `ops/records/repositories/artificial.art` + `ops/records/workspace.art` updated and pushed; no other workspace modifications.
- `git -C ../context-work status` shows NO modifications from this delegation.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it to `ops/_backlog/plan-workspace-split/instructions/extract-artificial__report.md`.
4. Generate the response and send it back to the delegator.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `_architect.md`, `_module.md`, or a workspace record. Report the exact package names as confirmed in the clone, the git-URL pins you used, whether the new repo's init commit needed `--no-verify`, and every script you had to rewire from the parent-install bins.

Thank you for your service.
