# Architecture: Artificial

## Milestone One

Milestone One focuses on generating agent instructions from domain sources.

The first implementation establishes the complete path from Art source to targeted agent context: defining domain resources in a distributable package, installing that package into a project, bootstrapping the domain, and compiling its resources into the projections required by different agents.

A domain package provides the resources and supporting infrastructure required to use the domain in a project. Installation bootstraps the project with the domain's essential Art instructions, skills, agent modes, and domain resources such as templates and routines.

The initial milestone therefore validates the core model rather than attempting to solve every possible Art compilation target: a domain can be packaged, installed, interpreted, and compiled into useful, use-case-specific agent instructions from a single source of truth.

## Definitions

### Domain Projections

The main goal of the projection system is to make the same domain knowledge usable by different consumers without requiring each consumer to receive the entire domain.

The compiler produces a set of per-use-case **projections** — compiled representations of a domain tailored to a particular consumer. Projections are committed to git rather than generated at consumption time. Because compilation is deterministic, the same source and configuration always produce the same projections, making generated context diffable, reviewable, and reproducible.

Tags attached to resource declarations provide the primary projection mechanism. Tags identify the projections for which a declaration is relevant and can determine whether a declaration is included, excluded, or transformed. Projection rules can therefore express both simple membership and consumer-specific representations of the same underlying resource.

The initial projections are:

- **Author** — complete knowledge required to create and modify Art sources.
- **Generator** — knowledge required to consume Art sources and generate derived resources.
- **Operator** — the minimum knowledge required to execute domain operations and make controlled modifications.
- **Indexer** — a compact representation of the domain surface for general-purpose discovery, querying, and lightweight maintenance.

Projections are not separate sources of truth. They are deterministic views of the same domain sources, compiled according to the needs and permissions of their consumers.

### Domains

A domain is a self-contained area of knowledge and operations — a collection of art sources declaring structures, types, routines, commands, and vocabulary. A domain is the unit of targeting and packaging: the compiler compiles each declared domain into one projection per use case, and a domain can be packaged as a reusable artifact (e.g. `@artificial/tasks`).

### Source Code

Art files (`.art`) are the source of truth for declarations: structures, types, routines, commands, and vocabulary. Any markdown file is a valid `.art` file; files not authored in art require more inference to read correctly.

A declaration is a resource: a markdown heading of the form `# Kind: Name` declares a resource of that kind with that name. The declaration form is fixed by the language — closed syntax — while the meaning of each kind is defined by the domain's structures — open semantics.

Template files (`.tart`) are renderers that turn records into outputs. `.tart` files are typically compiled into markdown by the domain Generator, so agents mostly encounter the baked `.md` output rather than the `.tart` template itself.

### Compiler

The compiler is **reactive** and works as a **pull system** — consumers pull compiled output from the sources they need, rather than having output pushed at them. An entry point selects what to compile; source changes propagate reactively to downstream consumers.

Its responsibility is to transform Art sources into deterministic projections while remaining independent of the semantics of individual resource kinds. The parser understands the language's declaration syntax, but the meaning of a declaration belongs to the domain that defines its kind.

The compilation pipeline is:

- **Parse** — read `.art` sources into structured records.
- **Extract** — select the declarations relevant to the requested projection or compilation target.
- **Transform** — apply projection tags, overloads, aggregations, and other transformations defined by the compilation configuration.
- **Render** — format the resulting records as the target representation, such as sections, tables, lists, summaries, or other generated resources.

The parser is built on the unified ecosystem — micromark, the same foundation used by GFM and MDX. It is therefore kind-agnostic: it recognises the language-level declaration structure and captures resources generically without needing to understand what a particular kind means.

Configuration determines how compilation is performed. A project-level `.artificials.config.mts` declares namespaces, packages, domains, and projection targets, while build configuration maps targets and resource types to their output formats.

The compiler consequently separates language processing from domain semantics: the language defines how declarations are written, domains define what those declarations mean, and compilation determines which representations are produced for each consumer.

### Compilation Model

Compilation follows a deterministic model:

**source + configuration → projection**

