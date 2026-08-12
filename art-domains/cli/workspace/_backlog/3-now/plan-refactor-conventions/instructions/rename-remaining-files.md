# Instruction: `rename-remaining-files`

## Goal

Rename the 9 remaining kebab-case files under `src/` to camelCase matching their single exported function, and update all imports. This closes the gap left by `rename-source-files` (planner misclassified hyphenated names as conformant).

## Scope

`$SCOPE` = `repos/artificial/art-domains/cli/workspace/src`

## Steps

1. Verify the full set of remaining kebab-case files:
   ```
   find $SCOPE -name "*-*"
   ```
   Expected result: exactly these 9 files (nothing else with a hyphen should remain):
   - `src/config/define-config.ts`
   - `src/private/git/has-remote.ts`
   - `src/private/git/is-dirty.ts`
   - `src/private/present/format-table.ts`
   - `src/private/store/create-checkout.ts`
   - `src/private/store/create-checkout.test.ts`
   - `src/test/commit-file.ts`
   - `src/test/create-command-context.ts`
   - `src/test/make-config.ts`

2. Rename each file with `git mv` to match its exported function:
   - `define-config.ts` → `defineConfig.ts`
   - `has-remote.ts` → `hasRemote.ts`
   - `is-dirty.ts` → `isDirty.ts`
   - `format-table.ts` → `formatTable.ts`
   - `create-checkout.ts` → `createCheckout.ts`
   - `create-checkout.test.ts` → `createCheckout.test.ts`
   - `commit-file.ts` → `commitFile.ts`
   - `create-command-context.ts` → `createCommandContext.ts`
   - `make-config.ts` → `makeConfig.ts`

3. Update every import statement that references the old paths. Do NOT change the exported function names, the import bindings, or any behavior. Expected importers (verify with grep, don't trust this list blindly):
   - `define-config`: `src/config/index.ts`
   - `has-remote` / `is-dirty`: `src/shared/scanCheckoutState.ts`
   - `format-table`: `src/private/present/presentCheckoutReport.ts`, `presentExtraneousReport.ts`, `presentOperationsReport.ts`
   - `create-checkout`: `src/commands/clone/cloneAll.ts`, `cloneSpecific.ts`, `cloneIfMissing.ts`, `src/private/store/createCheckoutStore.ts`, `hydrateStoreFromRecords.ts`, `src/commands/sanity/private/pushCheckout.ts`, `shouldPushCheckout.ts`
   - `create-checkout.test`: `src/private/store/create-checkout.test.ts` (the file itself — update only if it imports itself, which it does not; keep the file's own imports correct)
   - `commit-file`: test helpers and tests under `src/test/` and `src/commands/`
   - `create-command-context`: `src/test/` helpers used by command/record tests
   - `make-config`: `src/test/` helpers used by record/store tests
   - After the edit, `grep -rln "define-config\|has-remote\|is-dirty\|format-table\|create-checkout\|commit-file\|create-command-context\|make-config" $SCOPE` must return nothing.

4. Validate per step:
   - `npm run lint` — clean (includes prettier, eslint, tsc)
   - `npm run build` — clean

5. Run the full test suite: `npm run test` — 26 files, 82 tests, 0 skipped, all passing.

6. Commit:
   ```
   git add -A $SCOPE && git commit --no-verify -m "refactor(workspace-cli): rename remaining kebab-case files to camelCase" && git push origin main
   ```
   Expected output: exactly 9 renames (plus any import-only modifications).

## Do NOT

- Do NOT rename or modify any file not listed above.
- Do NOT rename `src/shared/scanExtraneousCheckouts.ts` (no hyphen — already conformant).
- Do NOT touch `architecture/commands.md` (uncommitted WIP, unrelated).
- Do NOT remove, add, or reorder any exports.
