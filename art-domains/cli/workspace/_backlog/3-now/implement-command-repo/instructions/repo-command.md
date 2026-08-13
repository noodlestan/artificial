# Implementation Instructions

**Plan:** `implement-command-repo`

**commit.Id:** `repo-command`

::switch `agent-worker` — switch to the agent-worker agent mode to execute this instruction. Your mode must be `worker` before you start changing files.

These are your instructions. They include a section at the end on how to report back to requester.

- RULE: If at any point you are instructed to **REPORT A BLOCKER** execute the instruction in the "## How to Report Back" section and STOP processing any other instructions.

## Working Agreements

The plan workflow (see `$WORKSPACE/.agents/domains/engineering/_guide.md`) runs on three working agreements:

1. **This instruction is self-contained.** Everything you need is in this file plus its mandatory reading — never rely on session memory, chat context, or details relayed by the user.
2. **Your report is self-contained.** The rendered report file carries the full trail: evidence, changes, verification results, blockers, feedback. Your chat response is only a pointer to it.
3. **User interaction is minimal.** The user relays this instruction to the delegator and expects a light confirmation: a happy face and up to 3 bullet points — done `repo-command`, created `repo command implementation`, thumbs up. If something goes horribly wrong, report the blocker instead of a summary.

## Goals

Implement the `repo` command for `@art-domains/workspace-cli`. This command lists repositories under active checkouts, their namespaces, and their packages with version information. This is infrastructure needed for the `link` and `publish` commands.

## Mandatory Reading

- `$PROJECT/_backlog/_architect.md` — workspace architecture, principles, NFRs, use cases
- `$PROJECT/architecture/_pseudo.md` — CLI pseudo-code: data structures, use cases, auxiliary functions (focus on `repo` command section)
- `$PROJECT/architecture/commands.md` — command surface and BDD scenarios (focus on `Repo` section)
- `$PROJECT/architecture/context-model.md` — WorkspaceContext, CheckoutStore, Project Records
- `$PROJECT/_guide.md` — setup and verification commands

- RULE: You MUST follow any links under `## Mandatory Reading` sections found in the listed files.
- RULE: If you are unable to read a file linked under `## Mandatory Reading` you must stop and REPORT A BLOCKER.

## Workflow

You are going to perform a series of steps and check status after each one.

1. Step 1. Refactor scan and records structure
2. Step 2. Create Test Scaffolds
3. Step 3. Define Contracts
4. Step 4. Implement Core Functions
5. Step 5. Implement repo Command
6. Step 6. Wire Command to CLI

Execute all the steps autonomously, one by one, including running the **Verification commands** plus any _Verification command_ found at the end of the current step.

### Rules

- RULE: You are FORBIDDEN to return to a previous step.
- RULE: If a verification command reports errors not related to the scope of these instructions, STOP and report back the error, following the "## How to Report Back".
- RULE: If a verification command reports errors related to the scope of these instructions, attempt to fix them.
- RULE: If the errors persist, inspect the cause before continuing.
- RULE: If still unable to fix it, STOP and report back the error, following the "## How to Report Back".
- RULE: Use existing test patterns from `src/commands/clone/` and `src/commands/branch/`.
- RULE: Use existing record patterns from `src/private/records/repository/` and `src/private/records/checkout/`.
- RULE: Use existing presentation patterns from `src/private/present/`.
- RULE: The `repo` command is read-only — no operations are logged; failures surface as report states.
- RULE: Each record reading function should be independently testable and follow the singular/plural pattern (e.g., `readProjectRecord` and `readProjectRecords`).

### Step Verification commands

After each step, run from this package directory:

```bash
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues (prettier, eslint, tsc --noEmit)
npm run build
npm run test
```

## Changes

- Move `src/shared/scan*` to `src/private/scan/` and update all imports (in step 1)
- Split `src/private/records/` into `src/private/records/repository/`, `src/private/records/checkout/`, and `src/private/records/projectGraph/` subdirectories (in step 1)
- Create test files: `src/commands/repo/*.test.ts`, `src/private/records/projectGraph/loadProjectGraph.test.ts`, `src/private/present/presentPackageStateReport.test.ts` (in step 2)
- Define `PackageStateRecord` (with version, publishedVersion, states), `ProjectRecord`, `NamespaceRecord`, `PackageRecord`, `ProjectGraph` types in `src/private/records/types.ts` (in step 3)
- Define `loadProjectGraph`, `readProjectRecord`, `readProjectRecords`, `readNamespaceRecord`, `readNamespaceRecords`, `readPackageRecord`, `readPackageRecords` function signatures (in step 3)
- Implement record reading functions: `readProjectRecord`, `readProjectRecords`, `readNamespaceRecord`, `readNamespaceRecords`, `readPackageRecord`, `readPackageRecords` (in step 4)
- Implement graph loading: `loadProjectGraph` calling `readProjectRecords`, `readNamespaceRecords`, `readPackageRecords`, and `consolidateProjectGraph` (in step 4)
- Implement `findPackage(graph, package)` to locate a package across projects (in step 4)
- Implement `presentPackageStateReport(checkout, packageStates)` to present the Package State Report (in step 4)
- Implement `repo` command handler with edge case handling (in step 5)
- Register `repo` command in CLI entry point (in step 6)

