# Sub-Agent REPORT (#producer)

**Plan:** `workspace-split`

**Id:** `extract-artificial`

**Outcome:** `COMPLETED`

## Evidence

### Changes

All goals landed. The `noodlestan/artificials` repo is a standalone Art Language + artisan toolchain monorepo: root scaffold + migrated tree (minus `tools/build`), renamed `artificials` → `artificial`, builds/lints/passes CI on its own with the toolchain fully declared, the build bins rewired to `@noodlestan/esbuild`, and no `@no-comply` cross-family dependency. The workspace records list the new repo. The monorepo and the migration source are untouched.

#### Files changed

**`noodlestan/artificials` repo (commit `069cb86`, pushed to `origin main`):**

Root scaffold: `package.json` (name `artificial`, full toolchain devDeps, git-URL deps for `@noodlestan/eslint-config` and `@noodlestan/esbuild`), `package-lock.json`, `turbo.json` (extract task dropped), `lefthook.yml` (single `npm run lint` step), `tsconfig.json` (include updated: `art-js/` + `artisans/`), `.eslintrc.cjs`, `.gitignore`, `.npmrc`, `.nvmrc`, `.prettierrc`, `.prettierignore`, `README.md` (updated packages table), `LICENSE-MIT`.

`configs/tsconfig/` — base tsconfigs migrated from `tools/configs/`: `cli/tsconfig.json`, `cli/tsconfig.esm.json`, `cli/tsconfig.cjs.json`, `libs/tsconfig.json`.

Migrated tree: `art-js/` (spec, libs, cli — all packages), `artisans/`, `records/`, `reference/`, `_backlog/`, `_temp/`, `_guide.md`, `_module.md`, `_plan.md`

Package rewires: `art-js/cli/dev-server/package.json` and `art-js/cli/watcher/package.json` — `no-comply-build` → `esbuild-cli`, `no-comply-watch` → `esbuild-cli-watch`. All lib packages (`bundler`, `parser`, `primitives`, `program`, `validator`) — added `devDependencies` for vite plugins and `solid-js`. All CLI packages — tsconfig extends paths updated from `tools/build/configs/` and `tools/configs/` to `configs/tsconfig/`; tsconfig files renamed from `tsconfig-cjs.json`/`tsconfig-esm.json` to `tsconfig.cjs.json`/`tsconfig.esm.json`. Placeholder `src/index.ts` files created for packages that had none. `poc-parse/src/index.ts` — added `eslint-disable no-console`. Lib tsconfigs — added `*.config.ts` to `include`.

**Workspace repo (commit `b40d70a`, pushed to `origin main`):**

- `ops/records/repositories/artificial.art` — new record.
- `ops/records/workspace.art` — added Artificial to Repositories list.

**No `--no-verify` was used.** Lefthook auto-installed its pre-commit hook during `npm install`; the hook runs `npm run lint` and passed on the init commit.

## Blockers (if any)

None.

## Feedback

### For the planner

- **`where`:** Step 1 — "Confirm `noodlestan/artificial` exists as an empty GitHub repo." **problem:** `gh` CLI was not installed; after installing it, `gh auth login` was required but no token was available. **decision:** the user created the repo manually at `git@github.com:noodlestan/artificials.git` (note: `artificials` with 's', not `artificial`). The repo name on GitHub is `artificials`; the root package name is `artificial`. READY-TO-APPLY for the plan:
  ```
  - Repo name: `noodlestan/artificials` (GitHub), root package `artificial`. The GitHub org name matches the legacy project name; the package rename is internal.
  ```
