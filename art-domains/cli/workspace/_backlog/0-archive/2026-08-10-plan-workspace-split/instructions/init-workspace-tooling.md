# Implementation Instructions

**Plan:** `workspace-split`

**commit.Id:** `init-workspace-tooling`

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Goals

Initialize the `noodlestan/workspace-tooling` repository (currently an empty GitHub repo) as a build-tooling monorepo and migrate the three tooling packages into it, so every Noodlestan project repo builds standalone without the workspace. This is the de-risk iteration for git-URL cross-repo dependencies.

- Package 1 — `cli/esbuild-cli` → `@noodlestan/esbuild` (esbuild build/watch wrapper), bins `noodlestan/esbuild-cli` (build) and `noodlestan/esbuild-cli-watch` (watch).
- Package 2 — `configs/tsconfig` → `@noodlestan/tsconfig` (base typescript configs, libs and cli variants).
- Package 3 — `configs/eslint-config` → `@noodlestan/eslint-config` (lint style guide; currently 0.0.7 in the `noodlestan/eslint-config` repo).

## Mandatory Reading

- `.agents/domains/plans/definitions/index.md` — plan, implementation-instructions, delegation, and report definitions.
- `.agents/domains/plans/files/index.md` — plan, instruction, delegation, and report file conventions.
- `.agents/domains/plans/templates/report__template.md` — the report format you render at the end.
- `ops/_backlog/plan-workspace-split/plan.md` — the plan; this commit is `init-workspace-tooling`.
- `ops/_guide.md` — the ops documents and how they relate.
- `ops/_architect.md` — the split design and NFRs (every repo builds standalone; no repo builds through the workspace).
- `ops/_module.md` — Structure: Repository (remote, consumers, packages, migration map) and Structure: Workspace (context repo, not a build root).
- `ops/records/repositories/workspace-tooling.art` — the repository record you must keep in sync with what you scaffold (package names, locations, bins).
- `artificials/records/scaffolders/project-skeleton/scaffolder-skeleton.art` and its `skeleton/` — the root dotfile conventions (`.gitignore`, `.npmrc`, `.nvmrc`, `.prettierignore`, `.prettierrc`, `.eslintrc.js`) to mirror at the repo root.
- Migration sources (read-only — do NOT modify them):
  - `../context-work/tools/build/` — the esbuild wrapper (bin, src, LICENSE-MIT, README).
  - `../context-work/tools/configs/` — the base tsconfigs (cli and libs variants).
  - `../../eslint-config/` — the `@noodlestan/eslint-config` checkout (src, test, package.json, tsconfig.json, LICENSE-MIT, README, lefthook.yml).

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

- Clone `git@github.com:noodlestan/workspace-tooling.git` into `repos/workspace-tooling/` (the `repos/` directory is gitignored in the workspace; the clone is not committed to the workspace).
- Scaffold the repo root: `LICENSE-MIT`, `README.md`, `.gitignore`, `.npmrc`, `.nvmrc`, `.prettierrc`, `.prettierignore`, `.eslintrc.js`, `tsconfig.json`, `turbo.json`, `lefthook.yml`, and a root `package.json` declaring npm workspaces (`cli/*`, `configs/*`), `packageManager: npm@10.2.3`, engines `node 24.15.0`, per the project-skeleton conventions.
- Migrate `../context-work/tools/build` → `cli/esbuild-cli`: rename package to `@noodlestan/esbuild`, keep version `0.0.11`, rename bins to `noodlestan/esbuild-cli` and `noodlestan/esbuild-cli-watch`, keep the `esbuild-plugin-file-path-extensions` dev dependency.
- Migrate `../context-work/tools/configs` → `configs/tsconfig` as package `@noodlestan/tsconfig` (libs + cli variants preserved as base configs).
- Migrate `../../eslint-config` → `configs/eslint-config` as package `@noodlestan/eslint-config` (version 0.0.7, from the checkout — src, test, package.json, tsconfig.json, LICENSE-MIT, README, lefthook.yml; NOT node_modules or .git).
- Wire the monorepo: `npm install` at the root, verify the three workspace packages resolve, `npm run lint` passes, and a standalone build of `cli/esbuild-cli` works.
- Commit in the workspace-tooling repo and push, so the git-URL dependency pattern can be validated.

