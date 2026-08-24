# Plan: Workflows Make Work Flow

**ID:** `workflows-make-work-flow`

**Status:** `REFINING`

**Template:** `$DOMAINS/plans/templates/plan.tart`

**Skill:** `write-plan`

**Purpose:** Update the write-plan skill to work with the new plan structure and work domain abstractions, and exercise the plan structures/templates by retrofitting completed work.

**Description:** Plan with 8 completed iterations (exercise) and 6 planned iterations covering skill update, agent mode update, domain routine refactor, and spec integration.

## Mandatory Reading

::READ `$DOMAINS/plans/structures/plan.art` (Structure) — Defines the plan structure and nested types.

## Path Variables

This section lists the path variables used throughout the plan file and its downstream work items. All file references in the plan and downstream work items MUST use these variables — never bare filesystem paths.

| Variable      | Resolved Path                     | Purpose                               |
| ------------- | --------------------------------- | ------------------------------------- |
| `$WORKSPACE`  | Current working directory         | Workspace root directory              |
| `$PROJECT`    | Provided with prompt              | Where work execution is taking place. |
| `$DOMAINS`    | `$WORKSPACE/.agents/domains`      | Domain resources directory            |
| `$SKILLS`     | `$WORKSPACE/.agents/skills`       | Skills resources directory            |
| `$MANAGEMENT` | `$WORKSPACE/checkouts/management` | Management project checkout           |
| `$ARTIFICIAL` | `$WORKSPACE/checkouts/artificial` | Artificial project checkout           |

## Summary

Update the write-plan skill to map its procedures (Composing Plan Scope, Composing Plan Context, Composing Path Variables) to the new plan structure fields (`scope`, `context.upstream`, `context.knowledge`, `context.required-skills`, `paths`). Exercise the plan structures by retrofitting 8 completed work groups as iterations. Add 6 planned iterations for skill update, agent mode update, domain routine refactor, and spec integration.

Scope covers the write-plan skill, plan structure, plan template, and work domain types. Upstream source is the Hello World milestone. knowledge includes plan/iteration structures, work domain types, and engineering workflow.

## Attachments

- `./plan-workflows-make-work-flow/plan__draft.md` (Draft) — Original draft with DONE/NOT DONE sections.

## Domains

| Domain / Path                                       | Description                                                                        |
| --------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Domain: Plans `$DOMAINS/plans/index.md`             | Planning lifecycle for contextualising, drafting, refining, and integrating plans. |
| Domain: Engineering `$DOMAINS/engineering/index.md` | Engineering lifecycle for setting up, verifying, and committing work.              |
| Domain: Work `$DOMAINS/work/index.md`               | Abstract work-item model shared by planning domains.                               |
| Domain: Domains `$DOMAINS/domains/index.md`         | Infrastructure for domain producers and consumers.                                 |

### Work Scope Types

| Work Scope Type / Path                                                    | Resource Kind / Path                                                    |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Type: Project Scope `$DOMAINS/projects/types/project-scope.art`           | Structure: Project `$DOMAINS/projects/structures/project.art`           |
| Type: Repository Scope `$DOMAINS/repositories/types/repository-scope.art` | Structure: Repository `$DOMAINS/repositories/structures/repository.art` |
| Type: Package Scope `$DOMAINS/packages/types/package-scope.art`           | Structure: Package `$DOMAINS/packages/structures/package.art`           |
| No work scope type for kind `Skill`                                       | Structure: Skill `$SKILLS/{skill}/SKILL.md`                             |
| No work scope type for kind `Domain`                                      | Structure: Domain `$DOMAINS/domains/structures/domain.art`              |
| No work scope type for kind `Workspace`                                   | Structure: Workspace `$DOMAINS/workspaces/structures/workspace.art`     |

### Workflows

| Workflow / Path                                                        | Description                                                                        |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Workflow: Planning `$DOMAINS/plans/workflows/planning.art`             | Planning lifecycle for contextualising, drafting, refining, and integrating plans. |
| Workflow: Engineering `$DOMAINS/engineering/workflows/engineering.art` | Engineering lifecycle for setting up, verifying, and committing work.              |