## Step Instructions

### Setup

Run from repository root (monorepo):

```bash
npm ci # to install dependencies.
npm run ci # to verify build is green before starting
```

### Step 1/6 — Refactor scan and records structure

**Goal:** Reorganize scan and records modules into proper private directory structure.

**Instructions:**

1. Move `src/shared/scan*` files to `src/private/scan/`:
   - `src/shared/scanAllCheckoutsStates.ts` → `src/private/scan/scanAllCheckoutsStates.ts`
   - `src/shared/scanAllCheckoutsStates.test.ts` → `src/private/scan/scanAllCheckoutsStates.test.ts`
   - `src/shared/scanCheckoutState.ts` → `src/private/scan/scanCheckoutState.ts`
   - `src/shared/scanCheckoutState.test.ts` → `src/private/scan/scanCheckoutState.test.ts`
   - `src/shared/scanExtraneousCheckouts.ts` → `src/private/scan/scanExtraneousCheckouts.ts`
   - `src/shared/scanExtraneousCheckouts.test.ts` → `src/private/scan/scanExtraneousCheckouts.test.ts`
   - `src/shared/types.ts` → `src/private/scan/types.ts` (or merge into existing types)
2. Update all imports across the codebase that reference the moved files
3. Split `src/private/records/` into subdirectories:
   - Move `src/private/records/loadRepositoryRecords.ts` → `src/private/records/repository/loadRepositoryRecords.ts`
   - Move `src/private/records/readRepositoryRecord.ts` → `src/private/records/repository/readRepositoryRecord.ts`
   - Move `src/private/records/readRepositoryRecord.test.ts` → `src/private/records/repository/readRepositoryRecord.test.ts`
   - Move `src/private/records/loadCheckoutRecords.ts` → `src/private/records/checkout/loadCheckoutRecords.ts`
   - Move `src/private/records/loadCheckoutRecords.test.ts` → `src/private/records/checkout/loadCheckoutRecords.test.ts`
   - Move `src/private/records/readCheckoutRecord.ts` → `src/private/records/checkout/readCheckoutRecord.ts`
   - Move `src/private/records/readCheckoutRecord.test.ts` → `src/private/records/checkout/readCheckoutRecord.test.ts`
   - Move `src/private/records/saveCheckoutRecord.ts` → `src/private/records/checkout/saveCheckoutRecord.ts`
   - Move `src/private/records/saveCheckoutRecord.test.ts` → `src/private/records/checkout/saveCheckoutRecord.test.ts`
   - Keep `src/private/records/types.ts` in place (shared types)
4. Create new directory structure for project graph:
   - Create `src/private/records/project/` for project record reading functions
   - Create `src/private/records/namespace/` for namespace record reading functions
   - Create `src/private/records/package/` for package record reading functions
   - Create `src/private/records/projectGraph/` for graph loading, consolidation, linking, and validation functions
5. Update all imports across the codebase that reference the moved files

**Extra Verification commands:**

- Execute `npm run test` in `$PROJECT` to verify refactoring doesn't break existing tests

### Step 2/6 — Create Test Scaffolds

**Goal:** Establish test files with pending tests for each BDD scenario.

**Instructions:**

1. Read the BDD scenarios from `$PROJECT/architecture/commands.md` → Repo section
2. Create `src/commands/repo/runRepo.test.ts` with pending tests for each scenario:
   - list a single checkout's packages
   - repo defaults to all checkouts when none specified
   - checkout has no project records
   - unknown checkout warns and skips
   - project references a missing namespace
   - namespace references a missing package
   - package path has no package.json
   - npm info fails
