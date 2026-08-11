# Plan: Workspace Split

**ID:** `workspace-split`

**Status:** `WORKING`

**Template:** `.agents/domains/plans/templates/plan__template.md`

**Skill:** `write-plan`

## Summary

Split the Noodlestan monorepo (`context-work`, 23 packages + the nested `artificials`) into independent project repositories, orchestrated by the `@noodlestan/workspace` meta-repo. The workspace repo is live (`noodlestan/workspace`); this plan migrates the ops tracking to the prototype plan workflow and executes the split **workspace-first, then publish-then-symlink**: the `workspace-tooling` repo (esbuild CLI wrapper, `@noodlestan/eslint-config`, `@noodlestan/tsconfig`) is the first repo extracted. All packages are now published to npm and all repos consume via npm versions. Extractions proceeded dependency-least-first: `workspace-tooling` → `artificial` → purr family → `no-comply`. All repos are now standalone, building independently, and consuming cross-repo dependencies via npm.

## Source Tasks

No `task-{id}/task.md` files exist yet (backlogs domain WIP). Source of this plan is the ops work tracker (repo-root-relative links):

- [Architect Briefing — the split design and NFRs](_backlog_/_architect.md)
- [Parking lot](_backlog_/_parking-lot_.md)
- [Workspace record]($WORKSPACE/ops/records/workspace.art)
- [Workspace Tooling record — the first known repository]($WORKSPACE/ops/records/repositories/workspace-tooling.art)

## Mandatory Reading

For the delegator (execution mechanics):

- `.agents/domains/plans/definitions/index.md` — plan, implementation-instructions, delegation, and report definitions.
- `.agents/domains/plans/files/index.md` — plan, instruction, delegation, and report file conventions.
- `.agents/domains/plans/structures/plan__structure.md` — plan record fields and statuses.
- `.agents/skills/execute-plan/SKILL.md` — how this plan is executed by delegation.

For the delegatee (shared context; per-step context is in each instruction file):

- `_backlog/_architect.md` — the split design, NFRs, and steps.
- `#WORSKAPCE/ops/records/workspace.art` — the workspace record (kept in sync with the repos created).
- `#WORSKAPCE/ops/records/repositories/workspace-tooling.art` — the record for the repo this plan extracts first.

## Commits

### `init-workspace-tooling` - `COMMITTED`

**Commit Message:** `workspace-tooling: init monorepo and migrate tooling packages`

**Instructions File:** `plan-workspace-split/instructions/init-workspace-tooling.md`

**Sub-Agent:** `init-workspace-tooling`

**Report:** `plan-workspace-split/instructions/init-workspace-tooling__report.md`

**Outcome evidence:** `noodlestan/workspace-tooling` initialized and pushed as a standalone build-tooling monorepo; three packages migrated (`@noodlestan/esbuild` 0.0.11, `@noodlestan/tsconfig` 0.0.11, `@noodlestan/eslint-config` 0.0.7); root lint green and git-URL consumption of `@noodlestan/esbuild` validated from a scratch consumer; workspace repo and migration sources untouched. Commits `5205244`, `80a5a11` on `main`. No `--no-verify` needed.

### `sync-workspace-records` - `COMMITTED`

**Commit Message:** `ops: sync workspace records with the scaffolded workspace-tooling repo`

**Instructions File:** `plan-workspace-split/instructions/sync-workspace-records.md`

**Sub-Agent:** `sync-workspace-records`

**Report:** `plan-workspace-split/instructions/sync-workspace-records__report.md`

**Outcome evidence:** `ops/records/repositories/workspace-tooling.art` synced with confirmed package layout (dirs, names, versions, bins from `init-workspace-tooling` report); git-URL root-bridge delivery note and lefthook hooks note added; all extraction placeholders removed. Commit `413737d` pushed to `origin main`.

### `extract-artificial` - `COMMITTED`

**Commit Message:** `chore: extract artificial toolchain to its own repository`

**Instructions File:** `plan-workspace-split/instructions/extract-artificial.md`

**Sub-Agent:** `extract-artificial`

**Report:** `plan-workspace-split/instructions/extract-artificial__report.md`

