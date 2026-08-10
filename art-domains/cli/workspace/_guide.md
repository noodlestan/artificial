# Workspace CLI Guide

**Purpose:** Practical guide to the workspace CLI package — its configuration system, architecture, and usage.

## Workspace Config TypeScript-based

The workspace configuration is a TypeScript module (`.art-workspace.mts`) at the workspace root that exports workspace paths. It provides type-safe access to workspace structure via `defineConfig` and `WorkspaceConfig` types.

### Configuration Structure

```typescript
interface WorkspaceConfig {
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

### Authoring Config

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

### Loading Mechanism

The CLI loads the config at runtime using esbuild bundle-at-runtime (Vite-style):

1. Read `.art-workspace.mts`
2. Run `esbuild.build({ entryPoints, bundle: true, write: false, format: 'esm', platform: 'node' })`
3. Write bundled output to a temp `.mjs` file
4. `await import()` the temp file

The config's `import { defineConfig } from '@art-domains/workspace-cli/config'` is resolved from the consumer `node_modules` and inlined. The `/config` subpath has zero runtime deps beyond `esbuild` (ESM-friendly), so the CLI command surface (commander, simple-git) never enters the manifest bundle.

### Package Exports

The CLI package exports two surfaces:

- **`@art-domains/workspace-cli/config`** — Authoring API for the manifest: `defineConfig`, `WorkspaceConfig`, `RepositoryRecord`, `RepositoryCheckout`, `loadWorkspaceConfig`, `verifyCheckouts`
- **`@art-domains/workspace-cli`** — Main entry re-exports config module for CLI commands and backwards compatibility

### Type Safety

The config types mirror the workspace structures:

- `WorkspaceConfig` — Top-level config with paths
- `RepositoryRecord` — Repository facts (name, remote, purpose, description, consumers)
- `RepositoryCheckout` — Checkout state (repo, location, branch, exists, pushed, published)

Type declarations are emitted (`dist/index.d.ts`) and the `exports` map ensures imports resolve and type-check in the `.mts` manifest.

### Why `.mts`?

The root `package.json` has no `"type": "module"`. The explicit `.mts` extension:

- Pins ESM for Node and bundlers
- Is unambiguous under Node's native type-stripping
- Signals TypeScript authoring to editors and tooling

### Source of Truth

Records (`ops/records/repositories/{repo}.art`, `ops/records/workspace.art`) are the source of truth. The config is manually authored, not generated.
