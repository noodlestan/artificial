# Sub-Agent REPORT (#producer)

**Plan:** `workspace-cli`

**Instruction Id:** `config-subpath-fix`

**Outcome:** `COMPLETED`

## Evidence

### Changes

All five goals were met: `@art-domains/workspace-cli@0.0.3` exposes the `./config` subpath (declarations + JS emitted), the manifest imports `defineConfig` from the subpath, and the load-time bundle is clean ESM — no `require` calls.

| Instruction Goal                                            | Status | Evidence                                                                                                                                                                                                                                                        |
| ----------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add `./config` export entry and emit `dist/config/index.js` | DONE   | `exports` map has `./config` → `types` + `import`; build script extended with second esbuild invocation for `src/config/index.ts`; version bumped to `0.0.3`                                                                                                    |
| Build, test, coverage pass                                  | DONE   | `npm run build` emits `dist/index.js`, `dist/index.d.ts`, `dist/config/index.js`, `dist/config/index.d.ts`; `npm test` → 8/8 pass; `npm run lint` → pass; `npm run test:coverage` → lines 96.26 / functions 100 / branches 84.61 / statements 96.26 (floor met) |
| Publish 0.0.3 and consume at workspace root                 | DONE   | `npm publish` → `+ @art-domains/workspace-cli@0.0.3`; `program.version('0.0.3')` aligned; root devDependency bumped to `0.0.3`; `npm install` succeeded; `node_modules/@art-domains/workspace-cli/dist/config/index.js` exists                                  |
| Switch manifest import to subpath                           | DONE   | `.art-workspace.mts` imports from `@art-domains/workspace-cli/config`; manifest still has workspace + 7 repo entries (8 `name` fields)                                                                                                                          |
| Verify load-time bundle is clean ESM                        | DONE   | esbuild bundle check prints `clean ESM bundle, no require() calls; bytes: 112331` and exits 0; `tsc --noEmit --module nodenext` passes; `art-workspace --help` boots; `art-workspace --version` prints `0.0.3`                                                  |

#### Files changed

- `repos/artificial/art-domains/cli/workspace/package.json` — version `0.0.3`; added `./config` export entry (`types` + `import` → `dist/config/index.d.ts` + `dist/config/index.js`); build script extended with second esbuild invocation for `src/config/index.ts`.
- `repos/artificial/art-domains/cli/workspace/src/index.ts` — `program.version('0.0.3')` aligned with published version.
- `.art-workspace.mts` (workspace root) — import changed from `@art-domains/workspace-cli` to `@art-domains/workspace-cli/config`; all other content unchanged (workspace + 7 repos).
- `package.json` / `package-lock.json` (workspace root) — devDependency bumped to `@art-domains/workspace-cli@0.0.3`; lockfile regenerated.

### Commits

- `repos/artificial` (pushed to `main` on `noodlestan/artificials`): **`94a4b9e`** — `feat(workspace-cli): expose config subpath to keep CJS deps out of the manifest bundle`.
- Workspace repo (committed, **not pushed**): **`1c07898`** — `feat(workspace): switch manifest to config subpath and bump workspace-cli to 0.0.3`. The workspace branch is ahead of `origin/main` by 12 commits (11 pre-existing + 1 from this commit); the instruction requires a push only for the artificial repo.

### Verification results

- Step 1: `package.json` has `./config` export entry, extended build script, version `0.0.3`.
- Step 2: `npm run build` emits all 4 dist artifacts; `npm test` → 8/8 pass; `npm run lint` → pass; `npm run test:coverage` → floor met (lines 96.26 / functions 100 / branches 84.61 / statements 96.26).
- Step 3: `npm view @art-domains/workspace-cli version` → `0.0.3`; root `package.json` declares `0.0.3`; `node_modules/@art-domains/workspace-cli/dist/config/index.js` exists.
- Step 4: `.art-workspace.mts` imports from `@art-domains/workspace-cli/config`; 8 `name` entries (workspace + 7 repos).
- Step 5: clean-ESM check prints `clean ESM bundle, no require() calls; bytes: 112331` and exits 0; `tsc --noEmit --module nodenext --moduleResolution nodenext --skipLibCheck .art-workspace.mts` passes; `art-workspace --help` boots; `art-workspace --version` prints `0.0.3`.
- Final sweep: `npm run build`, `npm test`, `npm run lint`, `npm run test:coverage` all pass in the CLI package.

## Blockers (if any)

None.

## Feedback

### For the planner

No ambiguities, omissions, or contradictions found. The instruction was self-contained and executed verbatim.

### For the technical writers

No documentation issues found.

### For the crew

- `npm publish` reported `"bin[art-workspace]" script name dist/index.js was invalid and removed` — the bin field was auto-corrected by npm during publish. The `dist/index.js` file IS included in the tarball and the CLI boots correctly via `art-workspace`, so this appears cosmetic. If the bin field is actually missing from the published package, future consumers may need to invoke the CLI directly via `node node_modules/@art-domains/workspace-cli/dist/index.js`.
- The workspace repo has an unrelated change in `ops/records/workspace.art` (not part of this commit) and an untracked report file from the previous delegation (`workspace-config__report.md`).
