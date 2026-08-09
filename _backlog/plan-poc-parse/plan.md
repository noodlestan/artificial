# Plan: Artificials POC Parse

**ID:** `poc-parse`

**Status:** `WORKING`

**Template:** `.agents/domains/plans/templates/plan__template.md`

**Skill:** `write-plan`

## Summary

POC-first spike of the artificials parser: a self-contained, CLI-executable package `@art-js/poc-parse` at `art-js/cli/poc-parse/`, internally partitioned along the pipeline boundaries (parse/extract/transform/render). Exercise the parse slice on the ADR corpus first; schema-first in TS (types as the metalanguage); micromark substrate; then reconcile the grammar WIP as the parser exercises it. Covers POC Steps 1–7; reactivity, template-engine research, and the precompiled rewrite are explicit follow-ups.

## Source Tasks

No `task-{id}/task.md` files exist yet (backlogs domain WIP). Source of this plan is the artificials work tracker (repo-root-relative links):

- [Artificials Plan — Approach + Work ahead](artificials/_architect.md)
- [Artificials WIP — ACTIONABLE](artificials/_wip.md)
- [Substrate Research ADR](artificials/architecture/records/adr/_research.md)

## Mandatory Reading

For the delegator (execution mechanics):

- `.agents/domains/plans/definitions/index.md` — plan, implementation-instructions, delegation, and report definitions.
- `.agents/domains/plans/files/index.md` — plan, instruction, delegation, and report file conventions.
- `.agents/domains/plans/structures/plan__structure.md` — plan record fields and statuses.
- `.agents/skills/execute-plan/SKILL.md` — how this plan is executed by delegation.

For the delegatee (shared context; per-step context is in each instruction file):

- `artificials/_guide.md` — artificials system overview: compiler pipeline and compilation model.
- `artificials/_architect.md` — approach and the step being executed.
- `artificials/_wip.md` — the ACTIONABLE list; identifies the current step.
- `artificials/architecture/records/adr/_research.md` — substrate research behind the spike.

## Commits

### `scaffold-poc-parse` - `COMMITTED`

**Commit Message:** `poc-parse: scaffold cli package`

**Instructions File:** `artificials/_backlog/plan-poc-parse/instructions/scaffold-poc-parse.md`

**Sub-Agent:** `scaffold-poc-parse`

**Evidence:** commit `ea047db0`; artefacts — `artificials/art-js/cli/poc-parse/**` (`@art-js/poc-parse` v0.0.1 CLI), `artificials/records/packages/artificials-poc-parse.art`, workspace entry `art-js/cli/poc-parse/` in `artificials/package.json`. CLI `npm run dev` prints banner, exit 0.

**Report:** `artificials/_backlog/plan-poc-parse/instructions/scaffold-poc-parse__report.md`

### `core-record-schema` - `DONE`

**Commit Message:** `poc-parse: add core record schema types`

**Instructions File:** `artificials/_backlog/plan-poc-parse/instructions/core-record-schema.md`

**Sub-Agent:** `core-record-schema`

**Evidence:** commit `fd67848`; artefacts — `art-js/cli/poc-parse/src/parse/types.ts` (core record schema: `Point`, `Position`, `RecordBase`, `SectionBlock`, `FieldBlock`, `NaturalBlock`, `Tag`, `Document`, open registries, derived unions). Types only, `tsc --noEmit` clean.

**Report:** `artificials/_backlog/plan-poc-parse/instructions/core-record-schema__report.md`

### `smoke-parse-corpus` - `PLANNED`

**Commit Message:** `poc-parse: smoke-parse the corpus`

**Instructions File:** `artificials/_backlog/plan-poc-parse/instructions/smoke-parse-corpus.md`

**Sub-Agent:** (pending)

### `construct-stack-record-builder` - `DRAFT`

**Commit Message:** `poc-parse: add construct-stack record builder`

**Instructions File:** `artificials/_backlog/plan-poc-parse/instructions/smoke-parse-corpus.md`

**Sub-Agent:** (pending)

### `cross-check-grammar-wip` - `DRAFT`

**Commit Message:** `poc-parse: cross-check grammar wip`

**Instructions File:** `artificials/_backlog/plan-poc-parse/instructions/smoke-parse-corpus.md`

**Sub-Agent:** (pending)

### `grammar-spec-fixes` - `DRAFT`

**Commit Message:** `poc-parse: fix grammar spec gaps`

**Instructions File:** `artificials/_backlog/plan-poc-parse/instructions/smoke-parse-corpus.md`

**Sub-Agent:** (pending)

### `first-constructs-vertical-slice` - `DRAFT`

**Commit Message:** `poc-parse: land first constructs and prep vertical slice`

**Instructions File:** `artificials/_backlog/plan-poc-parse/instructions/smoke-parse-corpus.md`

**Sub-Agent:** (pending)

## Follow ups

- Race execution cycle — one commit per delegator session; after each delegation the planner session analyses the sub-agent report and feedback and authors the next instruction batch (increasing sizes, e.g. 2–3, then 4–5–6). Remaining commits move `DRAFT` → `PLANNED` as their instruction files are written.
- Reactive core (chokidar → signals → memo recompute) — blocked on the POC (signals + directivity need exercised grammar).
- Template engine research (Nunjucks/Handlebars/Liquid vs `.tart` requirements) — parallelizable.
- Precompiled rewrite — install-time compilation + per-project overrides, using render-cost evidence from the POC.
- Standalone build of the compile command — `artificials/bin/compile`, `artificials/architecture/records/adr/compile.art`-backed, aimed at POC step 8.

- Commit convention — all commits use `git commit --no-verify` to skip the pre-commit CI hooks (lefthook `clean` + `extract`); also documented in the module `_module.md` next-move routines.
- Convention — delegation and report files are co-located in `plan-{id}/instructions/` (`{id}.md` + `{id}__report.md`). `files/index.md` naming patterns and `execute-plan/SKILL.md` delegation-file link rule reconciled to this on 2026-08-08; all subsequent instructions and reports render into `instructions/`.

## Feedback

- `scaffold-poc-parse`: see `artificials/_backlog/plan-poc-parse/instructions/scaffold-poc-parse__report.md`. Key planner items F1–F3 (workspace entry in `artificials/package.json` not repo-root; scaffolder naming `Scaffolder Skeleton: CLI Package`; `ci` deferred, no build/deps yet) + technical-writer items F4–F5 (tsconfig extends path; README link targets).
- `core-record-schema`: see `artificials/_backlog/plan-poc-parse/instructions/core-record-schema__report.md`. Key planner item F1 (stale `_research.md` path: `artificials/architecture/records/adr/_research.md` → `artificials/ops/records/adr/_research.md`; affects plan.md lines 21, 37 and _architect.md line 11).
