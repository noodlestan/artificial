# Implementation Instructions

**Plan:** `ops/_backlog/4-next/plan-workspace-cli/plan.md`

**commit.Id:** `cli-codebase-scaffold`

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `ops/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `cli-codebase-scaffold`, created package structure and records, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Scaffold the `@art-domains/workspace-cli` package structure and update ops/records to reflect the new package, namespace, dependencies, and scripts.

## Mandatory Reading

- `ops/_architect.md` — workspace architecture, principles, NFRs, use cases
- `ops/_adr/cli.art` — CLI package decisions (location, manifest format, records as source of truth, tech stack)
- `repos/artificial/ops/records/projects/artificial.art` — project record to update
- `repos/artificial/ops/records/namespaces/tools.art` — example namespace record
- `repos/artificial/ops/records/packages/artificials-bin.art` — example package record
- `repos/artificial/ops/records/dependencies/cli-dev.art` — example dependency record
- `repos/artificial/ops/records/scaffolders/skeleton-cli/scaffolder-skeleton.art` — CLI scaffolder

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

### 1. Create namespace record

Create `repos/artificial/ops/records/namespaces/art-domains.art`:

```art
# Module

## Namespace: Art Domains

**Purpose:** Domain packages for cross-repo tooling.

**Description:** Domain packages that provide cross-repo orchestration and workspace automation tools.

**Path:** `art-domains`

**Packages:**

- Package: Workspace CLI
```

### 2. Create package record

Create `repos/artificial/ops/records/packages/domains-workspace-cli.art`:

```art
# Module

## Package: Workspace CLI

**Purpose:** CLI for workspace orchestration (clone, branch, link, sanity, publish).

**Description:** Provides commands for managing multiple repositories: cloning repos, branching across repos, symlinking packages for local dev, checking repo status, and publishing packages.

**Path:** `cli/workspace/`

**Canonical Name:** `@art-domains/workspace-cli`

**Version:** `0.0.1`

**Language:** TypeScript

**Dependencies:**

- Runtime:
  - Package Dependency: Commander
  - Package Dependency: Simple Git
- Dev:
  - Package Dependency Set: Workspace CLI Development

**Scripts:**

- Package Script Set: Workspace CLI Build
- Package Script Set: Common Scripts

**Scaffolders:**

- Scaffolder Skeleton: CLI Package
- Scaffolder Skeleton: Package Common

**PackageFile:** package.json
```

### 3. Create dependency records

Create `repos/artificial/ops/records/dependencies/workspace-cli-dev.art`:

```art
# Module

## Package Dependency: Commander

**Canonical Name:** `commander`

**Purpose:** CLI framework for argument parsing and command routing.

**Version:** `^12.0.0`

## Package Dependency: Simple Git

**Canonical Name:** `simple-git`

**Purpose:** Git operations library for status, push, clone, branch commands.

**Version:** `^3.24.0`

## Package Dependency: Types Node

**Canonical Name:** `@types/node`

**Purpose:** Node.js type definitions.

**Version:** `^25.9.3`

## Package Dependency: TypeScript

**Canonical Name:** `typescript`

**Purpose:** TypeScript compiler.

**Version:** `^5.4.0`

## Package Dependency: Vitest

**Canonical Name:** `vitest`

**Purpose:** Testing framework.

**Version:** `^1.4.0`

## Package Dependency: Noodlestan Esbuild

**Canonical Name:** `@noodlestan/esbuild`

**Purpose:** Build tooling.

**Version:** `^0.0.11`

## Package Dependency Set: Workspace CLI Development

**Dependencies:**

- Package Dependency: Commander
- Package Dependency: Simple Git
- Package Dependency: Types Node
- Package Dependency: TypeScript
- Package Dependency: Vitest
- Package Dependency: Noodlestan Esbuild
```

### 4. Update project record

Update `repos/artificial/ops/records/projects/artificial.art`:

Add `- Namespace: Art Domains` to the **Namespaces:** section.

### 5. Scaffold package structure

Create the following structure at `repos/artificial/art-domains/cli/workspace/`:

```
art-domains/cli/workspace/
├── src/
│   └── index.ts          # Placeholder entry point
├── package.json
├── tsconfig.json
├── README.md
└── .gitignore
```

**src/index.ts** (placeholder):

```typescript
#!/usr/bin/env node