3. Create project graph loading tests in `src/private/records/projectGraph/loadProjectGraph.test.ts`:
   1. Start by creating mocks similar to `$PROJECT/src/test/writeCheckoutRecord.ts` for creating test `.art` files
   2. Test `readProjectRecord(path)` with valid record, missing file, and invalid file
   3. Test `readProjectRecords(path)` with multiple records, empty directory, and mixed valid/invalid
   4. Repeat for `readNamespaceRecord` and `readNamespaceRecords`
   5. Repeat for `readPackageRecord` and `readPackageRecords`
   6. Test `consolidateProjectGraph` with valid graph, missing namespace references, and missing package references
   7. Finish with `loadProjectGraph` (happy path and unexpected error only)
4. Create `src/private/present/presentPackageStateReport.test.ts` with tests for `presentPackageStateReport`

**Note:** Tests for `readProjectRecord` and `readProjectRecords` are similar; create one test file and import the test helpers. Same for namespace and package record reading functions.

**Extra Verification commands:**

- Execute `npm run test` in `$PROJECT` to verify test scaffolds compile

### Step 3/6 — Define Contracts

**Goal:** Define types and interfaces before implementation.

**Instructions:**

1. Define types in `src/private/records/types.ts`:

   ```typescript
   interface PackageStateRecord {
     canonicalName: string;
     version: string | null; // from package.json
     publishedVersion: string | null; // from npm
     directory: string;
     states: string[]; // "published" / "unpublished ({current version})"
   }

   interface ProjectRecord {
     name: string;
     path: string;
     namespaceNames: string[];
   }

   interface NamespaceRecord {
     name: string;
     path: string;
     packageNames: string[];
   }

   interface PackageRecord {
     name: string;
     canonicalName: string;
     path: string;
   }

   interface ProjectGraph {
     projects: ProjectRecord[];
     namespaces: Map<string, NamespaceRecord>;
     packages: Map<string, PackageRecord>;
     warnings: string[];
   }
   ```

2. Define function signatures for record reading:
   - `readProjectRecord(path: string): ProjectRecord | null` in `src/private/records/project/readProjectRecord.ts`
   - `readProjectRecords(path: string): ProjectRecord[]` in `src/private/records/project/readProjectRecords.ts`
   - `readNamespaceRecord(path: string): NamespaceRecord | null` in `src/private/records/namespace/readNamespaceRecord.ts`
   - `readNamespaceRecords(path: string): NamespaceRecord[]` in `src/private/records/namespace/readNamespaceRecords.ts`
   - `readPackageRecord(path: string): PackageRecord | null` in `src/private/records/package/readPackageRecord.ts`
   - `readPackageRecords(path: string): PackageRecord[]` in `src/private/records/package/readPackageRecords.ts`
3. Define function signatures for graph loading:
   - `loadProjectGraph(checkoutPath: string): ProjectGraph` in `src/private/records/projectGraph/loadProjectGraph.ts`
   - `consolidateProjectGraph(projects: ProjectRecord[], namespaces: NamespaceRecord[], packages: PackageRecord[]): ProjectGraph` in `src/private/records/projectGraph/consolidateProjectGraph.ts`
4. Define `findPackage` signature:
   - `findPackage(graph: ProjectGraph, packageName: string): { package: PackageRecord; projectPath: string; namespacePath: string } | null` in `src/private/records/projectGraph/findPackage.ts`
5. Define `presentPackageStateReport` signature in `src/private/present/presentPackageStateReport.ts`

**Extra Verification commands:**

- Execute `npm run lint` in `$PROJECT` to verify types compile

### Step 4/6 — Implement Core Functions

**Goal:** Implement the core functions following the pseudo-code.

**Instructions:**

1. Implement record reading functions:
   - `readProjectRecord(path: string): ProjectRecord | null` in `src/private/records/project/readProjectRecord.ts`:
     - Read project record from `.art` file at path
     - Parse and return ProjectRecord or null if missing/invalid
   - `readProjectRecords(path: string): ProjectRecord[]` in `src/private/records/project/readProjectRecords.ts`:
     - Read all project records from directory
     - Filter out nulls and return array
   - `readNamespaceRecord(path: string): NamespaceRecord | null` in `src/private/records/namespace/readNamespaceRecord.ts`:
     - Read namespace record from `.art` file at path
     - Parse and return NamespaceRecord or null if missing/invalid
   - `readNamespaceRecords(path: string): NamespaceRecord[]` in `src/private/records/namespace/readNamespaceRecords.ts`:
     - Read all namespace records from directory
     - Filter out nulls and return array
   - `readPackageRecord(path: string): PackageRecord | null` in `src/private/records/package/readPackageRecord.ts`:
     - Read package record from `.art` file at path
     - Parse and return PackageRecord or null if missing/invalid
   - `readPackageRecords(path: string): PackageRecord[]` in `src/private/records/package/readPackageRecords.ts`:
     - Read all package records from directory
     - Filter out nulls and return array
