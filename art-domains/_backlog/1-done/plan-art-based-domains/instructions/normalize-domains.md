# Instructions: build(domains): normalize domain indexes and resource files

**Plan:** `art-based-domains`

**Commit.id:** `normalize-domains`

**Commit.message:** `build(domains): normalize domain indexes and resource files`

NOTE: Before committing, update the body of the commit message to reflect the changes made as bullet points.

## Before you Start

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Path Variables

| Variable      | Resolved Path                      | Purpose                                      |
| ------------- | ---------------------------------- | -------------------------------------------- |
| `$WORKSPACE`  | Current working directory          | Workspace root                               |
| `$DOMAINS`    | `$WORKSPACE/.agents/domains/`      | Art domain instructions and resource indexes |
| `$MANAGEMENT` | `$WORKSPACE/checkouts/management/` | Roadmap checkout containing the plan         |

## Working Agreements

The plan workflow (see the entry point guide → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `%commit.id`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Normalize the Art Domains author and consumer entry points so each domain has a consistent record, fixed resource-kind index layout, and separately addressable `.art` resources.

## Mandatory Reading

::READ `$DOMAINS/domains/index.md` (Domain Index) — Defines domain entry points and resource index conventions.

::READ `$DOMAINS/roadmaps/index.md` (Domain Index) — Defines the Roadmaps domain entry point.

::READ `$DOMAINS/plans/index.md` (Domain Index) — Defines the Plans domain entry point.

::READ `$DOMAINS/conventions/index.md` (Domain Index) — Defines the Conventions domain entry point.

::READ `$DOMAINS/references/index.md` (Domain Index) — Defines the References domain entry point.

::READ `$DOMAINS/tasks/index.md` (Domain Index) — Defines the Tasks domain entry point.

::READ `$DOMAINS/engineering/_guide.md` (Guide) — Defines planning, implementation, verification, and commit responsibilities.

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Setup

This section provides the setup commands required before executing this instruction.

Run from `$WORKSPACE`:

```bash
npm run lint
```

Run from `$MANAGEMENT`:

```bash
npm run lint
```

## Changes

This section summarises the changes to be made in this iteration, rouped by steps.

- Split inline Plans file resources and Domains routine resources into individual `.art` files.
- Create or normalize every affected `domain.art` as the author entry point with `Purpose` and `Description`.
- Create or normalize every affected `index.md` as the consumer entry point with plain purpose/description paragraphs, definitions, and fixed resource-kind sections in the order Structures, Types, Workflows, Routines, Templates, Files.
- Render resources as tables, use Purpose / Pattern for Files, and omit empty sections.

## Workflow

This section describes the workflow to follow when executing this instruction.

You are going to perform a series of steps and check status after each one.

1. Step 1. Inventory domains and classify current resources.
2. Step 2. Extract inline resource records.
3. Step 3. Normalize domain records and consumer indexes.
4. Step 4. Validate links, ordering, and formatting.

Execute all the steps autonomously, one by one, including running the prescribed **Verification** actions.

### Rules

This section lists the rules to follow when executing this instruction.

- RULE: You are FORBIDDEN from return to a previous step.
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## Rules to Report".

## Step Verification

## Verification

This section provides the verification commands to validate changes made by this instruction.

From `$WORKSPACE`, run:

```bash
npm run lint
```

From `$MANAGEMENT`, run:

```bash
npm run lint
```

## Steps

### Step 1 / 4 — Inventory domains and classify current resources

Read every domain `domain.art` and `index.md` under `$DOMAINS`, preserving unrelated WIP. Record each domain’s definitions, structures, types, workflows, routines, templates, files, and any inline resources. Identify stale singular paths and duplicate ownership before editing.

### Step 2 / 4 — Extract inline resource records

In the Plans domain, split the inline entries currently represented by `files/index.md` into one `.art` file per file resource. Each extracted record must retain `Purpose`, `Naming Pattern`, `Template`, and `Location`.

In the Domains domain, split the inline entries currently represented by `routines/index.md` into one `.art` file per routine. Preserve each routine’s executable content and update its source index.

### Step 3 / 4 — Normalize domain records and consumer indexes

For each domain in scope—Conventions, Deployments, Domains, Engineering, Namespaces, Plans, Packages, Primitives, Projects, References, Repositories, Roadmaps, Tasks, Work, and Workspaces—ensure `domain.art` contains a `# Module` with `## Domain: {Name}`, `Purpose`, and `Description`.

Ensure `index.md` starts with `# {Name} Domain`, followed by two plain paragraphs for purpose and description, a `## Definitions` section, and resource-kind sections in the fixed order Structures, Types, Workflows, Routines, Templates, Files. Render each resource as a table and omit empty sections. Ensure all table paths resolve to the owning resource files.

### Step 4 / 4 — Validate links, ordering, and formatting

Run the Step Verification commands and the full Verification commands. Confirm every domain entry point is present, every extracted resource appears exactly once in its owner index, resource-kind sections are ordered consistently, and no new link targets a deleted or legacy inline resource.

When the baseline is valid, record the final commit body with the actual files and normalized domains, then commit as:

```text
build(domains): normalize domain indexes and resource files
```

## Final Verification

**Sanity check**

Starting from `$DOMAINS/index.md`, every domain in scope must be discoverable, each domain must expose `domain.art` and `index.md`, and each index must list only resources that resolve to existing files in the correct fixed order.

**Verification:**

From `$WORKSPACE`, run:

```bash
npm run lint
```

From `$MANAGEMENT`, run:

```bash
npm run lint
```

## How to Report Back to the Delegator

This section describes how to report back to the delegator after completing this instruction.

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with the `.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `plan-%plan.id/instructions/%commit.id__report.md`. No separate delegation record is created.
4. If your prompt included a `DIRECTIVE FEEDBACK:` include the feedback sections in the rendered report.
5. Generate the response and send it back to the delegator.
6. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `%commit.id`, created `{artefacts}`, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
