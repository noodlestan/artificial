# Implementation Instructions

**Plan:** `ops/_backlog/3-now/plan-workspace-cli/plan.md`

**commit.Id:** `sanity-command`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `ops/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `sanity-command`, table + `--auto` verified, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Implement `art-workspace sanity` as the first end-to-end consumer of the config layer. Two deliverables:

1. **In the CLI package** (`repos/artificial/art-domains/cli/workspace`, inside the artificial repo checkout): `verifyCheckouts(checkouts, needs, root)` in the config module (`src/config/`, exported from `src/config/index.ts`) — fills the requested runtime fields (`exists`, `pushed`) on each `RepositoryCheckout` using `fs` + `simple-git`; and the `sanity` command itself (new `src/sanity.ts`), wired into the commander CLI in `src/index.ts`.
2. **Publish** `@art-domains/workspace-cli@0.0.4` (publish-then-consume) and bump the workspace root devDependency.

**Where things live (read once, get it right):**

- The CLI package code (`verifyCheckouts`, the `sanity` command) is **declared, exposed, and committed in `repos/artificial/art-domains/cli/workspace`** — pushed to `main` on `noodlestan/artificials`. The package is published to npm as `@art-domains/workspace-cli`.
- The manifest `.art-workspace.mts` **lives at the workspace root** (next to `package.json`, `AGENTS.md`, `ops/`) — **do not modify it**; sanity consumes it read-only.
- All paths in this instruction are relative to the workspace root.

## Mandatory Reading

- `ops/_backlog/3-now/plan-workspace-cli/plan__pseudo__sanity.md` — **the contract**: input, output table, `pushed?` status values (no/now/yes), procedure, edge cases, BDD spec
- `ops/_backlog/3-now/plan-workspace-cli/plan__pseudo__config.md` — the `RepositoryCheckout` type, `verifyCheckouts` contract (fills only requested fields; pure locating, lazy verification), package exposure, coverage floor
- `ops/_adr/cli.art` — decisions: Git Library (simple-git), UI/UX (tables + minimal colors), Testing Strategy (opportunistic), Manifest Imports from a Dedicated Config Subpath
- `ops/_architect.md` — workspace architecture, principles, NFRs

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

### 1. `verifyCheckouts` in the CLI package config module

### 2. The `sanity` command — classification, `--auto` push, table output

### 3. Tests per the BDD spec (unit + integration)

### 4. Build + publish 0.0.4 and consume at the workspace root

## Rules

- **Repo boundaries:** package changes go in `repos/artificial/art-domains/cli/workspace/` (artificial repo — commit there, push to `main` on `noodlestan/artificials`). The manifest at the workspace root is **read-only** — never edit `.art-workspace.mts`, records, or structures.
- Do NOT modify: `loadWorkspaceConfig` / `locateCheckouts` (they work; this step only adds `verifyCheckouts`), the clone/branch/link/unlink/publish commands (not implemented yet), other packages, records, or structures.
- `verifyCheckouts` fills **only the fields requested in `needs`** — never probes or mutates unrequested fields (`published` is not needed by sanity; leave it unimplemented for now).
- The `sanity` command must never push without `--auto`; with `--auto` it pushes **only clean unpushed** repos (never dirty ones). `pushed?` values: `no` (unpushed, not pushed), `now` (pushed during this run), `yes` (already up-to-date).
- Table output is plain, aligned, minimal colors allowed — no new dependencies beyond what is already in the package.
- If a command reports errors, attempt to fix them. If the errors persist, inspect the cause before continuing. If still unable to fix it, STOP and report back following the "## How to Report Back" section.

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Implement `verifyCheckouts` in the CLI package config module
Step 2. Implement the `sanity` command and wire it into the CLI entry point
Step 3. Add tests per the BDD spec (unit + integration)
Step 4. Publish `@art-domains/workspace-cli@0.0.4`, bump the root devDependency, verify end to end

Execute all the steps autonomously, one by one, including running the **validation commands** plus any _validation command_ found at the end of the current step.

- RULE: You are FORBIDDEN from returning to a previous step.

## Step Validation commands

- RULE: After each step, execute the validation commands listed for that step.

## Steps

### Step 1 — `verifyCheckouts` in the CLI package config module

Work in `repos/artificial/art-domains/cli/workspace/` (the package). Implement exactly per `plan__pseudo__config.md` → `verifyCheckouts` contract:

- New file `src/config/verify-checkouts.ts`, exported from `src/config/index.ts`.
- Signature: `verifyCheckouts(checkouts: RepositoryCheckout[], needs: { exists?: boolean; pushed?: boolean; published?: boolean }, root: string): Promise<RepositoryCheckout[]>` — fills **only the requested fields**, mutating and returning the same checkouts.
- `exists`: directory present at `join(root, checkout.location)` — `fs.existsSync`.
- `pushed`: no unpushed commits vs the configured remote — `simple-git` in the checkout dir (`git status` / rev-list ahead count); a checkout whose dir is missing, or with no remote configured, is `pushed: false` (no throw — the caller surfaces the issue).
- `published`: NOT needed by sanity — do not implement registry probing; if `needs.published` is requested, leave the field unset for now.
- Keep the function pure of CLI concerns (no printing, no process exit).

**Validation:** `npm test` in the package passes (existing tests unaffected); `npm run build` succeeds.

### Step 2 — The `sanity` command

Work in `repos/artificial/art-domains/cli/workspace/` (the package). Implement exactly per `plan__pseudo__sanity.md`:

- New file `src/sanity.ts` exporting `runSanity({ root, auto })`; wire in `src/index.ts`: `program.command('sanity').description('Check git status across all repos').option('--auto', 'push clean unpushed repos').action(...)`.
- Flow: `config = await loadWorkspaceConfig(root)` → `checkouts = locateCheckouts(config)` → `await verifyCheckouts(checkouts, { exists: true, pushed: true }, root)` → for each checkout: git status (branch, clean/dirty, unpushed commits) → classify green (exists AND clean AND pushed) vs non-green.
- Missing manifest → scaffolded empty template + warn (from `loadWorkspaceConfig`); repo not cloned → `exists: false` → row with issue "repo not cloned".
- If `--auto`: push clean + unpushed repos (`simple-git` push), mark them `pushed? = now`.
- Table: only non-green repos — `repo/directory | branch | issues | pushed?`; `issues` summarizes dirty files / unpushed commits / detached HEAD / no remote / merge conflicts. If all repos are green, print "All repos are green ✓" instead of a table.

**Validation:** `npm run build` succeeds; `npm run workspace -- sanity` at the workspace root prints the non-green table (verify against the actual repos; do NOT pass `--auto`).

### Step 3 — Tests per the BDD spec

Work in `repos/artificial/art-domains/cli/workspace/` (the package). Add vitest tests per `plan__pseudo__sanity.md` → "Spec — Terse BDD" (each scenario maps to a test):

- `verifyCheckouts` unit tests: fills only requested fields; missing dir → `exists: false`; dirty tree → `pushed: false`; no remote → `pushed: false` without throw; clean+pushed → `exists: true`, `pushed: true`.
- `sanity` tests: classification + table rendering (green absent from table; dirty → `no`; clean unpushed without `--auto` → `no`; with `--auto` → pushed and `now`; not cloned → issue row; detached HEAD / merge conflicts surfaced; all green → ✓ message); integration tests with temp git repos covering the push path.
- Keep the existing coverage floor (v8 provider, lines 70 / functions 70 / branches 60 / statements 70).

**Validation:** `npm test`, `npm run lint`, and `npm run test:coverage` pass in `repos/artificial/art-domains/cli/workspace` (coverage floor met).

### Step 4 — Publish 0.0.4 and consume at the workspace root

- Bump `version` to `0.0.4` in `repos/artificial/art-domains/cli/workspace/package.json`; `npm run build`; `npm publish` (publish-then-consume — see `ops/_adr/publish.art`).
- At the workspace root (`package.json`): bump the devDependency `"@art-domains/workspace-cli": "0.0.4"` and run `npm install`.
- Manual verification at the workspace root: `npm run workspace -- sanity` (no `--auto`) — table matches reality; `npm run workspace -- sanity --help` shows the `--auto` option.

**Validation:** `node_modules/@art-domains/workspace-cli/package.json` at the workspace root declares `0.0.4`; `art-workspace sanity` runs end to end against the real manifest.

## Final Verification

**Sanity check**

The goals are met: the CLI package declares/exposes/commits `verifyCheckouts` (fills only requested `RepositoryCheckout` runtime fields) and the `sanity` command (classify, `--auto` push of clean unpushed repos only, non-green table with `repo/directory | branch | issues | pushed?`) in `repos/artificial/art-domains/cli/workspace`, published as `@art-domains/workspace-cli@0.0.4` and consumed at the workspace root.

**Verification steps**

- `repos/artificial/art-domains/cli/workspace`: `npm test`, `npm run lint`, `npm run build`, and `npm run test:coverage` (floor: lines 70 / functions 70 / branches 60 / statements 70) all pass; `src/config/verify-checkouts.ts` exists and is exported from `src/config/index.ts`; `src/sanity.ts` exists and the command is wired in `src/index.ts`.
- Package published to npm as `@art-domains/workspace-cli@0.0.4`; workspace root devDependency is `0.0.4`.
- `art-workspace sanity` at the workspace root prints the non-green table (all 7 repos considered; green ones absent); `--auto` verified via integration tests (temp repos) — never run `--auto` against the real workspace repos.
- Commit the package changes in `repos/artificial` (push to `main` on `noodlestan/artificials`) and the root `package.json` bump in the workspace repo.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it to `ops/_backlog/3-now/plan-workspace-cli/instructions/sanity-command__report.md`.
4. Generate the response and send it back to the delegator.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `_architect.md`, or records.

Thank you for your service.
