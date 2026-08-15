# Instructions: `refactor: singularize artificial package names`

**Plan:** `rename-packages`

**Commit:** `rename-packages`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `repos/artificial/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `rename-packages`, singularized `@art-js/artificial-*` across the live tree, lint green, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Singularize the accidental plural in the `@art-js/artificials-*` package names to `@art-js/artificial-*` across the live tree of the Artificial repository, including the package records in `ops/records/packages/`, the namespace record, the `artificials-lib-build.art` script-set record, and every reference in `*.art` and `*.md` docs — so that phases 1+ of the MD Art Roundtrip milestone consume the singular names. The `artificials-watcher` package/record and the `artificials-build` / `artificials-watch` commands are deliberately excluded (workspace-tooling territory; message filed at `_backlog/_message-workspace-tooling-architect.md`).

## Mandatory Reading

- `repos/artificial/_guide.md` — general info about the project; repo layout, setup, verification, working agreements, workflows.
- `repos/artificial/_backlog/4-next/plan-rename-packages/plan.md` — this plan; the commit is `rename-packages`.
- `repos/artificial/ops/records/packages/` — the package records to rename (format reference: `artificials-parser.art`).
- `repos/artificial/ops/records/namespaces/art-js.art` — the namespace record listing package references to singularize.
- `repos/artificial/ops/records/scripts/artificials-lib-build.art` — the script-set record to rename (referenced from lib package records).

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Setup

Run from `repos/artificial` repository directory:

```bash
npm ci # to install dependencies.
```

## Changes

The rename is driven by exact patterns, applied to the **live tree** only. The full inventory:

1. **`package.json` names** — rename `@art-js/artificials-*` → `@art-js/artificial-*` in 10 packages:
   `art-js/spec/`, `art-js/libs/primitives/`, `art-js/libs/parser/`, `art-js/libs/validator/`, `art-js/libs/bundler/`, `art-js/libs/program/`, `art-js/cli/bin/`, `art-js/cli/dev-server/`, `art-js/cli/language-server/`. NOT `art-js/cli/watcher/` (stays `@art-js/artificials-watcher`).
2. **Package records** — rename 10 files in `ops/records/packages/` (`artificials-{x}.art` → `artificial-{x}.art`): primitives, parser, validator, bundler, program, bin, dev-server, language-server, tools, poc-parse. NOT `artificials-watcher.art`. Spec has no record. In each renamed record: update the heading `## Package: Artificials {X}` → `## Package: Artificial {X}` and the `**Canonical Name:**` (poc-parse keeps `@art-js/poc-parse`).
3. **Script-set record** — rename `ops/records/scripts/artificials-lib-build.art` → `artificial-lib-build.art`; heading `## Package Script Set: Artificials Lib Build` → `## Package Script Set: Artificial Lib Build`. Update the `- Package Script Set: Artificials Lib Build` reference in the lib package records (primitives, parser, validator, bundler, program) to `- Package Script Set: Artificial Lib Build`. CLI package records keep `- Package Script Set: Artificials Cli Build` (that script-set record is excluded and stays as-is).
4. **Namespace record** — in `ops/records/namespaces/art-js.art`, singularize the package references `- Package: Artificials {X}` → `- Package: Artificial {X}` for all packages EXCEPT `- Package: Artificials Watcher` (stays).
5. **Docs references** — replace `@art-js/artificials-*` → `@art-js/artificial-*` in: root `README.md` (package table; the watcher row stays `@art-js/artificials-watcher`), `art-js/README.md`, `art-js/libs/parser/architecture/index.md` (`@art-js/artificials-primitives`), `architecture/records/adr/language.art` (`@art-js/artificials-spec`).
6. **Package display names** — singularize README h1s that mirror a renamed package (`# artificials-{x}` → `# artificial-{x}` in libs/primitives, libs/parser, libs/validator, libs/program; `# Artificials {X}` → `# Artificial {X}` in libs/bundler, cli/bin, cli/dev-server, cli/language-server, cli/tools) and the `[Artificials {X}]` link texts in `art-js/README.md`. The watcher README and display name stay as-is.
7. **Lockfile** — after all `package.json` renames, run `npm install` at the repository root to regenerate `package-lock.json` (never hand-edit it).

## Rules

- RULE: Only the exact patterns above. The bare word "Artificials" in prose (e.g. `[@artificials](../../README.md)` toolkit links, "the artificials parser", "Artificials (root)", `.artificials.config.mts`) is NOT part of this rename — leave it untouched.
- RULE: Do NOT modify anything under `_backlog/**`, `_temp/**`, `art-domains/**`, `artisans/**`, `art-js/cli/poc-parse/**` (read-only migration source; fixtures stay byte-identical), `art-js/cli/watcher/**`.
- RULE: Do NOT modify `ops/records/packages/artificials-watcher.art`, `ops/records/scripts/artificials-cli-build.art`, `ops/records/dependencies/cli-dev.art`.
- RULE: Do NOT modify `repos/artificial/_guide.md`, `repos/artificial/_architect.md`, `repos/artificial/_parking-lot.md`, `repos/artificial/_message-workspace-tooling-architect.md`, `repos/artificial/reference/**`.
- RULE: `package-lock.json` is regenerated with `npm install`, never hand-edited.
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## How to Report Back" section.
- RULE: If you commit, use `git commit --no-verify` — pre-commit hooks run the full CI pipeline (lefthook `clean` + `extract` + `ci`); this repo commits with `--no-verify`.

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Inventory the rename surface
Step 2. Rename package.json names and regenerate the lockfile
Step 3. Rename records (packages, script set, namespace)
Step 4. Update docs references and display names
Step 5. Verify

