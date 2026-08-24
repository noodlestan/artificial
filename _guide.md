# Noodlestan Artificial

A collection of tools and resources to generate and manage agent instructions. Includes the Art Language, and a (reactive) pipeline for bundling instructions.

## Recommended Reading

Agents SHOULD scan these files for relevant clarifications when faced with ambiguity or omissions that may result from missing definitions.

- `_guide.md` — this file: system overview, layout, setup, verification.

## Repository Layout

```
_backlog/           — plans, instructions, reports
ops/                — records (packages, namespaces, scripts)
architecture/       — ADRs, index
art-js/             — (namespace) parser, CLI, spec
art-domains/        — (namespace) domain packages
artisans/           — (namespace) experiments
```

## Projects

| Project            | Guide                                  | Backlog                                      |
| ------------------ | -------------------------------------- | -------------------------------------------- |
| Artificials (root) | `_guide.md`                            | `NONE`                                       |
| POC Parse          | `art-js/cli/poc-parse/_guide.md`       | `_backlog/1-done/plan-poc-parse/` (archived) |
| Art Mantras        | `artisans/apps/art-mantras/_guide.md`  | `artisans/apps/art-mantras/_backlog/`        |
| Workspace CLI      | `art-domains/cli/workspace/_guide.md`  | `art-domains/cli/workspace/_backlog/`        |
| Art JS             | `art-js/_backlog/_parking-lot.md`      | `art-js/_backlog/`                           |
| Art Domains        | `art-domains/_backlog/_parking-lot.md` | `art-domains/_backlog/_architect.md`         |

## Setup

Run at the root of the repository:

```bash
npm ci # to install dependencies.
```

## Verification

Run per package modified:

```bash
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues
npm run build
npm run test
```

## Records Management

Records are co-located with the resources they describe in `_records/` directories:

- **Project:** `_records/project.art`
- **Repository:** - `_records/repository.art`
- **Namespaces:** `{namespace}/_records/namespace.art`
- **Packages:** `{package-path}/_records/package.art`
- **NPM Deployments:** `{package-path}/_records/npm-deployment.art`
- **APP Deployments:** `{app-path}/_records/spa-deployment.art`

## References

This repository maintains an architecture reference at `architecture/index.md` and decision records at `architecture/records/adr`.

## Planning Workflow

Each project manages its own backlog in a local `_backlog/` directory with a `_guide.md` entry point containing layout, references, verification, and workflows.
