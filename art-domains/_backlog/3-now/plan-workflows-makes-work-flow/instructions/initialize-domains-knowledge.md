# Instructions: `initialize-domains-knowledge`

**Plan:** `workflows-make-work-flow`

**Iteration Id:** `initialize-domains-knowledge`

## Before you Start

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Path Variables

| Variable      | Resolved Path                     | Purpose                      |
| ------------- | --------------------------------- | ---------------------------- |
| `$WORKSPACE`  | Current working directory         | Workspace root directory.    |
| `$ARTIFICIAL` | `$WORKSPACE/checkouts/artificial` | Artificial project checkout. |

## Working Agreements

The plan workflow runs on three working agreements:

1. This instruction is self-contained. Use this file and its mandatory reading; do not rely on session memory.
2. The report is self-contained and must contain evidence, changes, verification, blockers, and feedback.
3. Keep the final chat report terse; the report file carries the full trail.

## Goals

Create the domains architecture knowledge starting point in `$ARTIFICIAL/art-domains/architecture/`: a reference model of domain boundaries, a reference workflows document, and an ADR collection capturing domain design principles.

## Mandatory Reading

- `$ARTIFICIAL/art-domains/architecture/reference-model.md` — Existing architecture reference model to align with.
- `$ARTIFICIAL/art-domains/architecture/reference-workflows.md` — Existing architecture reference workflows to align with.

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Set Up

**Setting Up:**

From `$ARTIFICIAL/`:

```bash
npm ci # to install dependencies.
```

## Changes

This iteration creates 4 files across 2 commits.

**Commit `add-domains-architecture-knowledge` — reference model and workflows:**

- Create `$ARTIFICIAL/art-domains/architecture/index.md` — domain architecture index.
- Create `$ARTIFICIAL/art-domains/architecture/reference-model.md` — domain boundaries for 11 domains.
- Create `$ARTIFICIAL/art-domains/architecture/reference-workflows.md` — 4 workflows with stage Input/Output/Gates/Operating Resources.

**Commit `add-domains-design-adrs` — domain design ADRs:**

- Create `$ARTIFICIAL/art-domains/architecture/_records/adr/` — up to 3 ADRs capturing domain design principles.

## Workflow

You are going to perform a series of steps and check status after each one.

1. Step 1. Create reference model and workflows.
2. Step 2. Verify reference model and workflows.
3. Step 3. Commit reference model and workflows.
4. Step 4. Create domain design ADRs.
5. Step 5. Verify domain design ADRs.
6. Step 6. Commit domain design ADRs.

Execute all the steps autonomously, one by one, including running the prescribed **Verification** actions.

### Rules

- RULE: You are FORBIDDEN from return to a previous step.
- RULE: If a command reports errors, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back following the "## Rules to Report".

## Steps

### Step `1 / 6` — Create reference model and workflows.

**Goal:** Create the architecture index, reference model, and reference workflows in `$ARTIFICIAL/art-domains/architecture/`.

Read the existing architecture files to understand the format and level of detail:

- Read `$ARTIFICIAL/architecture/reference-model.md`.
- Read `$ARTIFICIAL/architecture/reference-workflows.md`.

Create the following files:

1. `$ARTIFICIAL/art-domains/architecture/index.md` — a short index file that lists the architecture knowledge files (reference-model.md, reference-workflows.md, and the \_records/adr/ directory).

2. `$ARTIFICIAL/art-domains/architecture/reference-model.md` — model after `$ARTIFICIAL/architecture/reference-model.md`. Cover domain boundaries for the 11 domains defined in `$DOMAINS/index.md`. For each domain, describe its boundaries as relationships ordered from strongest to weakest, at the level of abstract concepts. Distinguish between work items, resources in work scope, and knowledge resources.

3. `$ARTIFICIAL/art-domains/architecture/reference-workflows.md` — model after `$ARTIFICIAL/architecture/reference-workflows.md`. Cover the 4 known workflows (Planning, Roadmapping, Engineering, Deploying). For each stage, describe input, output, gates, and operating resources.

### Step `2 / 6` — Verify reference model and workflows.

**Verifying:**

From `$ARTIFICIAL/`:

```bash
npm run lint:fix # to fix formatting issues automatically
```

```bash
ls -la $ARTIFICIAL/art-domains/architecture/
```

### Step `3 / 6` — Commit reference model and workflows.

**Policy:** AUTONOMOUS — commit and push without waiting for confirmation.

Commit `add-domains-architecture-knowledge` with message:

