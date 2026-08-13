# Plan: Workspace CLI — Repo Command

**ID:** `workspace-repo`

**Status:** `DRAFT`

**Template:** `plan`

**Skill:** `write-plan`

## Summary

Implement the `repo` command for `@art-domains/workspace-cli`. Lists repositories under active checkouts, their namespaces, and their packages. Infrastructure needed for `link` and `publish` commands.

## Source Tasks

- [Taken from Architect Briefing: Workspace CLI](_backlog/_architect.md)

## Mandatory Reading

- `_backlog/_architect.md` — workspace architecture, principles, NFRs, use cases
- `architecture/_pseudo.md` — CLI pseudo-code: data structures, use cases, auxiliary functions
- `architecture/commands.md` — command surface and BDD scenarios
- `architecture/context-model.md` — WorkspaceContext, CheckoutStore, Project Records

## Iterations

### `repo-command` - `PLANNED`

**Commit Message:** `feat(workspace-cli): implement repo command`

Implement `art-workspace repo` command.

**Use case:**

- `art-workspace repo [<checkout-name>...]` → list repositories under active checkouts, their namespaces, and their packages. All checkouts when none specified.

**Responsibilities:**

- Read checkout's project records (project → namespaces → packages)
- Resolve package paths and read `package.json` for current version
- Run `npm info` for last published version
- Collect `PackageStateRecord` per package
- Present Checkout Report + Package State Report

**Edge cases:**

- Unknown checkout → warn on stderr, skip.
- No project records → report checkout with state `no project records`.
- Missing namespace/package records → warn, skip.
- `package.json` missing → state `no package.json`.
- `npm info` fails → published version `unknown`.

**Pseudo details:** `architecture/_pseudo.md` → Use Cases → repo command.

**BDD:** `architecture/commands.md` → Repo section.

## Follow ups

- This command is prerequisite for `link` and `publish` commands.
- Consider caching `npm info` results for performance.
