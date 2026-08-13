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

## Scaffold + Tests Strategy

Before writing implementation code, the worker MUST establish the test scaffolds and contracts. This ensures the implementation is driven by the BDD scenarios and conventions already defined in the architecture.

### Pre-work: Refactor scan and records structure

Reorganize scan and records modules into proper private directory structure:

- Move `src/shared/scan*` to `src/private/scan/` and update all imports
- Split `src/private/records/` into `src/private/records/repository/`, `src/private/records/checkout/`, and `src/private/records/projectGraph/` subdirectories
- Create `src/private/records/project/`, `src/private/records/namespace/`, `src/private/records/package/` for record reading functions
- Update all imports across the codebase that reference the moved files

### Test File Structure

Create test files following the existing patterns in `src/`:

- `src/commands/repo/*.test.ts` — unit tests for the repo command
- `src/private/records/projectGraph/loadProjectGraph.test.ts` — unit tests for graph loading and record reading
- `src/private/present/presentPackageStateReport.test.ts` — unit tests for presenting the Package State Report

### Test-First Approach

1. **Read BDD scenarios** from `architecture/commands.md` → Repo section
2. **Create test scaffolds** with pending tests for each BDD scenario
3. **Define contracts** (types, interfaces) before implementation:
   - `PackageStateRecord` (canonicalName, version, publishedVersion, directory, states)
   - `ProjectRecord`, `NamespaceRecord`, `PackageRecord`, `ProjectGraph` types
   - `loadProjectGraph`, `readProjectRecord`, `readProjectRecords`, `readNamespaceRecord`, `readNamespaceRecords`, `readPackageRecord`, `readPackageRecords` function signatures
   - `consolidateProjectGraph`, `findPackage`, `presentPackageStateReport` function signatures
4. **Implement incrementally** to make each test pass
5. **Verify edge cases** are covered by tests (unknown checkout, no project records, missing namespace/package, missing package.json, npm info failure)

### Conventions to Follow

- Use existing test patterns from `src/commands/clone/` and `src/commands/branch/`
- Follow the data flow pattern: load config → create context → hydrate → execute → present reports
- Use operation log factories from `src/private/operations/` (though `repo` is read-only, no operations logged)
- Use report presentation patterns from `src/private/present/`
- Use record patterns from `src/private/records/repository/` and `src/private/records/checkout/`
- Each record reading function should follow the singular/plural pattern (e.g., `readProjectRecord` and `readProjectRecords`)

## SETUP

Before starting work, execute the setup steps defined in `_guide.md`:

Run from repository root (monorepo):

```bash
npm ci # to install dependencies.
npm run ci # to verify build is green before starting
```

If any of these fail, resolve the issue before proceeding with implementation.

## Iterations

### `repo-command` - `DONE`

**Commit Message:** `feat(workspace-cli): implement repo command`

**Commit:** `76cd4b4`

**Artefacts:**

- `src/commands/repo/runRepo.ts` — repo command handler
- `src/commands/repo/runRepo.test.ts` — BDD test scaffolds
- `src/private/records/project/` — project record reading functions
- `src/private/records/namespace/` — namespace record reading functions
- `src/private/records/package/` — package record reading functions
- `src/private/records/projectGraph/` — graph loading, consolidation, findPackage
- `src/private/present/presentPackageStateReport.ts` — package state report presenter
- Test scaffolds for all core functions

**Report:** [repo-command\_\_report.md](./instructions/repo-command__report.md)

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

## Final Verification

After implementation, execute the verification steps defined in `_guide.md`:

Run from this package directory:

```bash
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues (prettier, eslint, tsc --noEmit)
npm run build
npm run test
```

Runs on pre-commit hook from the repository root:

```bash
npm run ci # lint, build and test
```

All steps MUST pass. If any step fails, fix the issue before considering the task complete.

## Follow ups

- This command is prerequisite for `link` and `publish` commands.
- Consider caching `npm info` results for performance.