### Workflow Stages

| Name            | Workflow               | Description                               |
| --------------- | ---------------------- | ----------------------------------------- |
| Contextualizing | Workflow: Planning     | Gather scope and context for planning.    |
| Drafting        | Workflow: Planning     | Draft plan content and iterations.        |
| Refining        | Workflow: Planning     | Refine plan for clarity and completeness. |
| Setting up      | Workflow: Implementing | Prepare execution environment.            |
| Verifying       | Workflow: Implementing | Validate changes against requirements.    |
| Committing      | Workflow: Implementing | Package and commit completed work.        |

## Context

### Upstream Work

| Kind        | Path                                                            | Role                                                            |
| ----------- | --------------------------------------------------------------- | --------------------------------------------------------------- |
| Milestone   | `$MANAGEMENT/_roadmap/3-now/milestone-hello-world/milestone.md` | Coordinates this plan with other plans and milestones.          |
| Parking Lot | `$ARTIFICIAL/art-domains/_backlog/_parking-lot.md`              | Tracks short-term actionables, pending questions, and blockers. |

### Required Skills

- `write-plan` — Generates plans from sources and context. Required for Contextualizing, Drafting, Refining.
- `render-template` — Renders plan and instruction artefacts. Required for Drafting, Refining.

## Knowledge Context

::READ `$DOMAINS/plans/structures/plan.art` (Structure) — Defines plan record fields and statuses. Relevant for stages Contextualizing, Drafting, Refining.

::READ `$DOMAINS/plans/structures/iteration.art` (Structure) — Defines iteration as a container for changes and instructions. Relevant for stages Drafting, Refining.

::READ `$DOMAINS/plans/templates/plan.tart` (Template) — Defines the presentation of a plan file. Relevant for stages Drafting, Refining.

::READ `$DOMAINS/work/structures/work-item-abstract.art` (Structure) — Abstract base for all work-item records. Relevant for stages Contextualizing, Drafting.

::READ `$DOMAINS/work/types/work-scope-item-abstract.art` (Type) — Describes scoped resources participating in a work item. Relevant for stages Contextualizing, Drafting.

::READ `$DOMAINS/work/types/upstream-work-context.art` (Type) — Describes upstream sources of work. Relevant for stages Contextualizing.

::READ `$DOMAINS/work/types/knowledge-context.art` (Type) — Describes knowledge resources for work items. Relevant for stages Contextualizing, Drafting.

::READ `$DOMAINS/work/types/skill-context.art` (Type) — Describes skills required for work items. Relevant for stages Contextualizing, Drafting.

::READ `$DOMAINS/work/types/downstream-work-item.art` (Type) — Describes work items produced by the current work item. Relevant for stages Drafting, Refining.

::READ `$DOMAINS/work/types/work-attachment.art` (Type) — Describes files attached to work items. Relevant for stages Drafting.

::READ `$DOMAINS/work/types/workflow-stage.art` (Type) — Describes stages in work item workflows. Relevant for stages Contextualizing, Drafting.

::READ `$DOMAINS/engineering/workflows/engineering.art` (Workflow) — Engineering lifecycle stages. Relevant for stages Setting up, Verifying, Committing.

::READ `$DOMAINS/skills/write-plan/SKILL.md` (Skill) — The skill being updated. Relevant for stages Contextualizing, Drafting, Refining.

::READ `$DOMAINS/skills/write-milestone/SKILL.md` (Skill) — The skill being updated. Relevant for stages Contextualizing, Drafting, Refining.

## Scope

This plan updates the write-plan skill and exercises the plan structures. The scope covers the skill file, plan structure, plan template, and work domain types used by the skill. Commits happen in the Artificial repository and the Workspace repository.

### Repository: Artificial

**Resource:** Repository: Artificial

**Path:** `$ARTIFICIAL/`

**Record:** `$ARTIFICIAL/_records/repository.art`

**Role:** Changes required.

**Changes:**

- Domain files, structures, types, templates, and skills updated across iterations.

### Workspace: Noodlestan

**Resource:** Workspace: Noodlestan

**Path:** `$WORKSPACE/`

**Record:** `$WORKSPACE/_records/workspace.art`

