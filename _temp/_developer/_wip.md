# Developer WIP

## Pending

- Add `dependencies` field to Structure: Project and Structure: Package
  - Type: `List (Type: Dependency | Structure: Dependency Group)`
  - Dependencies represent npm packages needed by the project/package
  - Dependency Group allows grouping related dependencies (e.g. devDependencies, peerDependencies)

## Structures to Update

- `artificials/_meta/_architect/project/structures/project.art` — add `dependencies` field
- `artificials/_meta/_architect/project/structures/package.art` — add `dependencies` field

## Types to Create

- `artificials/_meta/_architect/project/types/dependency.art` — represents a single dependency (name, version, type)
- `artificials/_meta/_architect/project/structures/dependency-group.art` — groups dependencies by type (optional)
