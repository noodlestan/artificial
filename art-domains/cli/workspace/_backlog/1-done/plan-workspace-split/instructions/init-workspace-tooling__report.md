# Sub-Agent REPORT (#producer)

**Plan:** `workspace-split`

**Id:** `init-workspace-tooling`

**Outcome:** `COMPLETED`

## Evidence

### Changes

All goals landed. The `noodlestan/workspace-tooling` repo is a standalone build-tooling monorepo: root scaffold + three migrated packages, lints/builds on its own, committed and pushed, and a scratch consumer resolves `@noodlestan/esbuild` via git URL and invokes its bin. The workspace repo and the migration sources were not modified by this delegation.

#### Files changed

Root scaffold (`repos/workspace-tooling/`): `package.json`, `package-lock.json`, `turbo.json`, `lefthook.yml`, `tsconfig.json`, `.eslintrc.js`, `.gitignore`, `.npmrc`, `.nvmrc`, `.prettierrc`, `.prettierignore`, `README.md`, `LICENSE-MIT`.

`cli/esbuild-cli/` — migrated from `../context-work/tools/build/` and renamed to `@noodlestan/esbuild` 0.0.11: `bin/build.mjs`, `bin/watch.mjs`, `src/**` (build, config, helpers, plugins), `LICENSE-MIT`, `README.md` (updated to new bin names), `package.json` (renamed package, renamed bins, moved runtime deps to `dependencies`, added lint/test scripts).

`configs/tsconfig/` — migrated from `../context-work/tools/configs/` as `@noodlestan/tsconfig` 0.0.11: `cli/tsconfig.json`, `cli/tsconfig.cjs.json`, `cli/tsconfig.esm.json`, `libs/tsconfig.json`, `package.json`.