**Role:** Changes required.

**Changes:**

- Domain definitions, agent modes, and shared context updated across iterations.

### Skill: write-plan

**Resource:** Skill: write-plan

**Path:** `$SKILLS/write-plan/SKILL.md`

**Role:** Changes required.

**Changes:**

- Update Composing Plan Scope routine to output `List(Type: Work Scope Item (Abstract))` instead of `Structure: Plan Scope`
- Update Composing Plan Context routine to output `context.upstream`, `context.knowledge`, `context.required-skills` instead of `Structure: Plan Context`
- Update Create OR Update Plan routine to use `setting-up` and `verifying` as NaturalBlock fields, not injectable commands
- Remove references to non-existent Plan Scope and Plan Context structures

**Dependencies:**

- Plan structure must be stable before skill update.

### Skill: write-milestone

**Resource:** Skill: write-milestone

**Path:** `$SKILLS/write-milestone/SKILL.md`

**Role:** Changes required.

**Changes:**

- Update Composing Milestone Scope routine to output `List(Type: Work Scope Item (Abstract))` instead of `Structure: Milestone Scope`
- Update Composing Milestone Context routine to output `context.upstream`, `context.knowledge`, `context.required-skills` instead of `Structure: Milestone Context`
- Update Create OR Update Milestone routine to use `setting-up` and `verifying` as NaturalBlock fields, not injectable commands
- Remove references to non-existent Milestone Scope and Milestone Context structures

**Dependencies:**

- Milestone structure must be stable before skill update.

### Domain: Work

**Resource:** Domain: Work

**Path:** `$DOMAINS/work/`

**Role:** Changes required.

**Changes:**

- Add Work Status enum (DRAFT, PLANNING, READY, WORKING, BLOCKED, DELIVERED, INTEGRATING, DONE).
- Rewrite work-item-abstract.art with plan-level examples.
- Create scope types (Project Scope, Repository Scope, Package Scope, Application Scope, Deployment Scope).
- Create Work Phase type, Work Attachment type, Workflow structure.
- Define 6 core types.

### Domain: Plans

**Resource:** Domain: Plans

**Path:** `$DOMAINS/plans/`

**Role:** Changes required.

**Changes:**

- Refactor `plan.art` to use inherited fields from Work Item (Abstract) and new scope/context model.
- Create `iteration.art` structure for plan iterations (replaces `plan.commits`).
- Update plan.tart template for new structure.
- Update `instructions.tart` and `instructions-report.tart`.
- Remove `planning.art` workflow (to be recreated).

### Domain: Milestones

**Resource:** Domain: Milestones

**Path:** `$DOMAINS/roadmaps/`

**Role:** Changes required.

**Changes:**

- Move Phases field from Milestone to Roadmap structure.
- Refactor milestone.art and milestone.tart for new structure.
- Add roadmaps/definitions/index.md.

### Domain: Tasks

**Resource:** Domain: Tasks

**Path:** `$DOMAINS/tasks/`

**Role:** Deleted.

**Changes:**

- Remove entire Tasks domain (superseded by Work abstractions)
- Keep only Type: Spec (Abstract) in specs domain

## Work

### Execution Context

Execution occurs from `$WORKSPACE/` and is performed in the `$WORKSPACE` repository (mostly under `$DOMAINS/`) and knowledge is captured in `ARTIFICIAL`, both on the current branch.

### Items

| Resource / Record                                | Status    |
| ------------------------------------------------ | --------- |
| Iteration: Add Work Domain                       | `DONE`    |
| Iteration: Split Iterations From Commits         | `DONE`    |
| Iteration: Convert Templates to Directive Syntax | `DONE`    |
| Iteration: Rebuild Domain Indexes                | `DONE`    |
| Iteration: Initialize Domains Knowledge          | `WORKING` |
| Iteration: Initialize Architecture Knowledge     | `DONE`    |
| Iteration: Add Domain and Workflow Structure     | `DONE`    |
| Iteration: Update Fundamentals File              | `DONE`    |
| Iteration: Integrate Work Domain With Others     | `DONE`    |
| Iteration: Build Plan Workflows                  | `PLANNED` |
| Iteration: Finish Plan Iteration Model           | `PLANNED` |
| Iteration: Update Write Plan Skill               | `PLANNED` |
| Iteration: Update Agent Modes                    | `PLANNED` |
| Iteration: Refactor Domain Index Routines        | `PLANNED` |
| Iteration: Integrate Specs Into Plans            | `PLANNED` |

