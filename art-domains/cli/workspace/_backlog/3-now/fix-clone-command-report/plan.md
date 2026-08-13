# Plan: Workspace CLI — Fix Clone Command Report

**ID:** `fix-clone-command-report`

**Status:** `DRAFT`

**Template:** `plan`

**Skill:** `write-plan`

## Summary

Fix clone command report issues: checkout list shown twice, and report shows full checkout list without having scanned other repos.

## Source Tasks

- Parking lot bug: "Clone outputs checkout list twice"
- Parking lot bug: "Clone report shows checkout list without scanning"

## Mandatory Reading

- `_backlog/_architect.md` — workspace architecture, principles, NFRs, use cases
- `architecture/_pseudo.md` — CLI pseudo-code: data structures, use cases, auxiliary functions
- `architecture/commands.md` — command surface and BDD scenarios
- `architecture/reports.md` — How state and operation logs are presented

## Iterations

### `fix-clone-command-report` - `PLANNED`

**Commit Message:** `fix(workspace-cli): clone command report shows checkout list once and only for scanned repos`

Fix two bugs in clone command output: (1) checkout list appears twice, (2) report shows full checkout list even when only one repo was cloned (without having scanned others).

**Use case:**

- `npm run workspace clone` shows checkout list once
- `npm run workspace clone` (known project, not cloned) shows only the cloned checkout in report, not the full list

**Responsibilities:**

- Identify where checkout list is rendered twice and remove duplicate
- Ensure report only shows checkouts that were actually scanned/cloned
- Verify output matches expected behavior

**Edge cases:**

- Clone single repo
- Clone multiple repos
- Clone with --all flag
- Clone when checkout already exists

**Pseudo details:** `architecture/_pseudo.md` → Use Cases → clone command.

**BDD:** `architecture/commands.md` → Clone section.

## Follow ups

- None.
