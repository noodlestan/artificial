# Reference Model

Reference model of the domain landscape: for each domain, its boundaries expressed as relationships ordered from strongest to weakest. Relationships are described at the level of abstract concepts; concrete manifestations appear only as examples.

Three kinds of relationships are distinguished throughout:

- **Work items** and their relationships — dependencies, sequencing, composition, coordination.
- **Resources in work scope** and their relationships to work items — operations, dependencies, ownership.
- **Knowledge resources** and their relationships to work items and resources — architecture, patterns, conventions, pseudo code.

## Domain Boundaries

### Domain Boundaries: Work

- **Primitives** are directly depended upon — Work builds its abstractions on primitive types (paths, references, names), but makes no assumptions beyond the primitive contracts.
- **Roadmaps, Plans, and Backlogs** extend Work's abstract work item — Milestone, Plan, and Task are concrete work items that inherit identity, status, context, scope, attachments, and lifecycle from Work — but Work makes no assumptions about how they organise, sequence, or complete their work.
- **Projects, Repositories, Packages, Applications, and Deployments** provide concrete manifestations of Work's abstract work scope item — Project Scope, Repository Scope, Package Scope, Application Scope, and Deployment Scope relate resources to work items through the abstract scope contract (resource, path, record, owner, role, changes, dependencies) — but Work knows them only as scoped resources and makes no assumptions about their shape or operations.
- **Engineering** advances Work items through execution stages — implementation workflows operate on work items produced by planning domains — but Work defines neither the stages nor how they are performed.

### Domain Boundaries: Roadmaps

- **Work** is directly depended upon — Roadmaps coordinate milestones, which extend abstract work items and reuse Work abstractions for scope, upstream and downstream work items, phases, status, and context.
- **Knowledge** is consumed — Roadmaps use knowledge resources to ground the Briefing, Problem, and Solution stages, including architecture briefings, principles, and constraints, but make no assumptions about their shape.
- **Backlogs** may inform Roadmaps — parking lots and briefings feed roadmap direction, state, and candidate work, but Roadmaps can be created and used without a backlog.
- **Plans** may be coordinated by Roadmaps — Roadmaps sequence milestones and plans against each other and may reference plans as downstream work items, but make no assumptions about plan internals beyond the abstract work item contract.

### Domain Boundaries: Plans

- **Work** is directly depended upon — Plans extend abstract work items and use Work abstractions for work scope, upstream work items, downstream work items, workflows, stages, status, context, attachments, and phases.
- **Knowledge** is consumed — Plans use knowledge resources to provide context for planning and execution, including architecture, patterns, conventions, guides, and decision records, but make no assumptions about their shape.
- **Engineering** is assumed — Plans express execution intent (setup, verification, instructions) that engineering workflows consume as input, but Plans make no assumptions about how implementation is performed or verified.
- **Backlogs** may inform Plans — Plans may receive direction, state, or work from a backlog, but can be created and used without one.
- **Roadmaps** may inform Plans — Roadmaps may provide upstream work, direction, or context for Plans, but Plans can be created and used independently of Roadmaps and make no assumptions about their shape.
- **Skills** may be required by Plans — Plans may identify skills required to perform particular planning or implementation activities, but make no assumptions about how those skills are defined or provided.

### Domain Boundaries: Backlogs

- **Work** is directly depended upon — Backlogs hold tasks and candidate work items that extend abstract work items and reuse Work abstractions for status, context, and scope.
- **Knowledge** is consumed — Backlogs capture findings, open questions, and blockers alongside knowledge resources that qualify them, but make no assumptions about their shape.
- **Roadmaps** may be informed by Backlogs — parking lots feed roadmap briefing and problem stages with actionables and pending questions, but Backlogs remain usable without a roadmap.
- **Plans** may feed Backlogs — Backlogs may hand work to plans or absorb deferred plan follow-ups, but neither domain requires the other to remain usable.

### Domain Boundaries: Projects

- **Work** is directly depended upon — Projects define a concrete work scope type extending the abstract work scope item, expressing how project resources participate in work items.
- **Packages** may be owned by Projects — Projects group and version packages as part of their release surface, an ownership relationship expressed through scope and paths, but make no assumptions about package internals.
- **Applications** may be owned by Projects — Projects group applications as deliverables of the project, but make no assumptions about application shape or runtime.
- **Repositories** are assumed — Project source and records conventionally live in repositories and reach workspaces as checkouts, but a project can be described without assuming repository topology.

### Domain Boundaries: Repositories

- **Work** is directly depended upon — Repositories define a concrete work scope type extending the abstract work scope item, expressing how repository resources participate in work items.
- **Projects** may be hosted by Repositories — a repository may contain checkouts of one or more projects, a containment convention expressed through paths, but Repositories make no assumptions about project structure.
- **Packages** may be contained by Repositories — package source conventionally lives inside repository working trees, but Repositories remain usable without hosting packages.

### Domain Boundaries: Packages

- **Work** is directly depended upon — Packages define a concrete work scope type extending the abstract work scope item, expressing how package resources participate in work items.
- **Packages** may depend on Packages — package-to-package dependency graphs are internal to this domain (libraries consuming libraries), resolved through declared versions.
- **Projects** may own Packages — ownership assigns release surfaces and versioning responsibility, but Packages remain independently buildable and publishable.
- **Applications** may consume Packages — applications bind to published package APIs at integration time, but Packages make no assumptions about their consumers.

### Domain Boundaries: Applications

- **Work** is directly depended upon — Applications define a concrete work scope type extending the abstract work scope item, expressing how application resources participate in work items.
- **Packages** are depended upon — Applications integrate published package APIs to deliver behaviour, a build-time dependency resolved through package registries.
- **Projects** may own Applications — ownership assigns delivery responsibility and configuration, but Applications remain independently runnable.
- **Deployments** may carry Applications — deployment infrastructure instantiates applications into environments, but Applications make no assumptions about deployment mechanics.

### Domain Boundaries: Deployments

- **Work** is directly depended upon — Deployments define a concrete work scope type extending the abstract work scope item, expressing how deployment targets participate in work items.
- **Applications** are assumed — Deployments deploy application artefacts into environments, a conventional producer/consumer relationship that leaves both domains independently usable.
- **Environments** are owned by Deployments — targets, stages, and promotion rules are internal to this domain and invisible to other domains except through the abstract scope contract.

### Domain Boundaries: Engineering

- **Work** is directly depended upon — Engineering operates on work items (plans, instructions) advancing them through execution stages while reusing Work abstractions for status and context.
- **Knowledge** is consumed — Engineering stages apply conventions, guides, and architecture during setting up, verifying, and committing, but make no assumptions about their shape.
- **Work scope resources** are operated on — Engineering acts on resources declared in work scope (repositories, packages, applications) through their abstract scope contract, but makes no assumptions about any concrete resource domain.
- **Deployments** may be informed by Engineering — verified changes may hand off to deployment workflows, but Engineering remains complete without deploying.
