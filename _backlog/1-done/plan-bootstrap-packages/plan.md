# Plan: Bootstrap Packages

**ID:** `bootstrap-packages`

**Status:** `READY`

**Template:** `.agents/domains/plans/templates/plan__template.md`

**Skill:** `write-plan`

## Summary

Bootstrap `@art-js/artificial-primitives` (types only) and `@art-js/artificial-parser` in a single commit: migrate the core types into primitives and prove the parser package consumes primitives from its entry point and export a `parse(): void { return undefined }` stub — the entry-point contract that phase 2's fixture runner (`plan-migrate-testing-fixtures`) imports and calls. POC Parse — which stood in lieu of the parser lib — is superseded in phase 3 and archived in phase 10. Executed within the Artificial repository (`repos/artificial`) as phase 1 of the MD Art Roundtrip milestone.

## Scope

This section describes the working scope, where the plan is executed and what it modifies, including the scope resources involved or modified by the plan: workspace paths, repositories, packages, and deployments.

### Out of Scope

- Out of scope: parser code migration and POC-snapshot verification, addressed by the parser migration in phase 3 (`plan-migrate-and-verify`).
- Out of scope: fixture suite migration, addressed by the fixture copy in phase 2 (`plan-migrate-testing-fixtures`).
- Out of scope: constructs and serializer packages, addressed by the factory extraction in phase 4 (`plan-implement-constructs`) and the serializer bootstrap in phase 5 (`plan-implement-serializer`).
- Out of scope: roundtrip verification and pipeline tests, addressed by the two-way fixture tests in phase 5 and the pipeline suite in phase 6 (`plan-migrate-tests-pipeline`).
- Out of scope: roundtrip gap refinements (whitespace gaps preserved), addressed reactively in phase 8 (`plan-implement-gaps`).
- Out of scope: archive and publish, addressed in phase 10 (`plan-archive-poc-and-publish`).

### Workspace

**Workspace:** Running on $WORKSPACE = `project-parser-architect`; managed by `@art-domains/workspace-cli`; explained in `$WORKSPACE/\_guide.md`.

### Project Repositories

- Repository: Artificial – Checked out at `repos/artificial` branch `main`; described by `ops/records/projects/artificial.art`.

### Packages

- Package: Artificial Primitives – Canonical `@art-js/artificial-primitives` (public @0.0.1); described by `ops/records/packages/artificial-primitives.art`; located at `art-js/libs/primitives/`.
- Package: Artificial Parser – Canonical `@art-js/artificial-parser` (public @0.0.1); described by `ops/records/packages/artificial-parser.art`; located at `art-js/libs/parser/` (consumes primitives from its entry point in this plan).
- Package: Artificial POC Parse – Canonical `@art-js/poc-parse`; described by `ops/records/packages/artificial-poc-parse.art`; located at `art-js/cli/poc-parse/` (migration source; read-only).

### Deployments

None.

## Context

This section describes the context feeding (and being affected by) the plan, including sources of work, entry point guides, and knowledge resources.

### Sources

- Milestone: `_backlog/4-next/milestone-md-art-roundtrip/milestone.md` – defines this plan as phase 1 of the MD Art Roundtrip milestone, its package targets, and dependencies.
- Briefing: `_backlog/_architect.md` – approach (POC-first, schema-first in TS, mdast substrate) and milestone sequence.
- Parking Lot: `_backlog/_parking-lot.md` – pending items and open questions relevant to primitives/parser migration.
- Plan (archived): `_backlog/1-done/plan-poc-parse/plan.md` – POC current state, learnings, and feedback; source code to migrate at `art-js/cli/poc-parse/src/parse/`.

### Guides

- `repos/artificial/_guide.md` – repository layout, setup (`npm ci` at root), per-package verification commands, records and references locations, planning workflow.
- `repos/artificial/art-js/cli/poc-parse/_guide.md` – nested guide for the POC package (migration source); references `_pseudo.md` and architecture; notes the archived backlog.

### Knowledge

- Pseudo: `art-js/cli/poc-parse/_pseudo.md` – parser architecture (source of truth): context-aware visiting, factories, handlers.
- Architecture: `architecture/index.md` – artificial ecosystem overview.
- ADR: `architecture/records/adr/parser.art` – mdast-based substrate research behind the parser.
- ADR: `architecture/records/adr/language.art` – language and parser containment model decisions.

## Mandatory Reading

For the delegatee (shared context; per-step context is in each instruction file):

- `art-js/cli/poc-parse/_pseudo.md` – parser architecture (source of truth).
- `art-js/cli/poc-parse/src/parse/` – current POC implementation to migrate.

## Execution Context

Execution occurs in `$WORKSPACE/repos/artificial` on branch `main`; working directories are `$PROJECT/art-js/libs/primitives` and `$PROJECT/art-js/libs/parser`.

## Setup

Run from `repos/artificial` repository directory:

```bash
npm ci # to install dependencies.
```

## Verification

Run per package modified:

```bash
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues (prettier, eslint, tsc --noEmit)
npm run build
npm run test
```

## Commits

### `bootstrap-primitives-and-parse-libs` - `COMMITTED`

**Commit Message:** `build(md-art-roundtrip): bootstrap primitives and parser libs`

**Commit:** `d050b02`

**Instructions File:** `_backlog/3-now/plan-bootstrap-packages/instructions/bootstrap-primitives-and-parse-libs.md`

**Scope:**

- Migrate types from `poc-parse/src/parse/types.ts` to `art-js/libs/primitives/src/`
- Create entry point `src/index.ts` re-exporting all types
- Bootstrap `@art-js/artificial-parser` consuming `@art-js/artificial-primitives` from its entry point: import a simple type, declare a const of that type, `console.info(value)` (allow-listed by the root `no-console` rule — `allow: ['info', 'warn', 'error']`; no disable comment needed), and export a `parse(): void { return undefined }` stub (phase 2's runner imports it); add the primitives dependency `"@art-js/artificial-primitives": "*"` to `art-js/libs/parser/package.json` and regenerate the lockfile via `npm install` at the repository root
- Keep the vite build in both packages; do not modify poc-parse
- Verify: `npm run lint`, `npm run build` in both packages

```
**CHANGELOG:**

- Migrate POC parse types into `@art-js/artificial-primitives` (src/index.ts entry point)
- Bootstrap `@art-js/artificial-parser` consuming `@art-js/artificial-primitives` (smoke console.info) and exporting the `parse(): void { return undefined }` stub
- Wire `@art-js/artificial-primitives` workspace dependency + regenerate lockfile
```

## Follow ups

None.

## Feedback

Nothing relevant.