Execute all the steps autonomously, one by one, including running the prescribed **Verification** actions.

- RULE: You are FORBIDDEN from returning to a previous step.

## Step Verification

- After Step 1: your inventory table lists every file that matches the patterns and every exclusion.
- After Step 2: the 10 `package.json` names are singular; `npm install` exits 0.
- After Step 3: the 10 record files are renamed and their contents updated; `art-js.art` and lib record references are singular.
- After Step 4: `grep -rn "artificials-"` on the live tree returns only the expected residue (see Verification).
- After Step 5: full verification below.

## Verification

Scoped grep — run from the repository root; expected residue is ONLY the exclusions:

```bash
grep -rn "artificials-" --include="*.md" --include="*.art" --include="*.json" --include="*.ts" . \
  | grep -v node_modules | grep -v package-lock.json | grep -v "\.git/"
```

Expected residue (allowed, do not touch): hits under `_backlog/`, `art-domains/`, `artisans/`, `_temp/`, `art-js/cli/poc-parse/`, `art-js/cli/watcher/`, `ops/records/scripts/artificials-cli-build.art`, `ops/records/packages/artificials-watcher.art`, and the `artificials-build` / `artificials-watch` mentions in `art-js/**/README.md`.

Sanity spot-checks:

```bash
grep -rn "artificials-" art-js/libs/primitives/package.json art-js/libs/parser/package.json art-js/spec/package.json 2>/dev/null
# must print nothing
ls ops/records/packages/ | grep artificial  # must list artificial-*.art only, plus artificials-watcher.art
grep -rn "Package: Artificials " ops/records/namespaces/art-js.art ops/records/packages/artificial-*.art
# must print only "- Package: Artificials Watcher" from the namespace record
```

Lint — run per renamed package, or repo-wide from the repository root:

```bash
npm run lint # must pass
```

## Steps

### Step 1 of 5 — Inventory the rename surface

1. Run the discovery greps from the repository root (respect the scope of `repos/artificial`):

   ```bash
   grep -rn "artificials-" --include="*.md" --include="*.art" --include="*.json" --include="*.ts" . \
     | grep -v node_modules | grep -v package-lock.json | grep -v "\.git/"
   grep -rni "artificials" --include="*.md" --include="*.art" --include="package.json" . \
     | grep -v node_modules | grep -v package-lock.json | grep -v "\.git/"
   ```

2. Classify every hit against the `## Changes` inventory: package names (10), package records (10), script-set record (1), namespace references, docs references, display names — and every exclusion.
3. Build the inventory table in your head/report with: file → old value → new value → classification (RENAME / EXCLUDE).
4. Sanity check the classification:
   - The `## Package: Artificials {X}` headings and `**Canonical Name:**` lines of the 10 renamed records.
   - The `- Package: Artificials {X}` lines in `ops/records/namespaces/art-js.art` (Watcher stays).
   - The `- Package Script Set: Artificials Lib Build` references in the lib records (primitives, parser, validator, bundler, program) — these change; the `Artificials Cli Build` references do not.
   - The `package-lock.json` workspace entries (`node_modules/@art-js/artificials-*` and `packages/*` name fields) — these are regenerated by `npm install`, NOT hand-edited.

### Step 2 of 5 — Rename package.json names and regenerate the lockfile

1. Edit the `"name"` field in these 10 `package.json` files:
   `art-js/spec/`, `art-js/libs/primitives/`, `art-js/libs/parser/`, `art-js/libs/validator/`, `art-js/libs/bundler/`, `art-js/libs/program/`, `art-js/cli/bin/`, `art-js/cli/dev-server/`, `art-js/cli/language-server/` — replace `@art-js/artificials-` with `@art-js/artificial-`. Do NOT touch `art-js/cli/watcher/package.json`.
2. Run `npm install` at the repository root to regenerate `package-lock.json` (registers the renamed workspaces). Confirm exit 0.
3. Confirm `npm install` did not modify `package.json` files other than the 10 you edited (any drift — e.g. version bumps — revert and re-run).

### Step 3 of 5 — Rename records (packages, script set, namespace)

