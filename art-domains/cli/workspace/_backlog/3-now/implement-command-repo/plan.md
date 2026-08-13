# Plan: Workspace CLI — Repo Command

**ID:** `implement-command-repo`

**Status:** `DONE`

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

## Commits

### `repo-command` - `COMMITTED`

**Commit Message:** `feat(workspace-cli): implement repo command`

**Commit:** `76cd4b4`

**Artefacts:**

- `src/commands/repo/runRepo.ts` — repo command handler
- `src/commands/repo/runRepo.test.ts` — BDD test scaffolds (8 pending)
- `src/private/records/project/` — project record reading functions
- `src/private/records/namespace/` — namespace record reading functions
- `src/private/records/package/` — package record reading functions
- `src/private/records/projectGraph/` — graph loading, consolidation, findPackage
- `src/private/present/presentPackageStateReport.ts` — package state report presenter

**Report:** [repo-command\_\_report.md](./instructions/repo-command__report.md)

### `fix-repo-record-parsing` - `COMMITTED`

**Commit Message:** `fix(workspace-cli): fix record parsing and add kind field`

**Commit:** `c09e766`

**Artefacts:**

- `src/private/records/types.ts` — added `kind` field to all record types
- `src/private/records/project/readProjectRecord.ts` — fixed namespace parsing for multi-line lists
- `src/private/records/namespace/readNamespaceRecord.ts` — added `kind: 'namespace'`
- `src/private/records/package/readPackageRecord.ts` — added `kind: 'package'`
- `src/test/writeProjectRecord.ts` — updated test helper for multi-line namespace format

**Report:** [fix-repo-record-parsing\_\_report.md](./instructions/fix-repo-record-parsing__report.md)

### `repo-test-coverage` - `COMMITTED`

**Commit Message:** `test(workspace-cli): implement repo command test coverage`

**Commit:** `9227012`

**Artefacts:**

- `src/commands/repo/runRepo.test.ts` — implemented 8 BDD scenario tests
- `src/private/records/projectGraph/loadProjectGraph.test.ts` — implemented 24 record reading and graph tests
- `src/private/present/presentPackageStateReport.test.ts` — implemented 4 package state report tests

**Report:** [repo-test-coverage\_\_report.md](./instructions/repo-test-coverage__report.md)

## Follow ups

- This command is prerequisite for `link` and `publish` commands.
- Consider caching `npm info` results for performance.
