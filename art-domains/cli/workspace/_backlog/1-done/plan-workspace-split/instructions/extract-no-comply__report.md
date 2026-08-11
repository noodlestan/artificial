# Sub-Agent REPORT (#producer)

**Plan:** `workspace-split`

**Id:** `extract-no-comply`

**Outcome:** `BLOCKER`

## Evidence

### Changes

Partial progress. The `andrezero/no-comply` repo scaffold is complete with root files, migrated tree (10 packages), toolchain declared, and cross-repo deps rewired to git URLs. The lib packages (solid-primitives, solid-accessibility, solid-contexts, solid-composables, standard-ui, meta) build successfully. However, the CLI packages (mybin, meta-extract) and the demo app (standard-ui-demo) fail to build due to incomplete delivery bridges in the provider repos (purrception, purrtrait, purrpose).

**Current state:** The partial scaffold was pushed to `andrezero/no-comply` by the user after the sub-agent encountered the blocker. The workspace repo changes (plan update marking `extract-no-comply` as BLOCKED + this report) were also pushed.

#### Files changed

**`andrezero/no-comply` repo (partial scaffold pushed by user):**

Root scaffold: `package.json` (name `no-comply`, full toolchain devDeps, git-URL deps for all three families + tooling, delivery bridge for `@no-comply/solid-primitives`), `turbo.json` (no extract task), `lefthook.yml` (single `npm run lint` step), `tsconfig.json` (include: `libs/` + `cli/` + `apps/`), `.eslintrc.cjs`, `.gitignore`, `.npmrc`, `.nvmrc`, `.prettierrc`, `.prettierignore`, `README.md` (packages table), `LICENSE-MIT`, `AGENTS.md`.

`configs/tsconfig/` — base tsconfigs migrated: `tsconfig.json`, `tsconfig.cjs.json`, `tsconfig.esm.json`.

Migrated tree: `libs/` (solid-primitives, solid-accessibility, solid-contexts, solid-composables, standard-ui, solid-dev-tools, meta), `cli/` (meta-extract, mybin), `apps/` (standard-ui-demo), `reference/`. Pre-built `dist/meta.json` files copied for lib packages.

Package rewires: all 10 packages — tsconfig extends paths updated (`../../../tsconfig.json` → `../../tsconfig.json` for libs/apps, `../../../tools/configs/cli/` → `../../configs/tsconfig/` for CLI), repository URLs updated from `noodlestan/no-comply` to `andrezero/no-comply`, directory paths updated. CLI packages — `no-comply-build` → `esbuild-cli`, `no-comply-watch` → `esbuild-cli-watch`, `build-tools` devDep replaced with `@noodlestan/esbuild` git URL. All cross-repo deps (`@purrception/*`, `@purrtrait/*`, `@purrpose/*`) rewired from `0.0.11` to git URLs.

**`noodlestan/purrception` repo (commits `70b40fb` and `1442d4e`, pushed to `origin main`):**

Attempted to add delivery bridges for `@purrception/source-fs` and `@purrception/lang-ts-extract` via `file:` runtime dependencies. This approach failed — npm creates copies of the entire repo instead of symlinks to the subdirectories. Reverted to original state (only `@purrception/lang-ts` delivery bridge + `@purrception/primitives` as `file:` runtime dep).

**`noodlestan/purrpose` repo (commit `bb6ca15`, pushed to `origin main`):**

Delivery bridge added: root `main`/`types`/`exports` pointing to `libs/solid-shiki-service/src/index.ts`.

**Workspace repo (commit `48bba08`, pushed to `origin main`):**

- `ops/_backlog/plan-workspace-split/plan.md` — marked `extract-no-comply` as BLOCKED.
- `ops/_backlog/plan-workspace-split/instructions/extract-no-comply__report.md` — this report.

## Blockers (if any)

**Delivery bridge pattern doesn't scale for multiple consumable packages.**

The delivery bridge pattern (root `main`/`types`/`exports` pointing to ONE package + `file:` runtime deps for transitive deps) works for exposing a single primary package per repo. However, no-comply needs multiple packages from each provider repo:

- From `purrception`: `@purrception/lang-ts`, `@purrception/primitives`, `@purrception/source-fs`, `@purrception/lang-ts-extract`
- From `purrtrait`: `@purrtrait/lang-ts`, `@purrtrait/code-renderer`, `@purrtrait/solid-code`, `@purrtrait/view-tsx`, `@purrtrait/client-tsx`
- From `purrpose`: `@purrpose/client-babel`, `@purrpose/client-babel-preset-solidjs`, `@purrpose/solid-shiki-service`

