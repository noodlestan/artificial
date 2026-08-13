# Implementation Instructions

**Plan:** `poc-parse`

**commit.Id:** `grammar-spec-fixes`

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `repos/artificial/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `grammar-spec-fixes`, created `art-js/spec/...` fixes, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Reconcile the grammar spec files with the parser implementation. The mdast-based parser now correctly handles SectionBlock, FieldBlock, NaturalBlock, and Tag. The grammar spec files need to reflect the actual parser behaviour and close gaps identified during the POC.

## Mandatory Reading

- `repos/artificial/_guide.md` — general info about the project; repo layout, working agreements, workflows.
- `repos/artificial/_backlog/_architect.md` — Step 6 (grammar spec fixes).
- `repos/artificial/architecture/records/adr/language.art` — adopted decisions on construct containment and NaturalBlock catch-all.
- `repos/artificial/art-js/spec/grammar/constructs/structural/section-block.art` — current SectionBlock spec.
- `repos/artificial/art-js/spec/grammar/constructs/structural/field-block.art` — current FieldBlock spec.
- `repos/artificial/art-js/spec/grammar/constructs/structural/natural-block.art` — current NaturalBlock spec.
- `repos/artificial/art-js/cli/poc-parse/src/parse/types.ts` — the actual parser output schema.

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

### Step 1 — Fix FieldBlock containment rules

The FieldBlock spec (`field-block.art`) says the value "MAY contain procedure blocks, example blocks, directives, and raw Markdown content." This is too loose. Per `language.art` "Construct Containment" decision:

- A FieldBlock value terminates at the next FieldBlock, FieldInline, InlineDeclaration, SectionBlock, or the end of the enclosing SectionBlock.
- A FieldBlock MUST NOT contain a SectionBlock.
- A FieldBlock MUST NOT contain a nested FieldBlock.

Update `repos/artificial/art-js/spec/grammar/constructs/structural/field-block.art`:
- Fix the "Rules" section to match the containment decision.
- Fix the "Description" to reference the termination rules.

### Step 2 — Fix stale `type?` vs `kind` in SectionBlock spec

The SectionBlock spec (`section-block.art`) Schema block uses `kind?: <NaturalName>`. This is correct per the parser (SectionBlock has optional `kind`). But the Syntax block uses `### [<NaturalName (section-block.kind)>: ]<NaturalName (section-block.name)>` which is confusing.

Update `repos/artificial/art-js/spec/grammar/constructs/structural/section-block.art`:
- Clarify the Schema block: `kind?: string` (optional, present when heading has `Kind: Name` form).
- Clarify the Syntax block to show both forms: `# Name` and `# Kind: Name`.

### Step 3 — Clarify NaturalBlock as catch-all

The NaturalBlock spec (`natural-block.art`) says it "represents content associated with a construct through the construct's syntax rules." This is too narrow. Per `language.art` "Any Markdown is Valid `.art`" decision:

- NaturalBlock is the catch-all: any content that does not match another construct is a NaturalBlock.
- Plain markdown is never invalid — it classifies as NaturalBlock.

Update `repos/artificial/art-js/spec/grammar/constructs/structural/natural-block.art`:
- Update the "Purpose" to state it's the catch-all classification.
- Update the "Description" to reference "Any Markdown is Valid `.art`".
- Add the `children?: BlockContent[]` field to the Schema (for structured content like lists inside FieldBlocks).

### Step 4 — Reconcile Tag placement

Tags `(#identifier)` can appear:
- After a SectionBlock heading: `### Routine: List Tasks (#generator) (#wip)`
- In prose content (detected by regex, not syntax)

The Tag spec should clarify that tags in fenced code blocks are NOT classified as tags.

Check `repos/artificial/art-js/spec/grammar/expressions/tag.art` and update if needed to reflect:
- Tags are detected in prose, not in code blocks.
- Tags attach to the nearest enclosing SectionBlock.

### Step 5 — Summarise into language.art

Add a new decision to `repos/artificial/architecture/records/adr/language.art` summarising the parser's actual containment model:

```
## Decision: Parser Containment Model

**Status:** Adopted

**Context:** The grammar spec files described containment loosely. The mdast-based parser implements explicit containment rules that need to be reflected in the spec.

**Decision:** SectionBlocks nest by heading level. FieldBlock values terminate at the next FieldBlock, SectionBlock, or end of enclosing SectionBlock. NaturalBlock is the catch-all for any unclassified content. Tags are detected in prose via regex, not in code blocks.

**Consequences:** The spec files now match the parser implementation. The containment model is unambiguous for both parsers and spec readers.
```

## Rules

- NEVER modify `repos/artificial/_guide.md`, `repos/artificial/_backlog/_architect.md`, `repos/artificial/_backlog/plan-poc-parse/plan.md`, `.agents/domains/plans/**`, or any `repos/artificial/architecture/records/adr/compiler.art` file.
- Only modify: `repos/artificial/art-js/spec/grammar/constructs/structural/section-block.art`, `repos/artificial/art-js/spec/grammar/constructs/structural/field-block.art`, `repos/artificial/art-js/spec/grammar/constructs/structural/natural-block.art`, `repos/artificial/art-js/spec/grammar/expressions/tag.art`, `repos/artificial/architecture/records/adr/language.art`. Do NOT touch `src/`, `package.json`, tsconfigs, or any other existing file.
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## How to Report Back" section.
- RULE: If you commit, use `git commit --no-verify` — pre-commit hooks run the full CI pipeline (lefthook `clean` + `extract`); this repo commits with `--no-verify`.

## Final Verification

**Sanity check**

The grammar spec files accurately describe the parser's behaviour. Containment rules match `language.art`. NaturalBlock is correctly defined as the catch-all.

**Verification steps**

- Execute `npx tsc --noEmit` in `repos/artificial/art-js/cli/poc-parse/` — must exit 0 with no errors (parser unchanged, but confirms no regressions).
- Execute `npx tsx src/parse/parse.ts repos/artificial/art-js/spec/grammar/constructs/structural/section-block.art` — confirm parser output matches the updated spec.
- Confirm all modified `.art` files have consistent Schema, Syntax, and Rules sections.
- Execute `npm run lint:fix` in `repos/artificial/art-js/cli/poc-parse/` to auto-fix formatting.
- Execute `npm run lint` in `repos/artificial/art-js/cli/poc-parse/` to diagnose remaining issues.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. If your prompt included a `DIRECTIVE FEEDBACK:`:
   1. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your feedback.
4. Render the report file to `repos/artificial/_backlog/plan-poc-parse/instructions/grammar-spec-fixes__report.md` — reports are co-located with their instruction file (`plan-{id}/instructions/{id}__report.md`, per `files/index.md`).
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `grammar-spec-fixes`, updated `section-block.art` + `field-block.art` + `natural-block.art` + `language.art`, thumbs up). The full trail lives in the report file; never repeat it in chat.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `repos/artificial/_backlog/_architect.md`, or `repos/artificial/_wip.md`. Never silently "fix in code only" — the planner applies these changes later.

Thank you for your service.
