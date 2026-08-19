# CHANGELOG

## 0.0.16

### Fixed

- **Clone command:** Scan checkouts before presenting checkout report.
- **Sanity command:** Fix false "extraneous checkout" flag for known checkouts.
- **Scan state:** Fix wrong branch warning for extraneous checkouts with empty record branch.
- **Clone command:** Detect wrong remote in checkout report.
- **Clone command:** Respect record branch when cloning (checkout correct branch after clone).
- **Clone command:** Allow second checkout of same repo at different location.
- **Clone command:** Refuse clone when target directory already exists.
- **Clone command:** Fix custom location producing wrong checkout name and path.

## 0.0.15

### Added

- **Pull command:** Pull from origin for all clean checkouts with `art-workspace pull`.
- **Push command:** Push to origin for all clean checkouts with `art-workspace push`.
- **Sync command:** Pull then push for all clean checkouts with `art-workspace sync`.
- **Workspace status:** Show workspace root status before checkout status in sanity report.
- **Is behind detection:** Detect and display behind state for checkouts.
- **Auto-pull in sanity:** `art-workspace sanity --auto` pulls if behind before pushing.

### Fixed

- **Clone command:** Scan checkouts before presenting checkout report in clone use case.
- **Repo command:** Resolve package paths correctly with fallback logic for inconsistent namespace paths.
- **Repo command:** Skip npm info when package.json is missing or has no version.
- **Repo command:** Suppress stderr in npm info calls to avoid 404 error noise.
- **Repo command:** Resolve checkout names with 4-step resolution (exact match → strip prefix → slug format → location fallback).

### Changed

- **Refactor:** Decouple checkout scan state from stored Checkout type.
- **Refactor:** Model CheckoutScan as operation guards over states.
- **Refactor:** Decouple private layer from WorkspaceContext.
- **Refactor:** Move checkout store updates to scan call sites.

## 0.0.14

### Added

- **Repo command:** List repositories, namespaces, and packages with version and publish state.
- **Sanity report:** Show workspace as first-class checkout before checkouts section.

### Fixed

- **Clone report:** Show checkout list once and only for scanned repos.
- **Repo command:** Resolve package states correctly by fixing namespace record parser for multi-line list format.

## 0.0.13

### Added

- **Branch command:** Create/switch branches across checkouts.

### Fixed

- **Clone command:** Allow multiple checkouts of same repo at different locations.

## 0.0.12

### Added

- **Sanity command:** Check git status across all repos with `--auto` push.
- **Clone command:** Idempotent clone with checkout records.
- **Config:** `defineConfig` and workspace manifest loader.
- **Checkout records:** Persistent checkout state tracking.