#### Iteration: Add Work Domain

**id:** `add-work-domain`

**Purpose:** Add new work domain: Work Status enum, work-item-abstract.art, scope types, core types.

**Description:** Finalised Work Status enum, rewrote work-item-abstract.art with plan-level examples, created scope types and core types.

**Status:** `DONE`

**Changes:**

- Work Status enum (DRAFT, PLANNING, READY, WORKING, BLOCKED, DELIVERED, INTEGRATING, DONE).
- Rewrite work-item-abstract.art with plan-level examples.
- Purge title → name.
- Reshape Downstream Work Item.
- Create scope types (Project Scope, Repository Scope, Package Scope, Application Scope, Deployment Scope).
- Create Work Phase type.
- Define 6 core types.

#### Iteration: Split Iterations From Commits

**id:** `plan-iteration-commit-split`

**Purpose:** Split Plan → Iteration → Commit: plans contain iterations, iteration.art created, commits domain created.

**Description:** Plans now contain Iterations, created iteration.art and commits domain with Type: Commit.

**Status:** `DONE`

**Changes:**

- Create `plans/structures/iteration.art`.
- Create `commits/` domain with Type: Commit.
- Update Iteration to have changes/instructions/report/commits.
- Update templates.

#### Iteration: Convert Templates to Directive Syntax

**id:** `templates-converted`

**Purpose:** Convert templates to directive syntax.

**Description:** Converted `milestone.tart` and `plan.tart` to ::TEMPLATE directives.

**Status:** `DONE`

**Changes:**

- Convert `milestone.tart` fully to ::TEMPLATE directives
- Create `plan.tart` from milestone template
- Align TEMPLATE::READ lists

#### Iteration: Rebuild Domain Indexes

**id:** `domains-index-rebuilt`

**Purpose:** Rebuild domain indexes with 17 domains, definitions, structures, types, templates.

**Description:** Rebuilt `domains/{domain}/index.md` for 17 domains and `domains/index.md`.

**Status:** `DONE`

**Changes:**

- Rebuild `domains/{domain}/index.md` for 17 domains, including definitions, structures, types, templates, files, workflows, and routines.
- Rebuild `domains/index.md` with 17 domains.
- Remove Tasks domain.

#### Iteration: Add Domain and Workflow Structure

**id:** `structures-domains-created`

**Purpose:** Create Domain and Workflow structures.

**Description:** Created domain.art, workflow.art, and domain templates.

**Status:** `DONE`

**Changes:**

- Create domains/domains/structures/domain.art.
- Create domains/work/structures/workflow.art.
- Create domain templates.

#### Iteration: Update Fundamentals File

**id:** `update-fundamentals`

**Purpose:** Update fundamentals with new definitions.

**Description:** Update core definitions, remove duplicates.

**Status:** `DONE`

**Changes:**

- Update core definitions (domains, resources, records, fields, routines).
- Merge duplicate Interpreting Mandatory Reading Sections.

#### Iteration: Integrate Work Domain With Others

**id:** `integrate-work-domain`

**Purpose:** Review and auto-fix .agents for typos, stale references, shortenable references, and formatting.

**Description:** Scans .agents for typos, broken references, long-winded path examples, and formatting issues; auto-fixes all and waits for user review.

**Status:** `DONE`

**Changes:**

- Review .agents for typos and auto-fix all.
- Review .agents for stale references and fix broken links.
- Review .agents for shortenable references (use common paths such as $PROJECT and $DOMAINS as per this plan conventions, not full variable expansions).
- Review .agents for formatting: bullet points end with dot, examples use `checkouts/artificial/art-js/spec/grammar/constructs/inline/example-inline.art` format.
- Wait for user review before committing.

##### Commits [add-work-domain-and-refactor]