The current delivery bridge pattern can only expose ONE package per repo at the root level. When a consumer aliases multiple packages from the same repo (e.g., `"@purrception/source-fs": "git+ssh://..."` and `"@purrception/primitives": "git+ssh://..."`), npm installs the root package multiple times, and the root's `main`/`types` only point to one package (lang-ts for purrception, solid-shiki-service for purrpose).

**Impact:**

- Lib packages (solid-primitives, solid-accessibility, solid-contexts, solid-composables, standard-ui, meta) build successfully — they primarily need `@purrception/lang-ts` and `@purrception/primitives`, which are exposed by the purrception delivery bridge.
- CLI packages (mybin, meta-extract) fail to build — they need `@purrception/source-fs` and `@purrception/lang-ts-extract`, which are NOT exposed by the purrception delivery bridge.
- Demo app (standard-ui-demo) fails to build — it needs `@purrtrait/view-tsx`, `@purrtrait/client-tsx`, etc., which are NOT exposed by the purrtrait delivery bridge.

**Attempted solutions:**

1. Added `file:cli/source-fs` and `file:cli/lang-ts-extract` to purrception's root `dependencies` — npm created copies of the entire repo instead of symlinks to the subdirectories.
2. Attempted to use npm `exports` field with subpath exports — this would require consumers to import from `@purrception/source-fs/source-fs` instead of `@purrception/source-fs`, requiring significant source code changes.

**Required solution:**
The provider repos (purrception, purrtrait, purrpose) need a more sophisticated delivery bridge pattern that supports multiple consumable packages. Options:

