# Implementation Instructions

**Plan:** `ops/_backlog/3-now/plan-workspace-cli/plan.md`

**commit.Id:** `cli-entry-point-setup`

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `ops/_guide.md` → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `cli-entry-point-setup`, created entry point with command routing, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Setup the CLI entry point with commander, configure command routing structure for all 5 commands (clone, branch, link, sanity, publish), and establish the basic CLI skeleton.

## Mandatory Reading

- `ops/_architect.md` — workspace architecture, principles, NFRs, use cases
- `ops/_adr/cli.art` — CLI package decisions (tech stack: commander, simple-git, esbuild, vitest)
- `repos/artificial/ops/records/packages/domains-workspace-cli.art` — package record
- `repos/artificial/art-domains/cli/workspace/package.json` — current package.json
- `ops/_backlog/3-now/plan-workspace-cli/plan__pseudo__entry.md` — entry point pseudo-code

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Changes

### 1. Create entry point file

Create `repos/artificial/art-domains/cli/workspace/src/index.ts`:

```typescript
#!/usr/bin/env node

import { Command } from 'commander'

const program = new Command()

program
  .name('art-workspace')
  .description('Workspace orchestration CLI')
  .version('0.0.1')

program
  .command('clone')
  .description('Clone repos from manifest')
  .action(() => {
    console.log('clone command - TODO')
  })

program
  .command('branch')
  .description('Branch across repos')
  .action(() => {
    console.log('branch command - TODO')
  })

program
  .command('link')
  .description('Link packages for local dev')
  .action(() => {
    console.log('link command - TODO')
  })

program
  .command('sanity')
  .description('Check repo status')
  .action(() => {
    console.log('sanity command - TODO')
  })

program
  .command('publish')
  .description('Publish packages')
  .action(() => {
    console.log('publish command - TODO')
  })

program.parse()
```

### 2. Update package.json

Update `repos/artificial/art-domains/cli/workspace/package.json` to ensure:

- `bin` field points to `./dist/index.js`
- `build` script uses esbuild with shebang preservation
- Dependencies include `commander`

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
    "build": "esbuild src/index.ts --bundle --platform=node --outfile=dist/index.js --format=esm --banner:js='#!/usr/bin/env node'",
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

### 3. Install dependencies

Run `npm install` in `repos/artificial/art-domains/cli/workspace/` to install commander and other dependencies.

### 4. Build the CLI

Run `npm run build` to compile the entry point.

## Rules

- Create the entry point file at `repos/artificial/art-domains/cli/workspace/src/index.ts`.
- Ensure the shebang `#!/usr/bin/env node` is at the top of the file.
- Update package.json with the correct bin field and build script.
- The build script must preserve the shebang in the output.
- Run `npm install` to install dependencies.
- Run `npm run build` to compile.
- Do NOT implement command logic — just placeholder actions.
- If a command reports errors, attempt to fix them.
- If the errors persist, inspect the cause before continuing.
- If still unable to fix it, STOP and report back following the "## How to Report Back" section.

## Workflow

You are going to perform a series of steps and check status after each one.

Step 1. Create entry point file
Step 2. Update package.json
Step 3. Install dependencies
Step 4. Build the CLI
Step 5. Final verification

Execute all the steps autonomously, one by one, including running the **validation commands** plus any _validation command_ found at the end of the current step.

- RULE: You are FORBIDDEN from returning to a previous step.

## Step Validation commands

- RULE: After each step, execute the validation commands listed for that step.

## Steps

### Step 1 — Create entry point file

- Create `repos/artificial/art-domains/cli/workspace/src/index.ts` with the content specified in Changes section.

**Validation:** File exists with correct content, shebang at top.

### Step 2 — Update package.json

- Update `repos/artificial/art-domains/cli/workspace/package.json` with bin field and build script.

**Validation:** package.json has correct bin field and build script with shebang preservation.

### Step 3 — Install dependencies

- Run `npm install` in `repos/artificial/art-domains/cli/workspace/`.

**Validation:** `npm install` succeeds, `node_modules/commander` exists.

### Step 4 — Build the CLI

- Run `npm run build` in `repos/artificial/art-domains/cli/workspace/`.

**Validation:** `npm run build` succeeds, `dist/index.js` exists.

### Step 5 — Final verification

- Run `node dist/index.js --help` — should show CLI help with all 5 commands listed.
- Run `node dist/index.js --version` — should show `0.0.1`.
- Run `node dist/index.js clone` — should print "clone command - TODO".

## Final Verification

**Sanity check**

The goal is met: CLI entry point is setup with commander, command routing is configured for all 5 commands, and the CLI builds and runs successfully.

**Verification steps**

- `ls repos/artificial/art-domains/cli/workspace/src/index.ts` shows the file.
- `ls repos/artificial/art-domains/cli/workspace/dist/index.js` shows the built output.
- `node dist/index.js --help` shows all 5 commands.
- `node dist/index.js --version` shows version.
- Each command prints its TODO message.

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it to `ops/_backlog/3-now/plan-workspace-cli/instructions/cli-entry-point-setup__report.md`.
4. Generate the response and send it back to the delegator.

DIRECTIVE FEEDBACK: render your report with the report template. Include, for every ambiguity, omission, or contradiction found while implementing: `where` (the plan/instruction section involved), `problem`, `decision` (the simplest reading you implemented), and a READY-TO-APPLY snippet for the plan file, `_architect.md`, or records.

Thank you for your service.
