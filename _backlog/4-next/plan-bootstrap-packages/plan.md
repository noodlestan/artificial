# Plan: Bootstrap Packages

**ID:** `bootstrap-packages`

**Status:** `PREPARING`

**Template:** `.agents/domains/plans/templates/plan__template.md`

**Skill:** `write-plan`

## Summary

Bootstrap `@art-js/artificials-primitives` (types only) and `@art-js/artificials-parser` in a single commit: migrate the core types into primitives and prove the parser package consumes primitives from its entry point. POC Parse — which stood in lieu of the parser lib — is superseded by `@art-js/artificials-parser` and archived in phase 3. Executed within the Artificial repository (`repos/artificial`) as phase 1 of the MD Art Roundtrip milestone.

## Scope

This section describes the working scope, where the plan is executed and what it modifies, including the scope resources involved or modified by the plan: workspace paths, repositories, packages, and deployments.

### Workspace

**Workspace:** Running on $WORKSPACE = `project-parser-architect`; managed by `@art-domains/workspace-cli`; explained in `$WORKSPACE/\_guide.md`.

### Project Repositories

- Repository: Artificial – Checked out at `repos/artificial` branch `main`; described by `ops/records/projects/artificial.art`.

### Packages

- Package: Artificials Primitives – Canonical `@art-js/artificials-primitives` (public @0.0.1); described by `ops/records/packages/artificials-primitives.art`; located at `art-js/libs/primitives/`.
- Package: Artificials Parser – Canonical `@art-js/artificials-parser` (public @0.0.1); described by `ops/records/packages/artificials-parser.art`; located at `art-js/libs/parser/` (consumes primitives from its entry point in this plan).
- Package: Artificials POC Parse – Canonical `@art-js/poc-parse`; described by `ops/records/packages/artificials-poc-parse.art`; located at `art-js/cli/poc-parse/` (migration source; read-only).

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
- Architecture: `architecture/index.md` – artificials ecosystem overview.
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

### `bootstrap-primitives-and-parse-libs` - `PLANNED`

**Commit Message:** `art-js: bootstrap primitives and parser libs`

**Instructions File:** `_backlog/4-next/plan-bootstrap-packages/instructions/bootstrap-primitives-and-parse-libs.md`

**Scope:**

- Migrate types from `poc-parse/src/parse/types.ts` to `art-js/libs/primitives/src/`
- Create entry point `src/index.ts` re-exporting all types
- Bootstrap `@art-js/artificials-parser` consuming `@art-js/artificials-primitives` from its entry point: import a simple type, declare a const of that type, `console.info(value)`; add the primitives dependency to `art-js/libs/parser/package.json`
- Keep the vite build in both packages; do not modify poc-parse
- Verify: `npm run lint`, `npm run build` in both packages

## Follow ups

- Phase 2 (`migrate-and-verify`) and phase 3 (`archive-and-publish`) of the MD Art Roundtrip milestone.
- Milestone open questions: remove `createNestedContext` injection from handler factories during migration; decide on pure-whitespace gap `NaturalBlock`s for the lossless roundtrip; decide whether the dead `fieldBlockFactory` export is kept.

## Feedback

No sub-agent reports yet.