1. Use npm workspaces' native subdirectory installation (requires npm to support `#path:` for git deps, which is not yet merged in pacote).
2. Publish packages to npm and consume via npm registry (the "publish-then-symlink" pattern mentioned in the plan's follow-ups).
3. Refactor the provider repos to expose all consumable packages via a single root entry point (not feasible for packages with different purposes).
4. Use npm overrides/resolutions in the consumer repo to force correct subpath resolution (not supported for git deps).

## Feedback

### For the planner

- **`where`:** Step 4 — "Rewire every cross-repo dependency the family declares to a git URL alias." **problem:** The delivery bridge pattern documented in the previous extraction reports only works for ONE primary package per repo. no-comply needs multiple packages from each provider repo, and the current pattern doesn't scale. **decision:** Documented the blocker. The lib packages build successfully, but the CLI packages and demo app fail. READY-TO-APPLY for the plan: add a follow-up task to design a delivery bridge pattern that supports multiple consumable packages per repo, or accelerate the "publish-then-symlink" pattern.
- **`where`:** Goals — "Cross-repo wiring rules." **problem:** The instruction mentions "root `bin` entries + runtime `dependencies`" for CLI tools and "`main`/`types`/`exports`" for library packages, but doesn't address the case where a consumer needs multiple packages from the same provider repo. **decision:** The current pattern works for the first extraction (purrtrait only needed `@purrception/lang-ts`), but fails for no-comply which needs multiple packages from each family. READY-TO-APPLY for the instruction file: add a note that the delivery bridge pattern only supports ONE primary package per repo, and consumers needing multiple packages must use the "publish-then-symlink" pattern or wait for npm to support `#path:` for git deps.
- **`where`:** Step 6 — "Install, lint, typecheck, build — standalone validation." **problem:** The validation fails for CLI packages and the demo app due to incomplete delivery bridges. **decision:** The lib packages (the core of no-comply) build successfully. The CLI packages are internal tools (`private: true`) and the demo app is an acceptance test. READY-TO-APPLY for the instruction file: clarify that "standalone validation" means the published packages build successfully, not necessarily all internal tools and demo apps.

Package layout confirmed:

| dir                         | package                          | version |
| --------------------------- | -------------------------------- | ------- |
| `libs/solid-primitives/`    | `@no-comply/solid-primitives`    | 0.0.11  |
| `libs/solid-accessibility/` | `@no-comply/solid-accessibility` | 0.0.11  |
| `libs/solid-contexts/`      | `@no-comply/solid-contexts`      | 0.0.11  |
| `libs/solid-composables/`   | `@no-comply/solid-composables`   | 0.0.11  |
| `libs/standard-ui/`         | `@no-comply/standard-ui`         | 0.0.11  |
| `libs/solid-dev-tools/`     | `@no-comply/solid-dev-tools`     | 0.0.11  |
| `libs/meta/`                | `@no-comply/meta`                | 0.0.11  |
| `cli/meta-extract/`         | `@no-comply/meta-extract`        | 0.0.11  |
| `cli/mybin/`                | `@no-comply/mybin`               | 0.0.1   |
| `apps/standard-ui-demo/`    | `@no-comply/standard-ui-demo`    | 0.0.11  |

Git-URL pins used:

- `"@noodlestan/eslint-config": "git+ssh://git@github.com/noodlestan/eslint-config.git#main"`
- `"@noodlestan/esbuild": "git+ssh://git@github.com/noodlestan/workspace-tooling.git#main"`
- `"@purrception/lang-ts": "git+ssh://git@github.com/noodlestan/purrception.git#main"`
- `"@purrception/lang-ts-extract": "git+ssh://git@github.com/noodlestan/purrception.git#main"`
- `"@purrception/primitives": "git+ssh://git@github.com/noodlestan/purrception.git#main"`
- `"@purrception/source-fs": "git+ssh://git@github.com/noodlestan/purrception.git#main"`
- `"@purrtrait/lang-ts": "git+ssh://git@github.com/noodlestan/purrtrait.git#main"`
- `"@purrtrait/code-renderer": "git+ssh://git@github.com/noodlestan/purrtrait.git#main"`
- `"@purrtrait/solid-code": "git+ssh://git@github.com/noodlestan/purrtrait.git#main"`
- `"@purrtrait/view-tsx": "git+ssh://git@github.com/noodlestan/purrtrait.git#main"`
- `"@purrtrait/client-tsx": "git+ssh://git@github.com/noodlestan/purrtrait.git#main"`
- `"@purrpose/client-babel": "git+ssh://git@github.com/noodlestan/purrpose.git#main"`
- `"@purrpose/client-babel-preset-solidjs": "git+ssh://git@github.com/noodlestan/purrpose.git#main"`
- `"@purrpose/solid-shiki-service": "git+ssh://git@github.com/noodlestan/purrpose.git#main"`

Scripts rewired from parent-install bins:

- `cli/mybin`: `"build": "no-comply-build"` → `"build": "esbuild-cli"`, `"dev": "no-comply-watch"` → `"dev": "esbuild-cli-watch"`
- `cli/meta-extract`: `"build": "no-comply-build"` → `"build": "esbuild-cli"`, `"dev": "no-comply-watch"` → `"dev": "esbuild-cli-watch"`

Cross-repo deps rewired: all `@purrception/*`, `@purrtrait/*`, `@purrpose/*` deps in all 10 packages (version `0.0.11` → git URLs).

`purrpose → @no-comply/solid-primitives` reverse edge: **exists at extraction time.** The purrpose repo's `solid-shiki-service` depends on `@no-comply/solid-primitives`. After no-comply is extracted, the purrpose repo will need to rewire this from the temporary `file:` path to `git+ssh://git@github.com:andrezero/no-comply.git#main`. This requires adding a delivery bridge to the no-comply repo for `@no-comply/solid-primitives` (root `main`/`types`/`exports` pointing to `libs/solid-primitives/src/index.ts` + `solid-js` as runtime dependency). **This delivery bridge is already in place in the no-comply root package.json.**

### For the technical writers

- The delivery bridge pattern needs to be documented more clearly, with explicit notes about its limitations (only ONE primary package per repo).
- The `reference/` directory in the migration source was copied as-is (package-level reference docs).
- Pre-built `dist/meta.json` files were copied from the migration source for lib packages (these are generated by the `extract` script which depends on CLI packages that can't build standalone).

### For the crew

- Lefthook auto-installed its pre-commit hook on `npm install` (no explicit `lefthook install` ran). The scoped `npm run lint` pre-commit has NOT been tested on the init commit because the commit was not made by the sub-agent (blocker encountered before commit). The user pushed the partial scaffold manually.
- Standalone proof: NOT completed by the sub-agent. The lib packages build successfully (`npm run build` for solid-primitives, solid-accessibility, solid-contexts, solid-composables, standard-ui, meta all pass). The CLI packages and demo app fail due to delivery bridge limitations.
- The migration source (`../context-work/no-comply/**`) was not modified by this delegation (verified: no changes made to the source tree).
- Pre-existing unrelated changes in the workspace repo were left untouched; the workspace commit (`48bba08`) only includes the plan update and this report.
- The purrception and purrpose repos received follow-up commits to add/adjust delivery bridges. These commits were necessary to support no-comply's cross-repo deps, but the delivery bridge pattern still doesn't fully support multiple consumable packages per repo.
- npm install required `--legacy-peer-deps` flag due to a version conflict: `lucide-solid@1.18.0` (used by standard-ui-demo) vs `lucide-solid@^0.453.0` (peer dep in lib packages). This is a pre-existing issue in the migration source, not introduced by the extraction.
- Additional eslint plugins were required: `eslint-plugin-n`, `eslint-plugin-promise`, `@typescript-eslint/parser`. These are referenced by `eslint-config-standard` but were not in the original monorepo's root devDependencies (they were hoisted from a deeper level).
