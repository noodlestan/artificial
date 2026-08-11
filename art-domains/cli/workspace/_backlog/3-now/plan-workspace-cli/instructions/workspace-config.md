# Implementation Instructions

**Plan:** `ops/_backlog/3-now/plan-workspace-cli/plan.md`

**commit.Id:** `workspace-config`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `ops/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `workspace-config`, manifest authored + CLI config layer, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Implement the workspace config layer of the CLI package and author the workspace manifest. Three deliverables:

1. **In the CLI package** (`repos/artificial/art-domains/cli/workspace`, inside the artificial repo checkout): config types (`WorkspaceConfig`, `WorkspaceRecord`, `RepositoryRecord`, `RepositoryCheckout`), `defineConfig`, `locateCheckouts`, and `loadWorkspaceConfig` (esbuild bundle-at-runtime). `defineConfig` + the types are exported from the package entry; `esbuild` becomes a runtime dependency; the build emits `dist/index.d.ts` and the package gains an `exports` map.
2. **Publish** `@art-domains/workspace-cli@0.0.2` (publish-then-consume) and bump the workspace root devDependency.
3. **Author** `.art-workspace.mts` at the workspace root — it **imports** `defineConfig` from the published package and mirrors the records (workspace + 7 repository records).

**Where things live (read once, get it right):**

- The CLI package code (`defineConfig`, types, loader) is **declared, exposed, and committed in `repos/artificial/art-domains/cli/workspace`** — pushed to `main` on `noodlestan/artificials`. The package is published to npm as `@art-domains/workspace-cli`.
- The manifest `.art-workspace.mts` **lives at the workspace root** (next to `package.json`, `AGENTS.md`, `ops/`) — it is committed in the workspace repo. It **only imports** `defineConfig`; it never declares or redefines it.
- All paths in this instruction are relative to the workspace root.

## Mandatory Reading

- `ops/_backlog/3-now/plan-workspace-cli/plan__pseudo__config.md` — **the contract**: schema, `RepositoryCheckout` type, `defineConfig`, `locateCheckouts`, `loadWorkspaceConfig`, package exposure, edge cases, testing
- `ops/_adr/cli.art` — decisions: Generated Manifest at Workspace Root, Runtime Config Loading (esbuild bundle-at-runtime), CLI Public API, Manifest Mirrors Records Structures, Workspace Root as Private npm Package
- `ops/_adr/publish.art` — publish-then-symlink pattern (publish before consume)
- `ops/_architect.md` — workspace architecture, principles, NFRs
- `.agents/domains/workspace/structures/workspace__structure.md` and `.agents/domains/workspace/structures/repository__structure.md` — the structures the schema mirrors
- `ops/records/workspace.art` and `ops/records/repositories/*.art` — the record data the manifest mirrors

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

### 1. Set up test coverage in the CLI package

### 2. CLI package — types, defineConfig, locateCheckouts, loadWorkspaceConfig

### 3. Build + package — esbuild runtime dep, d.ts emission, exports map, version bump

### 4. Publish 0.0.2 and consume at the workspace root

### 5. Author `.art-workspace.mts` at the workspace root

### 6. End-to-end verification

## Rules

- **Repo boundaries:** package changes go in `repos/artificial/art-domains/cli/workspace/` (artificial repo — commit there, push to `main` on `noodlestan/artificials`). The manifest goes at the workspace root (workspace repo). Never declare `defineConfig` or the types inside the manifest — it imports them.
- Do NOT modify: the sanity/clone/branch/link/publish commands (they are not implemented yet), other packages, records, or the structures.
- The authored manifest must match the records exactly: 7 repository records (artificial, conventions, no-comply, purrception, purrpose, purrtrait, workspace-tooling) + the workspace record.
- If a command reports errors, attempt to fix them. If the errors persist, inspect the cause before continuing. If still unable to fix it, STOP and report back following the "## How to Report Back" section.

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Set up test coverage in the CLI package (vitest config, v8 provider, safety-net thresholds)
Step 2. Implement config types, `defineConfig`, `locateCheckouts`, `loadWorkspaceConfig` in the CLI package
Step 3. Add runtime `esbuild` dep, emit `dist/index.d.ts`, add `exports` map, bump to `0.0.2`
Step 4. Publish `@art-domains/workspace-cli@0.0.2` and bump the workspace root devDependency
Step 5. Author `.art-workspace.mts` at the workspace root
Step 6. Verify end to end

Execute all the steps autonomously, one by one, including running the **validation commands** plus any _validation command_ found at the end of the current step.

- RULE: You are FORBIDDEN from returning to a previous step.

## Step Validation commands

- RULE: After each step, execute the validation commands listed for that step.

## Steps

### Step 1 — Set up test coverage in the CLI package

Work in `repos/artificial/art-domains/cli/workspace/` (the package). Testing follows the opportunistic strategy (see `ops/_adr/cli.art` → "Testing Strategy — Opportunistic Process"): coverage is a safety net, not a dictator.

- Add `@vitest/coverage-v8` (matching the installed vitest `^1.x`) to `devDependencies` and run `npm install`.
- Create `vitest.config.ts` at the package root with `coverage`: `provider: 'v8'`, `reporter: ['text', 'text-summary']`, and a safety-net floor `thresholds: { lines: 70, functions: 70, branches: 60, statements: 70 }` (global, not per-file).
- Update `package.json` scripts: `"test": "vitest run"` (run-once — the current `"test": "vitest"` watches and would hang a delegated/CI run), `"test:watch": "vitest"`, `"test:coverage": "vitest run --coverage"`.
- The first `npm run test:coverage` reports 0% and exits non-zero — **expected**: no tests exist yet. The tests land in Step 2; the floor is met in the Final Verification.

**Validation:** `vitest.config.ts` exists with the coverage floor; the three scripts are set; `npm run test:coverage` produces a coverage report (a non-zero exit here is fine — see above).

### Step 2 — Config types, `defineConfig`, `locateCheckouts`, `loadWorkspaceConfig` (CLI package)

Work in `repos/artificial/art-domains/cli/workspace/` (the package). Implement exactly per `plan__pseudo__config.md`:

- **Types** (exported): `WorkspaceConfig` (`records.workspace: WorkspaceRecord`, `records.repos: RepositoryRecord[]`), `WorkspaceRecord` (name, purpose, description?, remote, branch?), `RepositoryRecord` (name, purpose?, description?, remote, checkout?, branch?, consumers?), and `RepositoryCheckout` (`repo: RepositoryRecord` — carries the remote, `location: string`, `branch: string`, plus optional runtime fields `exists?`, `pushed?`, `published?`).
- **`defineConfig(config: WorkspaceConfig): WorkspaceConfig`** — identity helper; the single public authoring entry point.
- **`locateCheckouts(config): RepositoryCheckout[]`** — **pure derivation, no I/O**: for each repo with a `checkout`, add `{ repo, location: repo.checkout, branch: repo.branch ?? 'main' }`; repos without a `checkout` are skipped with a warning. The list must represent multiple checkouts of the same repo (it is an array, not a map).
- **`loadWorkspaceConfig(root): Promise<WorkspaceConfig>`** — esbuild bundle-at-runtime (Vite-style): if `.art-workspace.mts` is missing at `root`, scaffold an empty template (the schema shape with empty records) + warn; then `esbuild.build({ entryPoints: [join(root, '.art-workspace.mts')], bundle: true, write: false, format: 'esm', platform: 'node' })`, write the bundle to a temp `.mjs`, `await import()` it, return `module.default`.
- Export `defineConfig` + all four types from `src/index.ts`.

Add vitest unit tests per the **terse BDD spec** in `plan__pseudo__config.md` → "Spec — Terse BDD" (each scenario maps to a test): `defineConfig` identity; `locateCheckouts` (one `RepositoryCheckout` per checkout field, skip-with-warning, empty list, two entries for one repo with two checkouts); `loadWorkspaceConfig` (fixture `.mts` load, missing-manifest scaffold + warn, throw path reports the manifest path).

**Validation:** `npm test`, `npm run lint`, and `npm run test:coverage` pass in `repos/artificial/art-domains/cli/workspace` (coverage floor met).

### Step 3 — Runtime dep, `dist/index.d.ts`, `exports` map, version bump

In `repos/artificial/art-domains/cli/workspace/package.json`:

- Move `esbuild` from `devDependencies` to `dependencies` (the loader uses it at runtime; `@noodlestan/esbuild` stays dev-only for building).
- Extend the `build` script to also emit declarations: `esbuild src/index.ts --bundle --platform=node --outfile=dist/index.js --format=esm --packages=external && tsc --emitDeclarationOnly`.
- Add an `exports` map so `import { defineConfig } from '@art-domains/workspace-cli'` resolves **and type-checks**:

```json
"exports": {
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.js"
  }
}
```

- Bump `version` from `0.0.1` to `0.0.2`.

**Validation:** `npm run build` in the package emits both `dist/index.js` and `dist/index.d.ts`.

### Step 4 — Publish 0.0.2 and consume at the workspace root

- Publish: `npm publish` in `repos/artificial/art-domains/cli/workspace` (publish-then-consume — see `ops/_adr/publish.art`).
- At the workspace root (`package.json`): bump the devDependency `"@art-domains/workspace-cli": "0.0.2"` and run `npm install`.

**Validation:** `node_modules/@art-domains/workspace-cli/dist/index.d.ts` exists at the workspace root; root `package.json` declares `0.0.2`.

### Step 5 — Author `.art-workspace.mts` at the workspace root

Create `.art-workspace.mts` at the workspace root (next to `package.json`). It imports `defineConfig` from the package and mirrors the records. Start from this shape and align every field with the records (name from the `## Repository:` heading; `purpose`/`description`/`consumers` copied from the record when present, otherwise omitted/`[]`):

```ts
import { defineConfig } from '@art-domains/workspace-cli';

export default defineConfig({
  records: {
    workspace: {
      name: 'Noodlestan',
      purpose:
        'Orchestrate the Noodlestan multi-repo workspace: clone repos, branch across clones, symlink projects to preview changes, and resolve cross-repo dependencies.',
      description:
        'The workspace meta-repo for Noodlestan projects. It is not a build root — every project repo builds standalone. It hosts shared context (artificial bootstrap, domains, agents, skills) and the ops workflow, and it is the home of the repository records.',
      remote: 'git@github.com:noodlestan/workspace.git',
      branch: 'main',
    },
    repos: [
      {
        name: 'Artificial',
        purpose: '<from ops/records/repositories/artificial.art, if present>',
        remote: 'git@github.com:noodlestan/artificial.git',
        checkout: 'repos/artificial',
        branch: 'main',
        consumers: [],
      },
      // ... one entry per repository record:
      // conventions   -> repos/conventions,   git@github.com:noodlestan/conventions.git
      // no-comply     -> repos/no-comply,     git@github.com:noodlestan/no-comply.git
      // purrception   -> repos/purrception,   git@github.com:noodlestan/purrception.git
      // purrpose      -> repos/purrpose,      git@github.com:noodlestan/purrpose.git
      // purrtrait     -> repos/purrtrait,     git@github.com:noodlestan/purrtrait.git
      // workspace-tooling -> repos/workspace-tooling, git@github.com:noodlestan/workspace-tooling.git
      //   consumers: ['artificial', 'purrception', 'purrtrait', 'purrpose', 'no-comply'] (from its record)
    ],
  },
});
```

- All 7 repos have `checkout: repos/<name>` and `branch: main` in their records — copy them verbatim.
- **Do not** invent fields. If a record has no `Purpose:`/`Description:`/`Consumers:`, omit the optional field (or use `consumers: []`).

**Validation:** `.art-workspace.mts` exists at the workspace root; it imports only from `@art-domains/workspace-cli`; it lists the workspace + 7 repos matching the records.

### Step 6 — End-to-end verification

At the workspace root:

- Type-check the manifest against the published package (proves the `exports` map + types resolve):
  `npx tsc --noEmit --module nodenext --moduleResolution nodenext --skipLibCheck .art-workspace.mts` — must pass with no errors.
- `npm run workspace -- --help` — CLI still boots.
- In `repos/artificial/art-domains/cli/workspace`: `npm test` and `npm run build` pass.

## Final Verification

**Sanity check**

The goals are met: the CLI package declares/exposes/commits `defineConfig` + types + `locateCheckouts` + `loadWorkspaceConfig` in `repos/artificial/art-domains/cli/workspace` (published `@art-domains/workspace-cli@0.0.2`), test coverage is set up (v8 provider, safety-net thresholds) with unit tests per the BDD spec passing, and `.art-workspace.mts` at the workspace root imports `defineConfig` and mirrors the workspace + 7 repo records.

**Verification steps**

- `repos/artificial/art-domains/cli/workspace`: `npm test`, `npm run lint`, `npm run build`, and `npm run test:coverage` (floor: lines 70 / functions 70 / branches 60 / statements 70) all pass; `vitest.config.ts` with v8 provider present; `dist/index.d.ts` emitted; `esbuild` in `dependencies`; `exports` map present; version `0.0.2`.
- Package published to npm as `@art-domains/workspace-cli@0.0.2`.
- Workspace root `package.json` devDependency is `0.0.2`; `node_modules/@art-domains/workspace-cli/dist/index.d.ts` exists.
- `.art-workspace.mts` at the workspace root imports `defineConfig` and mirrors the records (workspace + 7 repos, checkout/branch/remote verbatim from records).
- `npx tsc --noEmit --module nodenext --moduleResolution nodenext --skipLibCheck .art-workspace.mts` passes at the workspace root.
- Commit the package changes in `repos/artificial` (push to `main` on `noodlestan/artificials`) and the manifest + root `package.json` bump in the workspace repo.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it to `ops/_backlog/3-now/plan-workspace-cli/instructions/workspace-config__report.md`.
4. Generate the response and send it back to the delegator.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `_architect.md`, or records.

Thank you for your service.
