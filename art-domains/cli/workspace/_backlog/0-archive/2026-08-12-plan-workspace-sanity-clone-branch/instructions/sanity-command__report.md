# Sub-Agent REPORT (#producer)

**Plan:** `workspace-cli`

**Instruction Id:** `sanity-command`

**Outcome:** `COMPLETED`

## Evidence

### Changes

| Goal                               | Status | Evidence                                                                                                                                                                                                                  |
| ---------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------ | -------- |
| `verifyCheckouts` in config module | Done   | `src/config/verify-checkouts.ts` created, exported from `src/config/index.ts`; fills only requested fields (`exists`, `pushed`); missing dir → `exists: false`; no remote → `pushed: false`; dirty tree → `pushed: false` |
| `sanity` command                   | Done   | `src/sanity.ts` created with `runSanity({ root, auto })`; wired into `src/index.ts` with `--auto` option; classifies green vs non-green; table output with `repo/directory                                                | branch | issues | pushed?` |
| `--auto` push                      | Done   | Pushes clean unpushed repos only; marks as `pushed? = now`; never pushes dirty repos                                                                                                                                      |
| Tests per BDD spec                 | Done   | 23 tests pass (14 config + 9 sanity); coverage 94% lines, 100% functions, 79% branches                                                                                                                                    |
| Publish 0.0.7 and consume          | Done   | `@art-domains/workspace-cli@0.0.7` published to npm; workspace root devDependency bumped to `0.0.7`; `art-workspace sanity` runs end-to-end                                                                               |

#### Files changed

- `repos/artificial/art-domains/cli/workspace/src/config/verify-checkouts.ts` — new file: `verifyCheckouts` function with `gitIsUpToDate` helper
- `repos/artificial/art-domains/cli/workspace/src/config/index.ts` — added `verifyCheckouts` and `VerifyNeeds` exports
- `repos/artificial/art-domains/cli/workspace/src/config/load-config.ts` — fixed runtime esbuild bundle: added externals for node builtins, esbuild, simple-git; write temp bundle to workspace root instead of /tmp
- `repos/artificial/art-domains/cli/workspace/src/sanity.ts` — new file: `runSanity` function with git status classification, `--auto` push, table output
- `repos/artificial/art-domains/cli/workspace/src/sanity.test.ts` — new file: 9 BDD-spec tests covering classification, push, edge cases
- `repos/artificial/art-domains/cli/workspace/src/config/config.test.ts` — added 6 `verifyCheckouts` unit tests
- `repos/artificial/art-domains/cli/workspace/src/index.ts` — wired `sanity` command with `--auto` option; version bumped to 0.0.7
- `repos/artificial/art-domains/cli/workspace/package.json` — version bumped to 0.0.7
- `repos/artificial/art-domains/cli/workspace/.gitignore` — added `.art-workspace-bundle.mjs` and `coverage/`
- `package.json` (workspace root) — devDependency bumped to `@art-domains/workspace-cli@0.0.7`
- `.gitignore` (workspace root) — added `.art-workspace-bundle.mjs`

## Feedback

### For the planner

The instruction was clear and self-contained. The BDD spec in `plan__pseudo__sanity.md` and `plan__pseudo__config.md` provided precise contracts.

### For the technical writers

1. **Where:** `plan__pseudo__config.md` → `loadWorkspaceConfig` procedure
   **Problem:** The runtime esbuild bundle was inlining `esbuild` and `simple-git` from the config module, causing "Dynamic require of 'fs' is not supported" when the temp bundle was loaded as ESM.
   **Decision:** Added `external: ['node:fs', 'node:os', 'node:path', 'node:url', 'fs', 'os', 'path', 'url', 'esbuild', 'simple-git']` to the esbuild options, and wrote the temp bundle to the workspace root (not `/tmp`) so it can resolve packages from the workspace root's `node_modules`.
   **READY-TO-APPLY snippet for `plan__pseudo__config.md`:**

   ```
   output = esbuild.build({
     entryPoints: [path],
     bundle: true,
     write: false,
     format: 'esm',
     platform: 'node',
     external: ['node:fs', 'node:os', 'node:path', 'node:url', 'fs', 'os', 'path', 'url', 'esbuild', 'simple-git'],
   })
   tmp = write bundled output to join(root, '.art-workspace-bundle.mjs')
   ```

2. **Where:** `plan__pseudo__sanity.md` → Procedure step 5 (If `--auto` flag provided)
   **Problem:** The spec says "For each 'unpushed' repo (clean working tree, unpushed commits): git push". But repos without a tracking branch have `pushed: false` from `verifyCheckouts` but no "ahead" issue, so the push condition needs to check for remote presence, not just "ahead" commits.
   **Decision:** Changed the push condition to: if `pushed === 'no'` and no "no remote" issue, attempt push.
   **READY-TO-APPLY snippet for `plan__pseudo__sanity.md`:**

   ```
   5. If `--auto` flag provided
      - For each repo where pushed = 'no' and issues does not contain 'no remote':
        - Skip if dirty, detached HEAD, or merge conflicts
        - `git push origin <branch>` → push to remote
        - Update status to "now" (pushed during this run)
   ```

3. **Where:** `plan__pseudo__sanity.md` → Output table
   **Problem:** The spec shows `pushed?` values as `no/now/yes`, but doesn't clarify whether `now` (pushed during this run) should be treated as green (absent from table) or non-green.
   **Decision:** Treated `now` as green (repo is now up-to-date after push).
   **READY-TO-APPLY snippet for `plan__pseudo__sanity.md`:**
   ```
   Status values for `pushed?`:
   - `no` — unpushed, not pushed (dirty or `--auto` not provided)
   - `now` — unpushed, pushed during this run (`--auto` provided and repo was clean) — treated as green
   - `yes` — already up-to-date with remote
   ```

### For the crew

- The `bin` entry was removed during npm publish due to npm auto-correction. The CLI still works via `npx` and the workspace script, but the global `art-workspace` bin may not be available. Consider adding a `.npmignore` file or fixing the `bin` field in `package.json` to prevent npm from removing it.
- The temp bundle file (`.art-workspace-bundle.mjs`) is now written to the workspace root. It's gitignored but may be visible in the workspace. Consider cleaning it up after loading or using a more隐蔽 location.