## Rules

- NEVER modify the workspace repo, the plan file, the instruction files, or anything under `.agents/domains/**`, `ops/records/**`, `ops/_architect.md`, `ops/_guide.md`, `ops/_module.md`, `ops/_parking-lot.md`, `ops/_backlog/**` in the workspace.
- NEVER modify the migration sources: `../context-work/tools/**` and `../../eslint-config/**` stay read-only.
- Only the workspace-tooling repo gets commits in this delegation (one commit = one instruction). Do NOT commit to the workspace repo.
- The workspace repo has no lefthook hooks, so its commits run normally. The workspace-tooling repo, once scaffolded with lefthook, may run heavy CI on pre-commit; if its pre-commit fails on this first commit for reasons unrelated to the change, commit with `git commit --no-verify` and record which you used in your report.
- If a command reports errors, attempt to fix them.
- If the errors persist, inspect the cause before continuing.
- If still unable to fix it, STOP and report back following the "## How to Report Back" section.

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Clone the empty workspace-tooling repo
Step 2. Scaffold the repo root (dotfiles, package.json, turbo, lefthook)
Step 3. Migrate `cli/esbuild-cli` (`@noodlestan/esbuild`)
Step 4. Migrate `configs/tsconfig` (`@noodlestan/tsconfig`)
Step 5. Migrate `configs/eslint-config` (`@noodlestan/eslint-config`)
Step 6. Install, lint, and smoke-build
Step 7. Commit and push in the workspace-tooling repo
Step 8. Validate git-URL consumption from a scratch consumer

Execute all the steps autonomously, one by one, including running the **validation commands** plus any _validation command_ found at the end of the current step.

- RULE: You are FORBIDDEN from returning to a previous step.

## Step Validation commands

- RULE: After each step, execute the validation commands listed for that step.

## Steps

### Step 1 — Clone the empty workspace-tooling repo

- From the workspace root: `git clone git@github.com:noodlestan/workspace-tooling.git repos/workspace-tooling`.
- Verify the remote is empty (`git -C repos/workspace-tooling ls-remote origin` prints nothing) and that `repos/` is gitignored in the workspace (`git -C . check-ignore repos/workspace-tooling`).

**Validation:** `repos/workspace-tooling/` exists with `origin` configured and no commits on `main`.

### Step 2 — Scaffold the repo root

- Add `LICENSE-MIT` (Noodlestan MIT — copy the license text from the migration sources), `README.md` (repo name, purpose, packages table), `.gitignore` (node_modules, dist, \*.tsbuildinfo), `.npmrc`, `.nvmrc` (`24.15.0`), `.prettierrc`, `.prettierignore`, `.eslintrc.js` (mirroring the project-skeleton conventions), `tsconfig.json`, `turbo.json` (pipeline: build, lint, test), `lefthook.yml` (pre-commit hooks running the scoped lint/typecheck).
- Root `package.json`: name `@noodlestan/workspace-tooling` (private), `packageManager: npm@10.2.3`, engines `node 24.15.0`, `workspaces: ["cli/*", "configs/*"]`, scripts `lint`, `lint:fix`, `build`, `test`.

**Validation:** `npm install` at the repo root succeeds and creates `package-lock.json`.

### Step 3 — Migrate `cli/esbuild-cli` (`@noodlestan/esbuild`)

- Copy `../context-work/tools/build/` content (bin, src, LICENSE-MIT, README) into `cli/esbuild-cli/` (exclude nothing — no node_modules present).
- Edit `cli/esbuild-cli/package.json`: name `@noodlestan/esbuild`, keep version `0.0.11`, description "esbuild build/watch wrapper for Noodlestan packages", `"private": false`, `"publishConfig": { "access": "public" }`, bin entries `noodlestan/esbuild-cli` → `./bin/build.mjs` and `noodlestan/esbuild-cli-watch` → `./bin/watch.mjs`, keep `esbuild-plugin-file-path-extensions` dev dependency, add lint/test scripts matching the repo.

**Validation:** `node --check cli/esbuild-cli/bin/build.mjs` and `node --check cli/esbuild-cli/bin/watch.mjs` parse cleanly.

### Step 4 — Migrate `configs/tsconfig` (`@noodlestan/tsconfig`)

