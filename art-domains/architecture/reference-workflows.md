# Reference Workflows

Reference description of the known workflows: for each stage, its input, output, gates, and operating resources — expressed as abstractions, with concrete manifestations given only as examples.

## Workflows

### Planning Workflow

Workflow: Planning — Domain: Plans. Stages: Contextualizing, Drafting, Refining, Integrating.

**Contextualizing:**

- **Input:** upstream work context (roadmap milestone, backlog items, briefing) and knowledge resources (architecture briefings, decision records).
- **Output:** contextualised plan draft — summary, scope, path variables, mandatory reading.
- **Gates:** all upstream dependencies identified; scope resolved to abstract work scope items (Project Scope, Package Scope); path variables defined.
- **Operating resources:** the plan record (`plan.md`), upstream work contexts, knowledge contexts.

**Drafting:**

- **Input:** contextualised plan draft and the plan structure.
- **Output:** complete plan record rendered from the plan template — context, scope, work items, execution intent, and iteration blueprints.
- **Gates:** every template section resolved or explicitly omitted; downstream work items captured with records or listed as uncaptured; iterations defined with projected instructions file paths and commit blueprints.
- **Operating resources:** plan template (`.tart`), iteration structure, work item structures and types, plan record.

**Refining:**

- **Input:** drafted plan record and review feedback.
- **Output:** refined plan record — corrected scope, sequenced iterations, updated statuses.
- **Gates:** acceptance criteria defined; iterations in a releasable state; blockers either resolved or recorded.
- **Operating resources:** plan record, iteration structure, downstream work item records, status definitions.

**Integrating:**

- **Input:** delivered iteration reports and refined plan.
- **Output:** integrated outcomes — updated plan statuses, findings, decisions, follow-ups, feedback.
- **Gates:** all iteration reports integrated or explicitly deferred; documentation updates identified; feedback summarised.
- **Operating resources:** plan record, iteration records, changelog records, follow-up records.

### Roadmapping Workflow

Workflow: Roadmapping — Domain: Roadmaps. Stages: Briefing, Problem, Solution, Plan.

**Briefing:**

- **Input:** direction sources — backlog parking lots, stakeholder intent, knowledge resources (principles, constraints).
- **Output:** milestone briefing — purpose, problem statement, candidate scope.
- **Gates:** problem statement accepted; scope candidates identified as abstract resources.
- **Operating resources:** roadmap record, parking lot records, architecture briefings.

**Problem:**

- **Input:** milestone briefing.
- **Output:** problem definition — goals, constraints, non-goals (anti-scope), success criteria.
- **Gates:** goals distinguishable from solutions; anti-scope explicit.
- **Operating resources:** milestone record, knowledge resources.

**Solution:**

- **Input:** problem definition.
- **Output:** solution outline — approach, phased breakdown, resource impacts.
- **Gates:** approach validated against constraints; phases express resource dependencies only.
- **Operating resources:** milestone record, work phase types, work scope items.

**Plan:**

- **Input:** solution outline.
- **Output:** coordinated milestone record — phases, downstream milestones and plans, next action.
- **Gates:** downstream work items captured with records; sequencing expresses no implementation detail.
- **Operating resources:** milestone record, milestone template, downstream work item types.

### Engineering Workflow

Workflow: Implementing — Domain: Engineering. Stages: Setting up, Verifying, Committing.

**Setting up:**

- **Input:** delegated instruction with plan-provided context — paths, setup steps, mandatory reading.
- **Output:** prepared working state — dependencies installed, branches created, context loaded.
- **Gates:** working state matches instruction prerequisites; no undocumented local steps required.
- **Operating resources:** instruction record, repository checkouts, package manifests.

**Verifying:**

- **Input:** implemented changes in the working state.
- **Output:** verification evidence — test results, build outputs, conformance checks.
- **Gates:** all verification steps pass or failures are reported back as blockers; acceptance criteria demonstrably met.
- **Operating resources:** test suites, build tooling, instruction acceptance criteria.

**Committing:**

- **Input:** verified changes with evidence.
- **Output:** committed and pushed work — commits, updated work item status, report to delegator.
- **Gates:** commit conventions applied; work item status advanced; report captures deviations and findings.
- **Operating resources:** version control, instruction record, work item status definitions.

### Deploying Workflow

Workflow: Deploying — Domain: Deployments. Stages: Pre-Deploy, Deploy, Post-Deploy.

**Pre-Deploy:**

- **Input:** deployment request referencing an application scope and target environment.
- **Output:** validated deployment plan — artefact versions, environment configuration, rollback strategy.
- **Gates:** artefacts built and verified; environment configuration resolved; dependencies available.
- **Operating resources:** application scopes, deployment scopes, environment configuration.

**Deploy:**

- **Input:** validated deployment plan.
- **Output:** deployed application instance in the target environment.
- **Gates:** deployment executed without unresolved errors; health checks pass.
- **Operating resources:** deployment targets, artefact registries, infrastructure tooling.

**Post-Deploy:**

- **Input:** deployed application instance.
- **Output:** confirmed deployment — smoke checks, monitoring baseline, deployment record update.
- **Gates:** smoke checks pass; rollback not required; deployment outcome recorded against the work item.
- **Operating resources:** monitoring, deployment records, work item status definitions.
