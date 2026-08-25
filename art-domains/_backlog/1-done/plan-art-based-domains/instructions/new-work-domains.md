# Instructions: build(domains): establish Art Domains baseline

**Plan:** `art-based-domains`

**Commit.id:** `new-work-domains`

**Commit.message:** `build(domains): establish Art Domains baseline`

NOTE: Before committing, update the body of the commit message to reflect the changes made as bullet points.

## Before you Start

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Path Variables

| Variable      | Resolved Path                             | Purpose                                      |
| ------------- | ----------------------------------------- | -------------------------------------------- |
| `$WORKSPACE`  | Current working directory                 | Workspace root                               |
| `$DOMAINS`    | `$WORKSPACE/.agents/domains/`             | Art domain instructions and resource indexes |
| `$MANAGEMENT` | `$WORKSPACE/checkouts/management/`        | Roadmap checkout containing the plan         |
| `$ART_JS`     | `$WORKSPACE/checkouts/artificial/art-js/` | Source of structures being hoisted           |

## Working Agreements

The plan workflow (see the entry point guide → Planning Workflow → Working Together) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `%commit.id`, created `{artefacts}`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Establish the Art Domains baseline by separating work-domain responsibilities into single-purpose domains, hoisting the shared Artificials structure/type primitives, and making the resulting resources discoverable through valid domain indexes.

## Mandatory Reading

::READ `$DOMAINS/engineering/_guide.md` (Guide) — Defines planning, implementation, verification, and commit responsibilities.

::READ `$DOMAINS/domains/index.md` (Domain Index) — Defines domain entry points and resource index conventions.

::READ `$DOMAINS/roadmaps/structures/milestone.art` (Structure) — Defines the milestone record and nested phase/item model.

::READ `$DOMAINS/roadmaps/templates/milestone.tart` (Template) — Defines the milestone document layout.

::READ `$DOMAINS/work/index.md` (Domain Index) — Defines work-item scope and context abstractions.

::READ `$ART_JS/spec/structures/structure-abstract.art` (Structure) — Source `Structure (Abstract)` definition.

::READ `$ART_JS/spec/primitives/record-field.art` (Type) — Source `Record Field` definition.

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

- Shared foundations: hoist `Structure: Structure (Abstract)` and `Type: Record Field` from `$ART_JS`; create the Roadmaps milestone structure/template; and extract `path-ref` and `resource-ref` into Primitives.
- Work-resource extraction: create Deployments, Namespaces, Packages, Repositories, Scaffolders, Work, and Workspaces from the current project records, prototype records, and milestone draft.
- Ownership cleanup: trim Projects to `Structure: Project` and `Type: License`, then update every affected `domain.art`, `index.md`, resource link, and ownership reference.

## Workflow

This section describes the workflow to follow when executing this instruction.

You are going to perform a series of steps and check status after each one.

1. Step 1. Inventory current WIP and source records.
2. Step 2. Establish shared Artificials and Roadmaps/Primitives foundations.
3. Step 3. Extract the work-domain resources and update indexes.
4. Step 4. Validate links, structure declarations, and repository formatting.

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

### Step 1 / 4 — Inventory and protect the WIP

Read the current domain entry points and the two Art JS source records listed under Mandatory Reading. Build a concise map of existing singular/plural domain locations, duplicate resources, and cross-domain references. Check the working-tree status before changing anything and preserve unrelated modifications.

Confirm that the intended destinations already present in the WIP are semantically equivalent to the Art JS source records. Where a destination is incomplete, copy the source meaning into the domain-owned record and update the relevant index; do not remove the Art JS source until all required consumers have been identified.

### Step 2 / 4 — Establish shared foundations

Ensure the Artificials domain owns the hoisted `Structure (Abstract)` and `Record Field` resources, with valid `domain.art` and `index.md` entries. Preserve the record declaration format and align field names and examples with the current Artificials conventions.

Ensure the Roadmaps domain owns `Structure: Milestone` and its `milestone.tart` template. Extract `path-ref` and `resource-ref` into the Primitives domain and update the milestone structure’s `Uses` directives and all consumers to the new paths.

### Step 3 / 4 — Extract work domains from projects

Create or reconcile the following domain boundaries from the existing project records and current WIP:

- Deployments: deployment structure and build, command, environment, and infrastructure types derived from prototype records and the milestone draft.
- Namespaces: namespace structure extracted from projects.
- Packages: package structure plus script, dependency, and related package types extracted from projects.
- Repositories: repository and repository-owned resource structures extracted from projects.
- Scaffolders: scaffolder structures and file/skeleton/procedural types extracted from projects.
- Work: work-item structure plus scope, context, phase, downstream-item, and workflow-stage types derived from the milestone structure.
- Workspaces: workspace and checkout structures extracted from existing workspace concepts.
- Projects: retain only the project structure and `Type: License`; move other concepts to their owning domains.

For every moved or created resource, update its owning `domain.art`, `index.md`, and any `::READ` or table links that point to its previous location. Keep names and paths consistent with the plural domain names used by the current WIP.

### Step 4 / 4 — Validate the baseline

Run the Step Verification commands and the full Verification commands. Review the resulting diff for accidental edits to unrelated WIP. Confirm that every new domain has a discoverable entry point, every extracted resource has one owner, and no new link points at a deleted or singular legacy location.

When the baseline is valid, record the final commit body with the actual files and extracted resources, then commit as:

```text
build(domains): establish Art Domains baseline
```

## Final Verification

**Sanity check**

Starting from `$DOMAINS/index.md`, each new or normalized domain must be reachable through its domain index, and each resource listed in an index must resolve to an existing file. The Artificials and Roadmaps records must no longer depend on their original Art JS or milestone-inline definitions for ownership.

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
