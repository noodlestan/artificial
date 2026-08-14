# CHANGELOG

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

- **Clone:** Allow multiple checkouts of same repo at different locations.

## 0.0.12

### Added

- **Sanity command:** Check git status across all repos with `--auto` push.
- **Clone command:** Idempotent clone with checkout records.
- **Config:** `defineConfig` and workspace manifest loader.
- **Checkout records:** Persistent checkout state tracking.