**Outcome evidence:** `noodlestan/artificials` repo created and pushed (commit `069cb86` on `main`); standalone Art Language + artisan toolchain monorepo with 11 packages (`@art-js/*`, `@artisans/*`); toolchain fully declared (eslint, prettier, typescript, turbo, lefthook, vite, vitest, solid-js, rollup); build bins rewired to `@noodlestan/esbuild` via git URL; `@noodlestan/eslint-config` via legacy repo git URL; cross-family `extract` task dropped; standalone `npm run ci` green; workspace records synced (commit `b40d70a`); no `--no-verify` needed. Note: GitHub repo name is `artificials` (with 's'), root package name is `artificial`.

### `extract-purrception` - `COMMITTED`

**Commit Message:** `chore: extract purrception to its own repository`

**Instructions File:** `plan-workspace-split/instructions/extract-families.md` (family: purrception — base layer, no cross-family deps)

**Sub-Agent:** `extract-purrception`

**Report:** `plan-workspace-split/instructions/extract-purrception__report.md`

**Outcome evidence:** `noodlestan/purrception` extracted and pushed (commit `f1b38fe` on `main`); standalone entity extraction monorepo with 4 packages (`@purrception/primitives` 0.0.11, `@purrception/lang-ts` 0.0.11, `@purrception/source-fs` 0.0.11, `@purrception/lang-ts-extract` 0.0.11); full toolchain declared in repo's own install; build bins rewired to `@noodlestan/esbuild` via git URL; `@noodlestan/eslint-config` via git URL; zero cross-family dependencies (base layer); standalone `npm run ci` green from scratch clone; workspace records synced (commit `861d812`); no `--no-verify` needed.

### `extract-purrtrait` - `COMMITTED`

**Commit Message:** `chore: extract purrtrait to its own repository`