- **Repository:** Repository Scope: Workspace `$WORKSPACE`
- **Message:** build(work): new work domain with item(s), context and scope abstractions
- **Body:**
  - Add Abstract work item with upstream, downstream indirections
  - Add Work Status enum, and work scope and context abstractions
  - Add iteration structure for plan iterations (replaces plan.commits)
  - Create commits domain with Type: Commit
  - Add work scope types: in their respective domains: Application, Package, Repository, Project, Deployment
  - Remove Tasks domain (superseded by Work abstractions); kept only a small Spec type
  - Refactor plan.art, plan.tart, milestone.art, milestone.tart for new structure
  - Update fundamentals, domains index, and templates
- **Status:** `DONE`
- **Policy:** `AUTONOMOUS`
- **Hash:** `5a6b120`

#### Iteration: Initialize Domains Knowledge

**id:** `initialize-domains-knowledge`

**Purpose:** Initialise domains architecture knowledge: reference model, workflows, and ADRs.

**Description:** Created reference-model.md, reference-workflows.md, ADRs, and architecture index in `$ARTIFICIAL/art-domains`.

**Status:** `READY`

**Changes:**

In `$ARTIFICIAL/art-domains` namespace:

- Create `$ARTIFICIAL/art-domains/architecture/index.md` (similar to `$ARTIFICIAL/architecture`).
- Create `$ARTIFICIAL/art-domains/architecture/reference-model.md` with domain boundaries for 11 domains.
- Create `$ARTIFICIAL/art-domains/architecture/reference-workflows.md` with 4 workflows and stage Input/Output/Gates/Operating Resources.
- Create `$ARTIFICIAL/art-domains/architecture/_records/adr/` similar to `$ARTIFICIAL/architecture` and capture up to 3 decisions (based on principles, not particular shapes) based on examples of principles provided with the instructions.

**Instructions:** `./plan-workflows-make-work-flow/instructions/initialize-domains-knowledge.md`

**Report:** `./plan-workflows-make-work-flow/instructions/initialize-domains-knowledge__report.md`

##### Commits [add-domains-architecture-knowledge]

- **Repository:** Repository Scope: Artificial `$ARTIFICIAL`
- **Message:** knowledge(domains): Add reference model and workflow starting points.
- **Body:**
  - Create architecture index listing reference model and workflows.
  - Create reference-model.md with domain boundaries for 11 domains.
  - Create reference-workflows.md with 4 workflows and stage Input/Output/Gates/Operating Resources.
- **Status:** `READY`
- **Policy:** `AUTONOMOUS`
- **Hash:** `TBD`

##### Commits [add-domains-design-adrs]

- **Repository:** Repository Scope: Artificial `$ARTIFICIAL`
- **Message:** knowledge(domains): Add domain design ADRs.
- **Body:**
  - Create `_records/adr/` directory for domain design decisions.
  - Add ADR: Domain Dependency Principle.
  - Add ADR: Abstract Relationships Over Concrete Coupling.
  - Add ADR: Independent Domains.
- **Status:** `READY`
- **Policy:** `BLOCKED`
- **Hash:** `TBD`

#### Iteration: Build Plan Workflows

**id:** `build-plan-workflows`

**Purpose:** Build plan.md from draft content, mapping to current plan structure.

**Description:** Read draft, map to plan structure fields, create plan.md with scopes, context, knowledge, iterations.

**Changes:**

- Read draft content.
- Map to plan structure fields.
- Create plan.md with scopes, context, knowledge, iterations.

**Instructions:** `./plan-workflows-make-work-flow/instructions/build-plan-workflows.md`

**Report:** `./plan-workflows-make-work-flow/instructions/build-plan-workflows__report.md`

**Status:** `PLANNED`

#### Iteration: Finish Plan Iteration Model

**id:** `finish-plan-iteration-model`

**Purpose:** Finish Plan → Iteration → Instructions → Commits model.

**Description:** Review plan/iteration relation to Type: Commit, introduce Committing as workflow stage, introduce Type: Commit Convention.

**Changes:**

- Review plan/iteration relation to new Type: Commit.
- Introduce "Committing" as workflow stage.
- Introduce Type: Commit Convention.

