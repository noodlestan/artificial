# Implementation Instructions

**Plan:** `poc-parse`

**commit.Id:** `construct-stack-record-builder`

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `repos/artificial/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `construct-stack-record-builder`, created `src/parse/builder.ts`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Build the semantic layer that turns micromark token events into schema-typed records. This is the construct-stack pattern from `_research.md` best practice #2: enter/exit hooks per token type + an explicit stack.

The builder consumes the raw token event stream from micromark and produces `Document` records containing `SectionBlock`, `FieldBlock`, `NaturalBlock`, and `Tag` children.

## Mandatory Reading

- `repos/artificial/_guide.md` — general info about the project; repo layout, working agreements, workflows.
- `repos/artificial/architecture/records/adr/_research.md` — best practices 1–6; esp. #1 (two layers) and #2 (construct-stack pattern).
- `repos/artificial/art-js/cli/poc-parse/src/parse/types.ts` — the record schema the builder must produce.
- `repos/artificial/_backlog/plan-poc-parse/instructions/smoke-parse-section-block__findings.md` — tokenization findings that inform the builder design.

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

### Step 1 — Create the construct-stack builder

Create `repos/artificial/art-js/cli/poc-parse/src/parse/builder.ts` that:

1. Imports `parse`, `preprocess`, `postprocess` from `micromark` and types from `./types.ts`.
2. Exports a `buildDocument(markdown: string): Document` function.
3. Implements the construct-stack pattern:
   - Runs the micromark pipeline: `preprocess() → parse().document().write() → postprocess(doc.events)`.
   - Maintains an explicit stack of open records.
   - On `atxHeading` enter: pushes a new `SectionBlock` to the stack. Extracts `kind` and `name` from the heading text by parsing the `# Kind: Name` pattern (if present; otherwise `kind` is undefined).
   - On `strong` enter: detects `**Field:**` pattern (text starting with word chars followed by `:`). If matched, pushes a new `FieldBlock` to the stack.
   - On text/data events: accumulates content into the current record's value or children.
   - On `atxHeading` exit: pops the `SectionBlock` from the stack and attaches it as a child of the parent (or the document).
   - On `strong` exit: pops the `FieldBlock` if one was pushed.
   - Any content not classified into another construct becomes a `NaturalBlock`.
   - Tags `(#identifier)` are detected via regex in text content and appended to the nearest `SectionBlock.tags`.
4. Returns a `Document` record with all parsed children.

**Design notes from smoke-parse findings:**

- Directives (`::READ`) are plain text — no special token handling needed.
- Tags (`(#identifier)`) are plain text — detect via regex, not token events.
- Strong emphasis may split across tokens — reconstruct the complete bold span.
- ATX headings carry level info — use for nesting SectionBlocks (level > parent level = child).

### Step 2 — Create the parse entry point

Create `repos/artificial/art-js/cli/poc-parse/src/parse/parse.ts` that:

1. Imports `buildDocument` from `./builder.ts`.
2. Exports a `parse(markdown: string): Document` function that delegates to `buildDocument`.
3. Adds a CLI entry point: when run directly (`npx tsx src/parse/parse.ts`), reads a file path from `process.argv[1]`, parses it, and prints the record tree as JSON.

### Step 3 — Delete smoke-parse.ts

Delete `repos/artificial/art-js/cli/poc-parse/src/parse/smoke-parse.ts`. Its findings are captured in `_backlog/plan-poc-parse/instructions/smoke-parse-section-block__findings.md` and the builder replaces its token inspection role.

## Rules

- NEVER modify `repos/artificial/_guide.md`, `repos/artificial/_architect.md`, `repos/artificial/_wip.md`, `repos/artificial/_backlog/plan-poc-parse/plan.md`, `.agents/domains/plans/**`, or any `repos/artificial/architecture/records/**` file.
- Only create: `repos/artificial/art-js/cli/poc-parse/src/parse/builder.ts`, `repos/artificial/art-js/cli/poc-parse/src/parse/parse.ts`. Only delete: `repos/artificial/art-js/cli/poc-parse/src/parse/smoke-parse.ts`. Do NOT touch `src/index.ts`, `src/parse/types.ts`, `package.json`, tsconfigs, or any other existing file.
- The worker is authorised to add `// eslint-disable-next-line no-unused-vars` at file level if lint complains about unused variables during development.
- Do NOT run `npm run lint` or `npm run lint:fix` — prettier/eslint are not installed (dev deps deliberately deferred; the deferral lifts when the package's lint/CI is first exercised, POC step 4+). Type-check with `tsc --noEmit` directly (see Final Verification).
- If the plan or a reference is ambiguous or contradicts the repo conventions: resolve it with the simplest reading, and record the finding + a ready-to-apply change snippet in your report. Never code against a plan you silently changed in your head.
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## How to Report Back" section.
- RULE: If you commit, use `git commit --no-verify` — pre-commit hooks run the full CI pipeline (lefthook `clean` + `extract`); this repo commits with `--no-verify`.

## Final Verification

**Sanity check**

The artificials POC step 4 goal is met: the builder converts micromark tokens into schema-typed records (SectionBlock, FieldBlock, NaturalBlock, Tag), and the parse entry point can exercise it on a real `.art` file.

**Verification steps**

- Execute `npx tsc --noEmit` in `repos/artificial/art-js/cli/poc-parse/` — must exit 0 with no errors. If `npx` attempts to download typescript, run the repo-root binary directly: `../../../../node_modules/.bin/tsc --noEmit`.
- Execute `npx tsx src/parse/parse.ts repos/artificial/architecture/records/adr/language.art` in `repos/artificial/art-js/cli/poc-parse/` — must run without errors and output a JSON record tree. Confirm the output contains `SectionBlock` records with `kind`, `name`, and `children` fields.
- Execute `npm run lint:fix` in `repos/artificial/art-js/cli/poc-parse/` to auto-fix formatting.
- Execute `npm run lint` in `repos/artificial/art-js/cli/poc-parse/` to diagnose remaining issues. Use eslint disable `no-unused-var` at file level if needed.
- Confirm `git status` shows: new files `src/parse/builder.ts`, `src/parse/parse.ts`; deleted file `src/parse/smoke-parse.ts`.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. If your prompt included a `DIRECTIVE FEEDBACK:`:
   1. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your feedback.
4. Render the report file to `repos/artificial/_backlog/plan-poc-parse/instructions/construct-stack-record-builder__report.md` — reports are co-located with their instruction file (`plan-{id}/instructions/{id}__report.md`, per `files/index.md`).
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `construct-stack-record-builder`, created `src/parse/builder.ts`, thumbs up). The full trail lives in the report file; never repeat it in chat.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `repos/artificial/_architect.md`, or `repos/artificial/_wip.md`. Never silently "fix in code only" — the planner applies these changes later.

Thank you for your service.
