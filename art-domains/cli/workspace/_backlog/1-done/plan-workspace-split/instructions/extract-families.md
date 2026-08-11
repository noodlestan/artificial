# Implementation Instructions

**Plan:** `workspace-split`

**commit.Id:** `extract-families`

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `ops/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `extract-families`, created `noodlestan/{purrception,purrtrait,purrpose,no-comply}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Extract the remaining project families from the `context-work` monorepo into their own standalone repositories: `noodlestan/purrception`, `noodlestan/purrtrait`, `noodlestan/purrpose`, `noodlestan/no-comply`. Each builds and lints on its own with zero dependency on the monorepo's hoisted install.

**Corrective context (supersedes the plan's "extract-families" as one batch — the families have real cross-repo edges and must be extracted one repo per delegation, in dependency order):**

Verified dependency direction (from `package.json` files, version-pinned `0.0.11`):

- `purrception` — base layer. Depends only on itself (`@purrception/*`). Extract **first**.
- `purrtrait` — depends on `@purrception/lang-ts` (+ its own `@purrtrait/*`). Extract second.
- `purrpose` — depends on `@purrception/*` (+ its own `@purrpose/*`). Extract third.
- `no-comply` — depends on **all three**: `@purrception/*` (lang-ts, source-fs, primitives, lang-ts-extract), `@purrtrait/*` (lang-ts, code-renderer, solid-code, view-tsx, client-tsx), `@purrpose/*` (client-babel, client-babel-preset-solidjs, solid-shiki-service). Extract **last**. The `standard-ui-demo` app (the plan's acceptance test) lives inside `no-comply` and consumes all families + the workspace-tooling packages — it moves with `no-comply`.

Each extraction follows the `extract-artificial` recipe (see `ops/_backlog/plan-workspace-split/instructions/extract-artificial.md` for the full worked example): scaffold root mirroring the repo conventions, migrate the tree, declare the full toolchain in the repo's own install, rewire scripts from parent-install bins to `@noodlestan/esbuild` (`esbuild-cli`/`esbuild-cli-watch`), drop the lefthook `extract` step, wire cross-repo deps via git URLs, validate standalone, then sync the workspace records.

**Cross-repo wiring rules (from the first extraction report — apply to every `@purrception/*`/`@purrtrait/*`/`@purrpose/*` dep a consumer repo declares):**

- npm installs only the **root package** of a git dep (`#path:` unmerged in pacote). A family repo's root `package.json` therefore needs a **delivery bridge** for every package consumers need: root `bin` entries + runtime `dependencies`, mirroring what `workspace-tooling` did for the esbuild wrapper. Before wiring consumers, each family repo's root package must expose the consumable packages, or consumers fall back to the cloned-content/ops-symlink pattern.
- Consumers alias the git URL to the package name: `"@purrception/lang-ts": "git+ssh://git@github.com/noodlestan/purrception.git#main"`.
- The `purrpose → @no-comply/solid-primitives` reverse edge in the plan (`toLocalDep`) — verify whether it exists at extraction time; if it does, it resolves via a git-URL/symlink override, not publish.

## Mandatory Reading

- `.agents/domains/plans/definitions/index.md` — plan, implementation-instructions, delegation, and report definitions.
- `.agents/domains/plans/files/index.md` — plan, instruction, delegation, and report file conventions.
- `.agents/domains/plans/templates/report__template.md` — the report format you render at the end.
- `ops/_backlog/plan-workspace-split/plan.md` — the plan; this commit is `extract-families` (or the per-family split of it — see Rules).
- `ops/_guide.md` — the ops documents and the planning workflow.
- `ops/_architect.md` — the split design, NFRs, and the `extract(family)` step (`moveToOwnRepo` + `wireDeps` + `addTooling`).
- `ops/_module.md` — Structure: Repository and Structure: Workspace.
- `ops/records/repositories/workspace-tooling.art` and `ops/records/repositories/artificial.art` — the record pattern for extracted repos; `ops/records/workspace.art` — the workspace record you will extend.
- `ops/_backlog/plan-workspace-split/instructions/extract-artificial__report.md` — the previous extraction report (if landed); its feedback holds the git-URL, bin-linking, and toolchain facts.
- Migration sources (read-only — do NOT modify): `../context-work/purrception/`, `../context-work/purrtrait/`, `../context-work/purrpose/`, `../context-work/no-comply/`.

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

One repo per delegation, in dependency order: `purrception` → `purrtrait` → `purrpose` → `no-comply`. Each delegation:

1. **`noodlestan/<family>`** — the extracted standalone repo (main commit): scaffold root, migrate the tree, declare toolchain, rewire scripts + cross-repo deps via git URLs, add tooling, validate standalone.
2. **`noodlestan/workspace`** — records sync: add `ops/records/repositories/<family>.art`, register in `ops/records/workspace.art`.

The `context-work` monorepo is **never modified** by any of these delegations.

## Rules

- RULE: **One family per delegation session.** Do NOT extract multiple families in one sub-agent run — each repo is a separate relay so the plan record, reports, and feedback stay unambiguous. If this instruction lists more than one family, the delegator splits it: run the recipe once per family and record one commit per family.
- NEVER modify the migration sources: `../context-work/{purrception,purrtrait,purrpose,no-comply}/**` stay read-only.
- NEVER modify the workspace repo's plan, instruction, `_architect.md`, `_guide.md`, `_module.md`, `_parking-lot.md`, or anything under `.agents/domains/**`. The workspace repo gets exactly ONE commit per delegation: the records sync.
- Cross-repo deps resolve via **git URLs to the family repos**, never to the monorepo, never publish.
- The repo's own install must be complete: any bare import (`eslint`, `prettier`, `typescript`, `vite`, `vitest`, `@noodlestan/*`, `@purrception/*`, `@purrtrait/*`, `@purrpose/*`) must resolve from the repo's own `node_modules`.
- If a command reports errors, attempt to fix them. If the errors persist, inspect the cause before continuing. If still unable to fix it, STOP and report back following the "## How to Report Back" section.

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Pre-check the target repo and remotes
Step 2. Scaffold the `noodlestan/<family>` repo root
Step 3. Migrate the family tree and declare the toolchain
Step 4. Rewire scripts and cross-repo deps (git URLs)
Step 5. Add tooling: turbo, lefthook (no extract step), minimal AGENTS.md boot
Step 6. Install, lint, typecheck, build — standalone validation
Step 7. Commit and push `noodlestan/<family>`
Step 8. Sync the workspace records and commit the workspace repo
Step 9. Final verification

Execute all the steps autonomously, one by one, including running the **validation commands** plus any _validation command_ found at the end of the current step.

- RULE: You are FORBIDDEN from returning to a previous step.

## Step Validation commands

- RULE: After each step, execute the validation commands listed for that step.

## Steps

### Step 1 — Pre-check the target repo and remotes

- Confirm `noodlestan/<family>` exists as an empty GitHub repo (no commits). If it does not exist, try `gh repo create noodlestan/<family> --private --description "<family purpose>"`; if you have no `gh` access, REPORT A BLOCKER with the exact error.
- Confirm the migration source is present: `ls ../context-work/<family>/`.

**Validation:** the remote is empty (`git ls-remote git@github.com:noodlestan/<family>.git` prints nothing) and the source tree is readable.

### Step 2 — Scaffold the `noodlestan/<family>` repo root

- Clone the empty repo into `repos/<family>/` (`repos/` is gitignored in the workspace; the clone is not committed to the workspace).
- Scaffold the root mirroring the workspace-tooling / artificial repo conventions: `LICENSE-MIT`, `README.md` (repo name, purpose, packages table), `.gitignore`, `.npmrc`, `.nvmrc` (`24.15.0`), `.prettierrc`, `.prettierignore`, `.eslintrc.cjs`, `tsconfig.json`, `turbo.json`, `lefthook.yml`, root `package.json` (rename `name` to the family repo name, `packageManager: npm@10.2.3`, workspaces list minus nothing — the family keeps all its packages, engines node `>=18` unless the toolchain requires otherwise).
- Declare the **full toolchain** in root `devDependencies` (versions matching `../context-work/package.json`): `eslint`, `prettier`, `typescript`, `turbo`, `lefthook`, `vite`/`vitest` if used, plus `@noodlestan/eslint-config` (git URL to the legacy eslint-config repo) and `@noodlestan/esbuild` (git URL to the workspace-tooling root). Add **any root delivery bridge** the family repo needs for consumers (see Goals — cross-repo wiring rules).

**Validation:** `repos/<family>/` exists with `origin` configured, no commits on `main`, toolchain declared.

### Step 3 — Migrate the family tree and declare the toolchain

- Copy the migration source tree into `repos/<family>/`, EXCLUDING `node_modules/`, `package-lock.json` (fresh lockfile generated later), and any parent-hoisted strays.
- Rename the root package `name` to the family repo name; keep inner package names as-is.
- Update root `tsconfig.json` includes if the migration source references now-absent directories.
- Define the root lifecycle scripts the lefthook will call: `clean`, `lint`, `lint:fix`, `build`, `ci`, `test` (turbo-run).

**Validation:** tree copied; no `node_modules`/`package-lock.json` remnants; every script name used by the new lefthook/turbo exists in a `package.json`.

### Step 4 — Rewire scripts and cross-repo deps (git URLs)

- Replace any `no-comply-build`/`no-comply-watch` script calls with `esbuild-cli`/`esbuild-cli-watch` (`grep -rn "no-comply-build\|no-comply-watch" repos/<family> --include="*.json"` excluding node_modules/lockfile). The wrapper takes no CLI args — validate by building.
- Rewire every cross-repo dependency the family declares to a git URL alias: `"@purrception/*": "git+ssh://git@github.com/noodlestan/purrception.git#main"` (and similarly for `@purrtrait/*`, `@purrpose/*`, `@no-comply/*` as the order progresses). Same- repo deps stay workspace-local.
- Keep `@noodlestan/*` tooling deps as in the artificial extraction.

**Validation:** `npm ls <cross-repo-package>` at the repo root resolves each cross-repo dep from the git URL (installed in the repo's own `node_modules`); no dep points at the monorepo or a `file:` path outside the repo.

### Step 5 — Add tooling: turbo, lefthook, minimal AGENTS.md boot

- `turbo.json`: pipeline without an `extract` task (cross-family meta concern — do not re-add).
- `lefthook.yml`: pre-commit running a single scoped, turbo-cached step (`npm run lint`), per the workspace-tooling/artificial pattern.
- Write a minimal `AGENTS.md` boot per the plan (`## What`: "Each repo carries a minimal AGENTS.md boot").

**Validation:** lefthook references only repo-local, turbo-cached commands; `AGENTS.md` present with the boot sequence.

### Step 6 — Install, lint, typecheck, build — standalone validation

- `npm install` at `repos/<family>/`; `npm run lint`, `npm run build`, `npm run ci` all green at the root — fully self-contained (no reference to any parent directory).
- Fix resolution errors by declaring the missing dependency in the owning workspace's `package.json`.

**Validation:** `npm run ci` green at the root of `repos/<family>/` with the tree fully self-contained.

### Step 7 — Commit and push `noodlestan/<family>`

- `git -C repos/<family> add -A` and commit `chore: extract <family> to its own repository`.
- If the lefthook pre-commit fails on CI-heavy hooks unrelated to the change, use `git commit --no-verify` and note it in your report.
- Push to `origin main`.

**Validation:** `git -C repos/<family> status` clean; `git log --oneline -1` shows the commit; `git ls-remote origin main` shows it.

### Step 8 — Sync the workspace records and commit the workspace repo

- Write `ops/records/repositories/<family>.art` following the `workspace-tooling.art` / `artificial.art` record structure (Purpose, Description, Remote, Branch, Consumers, Packages as confirmed in the clone, Migrates).
- Update `ops/records/workspace.art` (`## Workspace: Noodlestan`): add `<family>` to the known repositories.
- Commit in the workspace repo: `ops: register <family> repository records` and push to `origin main`.

**Validation:** `<family>.art` matches the confirmed package names; `workspace.art` lists `<family>`; workspace commit pushed.

### Step 9 — Final verification

- Standalone proof: from a scratch directory, `git clone git@github.com:noodlestan/<family>.git`, `npm install`, `npm run ci` — green with zero workspace/monorepo involvement.
- `git -C repos/<family> status` clean; one commit on `main`, pushed.
- Workspace repo: exactly one new commit (records sync); `git status` clean except pre-existing unrelated changes.
- `../context-work/<family>/**` byte-identical to before (unmodified).

## Final Verification

**Sanity check**

The goal is met: `noodlestan/<family>` is a standalone repo, builds/lints/passes CI on its own, cross-repo deps resolve via git URLs, the pre-commit is repo-local and fast, the workspace records list the repo, and the monorepo is untouched.

**Verification steps**

- `repos/<family>/` has the root scaffold, the migrated tree, full toolchain declared, git-URL cross-repo deps, no `extract` step, minimal `AGENTS.md`.
- `git -C repos/<family> status` clean; `main` pushed; standalone clone+install+ci passes.
- Workspace: `<family>.art` + `workspace.art` updated and pushed; no other workspace modifications.
- `git -C ../context-work status` shows NO modifications from this delegation.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it to `ops/_backlog/plan-workspace-split/instructions/extract-families__report.md`.
4. Generate the response and send it back to the delegator.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `_architect.md`, `_module.md`, or a workspace record. Report the family's package list as confirmed in the clone, every cross-repo dep rewired to a git URL, whether the family's init commit needed `--no-verify`, and whether the `purrpose → @no-comply/solid-primitives` reverse edge exists at extraction time.

Thank you for your service.
