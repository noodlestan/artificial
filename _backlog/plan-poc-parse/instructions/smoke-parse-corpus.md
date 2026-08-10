# Implementation Instructions

**Plan:** `poc-parse`

**commit.Id:** `smoke-parse-corpus`

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `artificials/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `smoke-parse-corpus`, created `src/parse/smoke-parse.ts`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Prove that micromark can tokenize the art syntax before building the full record builder. Parse the corpus (6 ADR files + `section-block.art`) through micromark and inspect the token event stream to confirm:

- `**Field:**` (including block fields)
- `::READ` directives
- `#tags` (in the form `(#identifier)`)
- Code fences

tokenize as expected. Record findings in a report that feeds Step 4 and settles the substrate decision (micromark direct vs indirections).

## Mandatory Reading

- `.agents/domains/plans/definitions/index.md` — plan, implementation-instructions, delegation, and report definitions.
- `.agents/domains/plans/files/index.md` — plan, instruction, delegation, and report file conventions.
- `.agents/domains/plans/templates/report__template.md` — the report format you render at the end.
- `artificials/_backlog/plan-poc-parse/plan.md` — the plan; this commit is `smoke-parse-corpus`.
- `artificials/_guide.md` — the Artificials System overview: the compiler pipeline, the declaration model (`# Kind: Name`), and the kind-agnostic parser. Context only.
- `artificials/_architect.md` — Approach (micromark substrate) + Step 3 (smoke-parse the corpus).
- `artificials/_wip.md` — only to identify the current step; NEVER modify it.
- `artificials/architecture/records/adr/_research.md` — best practices 1–6; esp. #1 (two layers) and #6 (early spike insight: `# Kind: Name` is plain ATX heading).
- `artificials/art-js/spec/grammar/constructs/structural/section-block.art` — the spec file to include in the corpus.

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

Create `src/parse/smoke-parse.ts` (relative to `art-js/cli/poc-parse/`) that:

1. Reads the corpus files:
   - `architecture/records/adr/_research.md`
   - `architecture/records/adr/compiler.art`
   - `architecture/records/adr/configuration.art`
   - `architecture/records/adr/distribution.art`
   - `architecture/records/adr/documentation.art`
   - `architecture/records/adr/installation.art`
   - `architecture/records/adr/language.art`
   - `art-js/spec/grammar/constructs/structural/section-block.art`

2. Parses each file through micromark's `parse` function (from `micromark` package).

3. Collects and logs the token event stream for each file.

4. Specifically checks for and reports on:
   - ATX headings (`# Kind: Name` pattern) — do they tokenize as expected?
   - Strong emphasis (`**Field:**`) — do block fields tokenize correctly?
   - Directive text (`::READ`) — how does micromark handle this?
   - Tags (`(#identifier)`) — do they tokenize as plain text or something else?
   - Code fences — do they tokenize correctly?

5. Writes findings to `_backlog/plan-poc-parse/instructions/smoke-parse-corpus__findings.md` with:
   - Summary of what tokenizes as expected
   - Surprises or gaps
   - Recommendation: micromark direct vs indirections (e.g., `mdast-util-from-markdown`)

**Implementation notes:**

- Use `import { parse } from 'micromark'` — the core parse function.
- The parse function returns an event array: `[token, type, enterExit][]`.
- Log a summary per file: heading count, field count, directive count, tag count.
- For each syntax element of interest, show 2-3 example tokens with their type and position.
- Do NOT build a record builder yet — this is just token inspection.
- Do NOT modify `src/parse/types.ts` — the schema from Step 2 is unchanged.

## Rules

- NEVER modify `artificials/_guide.md`, `artificials/_architect.md`, `artificials/_wip.md`, `artificials/_backlog/plan-poc-parse/plan.md`, `.agents/domains/plans/**`, or any `artificials/architecture/records/**` file.
- Only create: `art-js/cli/poc-parse/src/parse/smoke-parse.ts` and `_backlog/plan-poc-parse/instructions/smoke-parse-corpus__findings.md`. Do NOT touch `src/index.ts`, `src/parse/types.ts`, `package.json`, tsconfigs, or any other existing file.
- Do NOT run `npm run lint` or `npm run lint:fix` — prettier/eslint are not installed (dev deps deliberately deferred; the deferral lifts when the package's lint/CI is first exercised, POC step 4+). Type-check with `tsc --noEmit` directly (see Final Verification).
- If the plan or a reference is ambiguous or contradicts the repo conventions: resolve it with the simplest reading, and record the finding + a ready-to-apply change snippet in your report. Never code against a plan you silently changed in your head.
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## How to Report Back" section.
- RULE: If you commit, use `git commit --no-verify` — pre-commit hooks run the full CI pipeline (lefthook `clean` + `extract`); this repo commits with `--no-verify`.

## Final Verification

**Sanity check**

The artificials POC step 3 goal is met: the corpus parses through micromark, token events are inspected, and findings are recorded in a report that settles the substrate decision.

**Verification steps**

- Execute `npx tsc --noEmit` in `art-js/cli/poc-parse/` — resolves the repo root's typescript and `@types/node` (upward node_modules walk); must exit 0 with no errors. If `npx` attempts to download typescript, run the repo-root binary directly: `../../../../node_modules/.bin/tsc --noEmit`.
- Execute `npx tsx src/parse/smoke-parse.ts` in `art-js/cli/poc-parse/` — must run without errors and produce output. If `npx` attempts to download tsx, install it first: `npm install -D tsx` (this is allowed for this step only).
- Re-read `_backlog/plan-poc-parse/instructions/smoke-parse-corpus__findings.md` and confirm it contains:
  - Summary of what tokenizes as expected
  - Surprises or gaps
  - Recommendation: micromark direct vs indirections
- Confirm `git status` shows exactly two new files: `art-js/cli/poc-parse/src/parse/smoke-parse.ts` and `_backlog/plan-poc-parse/instructions/smoke-parse-corpus__findings.md`.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. If your prompt included a `DIRECTIVE FEEDBACK:`:
   1. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your feedback.
4. Render the report file to `_backlog/plan-poc-parse/instructions/smoke-parse-corpus__report.md` — reports are co-located with their instruction file (`plan-{id}/instructions/{id}__report.md`, per `files/index.md`).
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `smoke-parse-corpus`, created `src/parse/smoke-parse.ts`, thumbs up). The full trail lives in the report file; never repeat it in chat.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `artificials/_architect.md`, or `artificials/_wip.md`. Never silently "fix in code only" — the planner applies these changes later.

Thank you for your service.
