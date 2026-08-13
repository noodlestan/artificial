# Plan: Artificials POC Parse

**ID:** `poc-parse`

**Status:** `WORKING`

**Template:** `.agents/domains/plans/templates/plan__template.md`

**Skill:** `write-plan`

## Summary

POC-first spike of the artificials parser: a self-contained, CLI-executable package `@art-js/poc-parse` at `art-js/cli/poc-parse/` based on `mdast`.

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
- `artificials/architecture/index.md` — architecture overview.
- `artificials/architecture/records/adr/parser.md` — substrate research behind the spike.

## Commits

### `scaffold-poc-parse` - `COMMITTED`

**Commit Message:** `poc-parse: scaffold cli package`

**Instructions File:** `artificials/_backlog/plan-poc-parse/instructions/scaffold-poc-parse.md`

**Evidence:** commit `ea047db0`; artefacts — `artificials/art-js/cli/poc-parse/**` (`@art-js/poc-parse` v0.0.1 CLI), `artificials/records/packages/artificials-poc-parse.art`, workspace entry `art-js/cli/poc-parse/` in `artificials/package.json`. CLI `npm run dev` prints banner, exit 0.

**Report:** `artificials/_backlog/plan-poc-parse/instructions/scaffold-poc-parse__report.md`

### `core-record-schema` - `COMMITTED`

**Commit Message:** `poc-parse: add core record schema types`

**Instructions File:** `artificials/_backlog/plan-poc-parse/instructions/core-record-schema.md`

**Evidence:** commit `fd67848`; artefacts — `art-js/cli/poc-parse/src/parse/types.ts` (core record schema: `Point`, `Position`, `RecordBase`, `SectionBlock`, `FieldBlock`, `NaturalBlock`, `Tag`, `Document`, open registries, derived unions). Types only, `tsc --noEmit` clean.

**Report:** `artificials/_backlog/plan-poc-parse/instructions/core-record-schema__report.md`

### `smoke-parse` - `COMMITTED`

**Commit Message:** `poc-parse: smoke-parse the corpus through micromark`

**Instructions File:** `artificials/_backlog/plan-poc-parse/instructions/smoke-parse.md`

**Evidence:** commits `147ab64` (smoke-parse), `aa8db92` (report); artefacts — `art-js/cli/poc-parse/src/parse/smoke-parse.ts` (micromark tokenization of 8 target files: 41 headings, 114 strong emphasis, 3 directives, 2 tags, 5 code fences), `artificials/_backlog/plan-poc-parse/instructions/smoke-parse-section-block__findings.md` (recommendation: micromark direct).

**Report:** `artificials/_backlog/plan-poc-parse/instructions/smoke-parse-section-block__report.md`

### `construct-stack-record-builder` - `COMMITTED`

**Commit Message:** `poc-parse: add construct-stack record builder`

**Instructions File:** `repos/artificial/_backlog/plan-poc-parse/instructions/construct-stack-record-builder.md`

**Evidence:** commit `7d23a6e`; artefacts — `art-js/cli/poc-parse/src/parse/builder.ts` (`buildDocument(markdown): Document` construct-stack builder), `art-js/cli/poc-parse/src/parse/parse.ts` (parse entry point + CLI), deleted `art-js/cli/poc-parse/src/parse/smoke-parse.ts`. `tsc --noEmit` clean; parse CLI emits JSON `SectionBlock`/`FieldBlock`/`NaturalBlock`/`Tag` records (corpus regression matches smoke counts; both tags surfaced).

**Report:** `repos/artificial/_backlog/plan-poc-parse/instructions/construct-stack-record-builder__report.md`

### `mdast-based-parse` - `COMMITTED`

**Commit Message:** `poc-parse: replace micromark builder with mdast-based parser`

**Instructions File:** `repos/artificial/_backlog/plan-poc-parse/instructions/mdast-based-parse.md`

**Evidence:** commit `11c3d04`; artefacts — rewritten `art-js/cli/poc-parse/src/parse/builder.ts` (mdast-based), new `art-js/cli/poc-parse/src/parse/factory.ts`, `types.ts` (`NaturalBlock.children`), `package.json` + workspace `package-lock.json` (deps `mdast-util-from-markdown`, `unist-util-visit`). `tsc --noEmit` exit 0; `npm run lint` clean; EC1–EC8 verified across `build-tools-dev.art`, `language.art`, `section-block.art`.

**Report:** `repos/artificial/_backlog/plan-poc-parse/instructions/mdast-based-parse__report.md`

### `cross-check-grammar-wip` - `CANCELLED`

**Reason:** Written for micromark-based builder. All fixes (FieldBlock detection, position cleanup, NaturalBlock enrichment) already done by mdast-based parser.

### `grammar-spec-fixes` - `COMMITTED`

**Commit Message:** `poc-parse: fix grammar spec gaps`

**Instructions File:** `repos/artificial/_backlog/plan-poc-parse/instructions/grammar-spec-fixes.md`

**Evidence:** commit `aaadf70`; artefacts — `art-js/spec/grammar/constructs/structural/field-block.art` (containment rules fixed), `art-js/spec/grammar/constructs/structural/section-block.art` (kind/name clarified), `art-js/spec/grammar/constructs/structural/natural-block.art` (catch-all purpose, `children` field added), `art-js/spec/grammar/expressions/tag.art` (prose-only detection clarified), `art-js/architecture/records/adr/language.art` (Parser Containment Model decision added). `tsc --noEmit` exit 0; `npm run lint` clean.

**Report:** `repos/artificial/_backlog/plan-poc-parse/instructions/grammar-spec-fixes__report.md`