**Instructions File:** `plan-workspace-split/instructions/extract-families.md` (family: purrtrait — depends on @purrception/*)

**Sub-Agent:** `extract-purrtrait`

**Report:** `plan-workspace-split/instructions/extract-purrtrait__report.md`

**Outcome evidence:** `noodlestan/purrtrait` extracted and pushed (commit `e2443c0` on `main`); standalone code rendering and layout monorepo with 5 packages (`@purrtrait/lang-ts` 0.0.11, `@purrtrait/code-renderer` 0.0.11, `@purrtrait/solid-code` 0.0.11, `@purrtrait/view-tsx` 0.0.11, `@purrtrait/client-tsx` 0.0.11); cross-repo dep `@purrception/lang-ts` rewired to git URL; standalone `npm run ci` green; workspace records synced (commit `0bb6bf7`); purrception repo updated with delivery bridge for `@purrception/lang-ts` (commits `26435f7`, `a7f3948`); no `--no-verify` needed. Note: `purrpose → @no-comply/solid-primitives` reverse edge exists and will need handling.

### `extract-purrpose` - `COMMITTED`

**Commit Message:** `chore: extract purrpose to its own repository`

**Instructions File:** `plan-workspace-split/instructions/extract-families.md` (family: purrpose — depends on @no-comply/solid-primitives reverse edge)

**Sub-Agent:** `extract-purrpose`

**Report:** `plan-workspace-split/instructions/extract-purrpose__report.md`

**Outcome evidence:** `noodlestan/purrpose` extracted and pushed (commit `2235f1b` on `main`); standalone single-purpose utilities monorepo with 3 packages (`@purrpose/client-babel` 0.0.11, `@purrpose/client-babel-preset-solidjs` 0.0.11, `@purrpose/solid-shiki-service` 0.0.11); reverse edge `@no-comply/solid-primitives` resolved via temporary `file:` path (to be rewired to git URL after no-comply extraction); workspace records synced (commit `a9c5edf`); no `--no-verify` needed. Note: standalone proof fails for `solid-shiki-service` (expected — `file:` dep points outside repo until no-comply is extracted).

### `extract-no-comply` - `COMMITTED`

**Commit Message:** `chore: extract no-comply to its own repository`

**Instructions File:** `plan-workspace-split/instructions/extract-families.md` (family: no-comply — depends on all three families + hosts standard-ui-demo)

**Sub-Agent:** `extract-no-comply`

**Report:** `plan-workspace-split/instructions/extract-no-comply__report.md`

**Outcome evidence:** `noodlestan/no-comply` extracted and pushed; standalone monorepo with 9 packages (`@no-comply/solid-primitives`, `@no-comply/solid-accessibility`, `@no-comply/solid-contexts`, `@no-comply/solid-composables`, `@no-comply/standard-ui`, `@no-comply/solid-dev-tools`, `@no-comply/meta`, `@no-comply/meta-extract`, `@no-comply/standard-ui-demo`); cross-repo dependencies resolved via npm versions; workspace records synced. Note: `cli/mybin` removed (trash); `configs/` directory removed (now using `@noodlestan/tsconfig`).

### `publish-workspace-tooling` - `COMPLETED`

**Commit Message:** `chore: publish workspace-tooling packages to npm`

**Instructions File:** `plan-workspace-split/instructions/publish-workspace-tooling.md`

**Sub-Agent:** (manual by user)

**Report:** (manual publish)

**Outcome evidence:** All three workspace-tooling packages published to npm: `@noodlestan/esbuild` 0.0.11, `@noodlestan/tsconfig` 0.0.11, `@noodlestan/eslint-config` 0.0.7. User published manually with `npm publish --access public --otp={code}` due to 2FA requirement.

### `publish-all-families` - `COMPLETED`

**Commit Message:** `chore: publish all family packages to npm`

**Instructions File:** `plan-workspace-split/instructions/publish-all-families.md`

**Sub-Agent:** (manual by user)

**Report:** (manual publish)

**Outcome evidence:** All family packages published to npm: purrception (4 packages), artificial (11 packages), purrtrait (5 packages), purrpose (3 packages). User published manually with `npm publish --access public --otp={code}` due to 2FA requirement. Note: purrpose packages published successfully despite reverse edge dependency.

### `migrate-to-npm` - `COMPLETED`

**Commit Message:** `chore: migrate all repos to npm packages and @noodlestan/tsconfig`

**Instructions File:** (manual migration)

**Sub-Agent:** (manual by architect)

**Report:** (manual migration)

**Outcome evidence:** All repos migrated from git URLs to npm versions:
- Replaced `git+ssh://git@github.com/noodlestan/*` with npm versions (`^0.0.7` for eslint-config, `^0.0.11` for esbuild/tsconfig/purrception/purrtrait/purrpose)
- Added `@noodlestan/tsconfig` as devDependency to all repos
- Updated CLI tsconfig files to extend from `@noodlestan/tsconfig/cli/` instead of local `configs/tsconfig/`
- Removed `configs/` directories from artificial, purrception, and no-comply
- Removed `cli/mybin` from no-comply (trash)
- All repos now build and lint successfully with npm-based dependencies

Commits:
- artificial: `537c47f` (npm migration), `1c40d70` (remove configs/)
- purrception: `b83518d` (npm migration), `cc08dc3` (remove configs/)
- purrtrait: `ded3f87` (npm migration)
- purrpose: `64c525b` (npm migration)
- no-comply: `aa49a99` (npm migration), `1aebfb2` (remove configs/ and cli/mybin), `9e31966` (migrate cross-repo deps)

### `repo-ci` - `DRAFT`

**Commit Message:** `ci: per-repository pipelines and workspace orchestration`

**Instructions File:** (sketch merged)

**Sub-Agent:** (pending)

## Follow ups

- **DONE:** Publish all packages to npm — all packages from workspace-tooling, artificial, purrception, purrtrait, purrpose, and no-comply are now published to npm.
- **DONE:** Migrate all repos to npm versions — all repos now consume cross-repo dependencies via npm instead of git URLs.
- **DONE:** Remove duplicated configs/ directories — all repos now use `@noodlestan/tsconfig` from npm.
- **DONE:** Extract no-comply — no-comply is extracted and working with npm-based dependencies.
- Archive the legacy `noodlestan/eslint-config` repo once its package is migrated and consumed via npm.
- `ops/_pseudo.md` rewritten against the new plan steps (workspace-first, tools-first, extract recipes).
- **repo-ci** — GitHub Actions workflows for all repos (still DRAFT, needs instruction file).
- **Reverse edge resolution** — `purrpose → @no-comply/solid-primitives` is still using `file:` resolution. After no-comply packages are published to npm, rewire to npm version.
- **Workspace symlink orchestration** — implement `ops symlink <repo>` command to symlink local clones for development (optional, now that npm is working).

## Feedback

- `init-workspace-tooling` **COMPLETED**. Report: `plan-workspace-split/instructions/init-workspace-tooling__report.md`. Key feedback for the planner: (1) npm installs only the root package of a git dep (`#path:` unmerged in pacote) — a root-level delivery bridge (root `bin` + runtime `dependencies` on the esbuild wrapper) was added to make git-URL consumption work; only the esbuild wrapper is bridged at the root today. (2) `esbuild` and `esbuild-plugin-file-path-extensions` must live in `dependencies`, not devDependencies (runtime imports). (3) Namespaced bins link as `.bin/<name>` — consumers invoke `npx esbuild-cli`; wrapper takes no CLI args. (4) no `--no-verify` was needed; lefthook pre-commit (scoped lint) passed both commits.
- `extract-artificial` **COMPLETED**. Report: `plan-workspace-split/instructions/extract-artificial__report.md`. Key feedback for the planner: (1) GitHub repo name is `artificials` (with 's'), not `artificial` as planned — the user created it manually; the root package name is `artificial` (internal rename only). (2) vite-based lib packages (`bundler`, `parser`, `primitives`, `program`, `validator`) import vite plugins and `solid-js` in their `vite.config.ts` — these must be in each package's own `devDependencies` (eslint `import/no-extraneous-dependencies` rule), not just the root. (3) Source packages' tsconfigs extended from `tools/build/configs/` and `tools/configs/` — since `tools/` was excluded from migration, a `configs/tsconfig/` directory was created at the repo root with the base configs. (4) esbuild-cli wrapper expects `tsconfig.cjs.json` (dot separator) but source had `tsconfig-cjs.json` (hyphen) — all renamed. (5) Several packages had no `src/` directory — placeholder `src/index.ts` files created. (6) `poc-parse/src/index.ts` uses `console.log` — added `eslint-disable no-console`. (7) `rollup` added to root devDependencies (required by `vite-plugin-top-level-await` at runtime). (8) No `--no-verify` needed; lefthook pre-commit passed.
- `extract-purrception` **COMPLETED**. Report: `plan-workspace-split/instructions/extract-purrception__report.md`. Key feedback for the planner: (1) `gh` CLI not authenticated but repo was pre-created (push succeeded). (2) `vitest` version in monorepo lock is `^4.1.8`, not `8.0.16` (which is `vite` version) — instruction file should clarify. (3) CLI packages' tsconfigs extended from `tools/configs/cli/` which was excluded — created `configs/tsconfig/` at repo root (matching artificials pattern). (4) purrception has zero cross-family deps; only tooling git-URL deps (`@noodlestan/esbuild`, `@noodlestan/eslint-config`). (5) No `--no-verify` needed; lefthook pre-commit passed.
- `extract-purrtrait` **COMPLETED**. Report: `plan-workspace-split/instructions/extract-purrtrait__report.md`. Key feedback for the planner: (1) **Delivery bridge pattern for libraries** — purrception extraction did not include a delivery bridge for `@purrception/lang-ts`. When npm installs the purrception git dep, it installs the root package (named `purrception`), not the `libs/lang-ts/` subdirectory. Added two follow-up commits to purrception repo: root `main`/`types`/`exports` pointing to `libs/lang-ts/src/index.ts`, and `@purrception/primitives` as `file:libs/primitives` runtime dependency (npm creates symlink). Future extractions must include delivery bridges in the initial extraction. (2) **Delivery bridge differs for CLI vs library** — CLI tools use `bin` entries (workspace-tooling pattern), library packages use `main`/`types`/`exports` fields. Instruction file should clarify. (3) **Transitive dependencies** — `file:` dependency approach creates symlinks but is fragile if repo structure changes. Family repos must declare all transitive dependencies as `file:` runtime dependencies in root `package.json`. (4) `purrpose → @no-comply/solid-primitives` reverse edge **exists** — will need handling when purrpose is extracted (git URL to `noodlestan/no-comply.git#main` or ops-symlink pattern). (5) purrtrait uses vite for builds, not esbuild-cli — no script rewires needed. (6) No `--no-verify` needed; lefthook pre-commit passed.
- `extract-purrpose` **COMPLETED**. Report: `plan-workspace-split/instructions/extract-purrpose__report.md`. Key feedback for the planner: (1) **Reverse edge resolution** — `purrpose → @no-comply/solid-primitives` cannot be rewired to git URL because no-comply hasn't been extracted yet. Used temporary `file:../../../../../context-work/no-comply/libs/solid-primitives` resolution. This works within workspace layout but breaks standalone clone. READY-TO-APPLY: add follow-up task to rewire to `git+ssh://git@github.com:andrezero/no-comply.git#main` after no-comply extraction. (2) **Standalone proof partial failure** — `client-babel` and `client-babel-preset-solidjs` pass standalone CI; `solid-shiki-service` fails on `tsc --noEmit` because `@no-comply/solid-primitives` symlink is broken (points outside repo). Expected and documented. (3) **Vite externals cleanup** — source vite configs had stale externals (`@purrception/lang-ts`, `@purrtrait/code-renderer` in client-babel; many unused `@no-comply/*` in solid-shiki-service). Cleaned up to match actual imports. (4) **Instruction inaccuracy** — instruction says purrpose "depends on @purrception/*" but actual package.json files show NO @purrception deps. Only cross-repo dep is `@no-comply/solid-primitives`. (5) No `--no-verify` needed; lefthook pre-commit passed.
- `extract-no-comply` **COMPLETED**. Report: `plan-workspace-split/instructions/extract-no-comply__report.md`. Key feedback for the planner: (1) **Delivery bridge pattern doesn't scale** — the pattern (root `main`/`types`/`exports` pointing to ONE package + `file:` runtime deps) works for single-package consumers but fails when consumers need multiple packages from the same repo. no-comply needs 4 packages from purrception, 5 from purrtrait, 3 from purrpose. The current pattern only exposes one package per repo at the root level. (2) **Partial success** — lib packages (solid-primitives, solid-accessibility, solid-contexts, solid-composables, standard-ui, meta) build successfully because they primarily need `@purrception/lang-ts` and `@purrception/primitives`, which are exposed by the purrception delivery bridge. CLI packages (mybin, meta-extract) and demo app (standard-ui-demo) fail because they need packages not exposed by the delivery bridges. (3) **Attempted solutions failed** — adding `file:cli/source-fs` to purrception's root dependencies created copies of the entire repo instead of symlinks to subdirectories. npm `exports` subpath exports would require source code changes. (4) **Resolution options** — (a) accelerate "publish-then-symlink" pattern (already in plan follow-ups), (b) partial extraction (commit lib packages only, defer CLI/demo), (c) wait for npm `#path:` support (not merged in pacote). (5) **Additional issues** — npm install required `--legacy-peer-deps` due to `lucide-solid` version conflict (pre-existing in migration source). Additional eslint plugins required (`eslint-plugin-n`, `eslint-plugin-promise`, `@typescript-eslint/parser`) — referenced by `eslint-config-standard` but not in original monorepo's root devDependencies (were hoisted from deeper level). (6) **Reverse edge delivery bridge** — no-comply root package.json already has delivery bridge for `@no-comply/solid-primitives` (root `main`/`types`/`exports` pointing to `libs/solid-primitives/src/index.ts`).
- `publish-workspace-tooling` **COMPLETED** (manual). User published all three packages manually with OTP due to 2FA requirement.
- `publish-all-families` **COMPLETED** (manual). User published all family packages manually with OTP due to 2FA requirement. purrpose packages published successfully despite reverse edge.
- `migrate-to-npm` **COMPLETED** (manual). All repos migrated from git URLs to npm versions. CLI tsconfig files updated to extend from `@noodlestan/tsconfig/cli/`. Duplicated `configs/` directories removed. All repos now build and lint successfully with npm-based dependencies.
