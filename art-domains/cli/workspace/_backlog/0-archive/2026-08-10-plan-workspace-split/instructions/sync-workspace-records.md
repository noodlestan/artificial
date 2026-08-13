# Implementation Instructions

**Plan:** `workspace-split`

**commit.Id:** `sync-workspace-records`

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `ops/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `sync-workspace-records`, created `workspace-tooling.art` sync, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Sync the workspace records with the confirmed state of the `workspace-tooling` repo, so the workspace meta-repo records match the repo as it actually landed. The first delegation (`init-workspace-tooling`) confirmed the exact package layout — dirs, names, versions, bins — and established the git-URL delivery bridge. This commit bakes those facts into `ops/records/repositories/workspace-tooling.art` and drops the "confirmed at extraction" placeholders.

## Mandatory Reading

- `.agents/domains/plans/definitions/index.md` — plan, implementation-instructions, delegation, and report definitions.
- `.agents/domains/plans/files/index.md` — plan, instruction, delegation, and report file conventions.
- `.agents/domains/plans/templates/report__template.md` — the report format you render at the end.
- `ops/_backlog/plan-workspace-split/plan.md` — the plan; this commit is `sync-workspace-records`.
- `ops/_module.md` — Structure: Repository (remote, consumers, packages) and Structure: Workspace.
- `ops/records/repositories/workspace-tooling.art` — the record you must sync.
- `ops/_backlog/plan-workspace-split/instructions/init-workspace-tooling__report.md` — the delegation report; its feedback table (dirs, names, versions, bins) is the source of truth for the sync.
- Reference: `ops/records/workspace.art` — the workspace record (read for context; do NOT change unless the sync requires it).

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

Update `ops/records/repositories/workspace-tooling.art` only:

- Replace the `**Packages:**` section with a table (or per-package entries) carrying the confirmed facts from the `init-workspace-tooling` report:

  | dir                     | package                     | version | bins                                                                                             |
  | ----------------------- | --------------------------- | ------- | ------------------------------------------------------------------------------------------------ |
  | `cli/esbuild-cli`       | `@noodlestan/esbuild`       | 0.0.11  | `noodlestan/esbuild-cli` → `./bin/build.mjs`, `noodlestan/esbuild-cli-watch` → `./bin/watch.mjs` |
  | `configs/tsconfig`      | `@noodlestan/tsconfig`      | 0.0.11  | — (configs only)                                                                                 |
  | `configs/eslint-config` | `@noodlestan/eslint-config` | 0.0.7   | — (main `.eslintrc.cjs`)                                                                         |

- Drop the "exact bin names confirmed at extraction" placeholder — the names are now concrete.
- Add a `**Delivery:**` note documenting the git-URL root bridge: the root `@noodlestan/workspace-tooling` `package.json` carries `bin` entries (pointing at `cli/esbuild-cli/bin/*.mjs`) plus the esbuild runtime `dependencies`, so consumers can alias `"@noodlestan/esbuild": "git+ssh://git@github.com/noodlestan/workspace-tooling.git#main"` — npm installs only the root package of a git dep (`#path:` unsupported). Note that only the esbuild wrapper is bridged at the root today; eslint-config/tsconfig are consumed from the same root install via their cloned content (`configs/...`) or an ops symlink.
- Add a `**Hooks:**` note: lefthook auto-installs its pre-commit on `npm install`; the scoped `npm run lint` pre-commit passed on both init commits — no `--no-verify` needed.

## Rules

- NEVER modify the workspace repo, the plan file, the instruction files, or anything under `.agents/domains/**` in the workspace.
- Touch ONLY `ops/records/repositories/workspace-tooling.art`. Leave everything else alone — including `.vscode/settings.json` (reformatted externally, not part of this work) and the record for the workspace itself.
- The workspace repo has no lefthook hooks, so its commits run normally.
- If a command reports errors, attempt to fix them.
- If the errors persist, inspect the cause before continuing.
- If still unable to fix it, STOP and report back following the "## How to Report Back" section.

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Read the report and the current record
Step 2. Sync the record with the confirmed facts
Step 3. Commit the change

Execute all the steps autonomously, one by one, including running the **validation commands** plus any _validation command_ found at the end of the current step.

- RULE: You are FORBIDDEN from returning to a previous step.

## Step Validation commands

- RULE: After each step, execute the validation commands listed for that step.

## Steps

### Step 1 — Read the report and the current record

- Read `ops/_backlog/plan-workspace-split/instructions/init-workspace-tooling__report.md` (source of truth) and `ops/records/repositories/workspace-tooling.art` (what you will sync).
- Cross-check the report's Feedback table against the `**Packages:**` section of the record.

**Validation:** you can name the three package dirs, names, versions, and bin entries from the report without re-reading it.

### Step 2 — Sync the record with the confirmed facts

- Edit `ops/records/repositories/workspace-tooling.art` per `## Changes` above. Keep the existing `**Purpose:**`, `**Description:**`, `**Remote:**`, `**Branch:**`, `**Consumers:**`, and `**Migrates:**` sections as-is (update `**Migrates:**` only if the sync reveals a correction).

**Validation:** re-read the record — no placeholder text remains, the packages table matches the report table exactly, and the `**Delivery:**` note is present.

### Step 3 — Commit the change

- `git add ops/records/repositories/workspace-tooling.art` and commit `ops: sync workspace records with the scaffolded workspace-tooling repo`.
- Push to `origin main`.

**Validation:** `git status` clean (except unrelated changes like `.vscode/settings.json` if still present); `git log --oneline -1` shows the commit; `git ls-remote origin main` shows it.

## Final Verification

**Sanity check**

The goal is met: `ops/records/repositories/workspace-tooling.art` reflects the confirmed package layout (dirs, names, versions, bins), the git-URL root-bridge delivery note, and the hooks note — with all extraction placeholders gone. Nothing else in the workspace changed.

**Verification steps**

- `ops/records/repositories/workspace-tooling.art` carries the confirmed table (three packages with versions and bins), the `**Delivery:**` note, and the `**Hooks:**` note.
- `git status` shows no other modifications from this delegation (ignore pre-existing `.vscode/settings.json`).
- The commit is pushed to `origin main`.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it to `ops/_backlog/plan-workspace-split/instructions/sync-workspace-records__report.md`.
4. Generate the response and send it back to the delegator.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `_architect.md`, `_module.md`, or the workspace-tooling record. Report the exact record sections you changed and the commit id.

Thank you for your service.
