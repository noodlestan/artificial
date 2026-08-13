# Sub-Agent REPORT (worker)

**Plan:** `workspace-cli`

**Instruction Id:** `config-refactor`

**Outcome:** `COMPLETED`

## Evidence

### Changes

Refactored the config contract from records injection to config params (paths only). The manifest now declares where things live; commands load repositories and checkouts from their record files via helper functions. The workspace record is no longer tracked by the CLI.

#### Files changed

**CLI package (`$CLI` — committed `16265fb` on `noodlestan/artificials`):**

| File                                                  | Change                                                                                                                                                                                                                                                |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/config/types.ts`                                 | `WorkspaceConfig` → paths-only shape (`clone.path`, `records.repositories.path`, `records.checkouts.path`/`template`); dropped `records.workspace`, `records.repos`, `CheckoutConfig`, `WorkspaceRecord`; `RepositoryRecord.consumers` → raw `string` |
| `src/config/define-config.ts`                         | Removed `locateCheckouts`; `defineConfig` identity for new shape                                                                                                                                                                                      |
| `src/config/load-config.ts`                           | Updated `EMPTY_TEMPLATE` to paths-only shape                                                                                                                                                                                                          |
| `src/config/index.ts`                                 | Dropped `locateCheckouts`, `CheckoutConfig`, `WorkspaceRecord` exports                                                                                                                                                                                |
| `src/private/records/repository-record.ts` (new)      | `readRepositoryRecord(file)` + `loadRepositories(config, root)`                                                                                                                                                                                       |
| `src/private/records/checkout-record.ts`              | `saveCheckoutRecord` reads template from `config.records.checkouts.template` (fallback: hardcoded); added `loadCheckouts(config, root)`                                                                                                               |
| `src/sanity.ts`                                       | Uses `loadCheckouts(config, root)` instead of `locateCheckouts`                                                                                                                                                                                       |
| `src/clone.ts`                                        | Uses `loadRepositories` + `loadCheckouts`; default location `join(config.clone.path, name)`                                                                                                                                                           |
| `src/index.ts`                                        | Updated exports and version to `0.0.9`                                                                                                                                                                                                                |
| `src/config/config.test.ts`                           | Updated for new config shape                                                                                                                                                                                                                          |
| `src/sanity.test.ts`                                  | Writes record files instead of inline manifest data                                                                                                                                                                                                   |
| `src/clone.test.ts`                                   | Writes record files instead of inline manifest data                                                                                                                                                                                                   |
| `src/private/records/repository-record.test.ts` (new) | Unit tests for `readRepositoryRecord` + `loadRepositories`                                                                                                                                                                                            |
| `src/private/records/checkout-record.test.ts`         | Added `loadCheckouts` tests + template-from-config tests                                                                                                                                                                                              |
| `package.json`                                        | Version bumped to `0.0.9`                                                                                                                                                                                                                             |

**Workspace (`$ROOT` — uncommitted for architect):**

| File                 | Change                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| `.art-workspace.mts` | Rewritten to paths-only shape; `checkouts: []` and `records.repos`/`records.workspace` removed |
| `package.json`       | devDependency bumped to `@art-domains/workspace-cli@0.0.9`                                     |
| `package-lock.json`  | Updated by `npm install`                                                                       |

### Validation results

| Check                                       | Result                                                                                       |
| ------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `npm run build`                             | ✅ green                                                                                     |
| `npm test`                                  | ✅ 44 tests pass (5 test files)                                                              |
| `npm run lint`                              | ✅ green (eslint + tsc --noEmit)                                                             |
| `npm run test:coverage`                     | ✅ 92.43% lines / 92.3% functions / 81.53% branches / 92.43% statements (floor: 70/70/60/70) |
| `npm publish`                               | ✅ `@art-domains/workspace-cli@0.0.9` published                                              |
| `npm ls @art-domains/workspace-cli` (root)  | ✅ resolves `0.0.9`                                                                          |
| `npx art-workspace sanity` (root)           | ✅ "All repos are green ✓"                                                                   |
| `npx art-workspace clone Artificial` (root) | ✅ reports "dirty working tree" (correct — repo has uncommitted changes)                     |

### Commit

- **artificial repo:** `16265fb` — `feat(workspace-cli): inject config params instead of records` (pushed to `origin/main`)
- **workspace repo:** `.art-workspace.mts`, `package.json`, `package-lock.json` — **uncommitted** (left for architect to validate and commit)

## Feedback

### For the planner

Instructions were clear and complete. One minor note: the verification step says `npx art-workspace clone artificial` (lowercase) but the repository record name is "Artificial" (capitalized). The name matching is case-sensitive (unchanged from previous iterations). This is consistent behavior, not a bug — just worth noting for the verification command.

### For the technical writers

No issues found. The pseudo-code specs (`plan__pseudo__config.md`, `plan__pseudo__clone.md`, `plan__pseudo__sanity.md`) accurately described the target implementation.

### For the crew

Straightforward refactor. The key change is that the manifest no longer carries record data — repositories and checkouts are loaded from record files at runtime. The `saveCheckoutRecord` function now accepts optional `config` and `root` parameters to resolve the template path, with a fallback to the hardcoded template if the file is missing.
