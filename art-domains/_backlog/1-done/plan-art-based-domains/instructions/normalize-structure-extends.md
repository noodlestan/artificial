# Instructions: build(domains): normalize structure inheritance declarations

**Plan:** `art-based-domains`

**Commit.id:** `normalize-structure-extends`

**Commit.message:** `build(domains): normalize structure inheritance declarations`

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

Normalize structure inheritance declarations across the Art Domains so every structure identifies its base with `Extends` and repeats the required inherited fields with local examples.

## Mandatory Reading

::READ `$DOMAINS/_artificials/structures/structure-abstract.art` (Structure) — Defines the default structure base and inherited field vocabulary.

::READ `$DOMAINS/_artificials/types/record-field.art` (Type) — Defines the field representation used by structure shapes and inheritance.

::READ `$DOMAINS/domains/index.md` (Domain Index) — Defines domain resource ownership and index conventions.

::READ `$DOMAINS/roadmaps/structures/milestone.art` (Structure) — Provides a representative structure with nested inherited fields.

::READ `$DOMAINS/plans/structures/plan.art` (Structure) — Provides a representative plan structure and inheritance model.

::READ `$DOMAINS/work/structures/work-item-abstract.art` (Structure) — Provides the work-item inheritance baseline.

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

- Add or normalize `**Extends:**` on every structure, defaulting to `Structure: Structure (Abstract)` when no more specific base is required.
- Add or normalize `**Inherits:**` on every structure with local examples for `purpose`, `description`, `extends`, `overrides`, `inherits`, `shape`, `status`, and `examples`, excluding `kind` and `name`.
- Preserve each structure’s local fields and update domain indexes and links to match the normalized declarations.

## Workflow

This section describes the workflow to follow when executing this instruction.

You are going to perform a series of steps and check status after each one.

1. Step 1. Inventory structures and inheritance declarations.
2. Step 2. Normalize base and inherited-field declarations.
3. Step 3. Reconcile indexes and dependent references.
4. Step 4. Validate structure coverage and formatting.

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

### Step 1 / 4 — Inventory structures and inheritance declarations

Read every structure file indexed under `$DOMAINS` and record its current `Extends`, `Inherits`, and local shape declarations. Preserve unrelated WIP and identify structures that inherit from old singular paths or omit the inherited-field block.

### Step 2 / 4 — Normalize base and inherited-field declarations

For every structure, add or correct `**Extends:**`. Use `**Extends:** Structure: Structure (Abstract)` as the default when the structure has no more specific base.

Add or correct `**Inherits:**` so it repeats these inherited fields with only the local example for each: `purpose`, `description`, `extends`, `overrides`, `inherits`, `shape`, `status`, and `examples`. Do not repeat `kind` or `name` under `Inherits`. Keep structure-specific fields in the local shape and preserve their existing semantics.

### Step 3 / 4 — Reconcile indexes and dependent references

Update each affected domain `index.md`, `domain.art`, and `::READ` directive so the normalized structure remains discoverable at its owning path. Replace stale inheritance references only where required by the normalized structure ownership; do not broaden this commit into unrelated domain extraction or index redesign.

### Step 4 / 4 — Validate structure coverage and formatting

Run the Step Verification commands and the full Verification commands. Check that every indexed structure contains the required `Extends` and `Inherits` declarations, that `kind` and `name` are absent from `Inherits`, and that each inherited field has a local example.

When the baseline is valid, record the final commit body with the actual files and normalized structures, then commit as:

```text
build(domains): normalize structure inheritance declarations
```

## Final Verification

**Sanity check**

Every structure reachable from the domain indexes must declare a base structure and the complete required inherited-field set, while retaining its local shape and valid resource links.

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