**Instructions:** `./plan-workflows-make-work-flow/instructions/finish-plan-iteration-model.md`

**Report:** `./plan-workflows-make-work-flow/instructions/finish-plan-iteration-model__report.md`

**Status:** `PLANNED`

#### Iteration: Update Write Plan Skill

**id:** `update-write-plan-skill`

**Purpose:** Update write-plan skill to work with new plan structure.

**Description:** Update Composing Plan Scope, Composing Plan Context, and Create OR Update Plan routines.

**Status:** `PREPARING`

**Changes:**

- Update Composing Plan Scope to output `List(Type: Work Scope Item (Abstract))`.
- Update Composing Plan Context to output context.upstream/knowledge/required-skills.
- Update Create OR Update Plan to use setting-up/verifying as NaturalBlock fields.
- Remove references to non-existent Plan Scope and Plan Context structures.

**Instructions:** `./plan-workflows-make-work-flow/instructions/update-write-plan-skill.md`

**Report:** `./plan-workflows-make-work-flow/instructions/update-write-plan-skill__report.md`

#### Iteration: Update Agent Modes

**id:** `update-agent-modes`

**Purpose:** Update agent modes: architect, planner, delegator, worker, backlog-manager.

**Description:** Update agent mode definitions to work with new plan structure and skill.

**Status:** `PREPARING`

**Changes:**

- Update architect agent mode
- Update planner agent mode
- Update delegator agent mode
- Update worker agent mode
- Update backlog-manager agent mode

**Instructions:** `./plan-workflows-make-work-flow/instructions/update-agent-modes.md`

**Report:** `./plan-workflows-make-work-flow/instructions/update-agent-modes__report.md`

#### Iteration: Refactor Domain Index Routines

**id:** `refactor-domain-index-routines`

**Purpose:** Refactor domain index routines to 2 routines: domain index and domain listing.

**Description:** Simplify domain index routines, update domains-listing.tart and domain-table-of-contents.tart.

**Status:** `PREPARING`

**Changes:**

- Simplify domain index routines.
- Update domains-listing.tart.
- Update domain-table-of-contents.tart.

**Instructions:** `./plan-workflows-make-work-flow/instructions/refactor-domain-index-routines.md`

**Report:** `./plan-workflows-make-work-flow/instructions/refactor-domain-index-routines__report.md`

#### Iteration: Integrate Specs Into Plans

**id:** `integrate-specs-into-plans`

**Purpose:** Integrate specs into plans.

**Description:** Integrate Type: Spec (Abstract) into plan structure and template.

**Status:** `PREPARING`

**Changes:**

- Integrate Type: Spec (Abstract) into plan structure.
- Update plan template for spec integration.

**Instructions:** `./plan-workflows-make-work-flow/instructions/integrate-specs-into-plans.md`

**Report:** `./plan-workflows-make-work-flow/instructions/integrate-specs-into-plans__report.md`

### Next

Build the plan file from draft content (current iteration). Then update the write-plan skill.

### Blockers

- Sweep files for legacy naming ("domain Record", "Record Structure", "Attachment File") — blocked on fundamentals cleanup being finalised.

## Findings

- The write-plan skill references `Structure: Plan Scope` and `Structure: Plan Context` which don't exist in the current domain graph.
- The plan structure has `setting-up` and `verifying` as NaturalBlock fields, not injectable commands as the skill expects.
- The DONE work in the draft can be modeled as iterations with status DONE for exercise purposes.
- The planning workflow file (`plans/workflows/planning.art`) doesn't exist yet but is referenced in the domains index.

## Decisions

- The plan structure is the source of truth, not the skill.
- DONE work will be modeled as iterations with status DONE to exercise the plan structure.
- The skill must be updated to work with the plan structure's fields, not the other way around.

## Documentation to Update

- Write-plan skill (primary target)
- Write-milestone skill (similar issues, follow-up)
- Domain index routines (refactor)

## Follow Ups

- Update write-milestone skill (similar mapping issues)
- Create planning workflow file (`plans/workflows/planning.art`)
- Create engineering workflow file if needed

## Feedback

None.