- Copy `../context-work/tools/configs/` (cli and libs variants) into `configs/tsconfig/` preserving the file layout.
- Add `configs/tsconfig/package.json`: name `@noodlestan/tsconfig`, version `0.0.11`, `"private": false`, `"publishConfig": { "access": "public" }`, `"files": ["cli", "libs"]`, description "Base typescript configurations for Noodlestan packages (libs and cli variants)".

**Validation:** the four tsconfig files are present under `cli/` and `libs/` and reference each other consistently.

### Step 5 — Migrate `configs/eslint-config` (`@noodlestan/eslint-config`)

- Copy `../../eslint-config/` content into `configs/eslint-config/` EXCLUDING `node_modules/` and `.git/` (copy src, test, package.json, tsconfig.json, LICENSE-MIT, README, lefthook.yml).
- Keep the package exactly as-is: name `@noodlestan/eslint-config`, version `0.0.7`, main `.eslintrc.cjs`.
- The legacy `noodlestan/eslint-config` repo is archived later by the user — do NOT delete or modify it.

**Validation:** `npm install` resolves `@noodlestan/eslint-config` from the workspace symlink (visible in `npm ls` at the root).

### Step 6 — Install, lint, and smoke-build

- `npm install` at the repo root.
- `npm run lint` passes at the repo root.
- Smoke-build `cli/esbuild-cli`: run its build bin against a trivial entry (e.g. a temp `.mjs` file importing nothing) and confirm it emits an output file. If the bin requires an input project layout, validate the wrapper at least by `node --check` on its sources and a lint pass.

**Validation:** `npm run lint` green at the root; esbuild wrapper emits a build artifact in a scratch dir.

### Step 7 — Commit and push in the workspace-tooling repo

- `git -C repos/workspace-tooling add -A` and commit `workspace-tooling: init monorepo and migrate tooling packages`.
- If the lefthook pre-commit fails on CI-heavy hooks unrelated to the change, use `git commit --no-verify` and note it in your report.
- Push to `origin main`.

**Validation:** `git -C repos/workspace-tooling status` clean; `git log --oneline -1` shows the commit; `git ls-remote origin main` shows it.

### Step 8 — Validate git-URL consumption from a scratch consumer

- In a scratch directory outside the workspace (e.g. `/tmp/ws-tooling-consumer`): `npm init -y`, then `npm install git+ssh://git@github.com/noodlestan/workspace-tooling.git` (or the https equivalent that resolves from this machine).
- Confirm the packages install and `node_modules/@noodlestan/esbuild` resolves with its bins; run `npx noodlestan/esbuild-cli --help` (or `--version`) if the bin supports it.

**Validation:** a scratch consumer installs `@noodlestan/esbuild` via the git URL and can invoke its bin. This is the de-risk proof for the git-URL dependency pattern.

## Final Verification

**Sanity check**

The goal is met: `noodlestan/workspace-tooling` is a standalone build-tooling monorepo (root scaffold + three packages migrated and renamed), builds and lints on its own, is committed and pushed, and a scratch consumer resolves `@noodlestan/esbuild` via git URL. The workspace repo and the migration sources are untouched.

**Verification steps**

- `repos/workspace-tooling/` has: root dotfiles + `package.json` with workspaces, `cli/esbuild-cli` (`@noodlestan/esbuild` 0.0.11, bins `noodlestan/esbuild-cli`/`noodlestan/esbuild-cli-watch`), `configs/tsconfig` (`@noodlestan/tsconfig`), `configs/eslint-config` (`@noodlestan/eslint-config` 0.0.7).
- `git -C repos/workspace-tooling status` clean; `main` pushed (`git ls-remote origin main` non-empty).
- `npm run lint` passes at the workspace-tooling root.
- `git -C . status` (workspace root) shows NO modifications from this delegation.
- `../context-work/tools/**` and `../../eslint-config/**` are byte-identical to before (unmodified).
- The scratch consumer installed `@noodlestan/esbuild` via git URL and invoked its bin.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it to `ops/_backlog/plan-workspace-split/instructions/init-workspace-tooling__report.md`.
4. Generate the response and send it back to the delegator.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `_architect.md`, `_module.md`, or the workspace-tooling record. Report the exact package dirs, names, versions, and bin names you landed on, and whether the init commit needed `--no-verify`.

Thank you for your service.
