# Sub-Agent REPORT (#producer)

**Plan:** `workspace-split`

**Id:** `extract-purrtrait`

**Outcome:** `COMPLETED`

## Evidence

### Changes

All goals landed. The `noodlestan/purrtrait` repo is a standalone code rendering and layout monorepo: root scaffold + migrated tree (5 packages), builds/lints/passes CI on its own with the toolchain fully declared, the cross-repo `@purrception/lang-ts` dep rewired to a git URL, and zero modifications to the monorepo. The workspace records list the new repo. The purrception repo received two follow-up commits to add a delivery bridge for `@purrception/lang-ts` (root `main`/`types` + `@purrception/primitives` as `file:` runtime dependency).

#### Files changed

**`noodlestan/purrtrait` repo (commit `e2443c0`, pushed to `origin main`):**

Root scaffold: `package.json` (name `purrtrait`, full toolchain devDeps, git-URL deps for `@noodlestan/eslint-config`, `@noodlestan/esbuild`, and `@purrception/lang-ts`), `package-lock.json`, `turbo.json` (no extract task), `lefthook.yml` (single `npm run lint` step), `tsconfig.json` (include: `libs/`), `.eslintrc.cjs`, `.gitignore`, `.npmrc`, `.nvmrc`, `.prettierrc`, `.prettierignore`, `README.md` (packages table), `LICENSE-MIT`, `AGENTS.md`.

Migrated tree: `libs/` (lang-ts, code-renderer, solid-code, view-tsx, client-tsx). No `node_modules/`, no `package-lock.json` from source, no `dist/`.

Package rewires: all 5 packages — tsconfig extends paths updated from `../../../tsconfig.json` to `../../tsconfig.json`, repository URLs updated from `noodlestan/no-comply` to `noodlestan/purrtrait`. `libs/lang-ts/package.json` — `@purrception/lang-ts` dep rewired from `0.0.11` to `git+ssh://git@github.com/noodlestan/purrception.git#main`.

**`noodlestan/purrception` repo (commits `26435f7` and `a7f3948`, pushed to `origin main`):**

Delivery bridge added: root `package.json` — `main` and `types` fields pointing to `libs/lang-ts/src/index.ts`, `exports` field for module resolution, `@purrception/primitives` as `file:libs/primitives` runtime dependency (so npm creates a symlink when installing the git dep).

**Workspace repo (commit `0bb6bf7`, pushed to `origin main`):**

- `ops/records/repositories/purrtrait.art` — new record.
- `ops/records/workspace.art` — added Purrtrait to Repositories list.

**No `--no-verify` was used.** Lefthook auto-installed its pre-commit hook during `npm install`; the hook runs `npm run lint` and passed on the init commit.

## Blockers (if any)

None.

## Feedback

### For the planner

- **`where`:** Step 4 — "Rewire every cross-repo dependency the family declares to a git URL alias." **problem:** The purrception extraction did not include a delivery bridge for `@purrception/lang-ts`. When npm installs the purrception git dep, it installs the root package (named `purrception`), not the `libs/lang-ts/` subdirectory. TypeScript cannot find `@purrception/lang-ts` because the root package has no `main`/`types` fields. **decision:** Added two follow-up commits to the purrception repo: (1) root `main`/`types`/`exports` pointing to `libs/lang-ts/src/index.ts`, (2) `@purrception/primitives` as `file:libs/primitives` runtime dependency (npm creates a symlink when installing the git dep, resolving the transitive import). READY-TO-APPLY for the plan: add a note that family repos must include delivery bridges for all consumable packages BEFORE consumers are wired. The purrception extraction report should be updated to reflect the delivery bridge.
- **`where`:** Step 4 — "Consumers alias the git URL to the package name." **problem:** The aliasing approach works for the direct dependency (`@purrception/lang-ts`), but transitive dependencies (`@purrception/primitives`) are not automatically resolved. **decision:** The `file:` dependency approach creates a symlink in the consumer's `node_modules/@purrception/primitives` pointing to `lang-ts/libs/primitives` (within the installed git dep). This works but is fragile — if the purrception repo structure changes, the symlink breaks. READY-TO-APPLY for the instruction file: add a note that family repos must declare all transitive dependencies as `file:` runtime dependencies in the root `package.json` to support git-URL consumption.
- **`where`:** Goals — "Cross-repo wiring rules." **problem:** The instruction mentions "root `bin` entries + runtime `dependencies`" for the delivery bridge, but this pattern is for CLI tools (like `@noodlestan/esbuild`). For library packages, the delivery bridge needs `main`/`types`/`exports` fields, not `bin` entries. **decision:** Used `main`/`types`/`exports` for the library delivery bridge. READY-TO-APPLY for the instruction file: clarify that the delivery bridge pattern differs for CLI tools (`bin` entries) vs library packages (`main`/`types`/`exports`).

Package layout confirmed:

| dir                   | package                    | version |
| --------------------- | -------------------------- | ------- |
| `libs/lang-ts/`       | `@purrtrait/lang-ts`       | 0.0.11  |
| `libs/code-renderer/` | `@purrtrait/code-renderer` | 0.0.11  |
| `libs/solid-code/`    | `@purrtrait/solid-code`    | 0.0.11  |
| `libs/view-tsx/`      | `@purrtrait/view-tsx`      | 0.0.11  |
| `libs/client-tsx/`    | `@purrtrait/client-tsx`    | 0.0.11  |

Git-URL pins used:

- `"@noodlestan/eslint-config": "git+ssh://git@github.com/noodlestan/eslint-config.git#main"`
- `"@noodlestan/esbuild": "git+ssh://git@github.com/noodlestan/workspace-tooling.git#main"`
- `"@purrception/lang-ts": "git+ssh://git@github.com/noodlestan/purrception.git#main"`

Scripts rewired from parent-install bins: none — purrtrait uses vite for builds, not esbuild-cli.

Cross-repo deps rewired: `@purrception/lang-ts` in `libs/lang-ts/package.json` (version `0.0.11` → git URL).

`purrpose → @no-comply/solid-primitives` reverse edge: **exists at extraction time.** `purrpose/libs/solid-shiki-service/package.json` depends on `@no-comply/solid-primitives: "0.0.11"` and imports from it in source. This will need to be handled when purrpose is extracted (git URL to `noodlestan/no-comply.git#main` or ops-symlink pattern).

### For the technical writers

- `ops/records/repositories/purrtrait.art` written following the `workspace-tooling.art` / `artificial.art` / `purrception.art` pattern. Package dirs, names, versions confirmed from the clone.
- The delivery bridge pattern for purrception (root `main`/`types`/`exports` + `file:` runtime deps) should be documented in the workspace records or the plan's follow-ups for future extractions.

### For the crew

- Lefthook auto-installed its pre-commit hook on `npm install` (no explicit `lefthook install` ran). The scoped `npm run lint` pre-commit passed on the init commit — no `--no-verify` needed.
- Standalone proof: `git clone git@github.com:noodlestan/purrtrait.git /tmp/purrtrait-standalone-check/repo && cd /tmp/purrtrait-standalone-check/repo && npm install && npm run ci` — all 5 tasks successful (lint + build + test across all packages).
- The migration source (`../context-work/purrtrait/**`) was not modified by this delegation (verified: `git -C ../context-work status` shows clean working tree).
- Pre-existing unrelated changes in the workspace repo were left untouched; only the two records files were committed.
- The purrception repo received two follow-up commits to add the delivery bridge. These commits were necessary because the purrception extraction did not anticipate consumers needing `@purrception/lang-ts` via git URL. Future extractions should include delivery bridges in the initial extraction.
