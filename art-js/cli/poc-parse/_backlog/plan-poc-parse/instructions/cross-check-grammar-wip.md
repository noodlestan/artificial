# Implementation Instructions

**Plan:** `poc-parse`

**commit.Id:** `cross-check-grammar-wip`

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `repos/artificial/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `cross-check-grammar-wip`, created `src/parse/builder.ts` fixes, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Cross-check the construct-stack builder against the grammar WIP and fix gaps found during round-trip analysis. This step addresses:

1. **FieldBlock detection inconsistency** — multi-word field names (e.g. `**Canonical Name:**`) not detected as FieldBlocks.
2. **NaturalBlock value model** — currently `.value: string` but structured content (lists, code blocks) inside FieldBlocks is flattened. Design and implement a richer model.
3. **Position object hygiene** — strip internal micromark fields (`_bufferIndex`, `_index`) from position records.
4. **Grammar gap enumeration** — document what the parser can't express yet (feeds Step 6).

## Mandatory Reading

- `repos/artificial/_guide.md` — general info about the project; repo layout, working agreements, workflows.
- `repos/artificial/_architect.md` — Step 5 (cross-check against the grammar WIP).
- `repos/artificial/_wip.md` — only to identify the current step; NEVER modify it.
- `repos/artificial/art-js/cli/poc-parse/src/parse/types.ts` — the record schema.
- `repos/artificial/art-js/cli/poc-parse/src/parse/builder.ts` — the current builder implementation.
- `repos/artificial/_backlog/plan-poc-parse/instructions/construct-stack-record-builder__report.md` — feedback from Step 4.
- `repos/artificial/architecture/records/adr/language.art` — ADR on construct containment and the NaturalBlock catch-all.

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

### Step 1 — Fix FieldBlock detection for multi-word field names

The builder currently fails to detect `**Canonical Name:**` as a FieldBlock. The pattern should match any `**{word chars including spaces}:**` sequence, not just single-word names.

Update the strong-enter detection in `builder.ts`:
- Match: `**` + one or more word/space chars + `:**` + optional space
- Examples that must match: `**Purpose:**`, `**Canonical Name:**`, `**Package Dependency Set:**`
- Examples that must NOT match: `**not a field**`, `**bold text**`

### Step 2 — Enrich NaturalBlock value model

**Problem:** When a FieldBlock contains structured content (e.g. a list under `**Dependencies:**`), the builder flattens it into a NaturalBlock with raw text. This loses the list semantics.

**Current state:**
```typescript
NaturalBlock.value: string  // raw markdown
```

**Design question to resolve:** How should NaturalBlock represent structured content?

**Proposed approach — discriminated value:**

```typescript
interface NaturalBlock extends RecordBase {
  construct: 'NaturalBlock';
  value: string;                    // raw markdown (always present)
  children?: BlockContent[];        // parsed sub-records (when content is structured)
}
```

When the builder encounters a list inside a FieldBlock's value:
- The list items become child records (e.g. `ListItemBlock` or similar)
- `.value` retains the raw markdown for lossless round-trip
- `.children` provides structured access

**Alternatively:** Introduce a dedicated `ListBlock` construct:
```typescript
interface ListBlock extends RecordBase {
  construct: 'ListBlock';
  ordered: boolean;
  children: ListItemBlock[];
}
```

**Decision required:** Choose the approach that keeps NaturalBlock as the catch-all while enabling structured content when present. The builder should attempt to classify NaturalBlock content by context (e.g. if inside a FieldBlock and content is a list, parse the list items).

### Step 3 — Strip internal position fields

Add a `cleanPosition` helper that converts micromark position objects to our `Position` type:

```typescript
function cleanPosition(raw: any): Position {
  return {
    start: { line: raw.start.line, column: raw.start.column, offset: raw.start.offset },
    end: { line: raw.end.line, column: raw.end.column, offset: raw.end.offset },
  };
}
```

Apply this to every position assignment in the builder.

### Step 4 — Enumerate grammar gaps

After fixing the builder, parse the full ADR corpus and document:

1. What constructs the parser handles correctly.
2. What constructs are partially handled (flattened, approximated).
3. What constructs are missing entirely.

Write findings to `repos/artificial/_backlog/plan-poc-parse/instructions/cross-check-grammar-wip__findings.md`.

## Rules

- NEVER modify `repos/artificial/_guide.md`, `repos/artificial/_architect.md`, `repos/artificial/_wip.md`, `repos/artificial/_backlog/plan-poc-parse/plan.md`, `.agents/domains/plans/**`, or any `repos/artificial/architecture/records/**` file.
- Only modify: `repos/artificial/art-js/cli/poc-parse/src/parse/builder.ts`, `repos/artificial/art-js/cli/poc-parse/src/parse/types.ts`. Only create: `repos/artificial/_backlog/plan-poc-parse/instructions/cross-check-grammar-wip__findings.md`. Do NOT touch `src/index.ts`, `package.json`, tsconfigs, or any other existing file.
- If the plan or a reference is ambiguous or contradicts the repo conventions: resolve it with the simplest reading, and record the finding + a ready-to-apply change snippet in your report. Never code against a plan you silently changed in your head.
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## How to Report Back" section.
- RULE: If you commit, use `git commit --no-verify` — pre-commit hooks run the full CI pipeline (lefthook `clean` + `extract`); this repo commits with `--no-verify`.

## Final Verification

**Sanity check**

The builder correctly detects multi-word field names, strips internal position fields, and the ADR corpus parses without errors. The findings file documents grammar gaps.

**Verification steps**

- Execute `npx tsc --noEmit` in `repos/artificial/art-js/cli/poc-parse/` — must exit 0 with no errors.
- Execute `npx tsx src/parse/parse.ts repos/artificial/ops/records/dependencies/build-tools-dev.art` — confirm `**Canonical Name:**` is now a FieldBlock (not NaturalBlock).
- Execute `npx tsx src/parse/parse.ts repos/artificial/architecture/records/adr/language.art` — confirm no position objects contain `_bufferIndex` or `_index`.
- Execute `npm run lint:fix` in `repos/artificial/art-js/cli/poc-parse/` to auto-fix formatting.
- Execute `npm run lint` in `repos/artificial/art-js/cli/poc-parse/` to diagnose remaining issues.
- Confirm `repos/artificial/_backlog/plan-poc-parse/instructions/cross-check-grammar-wip__findings.md` exists and contains the grammar gap enumeration.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. If your prompt included a `DIRECTIVE FEEDBACK:`:
   1. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your feedback.
4. Render the report file to `repos/artificial/_backlog/plan-poc-parse/instructions/cross-check-grammar-wip__report.md` — reports are co-located with their instruction file (`plan-{id}/instructions/{id}__report.md`, per `files/index.md`).
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `cross-check-grammar-wip`, created `builder.ts` fixes + findings, thumbs up). The full trail lives in the report file; never repeat it in chat.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `repos/artificial/_architect.md`, or `repos/artificial/_wip.md`. Never silently "fix in code only" — the planner applies these changes later.

Thank you for your service.
