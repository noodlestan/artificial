# Plan: Implement Gaps

**ID:** `implement-gaps`

**Status:** `PREPARING`

**Template:** `.agents/domains/plans/templates/plan__template.md`

**Skill:** `write-plan`

## Summary

Close the roundtrip gaps surfaced by the pipeline suite (phase 6), one gap at a time. Move from the one-liner markdown fixture toward text, lists, sections, and formatting in small fixture files, addressing gaps as they surface and refining the parser/serializer implementation. Planned last and reactive to the pipeline test results. Pure-whitespace gap `NaturalBlock`s are **preserved** (milestone decision) — no filtering; all refinements stay consistent with the verified migration baseline. Executed within the Artificial repository (`repos/artificial`) as phase 8 of the MD Art Roundtrip milestone.

## Scope

This section describes the working scope, where the plan is executed and what it modifies, including the scope resources involved or modified by the plan: workspace paths, repositories, packages, and deployments.

### Out of Scope

- Out of scope: archive and publish (after the roundtrip reaches 100% lossless), addressed in phase 10 (`plan-archive-poc-and-publish`).

### Workspace

**Workspace:** Running on $WORKSPACE = `project-parser-architect`; managed by `@art-domains/workspace-cli`; explained in `$WORKSPACE/\_guide.md`.

### Project Repositories

- Repository: Artificial — Checked out at `repos/artificial` branch `main`; described by `ops/records/projects/artificial.art`.

### Packages

- Package: Artificial Parser — Canonical `@art-js/artificial-parser` (public @0.0.1); described by `ops/records/packages/artificial-parser.art`; located at `art-js/libs/parser/` (refined as gaps close).
- Package: Artificial Serializer — Canonical `@art-js/artificial-serializer` (public @0.0.1); described by `ops/records/packages/artificial-serializer.art`; located at `art-js/libs/serializer/` (refined as gaps close).
- Package: Artificial Constructs — Canonical `@art-js/artificial-constructs` (public @0.0.1); described by `ops/records/packages/artificial-constructs.art`; located at `art-js/libs/constructs/` (refined as gaps close).
- Package: Artificial Primitives — Canonical `@art-js/artificial-primitives` (public @0.0.1); described by `ops/records/packages/artificial-primitives.art`; located at `art-js/libs/primitives/` (refined as gaps close).
- Package: Artificial POC Parse — Canonical `@art-js/poc-parse`; described by `ops/records/packages/artificial-poc-parse.art`; located at `art-js/cli/poc-parse/` (migration source; read-only).

### Deployments

None.

## Context

This section describes the context feeding (and being affected by) the plan, including sources of work, entry point guides, and knowledge resources.

### Sources

- Milestone: `_backlog/3-now/milestone-md-art-roundtrip/milestone.md` — defines this plan as phase 8; Decisions (preserve whitespace gaps; JSON-affecting logic changes only after the verified migration).
- Briefing: `_backlog/_architect.md` — approach (POC-first, schema-first in TS, mdast substrate) and milestone sequence.
- Parking Lot: `_backlog/_parking-lot.md` — pending items relevant to roundtrip gaps.
- Plan (archived): `_backlog/1-done/plan-poc-parse/plan.md` — POC current state, learnings, and feedback; the gap findings.

### Guides

- `repos/artificial/_guide.md` — repository layout, setup (`npm ci` at root), per-package verification commands, records and references locations, planning workflow.
- `repos/artificial/art-js/cli/poc-parse/_guide.md` — nested guide for the POC package (migration source); references `_pseudo.md` and architecture; notes the archived backlog.

### Knowledge

- Pipeline suite: `art-js/cli/pipeline-tests/` — the two-way fixture tests and `fixtures/roundtrip/` (phase 6); the gap list starts from its results.
- Pseudo: `art-js/cli/poc-parse/_pseudo.md` — parser architecture (source of truth).
- Architecture: `architecture/index.md` — artificial ecosystem overview.
- ADR: `architecture/records/adr/parser.art`, `architecture/records/adr/language.art` — substrate and containment decisions.

## Mandatory Reading

For the delegatee (shared context; per-step context is in each instruction file):

- `art-js/cli/pipeline-tests/fixtures/roundtrip/` — the current roundtrip fixture set and its surfaced gaps.
- `art-js/cli/poc-parse/_pseudo.md` — parser architecture (source of truth).

## Execution Context

Execution occurs in `$WORKSPACE/repos/artificial` on branch `main`; working directories are `$PROJECT/art-js/cli/pipeline-tests`, `$PROJECT/art-js/libs/parser`, `$PROJECT/art-js/libs/serializer`, and `$PROJECT/art-js/libs/constructs`.

## Setup

Run from `repos/artificial` repository directory:

```bash
npm ci # to install dependencies.
```

## Verification

Run in the pipeline suite:

```bash
npm run test # roundtrip fixtures must close with zero diffs
```

Plus per package modified:

```bash
npm run lint:fix
npm run lint
npm run build
npm run test
```

## Commits

### `roundtrip-text-fixture` - `DRAFT`

**Commit Message:** `build(md-art-roundtrip): close roundtrip gaps for text content`

**Instructions File:** `_backlog/4-next/plan-implement-gaps/instructions/roundtrip-text-fixture.md`

**Scope:**

- Add the next fixture (text content) to `fixtures/roundtrip/`
- Refine parser/serializer to close the surfaced gaps
- Verify: roundtrip diff is zero for the added fixture; existing fixtures still pass

### `roundtrip-lists-fixture` - `DRAFT`

**Commit Message:** `build(md-art-roundtrip): close roundtrip gaps for lists`

**Instructions File:** `_backlog/4-next/plan-implement-gaps/instructions/roundtrip-lists-fixture.md`

**Scope:**

- Add the lists fixture to `fixtures/roundtrip/`
- Refine parser/serializer to close the surfaced gaps
- Verify: roundtrip diff is zero for the added fixture; existing fixtures still pass

### `roundtrip-sections-fixture` - `DRAFT`

**Commit Message:** `build(md-art-roundtrip): close roundtrip gaps for sections`

**Instructions File:** `_backlog/4-next/plan-implement-gaps/instructions/roundtrip-sections-fixture.md`

**Scope:**

- Add the sections fixture to `fixtures/roundtrip/`
- Refine parser/serializer to close the surfaced gaps (inter-section whitespace stays preserved)
- Verify: roundtrip diff is zero for the added fixture; existing fixtures still pass

### `roundtrip-formatting-fixture` - `DRAFT`

**Commit Message:** `build(md-art-roundtrip): close roundtrip gaps for formatting`

**Instructions File:** `_backlog/4-next/plan-implement-gaps/instructions/roundtrip-formatting-fixture.md`

**Scope:**

- Add the formatting fixture (emphasis, code, links, etc.) to `fixtures/roundtrip/`
- Refine parser/serializer to close the surfaced gaps
- Verify: roundtrip diff is zero for the added fixture; existing fixtures still pass

## Follow ups

None.

## Feedback

No sub-agent reports yet.