- **`where`:** Step 4 — "Root devDependencies (versions matching the monorepo's root to avoid drift)." **problem:** the vite-based lib packages (`bundler`, `parser`, `primitives`, `program`, `validator`) import `vite-plugin-solid`, `vite-plugin-solid-svg`, `vite-plugin-top-level-await`, and `solid-js` in their `vite.config.ts` files. The eslint `import/no-extraneous-dependencies` rule requires these in each package's own `devDependencies`, not just the root. **decision:** added vite plugins + `solid-js` to each lib package's `devDependencies` (versions matching the monorepo lock: `vite` 8.0.16, `vite-plugin-solid` 2.11.12, `vite-plugin-solid-svg` 0.8.1, `vite-plugin-top-level-await` 1.6.0, `solid-js` 1.9.13). Also added `rollup` ^4.61.1 to root devDependencies (required by `vite-plugin-top-level-await` at runtime).
- **`where`:** Step 3 — "Copy the migration source tree." **problem:** the source packages' tsconfig files extended from `tools/build/configs/cli/tsconfig.json` and `tools/configs/cli/tsconfig.json`, but the `tools/` directory was excluded from migration. **decision:** created `configs/tsconfig/` at the repo root with the base configs (cli: `tsconfig.json`, `tsconfig.esm.json`, `tsconfig.cjs.json`; libs: `tsconfig.json`), and updated all extends paths in CLI packages.
- **`where`:** Step 5 — "Replace the build bins." **problem:** the esbuild-cli wrapper expects `tsconfig.cjs.json` (dot separator) but the source packages had `tsconfig-cjs.json` (hyphen separator). **decision:** renamed all `tsconfig-cjs.json` → `tsconfig.cjs.json` and `tsconfig-esm.json` → `tsconfig.esm.json` in CLI packages.
- **`where`:** Step 7 — "npm install at repos/artificial/." **problem:** several packages had no `src/` directory (empty stubs), causing eslint `parserOptions.project` errors (tsconfig `include` paths found no files) and eslint "No files matching the pattern" errors. **decision:** created minimal `src/index.ts` placeholder files for all packages that lacked them (`bin`, `dev-server`, `watcher`, `bundler`, `parser`, `primitives`, `program`, `validator`). Also added `*.config.ts` to lib tsconfig `include` arrays so eslint can parse `vite.config.ts` and `vitest.config.ts`.
- **`where`:** Step 7 — lint. **problem:** `poc-parse/src/index.ts` uses `console.log` (intentional for a CLI scaffold), triggering `no-console` eslint rule. **decision:** added `/* eslint-disable no-console */` at the top of the file.
- **`where`:** Step 4 — git URL for `@noodlestan/eslint-config`. **decision:** used `git+ssh://git@github.com/noodlestan/eslint-config.git#main` (the legacy repo). The legacy repo is archived but git-URL installs still work (read-only remote). This matches the pattern from the first extraction report.

Package layout confirmed:

| dir | package | version |
| --- | --- | --- |
| `art-js/spec/` | `@art-js/artificials-spec` | 0.0.1 |
| `art-js/libs/primitives/` | `@art-js/artificials-primitives` | 0.0.1 |
| `art-js/libs/parser/` | `@art-js/artificials-parser` | 0.0.1 |
| `art-js/libs/validator/` | `@art-js/artificials-validator` | 0.0.1 |
| `art-js/libs/bundler/` | `@art-js/artificials-bundler` | 0.0.1 |
| `art-js/libs/program/` | `@art-js/artificials-program` | 0.0.1 |
| `art-js/cli/bin/` | `@art-js/artificials-bin` | 0.0.1 |
| `art-js/cli/dev-server/` | `@art-js/artificials-dev-server` | 0.0.1 |
| `art-js/cli/watcher/` | `@art-js/artificials-watcher` | 0.0.1 |
| `art-js/cli/poc-parse/` | `@art-js/poc-parse` | 0.0.1 |
| `artisans/apps/art-mantras/` | `@artisans/art-mantras` | 0.0.1 |

Git-URL pins used:
- `"@noodlestan/eslint-config": "git+ssh://git@github.com/noodlestan/eslint-config.git#main"`
- `"@noodlestan/esbuild": "git+ssh://git@github.com/noodlestan/workspace-tooling.git#main"`

Scripts rewired from parent-install bins:
- `art-js/cli/dev-server`: `"build": "no-comply-build"` → `"build": "esbuild-cli"`, `"dev": "no-comply-watch"` → `"dev": "esbuild-cli-watch"`
- `art-js/cli/watcher`: `"build": "no-comply-build"` → `"build": "esbuild-cli"`, `"dev": "no-comply-watch"` → `"dev": "esbuild-cli-watch"`

### For the technical writers

- `ops/records/repositories/artificial.art` written following the `workspace-tooling.art` pattern. Package dirs, names, versions confirmed from the clone.
- The `records/` directory migrated as-is from the source (byte-identical `.art` files). The workspace records sync supersedes these.
- The `_backlog/`, `_temp/` directories migrated as-is (project-internal planning artefacts).

### For the crew

- Lefthook auto-installed its pre-commit hook on `npm install` (no explicit `lefthook install` ran). The scoped `npm run lint` pre-commit passed on the init commit — no `--no-verify` needed.
- Standalone proof: `git clone git@github.com:noodlestan/artificials.git /tmp/artificial-standalone-check/repo && cd /tmp/artificial-standalone-check/repo && npm install && npm run ci` — all 7 tasks successful (lint + build + test across all packages).
- The migration source (`../context-work/artificials/**`) was not modified by this delegation (verified: `git -C ../context-work status` shows clean working tree).
- Pre-existing unrelated changes in the workspace repo (`.gitignore`, `ops/_guide.md`) were left untouched; only the two records files were committed.