```
knowledge(domains): Add reference model and workflow starting points.

- Create architecture index listing reference model and workflows.
- Create reference-model.md with domain boundaries for 11 domains.
- Create reference-workflows.md with 4 workflows and stage Input/Output/Gates/Operating Resources.
```

Push the commit.

### Step `4 / 6` — Create domain design ADRs.

**Goal:** Create the ADR directory and capture up to 3 decisions based on domain design principles.

Review the principles listed in the iteration changes (in the plan) to understand what decisions to capture.

Create the following:

1. `$ARTIFICIAL/art-domains/architecture/_records/adr/` directory.

2. Up to 3 ADR files capturing domain design decisions. Each ADR should be based on principles, not particular shapes.

Examples of principles used to form decisions about domain design (not authoritative, food for thought, integrate with reality):

- A domain may depend directly on another domain when it cannot provide its own abstraction without that domain.
- A domain may assume another domain when the relationship is useful or conventional but both domains remain independently usable.
- A domain may be aware of another domain when it can reference, coordinate with, inform, or be informed by it without assuming its shape.
- Prefer describing relationships at the level of abstract concepts rather than prematurely coupling domains to concrete implementations.
- Explicitly distinguish between:
  - work items and their relationships — dependencies, sequencing, composition, coordination, etc.
  - resources in work scope and their relationships to work items — operations, dependencies, ownership, etc.
  - knowledge resources and their relationships to work items and resources — architecture, patterns, conventions, pseudocode, etc.
- Where a domain works with an abstract concept that may eventually have several concrete domain manifestations, describe the abstract relationship and give those manifestations only as examples.
- Do not infer a dependency merely because one domain can be used together with another.
- Every domain should remain independently usable unless its purpose fundamentally requires another domain.
- Do not create relationships merely to make the domains form a hierarchy.
- Do not assume that an upstream/downstream workflow implies a domain dependency: independent domains may consume and produce abstract work items at different levels of granularity.

This ADR is proposed by the architect:

- ADR: Relationships by Example - context: "Where a domain works with an concepts other (eventually unknown) domains, naming conrete manifestations may prematurely couple the domains" decision "In domain resources prose, always refer to resources in abstract terms, naming concrete resource kinds or names as examples." Consequences: - The domain design is not directly coupled to other domains; - new domains can be added with their resources participating automatically and seemlessly in existing workflows and resource hierarchies. - Art projections (install/compile time) of installed domains can customize workflows, routing, and resource discoverability and association by merely overriding examples."

These 2 are suggested by the architect:

- **ADR: Domain Dependency Principle** — A domain may depend directly on another domain when it cannot provide its own abstraction without that domain.
- **ADR: Independent Domains** — Every domain should remain independently usable unless its purpose fundamentally requires another domain.

Add one more if you can think of another principle that is important to capture.

Use the following structure for each ADR:

```markdown
# ADR: {title}

**Status:** PROPOSED

**Context:** {what principle or observation prompted this decision}

**Decision:** {what was decided}

**Consequences:** {what follows from this decision}
```

Save each ADR in `$ARTIFICIAL/art-domains/architecture/_records/adr/` with a filename that reflects the title, e.g., `domain-dependency-principle.md`.

### Step `5 / 6` — Verify domain design ADRs.

From `$ARTIFICIAL/`:

```bash
npm run lint:fix # to fix formatting issues automatically
```

```bash
ls -la $ARTIFICIAL/art-domains/architecture/_records/adr/
```

### Step `6 / 6` — Commit domain design ADRs.

**Policy:** BLOCKED — STOP and REPORT A BLOCKER. Do not commit or push.

Commit `add-domains-design-adrs` with message:

```
knowledge(domains): Add domain design ADRs.

- Create _records/adr/ directory for domain design decisions.
- Add ADR: Domain Dependency Principle.
- Add ADR: Abstract Relationships Over Concrete Coupling.
- Add ADR: Independent Domains.
```

REPORT A BLOCKER: second commit is blocked. Do not proceed.

## Final Verification

**Sanity check:**

```bash
ls -la $ARTIFICIAL/art-domains/architecture/
ls -la $ARTIFICIAL/art-domains/architecture/_records/adr/
wc -l $ARTIFICIAL/art-domains/architecture/reference-model.md
wc -l $ARTIFICIAL/art-domains/architecture/reference-workflows.md
```

**Verifying:**

From `$ARTIFICIAL/`:

```bash
npm run lint:fix # to fix formatting issues automatically
```

## How to Report Back

Render `$ARTIFICIAL/art-domains/_backlog/3-now/plan-workflows-makes-work-flow/instructions/initialize-domains-knowledge__report.md` with the report template. Include changed files, verification evidence, and any ambiguity about the ADR content.