2. Implement graph loading:
   - `loadProjectGraph(checkoutPath: string): ProjectGraph` in `src/private/records/projectGraph/loadProjectGraph.ts`:
     - Call `readProjectRecords`, `readNamespaceRecords`, and `readPackageRecords` to load all records from `{checkoutPath}/ops/records/`
     - Call `consolidateProjectGraph` to link and validate
   - `consolidateProjectGraph(projects, namespaces, packages): ProjectGraph` in `src/private/records/projectGraph/consolidateProjectGraph.ts`:
     - Link project.namespaceNames → namespaces
     - Link namespace.packageNames → packages
     - Generate warnings for missing namespace/package references
     - Return consolidated ProjectGraph
3. Implement package finding:
   - `findPackage(graph: ProjectGraph, packageName: string): { package: PackageRecord; projectPath: string; namespacePath: string } | null` in `src/private/records/projectGraph/findPackage.ts`:
     - Search by canonicalName first, then by name
     - Return resolved package with project.path and namespace.path context, or null
4. Implement `presentPackageStateReport(checkout, packageStates)` in `src/private/present/presentPackageStateReport.ts`:
   - Present table with columns: package, version, published, states
   - Follow existing report presentation patterns from `src/private/present/`

**Extra Verification commands:**

- Execute `npm run test` in `$PROJECT` to verify core functions pass tests

### Step 5/6 — Implement repo Command

**Goal:** Implement the repo command handler.

**Instructions:**

1. Create `src/commands/repo/runRepo.ts` following the pattern from `clone/runClone.ts` and `branch/runBranch.ts`
2. Implement the command handler:
   - Parse checkout names from arguments (default to all checkouts)
   - For each checkout:
     - Load project graph using `loadProjectGraph(checkout.path)`
     - If no projects in graph, add issue "no project records" to checkout
     - For each project in graph.projects:
       - For each namespace in project.namespaceNames:
         - For each package in namespace.packageNames:
           - Resolve packagePath = `{checkout.path}/{project.path}/{namespace.path}/{package.path}`
           - Read `package.json` for current version (null if missing)
           - Run `npm info {package.canonicalName}` for published version (null if fails)
           - Collect PackageStateRecord with states: "no package.json", "npm info failed"
     - Present Checkout Report row
     - Present Package State Report for checkout's packages
3. Handle edge cases:
   - Unknown checkout → warn on stderr, skip
   - No project records → report checkout with state "no project records"
   - Missing namespace/package records → warn, skip (handled by consolidateProjectGraph)
   - package.json missing → state "no package.json"
   - npm info fails → published version "unknown", state "npm info failed"

**Extra Verification commands:**

- Execute `npm run test` in `$PROJECT` to verify repo command passes tests

### Step 6/6 — Wire Command to CLI

**Goal:** Register the repo command in the CLI entry point.

**Instructions:**

1. Read the CLI entry point (`src/index.ts`)
2. Add the `repo` command registration following the pattern from `clone` and `branch`
3. Wire the command handler to the CLI router

**Extra Verification commands:**

- Execute `npm run build` in `$PROJECT` to verify the command is wired correctly
- Execute `npm run test` in `$PROJECT` to verify all tests pass

### Final Verification

Run from this package directory:

```bash
npm run lint:fix # to fix formatting issues automatically
npm run lint # to report other issues (prettier, eslint, tsc --noEmit)
npm run build
npm run test
```

Runs on pre-commit hook from the repository root:

```bash
npm run ci # lint, build and test
```

All steps MUST pass. If any step fails, fix the issue before considering the task complete.

**Sanity check**

Verify that:

- The `repo` command lists repositories, namespaces, and packages
- The command works with zero, one, or multiple checkout names
- Edge cases are handled correctly (unknown checkout, no project records, missing records, missing package.json, npm info failure)
- The command is read-only (no operations logged)
- All BDD scenarios from `architecture/commands.md` pass

## How to Report Back to the Delegator

1. Summarise the current context, asking: are you reporting completion or a BLOCKER?
2. Gather the evidence of changes made and outcomes achieved, or the blocker error details.
3. Use the **render-template** skill with `$WORKSPACE/.agents/domains/plans/templates/report__template.md` to render your report and write it next to this instruction file: `implement-command-repo/instructions/repo-command__report.md`. No separate delegation record is created.
4. Generate the response and send it back to the delegator.
5. Keep the response terse per the Working Agreements: happy face + up to 3 bullet points (done `repo-command`, created `repo command implementation`, thumbs up). The full trail lives in the report file; never repeat it in chat.

Thank you for your service.
