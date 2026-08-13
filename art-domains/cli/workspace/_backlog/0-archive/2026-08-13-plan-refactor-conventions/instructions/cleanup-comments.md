# Instruction: Cleanup Comments

**Plan:** `refactor-conventions`

**commit.Id:** `cleanup-comments`

**Package:** `$PACKAGE` = `repos/artificial/art-domains/cli/workspace` (relative to the workspace root). All file paths in this instruction are relative to `$PACKAGE`; run npm commands in `$PACKAGE`.

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `cleanup-comments`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Remove the stray comments and commented-out code found in the pre-plan scan. Keep meaningful explanatory comments and keep the `eslint-disable` directives that the stub commands still need.

## Mandatory Reading

- `package.json` — scripts: `lint`, `build`, `test`
- `_backlog/3-now/plan-refactor-conventions/plan.md` — commit boundaries and context

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

Note: this commit runs AFTER `rename-source-files` and `split-test-files`. File paths below use the post-rename names.

### Remove

1. `src/commands/sanity/runSanity.test.ts` — remove the commented-out line `// await commitFile(repoDir, 'file.txt');` (around line 73) and the `// expected conflict` comment (around line 211). If `commitFile` becomes unused in that file, remove its import.
2. `src/private/operations/types.ts` — remove the 5 section-separator comments: `// --- Base ---`, `// --- Outcome-specific bases ---`, `// --- Specific success types ---`, `// --- Specific failure types ---`, `// --- Union ---`. Keep the type declarations themselves untouched.

### Keep (do NOT touch)

- `src/private/git/getUnpushedCount.ts` — the two-line comment explaining the new-branch-with-no-remote case (non-obvious logic).
- `src/shared/scanExtraneousCheckouts.ts` — the comment `// checkouts path doesn't exist or can't be read` in the catch branch (explains the guard).
- `src/commands/link/runLink.ts`, `src/commands/publish/runPublish.ts`, `src/commands/unlink/runUnlink.ts` — the `// eslint-disable-next-line @typescript-eslint/no-unused-vars` directives. They are still required until the stub commands are implemented; removing them breaks lint.

## Rules

- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## Rules to Report" section.
- RULE: Touch ONLY the files listed under `## Changes` → Remove. The "Keep" files must remain byte-identical.
- RULE: Do not change any code behavior — comments only.

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Remove stray comments in `runSanity.test.ts`
Step 2. Remove section separators in `types.ts`
Step 3. Run full validation

Execute all the steps autonomously, one by one, including running the **validation commands** plus any _validation command_ found at the end of the current step.

- RULE: You are FORBIDDEN from return to a previous step.

## Step Validation commands

- RULE: After each step, execute the following validation commands:

- Execute `npm run lint` in `$PACKAGE` to validate format, lint, and typecheck
- Execute `npm run test` in `$PACKAGE` to run the unit tests

## Steps

### Step 1 / 3 — Remove stray comments in `runSanity.test.ts`

Open `src/commands/sanity/runSanity.test.ts` and remove the commented-out line and the `// expected conflict` comment per `## Changes`. Remove the now-unused `commitFile` import if lint reports it.

**Extra validation commands:**

- Execute `npm run lint` in `$PACKAGE`

### Step 2 / 3 — Remove section separators in `types.ts`

Open `src/private/operations/types.ts` and remove the 5 section-separator comments per `## Changes`. Keep every type declaration unchanged.

**Extra validation commands:**

- Execute `npm run lint` in `$PACKAGE`

### Step 3 / 3 — Full validation

**Extra validation commands:**

- Execute `npm run lint` in `$PACKAGE`
- Execute `npm run build` in `$PACKAGE`
- Execute `npm run test` in `$PACKAGE`

## Final Verification

**Sanity check**

`git diff` in `$PACKAGE` shows comment-only deletions — no behavioral code changes. The "Keep" files listed under `## Changes` show zero diff.

**Verification steps**

- Execute `npm run lint` in `$PACKAGE`
- Execute `npm run build` in `$PACKAGE`
- Execute `npm run test` in `$PACKAGE`
- Commit in the artificial repo with the single message `chore(workspace-cli): remove commented-out code and stray comments` and push to `origin main`. If the pre-commit hook blocks, fix the issue and create a new commit — do not amend.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `_backlog/3-now/plan-refactor-conventions/instructions/cleanup-comments__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points — done `cleanup-comments`, created `{artefacts}`, thumbs up. The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