`configs/eslint-config/` — migrated from `../../eslint-config/` as `@noodlestan/eslint-config` 0.0.7 (byte-identical): `src/**`, `test/**`, `package.json`, `tsconfig.json`, `LICENSE-MIT`, `README.md`, `lefthook.yml`, `.eslintrc.cjs` (the `main` entry), `.prettierrc` (the package's own — see feedback).

Repo commits (workspace-tooling only, both pushed to `origin main`):

- `5205244 workspace-tooling: init monorepo and migrate tooling packages`
- `80a5a11 workspace-tooling: expose esbuild-cli bins at repo root for git-URL consumption`

**No `--no-verify` was used on either commit.** Lefthook auto-installed its pre-commit hook during `npm install`; the hook runs `npm run lint` and passed on both commits. The planned heavy-CI escape hatch was not needed.

## Blockers (if any)

None.

## Feedback

### For the planner

Package layout landed exactly as specified:

| dir                     | package                     | version | bins                                                                                             |
| ----------------------- | --------------------------- | ------- | ------------------------------------------------------------------------------------------------ |
| `cli/esbuild-cli`       | `@noodlestan/esbuild`       | 0.0.11  | `noodlestan/esbuild-cli` → `./bin/build.mjs`, `noodlestan/esbuild-cli-watch` → `./bin/watch.mjs` |
| `configs/tsconfig`      | `@noodlestan/tsconfig`      | 0.0.11  | — (configs only)                                                                                 |
| `configs/eslint-config` | `@noodlestan/eslint-config` | 0.0.7   | — (main `.eslintrc.cjs`)                                                                         |

- **`where`:** Step 8 (git-URL consumption) / `ops/_architect.md` Follow-ups ("De-risk git-URL deps"). **problem:** npm (11.12.1) installs **only the root package** of a git dependency; subdirectory installs are unsupported (`#path:` fragment unmerged in pacote). The plain `git+ssh://git@github.com/noodlestan/workspace-tooling.git` install yields a private root package with no bins, so `node_modules/@noodlestan/esbuild` did not resolve as instructed. **decision:** added a minimal delivery bridge to the root `package.json` — `bin` entries pointing at `cli/esbuild-cli/bin/*.mjs` plus the esbuild runtime `dependencies`. Consumers now alias `"@noodlestan/esbuild": "git+ssh://git@github.com/noodlestan/workspace-tooling.git#main"` and get a working, invokable wrapper. READY-TO-APPLY for `ops/_architect.md` Follow-ups:
  ```
  - De-risk git-URL deps: RESOLVED (workspace-tooling). npm installs only the root package of a git dep (subdir installs unsupported — pacote `#path:` unmerged). Each tooling repo must expose its consumable tooling at the root (`bin` + runtime `dependencies`); consumers alias the git URL to the package name. Only the esbuild wrapper is bridged at the root today — eslint-config/tsconfig are consumed from the same root install via their cloned content (`configs/...`) or ops symlink.
  ```
- **`where:`** Step 3 (esbuild-cli) — "keep the `esbuild-plugin-file-path-extensions` dev dependency". **problem:** the wrapper imports `esbuild` and `esbuild-plugin-file-path-extensions` at runtime; with the plugin as a devDependency the standalone consumer build fails with `ERR_MODULE_NOT_FOUND` (verified). **decision:** moved both `esbuild` (0.28.0, matches the lock's `~0.28.0`) and `esbuild-plugin-file-path-extensions` to `dependencies`; added `esbuild` explicitly since the source `tools/build/package.json` never declared it (it resolved transitively in `context-work`). READY-TO-APPLY (record/plan note):
  ```
  `cli/esbuild-cli`: `esbuild` and `esbuild-plugin-file-path-extensions` must stay in `dependencies` (runtime imports in bin/src), not devDependencies.
  ```
- **`where:`** Step 5 (eslint-config) copy list. **problem:** the copy list omitted `.prettierrc` and `.eslintrc.cjs`; the repo-root `.prettierrc` (project-skeleton, `useTabs` for JS) reformats the package's `tabWidth: 4` files and breaks `npm run lint`, and `main: .eslintrc.cjs` requires the file to exist. **decision:** copied both into `configs/eslint-config/` ("keep the package exactly as-is").
- **`where:`** Step 3 — "add lint/test scripts matching the repo". **problem:** plain `eslint .` matches no files in an `.mjs`-only package (the Noodlestan eslint config overrides do not cover `*.mjs`), failing lint with exit 2. **decision:** `"lint": "prettier . -c && eslint --ext .mjs ."`, `"test": "npm run lint"`.
- **`where:`** Step 8 — "run `npx noodlestan/esbuild-cli --help`". **problem:** npm links namespaced bins by their last path segment, so `noodlestan/esbuild-cli` is linked as `.bin/esbuild-cli` and `npx noodlestan/esbuild-cli` exits 128; the wrapper also accepts no CLI args (`--help`/`--version` unsupported). **decision:** validated invocation via `npx esbuild-cli`, which ran a full build in the scratch consumer (dist/cjs + dist/esm + `.d.ts` emitted). READY-TO-APPLY for the plan:
  ```
  Bin names are nominal (`noodlestan/esbuild-cli` in package.json); npm links them as `.bin/esbuild-cli`. Consumers invoke `npx esbuild-cli`. The wrapper takes no CLI args — validate by building, not `--help`.
  ```
- **`where:`** Step 8 — "npm install git+ssh://git@github.com/noodlestan/workspace-tooling.git (or the https equivalent)". **decision:** validated with the ssh URL; the https form was also attempted for the `#path:` fragment and behaves identically. The repo root stays `"private": true` — npm installs it fine via git URL.

### For the technical writers

- `ops/records/repositories/workspace-tooling.art`: package dirs, names, versions and bins are now confirmed (see table above) — the record's "exact bin names confirmed at extraction" is now concrete.
- eslint-config migration is byte-identical to the `noodlestan/eslint-config` checkout (src, test, package.json, tsconfig.json, LICENSE-MIT, README, lefthook.yml, `.eslintrc.cjs`, `.prettierrc`); the legacy repo was not touched (archival is the user's follow-up).
- `@noodlestan/workspace-tooling` root package.json now carries `bin` + `dependencies` (the git-URL delivery bridge) — worth documenting so future steps don't treat the root as pure meta.
- The `#path:` fragment is not supported by current npm/pacote — do not plan on it.

### For the crew

- Lefthook auto-installed its pre-commit hook on `npm install` (no explicit `lefthook install` ran). The scoped `npm run lint` pre-commit passed on both commits — no `--no-verify` needed; the repo's pre-commit is fast (turbo-cached).
- Smoke test ran from a scratch project layout because the wrapper hard-codes `src/index.ts` entrypoints and `npm run build:types:*`; the validation fell back to a full layout (package.json + tsconfigs + src) rather than the trivial `.mjs` entry suggested in the instructions — the trivial entry cannot be fed to the bin.
- Workspace note: `.vscode/settings.json` in the workspace repo was reformatted externally during this session (editor auto-save at 19:15, before/parallel to the work). This delegation did not open or edit it; it was left untouched and is reported for awareness.
- Scratch artefacts used for validation: `/tmp/ws-esbuild-smoke`, `/tmp/ws-tooling-consumer` (git-URL consumer), `/tmp/noodlestan-esbuild-0.0.11.tgz`.
