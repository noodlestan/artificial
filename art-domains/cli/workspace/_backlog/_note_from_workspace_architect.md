# Note from Workspace Architect

**Date:** 2026-08-14  
**From:** Workspace Architect  
**To:** Workspace CLI Maintainers

## Context

We are currently working on a major reorganization of records across all repositories. The goal is to move from centralized `ops/records/` directories to co-located `_records/` directories next to the resources they describe.

**Example of the new pattern:**
- `repos/artificial/ops/records/projects/artificial.art` → `repos/artificial/_records/project.art`
- `repos/artificial/ops/records/namespaces/art-js.art` → `repos/artificial/art-js/_records/namespace.art`
- `repos/artificial/ops/records/packages/artificials-parser.art` → `repos/artificial/art-js/libs/parser/_records/package.art`

## Problem

The workspace CLI currently relies on hardcoded path conventions for discovering records:
- Repository records: `ops/records/repositories/{repo}.art`
- Checkout records: `ops/records/checkouts/{repo}.art`
- Workspace record: `ops/records/workspace.art`

These conventions are defined in:
- `src/config/types.ts` (path constants)
- `src/private/records/` (record loading logic)

## Requirement

As we migrate to co-located `_records/` directories, the workspace CLI needs to evolve to:

1. **Discover .art files dynamically** instead of relying on fixed paths
2. **Identify files by kind** (e.g., `## Repository:`, `## Checkout:`, `## Project:`) rather than by location
3. **Support both old and new conventions** during the migration period

## Suggested Approach

Implement a record discovery system that:
- Scans for `.art` files across the workspace
- Parses the file to extract the resource kind from the heading (e.g., `## Repository: Artificial`)
- Builds an in-memory index of records by kind and name
- Provides lookup methods similar to the current API

This will allow the CLI to work with records regardless of their physical location, enabling the co-location pattern while maintaining backward compatibility.

## References

- Migration plan: `$WORKSPACE/_backlog/3-now/plan-records-migration/plan.md`
- Workspace parking lot: `$WORKSPACE/_backlog/_parking-lot.md`
- Deployment domain: `$WORKSPACE/.agents/domains/deployment/`
- Published structure: `$WORKSPACE/.agents/domains/project/structures/published.art`

## Action Required

Please prioritize this enhancement. The records migration is blocked until the workspace CLI can discover records dynamically.

Thank you!