console.log('art-workspace CLI — placeholder');
```

**package.json**:

```json
{
  "name": "@art-domains/workspace-cli",
  "version": "0.0.1",
  "description": "Workspace orchestration CLI",
  "type": "module",
  "bin": {
    "art-workspace": "./dist/index.js"
  },
  "scripts": {
    "build": "esbuild src/index.ts --bundle --platform=node --outfile=dist/index.js --format=esm",
    "dev": "npm run build -- --watch",
    "test": "vitest",
    "lint": "eslint src/ && tsc --noEmit"
  },
  "dependencies": {
    "commander": "^12.0.0",
    "simple-git": "^3.24.0"
  },
  "devDependencies": {
    "@types/node": "^25.9.3",
    "typescript": "^5.4.0",
    "vitest": "^1.4.0",
    "@noodlestan/esbuild": "^0.0.11"
  }
}
```

**tsconfig.json**:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**README.md**:

````markdown
# @art-domains/workspace-cli

Workspace orchestration CLI for the Noodlestan ecosystem.

## Commands

- `art-workspace clone` — Clone repos from manifest
- `art-workspace branch` — Branch across repos
- `art-workspace link` — Symlink packages for local dev
- `art-workspace sanity` — Check repo status
- `art-workspace publish` — Publish packages

## Installation

```bash
npm install -g @art-domains/workspace-cli
```
````

## Usage

```bash
art-workspace --help
```

```

**.gitignore**:

```

node_modules/
dist/
\*.log
.DS_Store

```

## Rules

- Create all records in `repos/artificial/ops/records/` following the existing patterns.
- Scaffold the package structure at `repos/artificial/art-domains/cli/workspace/`.
- Ensure all file paths in records match the actual scaffolded structure.
- Do NOT run `npm install` yet — that will be done in a later step.
- Do NOT implement the CLI logic — that will be done in later steps.
- If a command reports errors, attempt to fix them.
- If the errors persist, inspect the cause before continuing.
- If still unable to fix it, STOP and report back following the "## How to Report Back" section.

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Create namespace record
Step 2. Create package record
Step 3. Create dependency records
Step 4. Update project record
Step 5. Scaffold package structure
Step 6. Final verification

Execute all the steps autonomously, one by one, including running the **validation commands** plus any _validation command_ found at the end of the current step.

- RULE: You are FORBIDDEN from returning to a previous step.

## Step Validation commands

- RULE: After each step, execute the validation commands listed for that step.

## Steps

### Step 1 — Create namespace record

- Create `repos/artificial/ops/records/namespaces/workspace.art` with the content specified in Changes section.

**Validation:** File exists and follows the pattern of other namespace records.

### Step 2 — Create package record

- Create `repos/artificial/ops/records/packages/workspace-cli.art` with the content specified in Changes section.

**Validation:** File exists and follows the pattern of other package records.

### Step 3 — Create dependency records

- Create `repos/artificial/ops/records/dependencies/workspace-cli-dev.art` with the content specified in Changes section.

**Validation:** File exists and follows the pattern of other dependency records.

### Step 4 — Update project record

- Update `repos/artificial/ops/records/projects/artificial.art` to add `- Namespace: Workspace Tools` to the Namespaces section.

**Validation:** Project record includes the new namespace.

### Step 5 — Scaffold package structure

- Create the directory structure at `repos/artificial/art-domains/cli/workspace/`.
- Create all files as specified in Changes section.

**Validation:** All files exist with correct content.

### Step 6 — Final verification

- All records created/updated in `repos/artificial/ops/records/`.
- Package structure scaffolded at `repos/artificial/art-domains/cli/workspace/`.
- Records match the scaffolded structure (dependencies, scripts, paths).

## Final Verification

**Sanity check**

The goal is met: package structure is scaffolded and records are updated to reflect the new package, namespace, dependencies, and scripts.

**Verification steps**

- `ls repos/artificial/ops/records/namespaces/workspace.art` shows the file.
- `ls repos/artificial/ops/records/packages/workspace-cli.art` shows the file.
- `ls repos/artificial/ops/records/dependencies/workspace-cli-dev.art` shows the file.
- `grep "Art Domains" repos/artificial/ops/records/projects/artificial.art` shows the namespace.
- `ls repos/artificial/art-domains/cli/workspace/` shows the package structure.
- `cat repos/artificial/art-domains/cli/workspace/package.json` shows correct dependencies and scripts.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it to `ops/_backlog/4-next/plan-workspace-cli/instructions/cli-codebase-scaffold__report.md`.
4. Generate the response and send it back to the delegator.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `_architect.md`, or records.

Thank you for your service.
```
