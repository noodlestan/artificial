# Implementation Instructions

**Plan:** `ops/_backlog/3-now/plan-workspace-cli/plan.md`

**commit.Id:** `config-subpath-fix`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `ops/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `config-subpath-fix`, clean ESM manifest bundle, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Close the latent runtime gap in the `workspace-config` delivery: the authored manifest imports the CLI **main entry** (`@art-domains/workspace-cli`), so `loadWorkspaceConfig`'s load-time esbuild bundle pulls in `commander` (CommonJS) — whose `require('node:events')` throws under pure-ESM Node. The CLI's config module already lives in `src/config/` (pure, no commander/simple-git); this commit **exposes it as the `./config` subpath**, republishes as `0.0.3`, and switches the manifest to import from it. After this commit the load-time bundle must be clean ESM (no `require` calls).

**Where things live (read once, get it right):**

- The CLI package is at `repos/artificial/art-domains/cli/workspace` (inside the artificial repo checkout) — **declared, exposed, and committed there**, pushed to `main` on `noodlestan/artificials`, published to npm as `@art-domains/workspace-cli`.
- The manifest `.art-workspace.mts` lives at the **workspace root** (next to `package.json`) and is committed in the workspace repo. It **imports** `defineConfig` from the package; it never declares it.
- All paths in this instruction are relative to the workspace root.

## Mandatory Reading

- `ops/_backlog/3-now/plan-workspace-cli/plan.md` → `workspace-config` section: "Post-delegation corrections" (why this commit exists)
- `ops/_backlog/3-now/plan-workspace-cli/plan__pseudo__config.md` → "Package exposure" section and the exports map (the target shape)
- `ops/_adr/cli.art` → "Manifest Imports from a Dedicated Config Subpath" and "Runtime Config Loading — esbuild Bundle-at-Runtime"
- `ops/_adr/publish.art` — publish-then-symlink pattern
- `ops/_backlog/3-now/plan-workspace-cli/instructions/workspace-config__report.md` — the delivery this commit corrects

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

### 1. Expose the `./config` subpath and emit `dist/config/index.js`

### 2. Build, test, coverage

### 3. Publish 0.0.3 and consume at the workspace root

### 4. Switch the manifest import to the subpath

### 5. Verify the load-time bundle is clean ESM

## Rules

- **Wiring only.** Do NOT change the logic in `src/config/` (types, defineConfig, locateCheckouts, loadWorkspaceConfig) or its tests — they pass and stay as-is.
- Do NOT modify the records, the structures, the authored manifest content (only its import line), or any other package.
- `src/config/` must stay free of `commander` and `simple-git` imports.
- If a command reports errors, attempt to fix them. If the errors persist, inspect the cause before continuing. If still unable to fix it, STOP and report back following the "## How to Report Back" section.

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Add the `./config` export entry and emit `dist/config/index.js`
Step 2. Build, test, and coverage floor pass
Step 3. Publish `@art-domains/workspace-cli@0.0.3` and bump the workspace root devDependency
Step 4. Switch `.art-workspace.mts` to `@art-domains/workspace-cli/config`
Step 5. Verify the load-time bundle is clean ESM

Execute all the steps autonomously, one by one, including running the **validation commands** plus any _validation command_ found at the end of the current step.

- RULE: You are FORBIDDEN from returning to a previous step.

## Step Validation commands

- RULE: After each step, execute the validation commands listed for that step.

## Steps

### Step 1 — Add the `./config` export entry and emit `dist/config/index.js`

In `repos/artificial/art-domains/cli/workspace/package.json`:

- Add the subpath to `exports` (keep the existing `.` entry):

```json
"exports": {
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.js"
  },
  "./config": {
    "types": "./dist/config/index.d.ts",
    "import": "./dist/config/index.js"
  }
}
```

- Extend the `build` script so it also emits the config bundle (the config module is pure ESM — external deps only, `--packages=external`):

```json
"build": "esbuild src/index.ts --bundle --platform=node --outfile=dist/index.js --format=esm --packages=external && esbuild src/config/index.ts --bundle --platform=node --outfile=dist/config/index.js --format=esm --packages=external && tsc --emitDeclarationOnly"
```

- Bump `version` from `0.0.2` to `0.0.3`.

**Validation:** `package.json` has the `./config` export entry, the extended build script, and `0.0.3`.

### Step 2 — Build, test, coverage

In `repos/artificial/art-domains/cli/workspace`:

- `npm run build` — must emit `dist/index.js`, `dist/index.d.ts`, `dist/config/index.js`, `dist/config/index.d.ts`.
- `npm test` and `npm run lint` — pass.
- `npm run test:coverage` — passes the safety-net floor (lines 70 / functions 70 / branches 60 / statements 70).

**Validation:** all four commands pass; the four dist artifacts exist.

### Step 3 — Publish 0.0.3 and consume at the workspace root

- In `repos/artificial/art-domains/cli/workspace`: `npm publish` (publish-then-consume — see `ops/_adr/publish.art`).
- In `src/index.ts` (the CLI entry), align the `program.version(...)` string with the published version (`0.0.3`) so `art-workspace --version` matches the package.
- At the workspace root: bump the devDependency `"@art-domains/workspace-cli": "0.0.3"` in `package.json` and run `npm install`.

**Validation:** `npm view @art-domains/workspace-cli version` shows `0.0.3`; root `package.json` declares `0.0.3`; `node_modules/@art-domains/workspace-cli/dist/config/index.js` exists.

### Step 4 — Switch the manifest import to the subpath

In `.art-workspace.mts` at the workspace root, change exactly one line:

- From: `import { defineConfig } from '@art-domains/workspace-cli';`
- To: `import { defineConfig } from '@art-domains/workspace-cli/config';`

Do NOT change any other part of the manifest (it mirrors the workspace + 7 repo records).

**Validation:** the import line is the subpath; the manifest still has workspace + 7 repo entries.

### Step 5 — Verify the load-time bundle is clean ESM

From the **workspace root** (esbuild is hoisted in the root `node_modules` as a dependency of the installed CLI; if it is not, run the same script from inside `repos/artificial/art-domains/cli/workspace` and reference the manifest as `../../../../../.art-workspace.mts`):

```bash
node --input-type=module -e "
import { build } from 'esbuild';
const result = await build({ entryPoints: ['.art-workspace.mts'], bundle: true, write: false, format: 'esm', platform: 'node' });
const out = result.outputFiles[0].text;
if (/\brequire\(/.test(out)) {
  console.error('FOUND require() in load-time bundle:');
  console.error(out.split('\n').filter(l => /\brequire\(/.test(l)).slice(0, 5).join('\n'));
  process.exit(1);
}
console.log('clean ESM bundle, no require() calls; bytes:', out.length);
"
```

This mirrors exactly what `loadWorkspaceConfig` does (`bundle: true`, `format: 'esm'`, `platform: 'node'`). It must print `clean ESM bundle, no require() calls` and exit 0. Also:

- `npx tsc --noEmit --module nodenext --moduleResolution nodenext --skipLibCheck .art-workspace.mts` — passes (proves the subpath types resolve).
- `npm run workspace -- --help` — the CLI boots.
- `npm run workspace -- --version` — prints `0.0.3`.

**Validation:** clean-ESM check prints the success line and exits 0; the tsc check passes; the CLI boots and reports `0.0.3`.

## Final Verification

**Sanity check**

The goals are met: `@art-domains/workspace-cli@0.0.3` exposes `./config` (declarations + JS emitted), the manifest imports `defineConfig` from the subpath, and the load-time bundle is clean ESM — no `require` calls, so commander's CJS never enters it. The `sanity-command` commit can consume the loader safely.

**Verification steps**

- `repos/artificial/art-domains/cli/workspace`: `npm run build`, `npm test`, `npm run lint`, `npm run test:coverage` (floor) all pass.
- `dist/config/index.js` + `dist/config/index.d.ts` exist; exports map has `./config`.
- Package published as `@art-domains/workspace-cli@0.0.3`; root devDependency is `0.0.3`; `art-workspace --version` prints `0.0.3`.
- `.art-workspace.mts` imports from `@art-domains/workspace-cli/config`; content otherwise unchanged (workspace + 7 repos).
- The clean-ESM verification script prints `clean ESM bundle, no require() calls` and exits 0.
- `npx tsc --noEmit --module nodenext --moduleResolution nodenext --skipLibCheck .art-workspace.mts` passes at the workspace root.
- Commit the package changes in `repos/artificial` (push to `main` on `noodlestan/artificials`) and the manifest import + root `package.json` bump in the workspace repo.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it to `ops/_backlog/3-now/plan-workspace-cli/instructions/config-subpath-fix__report.md`.
4. Generate the response and send it back to the delegator.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `_architect.md`, or records.

Thank you for your service.
