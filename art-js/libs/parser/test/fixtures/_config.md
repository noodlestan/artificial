# Workspace CLI — Configuration

The configuration system of the workspace CLI: the `.art-workspace.mts` manifest, its structure, authoring, loading mechanism, package exports, and type safety.

## Overview

The workspace configuration is a TypeScript module (`.art-workspace.mts`) at the workspace root that exports workspace paths. It provides type-safe access to workspace structure via `defineConfig` and the `WorkspaceConfig` type.

The config is **manually authored, not generated**. Records (`ops/records/repositories/{repo}.art`, `ops/records/workspace.art`) are the source of truth; the config points the CLI at them. A future generator derives the manifest from records, eliminating the manual step.

## Configuration Structure

```typescript
interface WorkspaceConfig {
  root: {
    path: string; // Workspace root; set by loadWorkspaceConfig to the invocation cwd
  };
  clone: {
    path: string; // Where repos are cloned (e.g., 'repos')
  };
  records: {
    repositories: {
      path: string; // Path to repository records (e.g., 'ops/records/repositories')
    };
    checkouts: {
      path: string; // Path to checkout records (e.g., 'ops/records/checkouts')
      template: string; // Template for generating checkout records
    };
  };
}
```

## Authoring Config

The manifest imports `defineConfig` from the `/config` subpath:

```typescript
import { defineConfig } from '@art-domains/workspace-cli/config';

export default defineConfig({
  clone: { path: 'repos' },
  records: {
    repositories: { path: 'ops/records/repositories' },
    checkouts: {
      path: 'ops/records/checkouts',
      template: '.agents/domains/workspace/templates/checkout.art.njk',
    },
  },
});
```

## Loading Mechanism

The CLI loads the config at runtime using esbuild bundle-at-runtime (Vite-style):

1. Read `.art-workspace.mts`.
2. Run `esbuild.build({ entryPoints, bundle: true, write: false, format: 'esm', platform: 'node' })`.
3. Write the bundled output to a temp `.mjs` file.
4. `await import()` the temp file.

The config's `import { defineConfig } from '@art-domains/workspace-cli/config'` is resolved from the consumer `node_modules` and inlined. The `/config` subpath has zero runtime deps beyond `esbuild` (ESM-friendly), so the CLI command surface (commander, simple-git) never enters the manifest bundle. `esbuild` is therefore a **runtime dependency** of `@art-domains/workspace-cli` (see `records/adr/cli.art` — "Runtime Config Loading — esbuild Bundle-at-Runtime").

## Package Exports

The CLI package exports two surfaces:

- **`@art-domains/workspace-cli/config`** — Authoring API for the manifest: `defineConfig`, the `WorkspaceConfig` type, and `loadWorkspaceConfig`.
- **`@art-domains/workspace-cli`** — Main entry (the `art-workspace` binary) re-exports the config module for the CLI commands and backwards compatibility.

The `exports` map (`./config` → `types` + `import`) keeps the authoring surface stable: renaming types or exports is a breaking change once consumers exist — the manifest is the first consumer.

## Type Safety

The config types mirror the workspace structures:

- `WorkspaceConfig` — top-level config with paths (`root.path`, `clone.path`, `records.*`).
- `RepositoryRecord` — repository facts (name, remote, purpose, description, consumers).
- `CheckoutRecord` — checkout state (name, location, branch, repository).

Type declarations are emitted (`dist/index.d.ts`) and the `exports` map ensures imports resolve and type-check in the `.mts` manifest.

## Why `.mts`?

The root `package.json` has no `"type": "module"`. The explicit `.mts` extension:

- Pins ESM for Node and bundlers.
- Is unambiguous under Node's native type-stripping.
- Signals TypeScript authoring to editors and tooling.

## Source of Truth

Records (`ops/records/repositories/{repo}.art`, `ops/records/workspace.art`) are the source of truth. The config is manually authored, not generated — the two stay in sync manually until the generator lands.

## Design Decisions

The configuration design is captured in `records/adr/cli.art`:

- **Type-safe Configuration in Workspace Root** — `.art-workspace.mts` as a TypeScript ESM module; `/config` subpath for the authoring API; main entry re-exports for the CLI.
- **Runtime Config Loading — esbuild Bundle-at-Runtime** — the manifest is bundled and imported at runtime; `esbuild` becomes a runtime dependency. Reconsider Node native type-stripping when the minimum Node version is guaranteed (≥ 22.6).
- **Manifest Mirrors Records Structures; Checkouts Derived at Entry Point** — superseded in part by the Checkout record decision below.
- **Checkouts as CLI-Managed Records — Structure: Checkout** — status Proposed in the ADR but effectively adopted in implementation: checkouts are persisted in their own records (`ops/records/checkouts/{repo}.art`) managed by CLI commands, keeping repository records as read-only facts.
- **Records as Source of Truth** — generated files (`.art-workspace.mts`) are derived from records, not maintained separately.