Given identical sources and identical configuration, compilation produces identical projections every time.

This makes compiled output a first-class, reviewable artifact rather than an opaque cache or runtime dependency. Projections can be committed to git, inspected by humans, consumed directly by agents, and reviewed as ordinary changes.

A change to an Art source or compilation configuration therefore produces a corresponding, visible change to its affected projections. The generated representation remains traceable to its source while allowing consumers to operate on a precompiled, purpose-specific view of the domain.

The model separates three concerns:

- **Sources** define the authoritative domain data and knowledge.
- **Configuration** defines what should be compiled and how.
- **Projections** provide deterministic, consumer-specific representations of those sources.

## Use Cases

### Generate Agent Instructions

Model an entire domain as instructions an agent needs: structures, types, routines, commands, and vocabulary. The system then compiles those instructions into projections per use case, so each agent gets a tailored projection — different agents get different instruction sets, different projections of the same processes, and different levels of detail per domain.

Each projection exposes the minimum context its consumer needs:

- **Author Projection** — for agents that declare and write art sources: full syntax, structures, rules, examples. Example: "Create a new `.art` file".
- **Generator Projection** — for agents that generate derived outputs (markdown, generated resources) from art sources. Example: "Generate the domain listing".
- **Operator Projection** — for agents that read, execute, and lightly modify existing resources through controlled routines, with minimum exposure to the domain. Example: "Execute the Process: Render Resources".
- **Indexer Projection** — for agents with no predetermined relationship to the domain (generalists like assistants, spell-checking/fixing, querying/reporting). Exposes the entire domain surface as a compact index of resources — names, kinds, categories, brief descriptions, and source paths — resolving resource names to their art source, without application examples or full instructions. Not read-only: it may perform small, controlled modifications within its scope.

#### Planning Agent

A Planning Agent needs comprehensive knowledge of the planning domain: its structures, types, routines, commands, conventions, and workflows. It needs only the subset of the coding domain required to produce technically coherent plans and implementation instructions. Its projection therefore provides deep planning knowledge while keeping coding knowledge narrow and targeted.

#### Delegator Agent

A Delegator Agent needs enough knowledge of planning to understand plans, commits, and implementation instructions, but does not need the full planning domain. The Worker agents it delegates to require a different projection: limited knowledge of planning, particularly how to interpret and follow plan instructions, combined with substantial knowledge resources for understanding and improving references such as architecture decisions, patterns, and conventions.

### Single Source of Truth for Declarations

Art unifies, under a single source of truth, declarations of things that are typically represented separately as machine-readable data and human- or agent-readable knowledge. A resource can therefore contain both structured data and natural-language information that agents can process, while remaining suitable for deterministic compilation into different representations.

#### Scaffolders

Project, package, namespace, and other scaffolding definitions can be declared once as structured resources and compiled into the files and configurations required to instantiate them. The declaration becomes the source of truth rather than one generated output being treated as authoritative.

For example, a package or namespace can be described once in Art and used to generate its project structure, configuration, documentation, or other representations required by different consumers.

#### Documentation

References, patterns, architecture decisions, guides, conventions, and other knowledge resources can be authored once and rendered into representations for different consumers.

The same source can produce human-oriented documentation, compact agent instructions, searchable indexes, or targeted domain references without maintaining separate versions of the underlying knowledge.

#### Domain Records

Operational records such as tasks, plans, changelogs, and backlogs can be declared as structured resources while retaining the natural-language content needed to interpret them.

This allows the same record to serve as machine-readable data for tooling and as contextual knowledge for agents, while projections determine which fields, relationships, descriptions, and instructions are exposed to each consumer.

## Key Benefits

- **Context minimisation** — each agent receives only the subset of a domain it needs, reducing token usage and shortening inference loops.
- **Fewer ambiguities, omissions, contradictions** — one source of truth feeding generated instructions; nothing hand-maintained in parallel.
- **Automated SoT → instructions** — sources become instructions without manual transcription.
- **Portable, reusable, shareable** — domains package as artifacts (e.g. `@artificial/tasks`) and can be reused across repositories.