1. Rename the 10 package record files in `ops/records/packages/`: `artificials-primitives.art`, `artificials-parser.art`, `artificials-validator.art`, `artificials-bundler.art`, `artificials-program.art`, `artificials-bin.art`, `artificials-dev-server.art`, `artificials-language-server.art`, `artificials-tools.art`, `artificials-poc-parse.art` → drop the `s` after `artificial`. Do NOT rename `artificials-watcher.art`.
2. In each renamed record:
   - heading: `## Package: Artificials {X}` → `## Package: Artificial {X}` (e.g. `## Package: Artificials Parser` → `## Package: Artificial Parser`; poc-parse: `## Package: Artificials Poc Parse` → `## Package: Artificial Poc Parse`)
   - `**Canonical Name:**` → `@art-js/artificial-{x}` (poc-parse keeps `@art-js/poc-parse`)
   - lib records (primitives, parser, validator, bundler, program): reference `- Package Script Set: Artificials Lib Build` → `- Package Script Set: Artificial Lib Build`
   - CLI records (bin, dev-server, language-server, tools) and poc-parse: the `Artificials Cli Build` reference stays as-is
3. Rename `ops/records/scripts/artificials-lib-build.art` → `artificial-lib-build.art`; heading → `## Package Script Set: Artificial Lib Build`. Do NOT rename `artificials-cli-build.art`.
4. In `ops/records/namespaces/art-js.art`, singularize `- Package: Artificials {X}` → `- Package: Artificial {X}` for all entries except `- Package: Artificials Watcher` (stays as-is).
5. Sanity: `grep -rn "Package: Artificials " ops/records/` must return only the watcher record, the cli-build script-set record, and the cli-dev dependency record.

### Step 4 of 5 — Update docs references and display names

1. Root `README.md` package table: singularize the 9 renamed rows (`@art-js/artificials-*` → `@art-js/artificial-*`). The `@art-js/artificials-watcher` row stays.
2. `art-js/README.md`: singularize `[Artificials {X}]` link texts for the renamed packages (Bundler, Parser, Primitives, Program, Validator, Bin, Dev Server, Language Server, Tools). `[Artificials Watcher]` stays.
3. README h1s (display names of renamed packages):
   - `art-js/libs/primitives/README.md`, `art-js/libs/parser/README.md`, `art-js/libs/validator/README.md`, `art-js/libs/program/README.md`: `# artificials-{x}` → `# artificial-{x}`
   - `art-js/libs/bundler/README.md`: `# Artificials Bundler` → `# Artificial Bundler`
   - `art-js/cli/bin/README.md`: `# Artificials Bin` → `# Artificial Bin`
   - `art-js/cli/dev-server/README.md`: `# Artificials Dev Server` → `# Artificial Dev Server`
   - `art-js/cli/language-server/README.md`: `# Artificials Language Server` → `# Artificial Language Server`
   - `art-js/cli/tools/README.md`: `# Artificials Tools` → `# Artificial Tools`
   - Do NOT touch `art-js/cli/watcher/README.md`.
   - The `[@artificials](../../README.md)` toolkit links and "built using `artificials-build` from `tools/`" lines stay as-is.
4. `art-js/libs/parser/architecture/index.md`: `@art-js/artificials-primitives` → `@art-js/artificial-primitives`.
5. `architecture/records/adr/language.art`: `@art-js/artificials-spec` → `@art-js/artificial-spec`.

### Step 5 of 5 — Verify

1. Run the scoped grep from `## Verification`; every remaining hit must be on the expected-residue list.
2. Run the sanity spot-checks from `## Verification`.
3. Run `npm run lint` (repo-wide, from the repository root) — must exit 0.
4. `git status` — review the full change set: it must contain ONLY the renamed/modified files per the inventory, plus `package-lock.json`. Confirm nothing under the exclusions is staged.

## Final Verification

**Sanity check**

The live tree is singular: `@art-js/artificial-*` package names in 10 `package.json` files, 10 renamed package records + the renamed `artificial-lib-build.art` script-set record, singular namespace references (except Watcher), singular README display names and doc references (except Watcher and the workspace-tooling terms). The scoped grep returns only the expected residue. `npm run lint` passes. The lockfile is regenerated, not hand-edited.

**Verification:**

```bash
grep -rn "artificials-" --include="*.md" --include="*.art" --include="*.json" --include="*.ts" . \
  | grep -v node_modules | grep -v package-lock.json | grep -v "\.git/"
# expected residue: _backlog/ _temp/ art-domains/ artisans/ art-js/cli/poc-parse/ art-js/cli/watcher/
# ops/records/scripts/artificials-cli-build.art ops/records/packages/artificials-watcher.art
# + artificials-build / artificials-watch mentions in art-js/**/README.md
```

```bash
npm run lint # must pass
```

**Commit and report**

- Stage all changes (renamed/modified files + regenerated `package-lock.json`).
- Commit with message: `refactor: singularize artificial package names`.
- Use `git commit --no-verify`.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `repos/artificial/_backlog/4-next/plan-rename-packages/instructions/rename-packages__report.md`. No separate delegation record is created.
4. If your prompt included a `DIRECTIVE FEEDBACK:` include the feedback sections in the rendered report.
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `rename-packages`, singularized `@art-js/artificial-*` across the live tree, lint green, thumbs up). The full trail lives in the report file; never repeat it in chat.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `repos/artificial/_backlog/_architect.md`, or `repos/artificial/_backlog/_parking-lot.md`. Never silently "fix in code only" — the planner applies these changes later.

Thank you for your service.
