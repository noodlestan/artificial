# Plan: Workspace CLI — Fix Repo Command Graph Loading

**ID:** `fix-repo-command-graph-loading`

**Status:** `DONE`

**Template:** `plan`

**Skill:** `write-plan`

## Summary

Fix repo command showing "unknown package" for every package, followed by hydrated checkout list. Investigate graph loading and package resolution logic.

## Source Tasks

- Parking lot bug: "Repo shows unknown package everywhere"

## Mandatory Reading

- `_backlog/_architect.md` — workspace architecture, principles, NFRs, use cases
- `architecture/_pseudo.md` — CLI pseudo-code: data structures, use cases, auxiliary functions
- `architecture/context-model.md` — WorkspaceContext, CheckoutStore, Project Records
- `architecture/commands.md` — command surface and BDD scenarios

## Iterations

### `fix-repo-command-graph-loading` - `DONE`

**Commit:** `c5baa99`

**Commit Message:** `fix(workspace-cli): repo command resolves package states correctly`

**Outcome:** Fixed namespace record parser to handle multi-line list format, moved report presentation outside checkout loop, updated test helper to write list format. All 152 tests pass.

**Files changed:**

- `src/private/records/namespace/readNamespaceRecord.ts`
- `src/commands/repo/runRepo.ts`
- `src/test/writeProjectRecord.ts`

Fix repo command showing "unknown package" for every package, followed by duplicate checkout list.

**Root cause:**

1. `readNamespaceRecord.ts` parser uses regex that only captures first line of `**Packages:**` section
2. Actual record format uses multi-line list: `**Packages:**\n\n- Package: Name1\n- Package: Name2`
3. Parser extracts `- Package: Name1` instead of `Name1`, causing package lookup to fail
4. `runRepo.ts` presents checkout report inside per-checkout loop instead of after

**Solution:**

1. Fix `readNamespaceRecord.ts` to parse list format (mirror `readProjectRecord.ts` namespace parsing)
2. Move report presentation outside the loop in `runRepo.ts`
3. Update test helper `writeNamespaceRecord.ts` to use list format (match actual records)
4. Update tests to verify list format parsing

**Use case:**

- `npm run workspace repo` shows correct package states (version, published version, states)
- No "unknown package" errors for valid packages
- No duplicate checkout list after package states

**Responsibilities:**

- Fix namespace record parser to handle list format
- Extract package names from `- Package: {name}` lines
- Move report presentation outside per-checkout loop
- Update test helper to write list format
- Verify all tests pass

**Edge cases:**

- Package record missing
- Namespace record missing
- Project record missing
- package.json missing
- npm info fails
- Empty packages list
- Multiple packages in list

**Pseudo details:** `architecture/_pseudo.md` → Use Cases → repo command.

**BDD:** `architecture/commands.md` → Repo section.

## Follow ups

- None.
