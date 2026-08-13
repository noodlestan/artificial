# Plan: Workspace CLI — Fix Repo Command Graph Loading

**ID:** `fix-repo-command-graph-loading`

**Status:** `DRAFT`

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

### `fix-repo-command-graph-loading` - `PLANNED`

**Commit Message:** `fix(workspace-cli): repo command resolves package states correctly`

Fix repo command showing "unknown package" for every package. Investigate graph loading, package resolution, and why hydrated checkout list appears after package states.

**Use case:**

- `npm run workspace repo` shows correct package states (version, published version, states)
- No "unknown package" errors for valid packages
- No duplicate checkout list after package states

**Responsibilities:**

- Investigate why packages show as "unknown"
- Fix graph loading to correctly resolve package records
- Fix package state resolution (version, published version)
- Remove duplicate checkout list output
- Verify with existing tests

**Edge cases:**

- Package record missing
- Namespace record missing
- Project record missing
- package.json missing
- npm info fails

**Pseudo details:** `architecture/_pseudo.md` → Use Cases → repo command.

**BDD:** `architecture/commands.md` → Repo section.

## Follow ups

- None.
