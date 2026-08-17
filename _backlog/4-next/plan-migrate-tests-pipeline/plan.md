# Plan: Migrate Tests to Pipeline

**ID:** `migrate-tests-pipeline`

**Status:** `PREPARING`

**Template:** `.agents/domains/plans/templates/plan__template.md`

**Skill:** `write-plan`

## Summary

Migrate the test suites into `@art-js/pipeline-test-cli` at `art-js/cli/pipeline-tests/`, where tests depend on BOTH `@art-js/artificial-parser` and `@art-js/artificial-serializer`. Add a second test on `scripts/roundtrip.ts` with fixtures at `fixtures/roundtrip/`, adding one fixture at a time and starting with a simple `# File one line` to prove the roundtrip test works. When whitespace (or other) roundtrip gaps surface, attempt a quick hack; if blocked, do NOT add more fixtures — defer to the next plan (`implement-gaps`). Executed within the Artificial repository (`repos/artificial`) as phase 6 of the MD Art Roundtrip milestone.

## Scope

This section describes the working scope, where the plan is executed and what it modifies, including the scope resources involved or modified by the plan: workspace paths, repositories, packages, and deployments.

### Out of Scope

- Out of scope: roundtrip gap closure (text, lists, sections, formatting; whitespace preserved), addressed reactively in phase 8 (`plan-implement-gaps`) — this plan stops adding fixtures and defers when blocked.
- Out of scope: archive and publish, addressed in phase 10 (`plan-archive-poc-and-publish`).

### Workspace

**Workspace:** Running on $WORKSPACE = `project-parser-architect`; managed by `@art-domains/workspace-cli`; explained in `$WORKSPACE/\_guide.md`.

### Project Repositories

- Repository: Artificial – Checked out at `repos/artificial` branch `main`; described by `ops/records/projects/artificial.art`.

### Packages

- Package: Artificial Parser – Canonical `@art-js/artificial-parser` (public @0.0.1); described by `ops/records/packages/artificial-parser.art`; located at `art-js/libs/parser/` (pipeline test dependency).
- Package: Artificial Serializer – Canonical `@art-js/artificial-serializer` (public @0.0.1); described by `ops/records/packages/artificial-serializer.art`; located at `art-js/libs/serializer/` (pipeline test dependency).
- Package: Pipeline Test CLI – Canonical `@art-js/pipeline-test-cli`; located at `art-js/cli/pipeline-tests/` (test harness CLI; not published; depends on parser + serializer).
- Package: Artificial POC Parse – Canonical `@art-js/poc-parse`; described by `ops/records/packages/artificial-poc-parse.art`; located at `art-js/cli/poc-parse/` (migration source; read-only).

### Deployments

None.

## Context

This section describes the context feeding (and being affected by) the plan, including sources of work, entry point guides, and knowledge resources.

### Sources

- Milestone: `_backlog/3-now/milestone-md-art-roundtrip/milestone.md` – defines this plan as phase 6; Decisions (two-way diffing established in phase 5); whitespace gaps preserved until the gaps phase.
- Briefing: `_backlog/_architect.md` – approach (POC-first, schema-first in TS, mdast substrate) and milestone sequence.
- Parking Lot: `_backlog/_parking-lot.md` – pending items relevant to pipeline testing.
- Plan (archived): `_backlog/1-done/plan-poc-parse/plan.md` – POC current state, learnings, and feedback.

### Guides

- `repos/artificial/_guide.md` – repository layout, setup (`npm ci` at root), per-package verification commands, records and references locations, planning workflow.
- `repos/artificial/art-js/cli/poc-parse/_guide.md` – nested guide for the POC package (migration source); references `_pseudo.md` and architecture; notes the archived backlog.

### Knowledge

- Fixture suite: `art-js/libs/parser/test/fixtures/` – existing fixture inputs, snapshots, and the two-way runner (phases 2 and 5); the pipeline suite builds on it.
- Pseudo: `art-js/cli/poc-parse/_pseudo.md` – parser architecture (source of truth).
- Architecture: `architecture/index.md` – artificial ecosystem overview.

## Mandatory Reading

For the delegatee (shared context; per-step context is in each instruction file):

- `art-js/libs/parser/test/` – the migrated fixture suite and runner to relocate/extend.
- `art-js/libs/serializer/src/` – the serializer API used by the roundtrip script.

## Execution Context

Execution occurs in `$WORKSPACE/repos/artificial` on branch `main`; working directory is `$PROJECT/art-js/cli/pipeline-tests`.

## Setup

Run from `repos/artificial` repository directory:

```bash
npm ci # to install dependencies.
```

## Verification

Run in the pipeline tests suite:

```bash
npm run test # roundtrip + fixture tests
```

Plus per package modified:

```bash
npm run lint:fix
npm run lint
npm run build
npm run test
```

## Commits

### `migrate-tests-pipeline` - `DRAFT`

**Commit Message:** `build(md-art-roundtrip): migrate tests to pipeline suite`

**Instructions File:** `_backlog/4-next/plan-migrate-tests-pipeline/instructions/migrate-tests-pipeline.md`

**Scope:**

- Create the pipeline tests suite at `art-js/cli/pipeline-tests/` with dependencies on parser and serializer
- Relocate the parser fixture suite and runner into the pipeline suite; keep the two-way assertions from phase 5
- Verify: `npm run test` passes in the pipeline suite
- Do not modify poc-parse (migration source; read-only)

### `roundtrip-smoke-fixture` - `DRAFT`

**Commit Message:** `build(md-art-roundtrip): add roundtrip smoke fixture`

**Instructions File:** `_backlog/4-next/plan-migrate-tests-pipeline/instructions/roundtrip-smoke-fixture.md`

**Scope:**

- Add `scripts/roundtrip.ts` — parse fixture → serialize → diff `source.md` against `parsed.md`
- Add `fixtures/roundtrip/` with a single fixture: `# File one line` — proves the roundtrip test works end to end
- Add one fixture at a time; on the first roundtrip gap (whitespace or other), attempt a quick hack; if blocked, STOP adding fixtures and defer to phase 8
- Verify: `npm run test` passes; roundtrip result on the one-liner fixture reported
- Do not modify poc-parse (migration source; read-only)

## Follow ups

None.

## Feedback

No sub-agent reports yet.