### `extract-mdast-transparently` - `COMMITTED`

**Commit Message:** `poc-parse: ruthless rewrite for mdast transparency`

**Instructions File:** `repos/artificial/art-js/cli/poc-parse/_backlog/plan-poc-parse/instructions/extract-mdast-transparently.md`

**Evidence:** commit `e3b76c9`; artefacts — rewritten `art-js/cli/poc-parse/src/parse/builder.ts` (context-aware visiting with `createNestedContext`), rewritten `art-js/cli/poc-parse/src/parse/factory.ts` (VisitContext, factories, helpers), extended `art-js/cli/poc-parse/src/parse/types.ts` (`NaturalBlock` transparent with index signature `[key: string]: unknown`). `npm run lint` exit 0; TC1 verified — `SectionBlock { kind: "Routine", name: "List Tasks" }` output confirmed.

**Report:** `repos/artificial/art-js/cli/poc-parse/_backlog/plan-poc-parse/instructions/extract-mdast-transparently__report.md`

### `refine-parse-factories` - `COMMITTED`

**Commit Message:** `poc-parse: refine parse factories and builder`

**Instructions File:** `repos/artificial/art-js/cli/poc-parse/_backlog/plan-poc-parse/instructions/refine-parse-factories.md`

**Evidence:** commit `3b3a606`; artefacts — rewritten `art-js/cli/poc-parse/src/parse/factory.ts` (`close()` → `parent()`, `findParentSection` → `findTagable`, `ConstructHandler` interface + `createSectionBlockHandler`/`createFieldBlockHandler` factory functions), rewritten `art-js/cli/poc-parse/src/parse/builder.ts` (uses injected handlers, updated imports). `npm run lint` exit 0; TC1 verified.

**Report:** `repos/artificial/art-js/cli/poc-parse/_backlog/plan-poc-parse/instructions/refine-parse-factories__report.md`

### `abstract-builder` - `COMMITTED`

**Commit Message:** `poc-parse: abstract builder and encapsulate constructs`

**Instructions File:** `repos/artificial/art-js/cli/poc-parse/_backlog/plan-poc-parse/instructions/abstract-builder.md`

**Scope:**

- Rename `close()` → `parent()` (clearer naming)
- Rename `findParentSection()` → `findTagable()` (clearer purpose)
- Refactor `buildDocument` to inject construct-specific logic via contract (no closures over construct types)
- # Small bug fixes if noticed during review
- Rename `visitChildren` → `shouldVisit` (clearer boolean)
- Restructure `visitNode` with `maybeHandleFactory` (early return pattern)
- Rename `visitParagraph` → `handleBlock` (block handler, not paragraph-specific)
- Extract `handleNaturalBlock` (named function for natural block fallback)
- Document inline node SKIP behavior
- Move field detection into `VisitContext.detectField()` (encapsulate construct logic)

**Evidence:** commit `2b67209`; artefacts — rewritten `art-js/cli/poc-parse/src/parse/builder.ts` (`HandleResult` interface, `maybeHandleFactory` helper, `handleBlock`, `handleNaturalBlock`, restructured `visitNode` with early returns, uses `currentContext.detectField()`), rewritten `art-js/cli/poc-parse/src/parse/factory.ts` (`visitChildren` → `shouldVisit` in interface + 4 factories, `detectField` added to `VisitContext` interface and implemented in `createNestedContext`). `npm run lint` exit 0; TC1 verified.

**Report:** `repos/artificial/art-js/cli/poc-parse/_backlog/plan-poc-parse/instructions/abstract-builder__report.md`

### `define-parser-builder-construct-layers` - `DRAFT`

**Commit Message:** `poc-parse: define parser builder construct layers`

**Instructions File:** `repos/artificial/art-js/cli/poc-parse/_backlog/plan-poc-parse/instructions/define-parser-builder-construct-layers.md`

**Scope:**
- Clean `VisitContext` — remove `detectField`, `_section` (construct-specific pollution)
- Remove `isInlineNode` / `INLINE_TYPES` — let factories handle all nodes uniformly
- Create `ConstructPreProcessor` contract for field detection (before factory)
- Move tag detection out of `VisitContext.push()` into a handler
- Inject everything into `buildDocument` — no default args, `ParserConfig` interface
- Create `createDefaultConfig()` entry point
- Update `parse.ts` to use injected config

## Follow ups

- Race execution cycle — one commit per delegator session; after each delegation the planner session analyses the sub-agent report and feedback and authors the next instruction batch (increasing sizes, e.g. 2–3, then 4–5–6). Remaining commits move `DRAFT` → `PLANNED` as their instruction files are written.
- Reactive core (chokidar → signals → memo recompute) — blocked on the POC (signals + directivity need exercised grammar).
- Template engine research (Nunjucks/Handlebars/Liquid vs `.tart` requirements) — parallelizable.
- Precompiled rewrite — install-time compilation + per-project overrides, using render-cost evidence from the POC.
- Standalone build of the compile command — `artificials/bin/compile`, `artificials/architecture/records/adr/compile.art`-backed, aimed at POC step 8.

- Commit convention — all commits use `git commit --no-verify` to skip the pre-commit CI hooks (lefthook `clean` + `extract`); also documented in the module `_module.md` next-move routines.
- Convention — delegation and report files are co-located in `plan-{id}/instructions/` (`{id}.md` + `{id}__report.md`). `files/index.md` naming patterns and `execute-plan/SKILL.md` delegation-file link rule reconciled to this on 2026-08-08; all subsequent instructions and reports render into `instructions/`.
