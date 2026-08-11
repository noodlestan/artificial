# Sub-Agent REPORT (#producer)

**Plan:** `workspace-split`

**Id:** `extract-families`

**Outcome:** `IN_PROGRESS` (1 of 4 families extracted)

## Evidence

### Changes

The `extract-families` instruction file covers 4 family extractions in dependency order: `purrception` → `purrtrait` → `purrpose` → `no-comply`. This report covers the first delegation: `extract-purrception`.

#### `extract-purrception` — COMPLETED

**`noodlestan/purrception` repo (commit `f1b38fe`, pushed to `origin main`):**

Root scaffold: `package.json` (name `purrception`, full toolchain devDeps, git-URL deps for `@noodlestan/eslint-config` and `@noodlestan/esbuild`), `package-lock.json`, `turbo.json` (no extract task), `lefthook.yml` (single `npm run lint` step), `tsconfig.json` (include: `libs/` + `cli/`), `.eslintrc.cjs`, `.gitignore`, `.npmrc`, `.nvmrc`, `.prettierrc`, `.prettierignore`, `README.md` (packages table), `LICENSE-MIT`, `AGENTS.md`.

`configs/tsconfig/` — base tsconfigs migrated from `tools/configs/cli/`: `tsconfig.json`, `tsconfig.cjs.json`, `tsconfig.esm.json`.

Migrated tree: `libs/` (primitives, lang-ts), `cli/` (source-fs, lang-ts-extract). No `node_modules/`, no `package-lock.json` from source, no `dist/`.

Package rewires: `cli/source-fs/package.json` and `cli/lang-ts-extract/package.json` — `no-comply-build` → `esbuild-cli`, `no-comply-watch` → `esbuild-cli-watch`, `build-tools` devDep replaced with `@noodlestan/esbuild` git URL. Lib packages — `build-tools` devDep removed, vite plugins + `solid-js` + `rollup` + `vitest` added to each package's own devDependencies. All tsconfig extends paths updated. Repository URLs updated from `noodlestan/no-comply` to `noodlestan/purrception`.

**Workspace repo (commit `861d812`, pushed to `origin main`):**

- `ops/records/repositories/purrception.art` — new record.
- `ops/records/workspace.art` — added Purrception to Repositories list.

**No `--no-verify` was used.** Lefthook auto-installed its pre-commit hook during `npm install`; the hook runs `npm run lint` and passed on the init commit.

**Package layout confirmed:**

| dir | package | version |
| --- | --- | --- |
| `libs/primitives/` | `@purrception/primitives` | 0.0.11 |
| `libs/lang-ts/` | `@purrception/lang-ts` | 0.0.11 |
| `cli/source-fs/` | `@purrception/source-fs` | 0.0.11 |
| `cli/lang-ts-extract/` | `@purrception/lang-ts-extract` | 0.0.11 |

**Git-URL pins used:**
- `"@noodlestan/eslint-config": "git+ssh://git@github.com/noodlestan/eslint-config.git#main"`
- `"@noodlestan/esbuild": "git+ssh://git@github.com/noodlestan/workspace-tooling.git#main"`

**Scripts rewired from parent-install bins:**
- `cli/source-fs`: `"build": "no-comply-build"` → `"build": "esbuild-cli"`, `"dev": "no-comply-watch"` → `"dev": "esbuild-cli-watch"`
- `cli/lang-ts-extract`: `"build": "no-comply-build"` → `"build": "esbuild-cli"`, `"dev": "no-comply-watch"` → `"dev": "esbuild-cli-watch"`

**Cross-repo deps rewired:** none — purrception is the base layer with zero cross-family dependencies.

**Standalone proof:** `git clone git@github.com:noodlestan/purrception.git /tmp/purrception-standalone-check/repo && cd /tmp/purrception-standalone-check/repo && npm install && npm run ci` — all 4 tasks successful (lint + build + test across all packages).

#### Remaining families (pending delegation)

- `extract-purrtrait` — depends on `@purrception/lang-ts`
- `extract-purrpose` — depends on `@purrception/*`
- `extract-no-comply` — depends on all three families

## Blockers (if any)

None.

## Feedback

### For the planner

- **`where`:** Step 1 — "Confirm `noodlestan/<family>` exists as an empty GitHub repo." **problem:** `gh` CLI is not authenticated. **decision:** the repo was already available at `git@github.com:noodlestan/purrception.git` (push succeeded). The repo may have been pre-created by the user. READY-TO-APPLY for the plan: no change needed — the push worked.
- **`where`:** Step 4 — "Root devDependencies (versions matching the monorepo's root to avoid drift)." **problem:** `vitest` version in the monorepo lock is `^4.1.8`, not `8.0.16` (which is the `vite` version). **decision:** used `vitest: "^4.1.8"` matching the monorepo lock. READY-TO-APPLY for the instruction file: add a note that `vitest` and `vite` have different version numbers.
- **`where`:** Step 3 — "Copy the migration source tree." **problem:** the CLI packages' tsconfig files extended from `tools/configs/cli/` which was excluded from migration. **decision:** created `configs/tsconfig/` at the repo root with the base configs (matching the artificials extraction pattern), and updated all extends paths.
- **`where`:** Step 4 — "Rewire every cross-repo dependency." **decision:** purrception has zero cross-family deps. All `@purrception/*` deps are workspace-local. The only git-URL deps are tooling: `@noodlestan/esbuild` and `@noodlestan/eslint-config`.

### For the technical writers

- `ops/records/repositories/purrception.art` written following the `workspace-tooling.art` / `artificial.art` pattern. Package dirs, names, versions confirmed from the clone.
- The `reference/` directory in `libs/lang-ts/` and `libs/primitives/` migrated as-is (package-level reference docs).

### For the crew

- Lefthook auto-installed its pre-commit hook on `npm install` (no explicit `lefthook install` ran). The scoped `npm run lint` pre-commit passed on the init commit — no `--no-verify` needed.
- The migration source (`../context-work/purrception/**`) was not modified by this delegation (verified: `git -C ../context-work status` shows clean working tree).
- Pre-existing unrelated changes in the workspace repo were left untouched; only the two records files were committed.
