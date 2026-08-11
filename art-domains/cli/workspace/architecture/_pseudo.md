# Pseudo: Workspace CLI

Description of the CLI parts: entry point, data structures, use cases (expanded from architect file), and main auxiliary functions. Zero real code — bodies prescribe what to do, not how to implement.

## Entry Point

### Function: main()

**Responsibility:** Parse CLI arguments and route to the appropriate command handler.

```pseudo
main
  parse args with commander
  route to: clone | branch | link | sanity | publish
```

## Data Structures

### Records

**WorkspaceRecord:** `.agents/domains/workspace/structures/workspace__structure.md`
**RepositoryRecord:** `.agents/domains/workspace/structures/repository__structure.md`
**CheckoutRecord:** `.agents/domains/workspace/structures/checkout__structure.md`

### WorkspaceContext

Per-command invocation context. Passed as a single object to all routines — never destructured.

```
WorkspaceContext
  config: WorkspaceConfig
  root: string
  store: CheckoutStore
  log: OperationsLog
```

### CheckoutStore

In-memory state of all known checkouts. Created per command invocation.

```
CheckoutStore
  checkouts: Map<name, Checkout>    // keys are lowercase

  addCheckout(repo, location) → Checkout     // creates in store (records synced separately)
  loadExistingCheckouts()                    // hydrate from disk records into store
  findCheckout(name) → Checkout             // case-insensitive lookup
  getCheckout(name) → Checkout              // exact (lowercase) lookup
  setCheckout(checkout)                     // replace checkout in store by name
  getAllCheckouts() → Checkout[]
  markExtraneous(location) → Checkout        // creates without persisting
  getExtraneous() → Checkout[]
  syncRecords()                              // persist store state to disk records
```

### Checkout

Individual repo checkout state.

```
Checkout //
  repo: RepositoryRecord
  record: CheckoutRecord // contains kind,name,location/branch, and eventually (purpose, description)
  exists: boolean
  detached: boolean
  conflicts: boolean
  dirty: boolean
  hasRemote: boolean
  unpushed: number       // -1 = no tracking branch, 0 = pushed, >0 = commits ahead
  issues: string[]
  extraneous: boolean

  // convenience accessors — derived from record
  name → string          // record.name, lowercase
  location → string      // record.location
  branch → string        // record.branch
```

### OperationsLog

Append-only log of side effects performed during a command.

```
OperationsLog
  operations: Operation[]

  cloned(repo, detail)
  pushed(repo, detail)
  published(repo, detail)
  branchCreated(repo, detail)
  linked(repo, detail)
  unlinked(repo, detail)
  all() → Operation[]
  since(ts) → Operation[]
  latest(number) → Operation[]
```

### Operation

```
Operation
  ts: date
  repo: string
  operation: string     // one of: cloned | pushed | published | branch created | linked | unlinked
  detail: string
```

## Reports

Every command that touches checkouts produces one or more reports. Reports are presented as markdown tables. Always the full table — no collapsing. Each report has a header line (e.g. `Checkout Report:`) and an empty line after the table.

### Checkout Report

The primary status table. Present after every command that reads or mutates checkouts.

### Operations Report

Appended when a command performs side effects. Omitted when nothing was done.

| repo        | operation | detail                     |
| ----------- | --------- | -------------------------- |
| artificial  | cloned    | to repos/artificial        |
| purrception | pushed    | 2 commits to origin/feat/x |
| no-comply   | published | @no-comply/core@1.2.3      |

### Extraneous Report

Directories under the checkouts path with no matching record. Presented by `clone` (no-args) and `sanity`.

| directory      | branch  | states             |
| -------------- | ------- | ----------------- |
| my-test-clone  | main    | —                 |
| old-experiment | feature | uncommitted files |

## Use Cases

### Command: clone [--all] [name] [target]

**Responsibility (clone --all):** Bootstrap workspace by cloning all repos, updating records, and presenting the Checkout Report with Operations Report.

**Responsibility (clone <repo>):** Clone a single repo for targeted work, update records, and present the Checkout Report with Operations Report.

**Responsibility (clone, no args):** Present the Checkout Report and Extraneous Report without cloning.

```pseudo
clone(all, name, target)
  ctx = createWorkspaceContext(config, root)
  repos = loadRepositories(ctx)
  ctx.store.loadExistingCheckouts()

  if all:
    existingRecords = loadCheckouts(ctx)

    for repo in repos:
      if not ctx.store.findCheckout(repo.name):
        override = existingRecords.find(r => r.name === repo.name)
        location = override?.location ?? defaultLocation(repo)
        ctx.store.addCheckout(repo, location)

    for checkout in ctx.store.getAllCheckouts():
      checkout = scanCheckout(ctx, checkout)
      if not checkout.exists:
        cloneRepo(checkout.location, checkout.repo.remote)
        checkout = scanCheckout(ctx, checkout)
        ctx.log.cloned(checkout.repo.name, "to " + checkout.location)

    presentCheckoutReport(ctx.store)
    presentOperationsReport(ctx.log)
    ctx.store.syncRecords()
    return

  if name:
    canonical = name.startsWith("@") ? name.split("/")[1] : name
    repo = repos.find(r => r.name.toLowerCase() === canonical.toLowerCase())
    if not repo:
      report error "unknown repo"
      return

    existingRecords = loadCheckouts(ctx)
    checkout = ctx.store.findCheckout(canonical)
    if not checkout:
      override = existingRecords.find(r => r.name === repo.name)
      location = target ?? override?.location ?? defaultLocation(repo)
      checkout = ctx.store.addCheckout(repo, location)

    checkout = scanCheckout(ctx, checkout)
    if not checkout.exists:
      cloneRepo(checkout.location, repo.remote)
      checkout = scanCheckout(ctx, checkout)
      ctx.log.cloned(checkout.repo.name, "to " + checkout.location)

    presentCheckoutReport(ctx.store)
    presentOperationsReport(ctx.log)
    ctx.store.syncRecords()
    return

  // neither --all nor name: status mode
  scanAllCheckouts(ctx)
  scanExtraneousCheckouts(ctx)
  presentCheckoutReport(ctx.store)
  presentExtraneousReport(ctx.store)
```

### Command: branch <name> in <repos...>

**Responsibility:** Create and checkout a feature branch across multiple repos. Present Checkout Report + Operations Report.

```pseudo
branch(name, repos)
  ctx = createWorkspaceContext(config, root)
  repos = loadRepositories(ctx)

  for repoName in repos:
    repo = repos.find(r => r.name.toLowerCase() === repoName.toLowerCase())
    if not repo:
      ctx.log.branchCreated(repoName, "skipped — unknown repo")
      continue

    checkout = ctx.store.findCheckout(repo.name)
    if not checkout or not checkout.exists:
      ctx.log.branchCreated(repo.name, "skipped — not cloned")
      continue

    dir = join(ctx.root, checkout.location)
    git checkout -b name in dir
    ctx.store.setCheckout({ ...checkout, branch: name })
    ctx.log.branchCreated(checkout.repo.name, "branch " + name)

  presentCheckoutReport(ctx.store)
  presentOperationsReport(ctx.log)
  ctx.store.syncRecords()
```

**Edge cases:**
- Repo not cloned: skip with warning, log operation
- Branch already exists: checkout existing branch
- Uncommitted changes: warn but proceed (git checkout -b handles this)

### Command: link <repo> [namespaces] [packages]

**Responsibility:** Symlink local packages into other repos' node_modules for local dev. Present Operations Report.

```pseudo
link(repo, namespaces, packages)
  ctx = createWorkspaceConfig(config, root)
  repos = loadRepositories(ctx)

  source = repos.find(r => r.name.toLowerCase() === repo.toLowerCase())
  if not source:
    report error "unknown repo"
    return

  // Identify packages to link (filtered by namespaces/packages if provided)
  sourcePackages = findPackages(source, namespaces, packages)
  consumers = findConsumers(source, repos)

  for consumer in consumers:
    consumerDir = join(ctx.root, consumer.checkout.location)
    if not dirExists(consumerDir):
      continue

    for pkg in sourcePackages:
      target = join(consumerDir, "node_modules", pkg.name)
      source_ = join(ctx.root, source.checkout.location, pkg.path)
      rm -rf target
      ln -s source_ target
      ctx.log.linked(source.name, pkg.name + " → " + consumer.name)

  presentOperationsReport(log)
```

**Edge cases:**
- Consumer not cloned: skip with warning
- Existing symlink: replace
- Existing directory (npm-installed): error — don't overwrite without confirmation

### Command: unlink <repo> [namespaces] [packages]

**Responsibility:** Remove package symlinks and restore npm packages. Present Operations Report.

```pseudo
unlink(repo, namespaces, packages)
  ctx = createWorkspaceContext(config, root)
  repos = loadRepositories(ctx)

  source = repos.find(r => r.name.toLowerCase() === repo.toLowerCase())
  if not source:
    report error "unknown repo"
    return

  sourcePackages = findPackages(source, namespaces, packages)
  consumers = findConsumers(source, repos)
  affected = Set()

  for consumer in consumers:
    consumerDir = join(ctx.root, consumer.checkout.location)
    if not dirExists(consumerDir):
      continue

    for pkg in sourcePackages:
      target = join(consumerDir, "node_modules", pkg.name)
      if isSymlink(target):
        rm target
        affected.add(consumerDir)
        ctx.log.unlinked(source.name, pkg.name + " from " + consumer.name)

  for dir in affected:
    npm install in dir

  presentOperationsReport(log)
```

**Edge cases:**
- Consumer not cloned: skip with warning
- Not a symlink: skip (npm-installed)
- Symlink doesn't exist: skip
- npm install fails: report error, continue

### Command: sanity [--auto]

**Responsibility:** Check git status across all repos. Present Checkout Report + Extraneous Report. With --auto, push clean unpushed repos and append Operations Report.

```pseudo
sanity(auto)
  ctx = createWorkspaceContext(config, root)

  ctx.store.loadExistingCheckouts()
  scanAllCheckouts(ctx)
  scanExtraneousCheckouts(ctx)

  if auto:
    for checkout in ctx.store.getAllCheckouts():
      if not checkout.dirty and checkout.unpushed > 0 and checkout.hasRemote:
        git push origin checkout.branch
        updated = { ...checkout, unpushed: 0 }
        ctx.store.setCheckout(updated)
        ctx.log.pushed(checkout.repo.name, "to origin/" + checkout.branch)

  presentCheckoutReport(ctx.store)
  presentExtraneousReport(ctx.store)
  presentOperationsReport(ctx.log)
  if auto:
    ctx.store.syncRecords()
```

### Command: publish [--auto]

**Responsibility:** Push repos and publish packages to npm. Present Checkout Report + Operations Report.

```pseudo
publish(auto)
  ctx = createWorkspaceContext(config, root)
  repos = loadRepositories(ctx)
  ctx.store.loadExistingCheckouts()
  scanAllCheckouts(ctx)

  for checkout in ctx.store.getAllCheckouts():
    // Push if clean, has remote, unpushed > 0
    if auto and not checkout.dirty and checkout.unpushed > 0 and checkout.hasRemote:
      git push origin checkout.branch
      updated = { ...checkout, unpushed: 0 }
      ctx.store.setCheckout(updated)
      ctx.log.pushed(checkout.repo.name, "to origin/" + checkout.branch)

    // Publish unpublished packages
    packages = findPackages(checkout.repo)
    for pkg in packages:
      if pkg.private: continue
      version = readPackageVersion(join(ctx.root, checkout.location, pkg.path, "package.json"))
      published = npmIsPublished(pkg.name, version)
      if not published and auto:
        npm publish --access public in pkg.path
        ctx.log.published(checkout.repo.name, pkg.name + "@" + version)

  presentCheckoutReport(ctx.store)
  presentOperationsReport(ctx.log)
  if auto:
    ctx.store.syncRecords()
```

**Edge cases:**
- Repo not cloned: skip with warning
- No remote configured: skip push, log issue
- Package already published: skip
- npm publish fails: report error, continue with other packages
- OTP required: error if `--auto`

## Auxiliary Functions

### Function: createWorkspaceContext(config, root)

**Responsibility:** Create a WorkspaceContext with CheckoutStore and OperationsLog.

```pseudo
createWorkspaceContext(config, root)
  ctx.config = config
  ctx.root = root
  ctx.store = new CheckoutStore
  ctx.log = new OperationsLog
  return ctx
```

### Function: scanCheckout(ctx, checkout)

**Responsibility:** Read git state from filesystem, create a new checkout instance with updated state, and set it in the store. Returns the new checkout.

```pseudo
scanCheckout(ctx, checkout)
  dir = join(ctx.root, checkout.location)

  if not dirExists(dir):
    updated = { ...checkout, exists: false, issues: ["repo not cloned"] }
    ctx.store.setCheckout(updated)
    return updated

  exists = true
  branch = getCurrentBranch(dir)
  detached = isDetachedHead(dir)
  conflicts = hasMergeConflicts(dir)
  dirty = isDirty(dir)
  hasRemote = hasRemote(dir)
  unpushed = getUnpushedCount(dir)  // -1 = no tracking branch, 0 = pushed, >0 = commits ahead

  issues = []
  if detached: issues.push("detached HEAD")
  if conflicts: issues.push("merge conflicts")
  if not hasRemote: issues.push("no remote")
  if dirty: issues.push("uncommitted files")
  if unpushed === -1: issues.push("not pushed")
  else if unpushed > 0: issues.push("N commits ahead")

  updated = { ...checkout, exists, branch, detached, conflicts, dirty, hasRemote, unpushed, issues }
  ctx.store.setCheckout(updated)
  return updated
```

### Function: scanAllCheckouts(ctx)

**Responsibility:** Scan all checkouts in the store.

```pseudo
scanAllCheckouts(ctx)
  for checkout in ctx.store.getAllCheckouts():
    scanCheckout(ctx, checkout)
```

### Function: scanExtraneousCheckouts(ctx)

**Responsibility:** Scan for extraneous (non-record based) checkouts under config.checkouts.path.

```pseudo
scanExtraneousCheckouts(ctx)
  checkoutsPath = join(ctx.root, ctx.config.records.checkouts.path)
  recordedLocations = ctx.store.getAllCheckouts().map(c => c.location)

  for dir in listDirectories(checkoutsPath):
    location = relative(ctx.root, dir)
    if location not in recordedLocations:
      checkout = ctx.store.markExtraneous(location)
      scanCheckout(ctx, checkout)
```

### Function: presentCheckoutReport(store)

**Responsibility:** Present the Checkout Report ordered by package name.

```pseudo
presentCheckoutReport(store)
  checkouts = store.getAllCheckouts()
  checkouts.sort(by package name)
  print table (repo, location, branch, states)
```

### Function: presentOperationsReport(log)

**Responsibility:** Present the Operations Report. Omitted when no operations occurred.

```pseudo
presentOperationsReport(log)
  operations = log.all()
  if operations is empty:
    return

  print table (repo, operation, detail)
```

### Function: presentExtraneousReport(store)

**Responsibility:** Present the Extraneous Report. Omitted when none found.

```pseudo
presentExtraneousReport(store)
  extraneous = store.getExtraneous()
  if extraneous is empty:
    return

  print table (directory, branch, states)
```

### Function: loadWorkspaceConfig(root)

**Responsibility:** Load and parse the workspace config from `.art-workspace.mts`.

```pseudo
loadWorkspaceConfig(root)
  if .art-workspace.mts not exists:
    scaffold empty template

  bundle with esbuild (ESM, node platform)
  write temp .mjs
  import temp file
  return config
```

### Function: loadRepositories(ctx)

**Responsibility:** Read all repository records from the records directory.

```pseudo
loadRepositories(ctx)
  scan ctx.config.records.repositories.path
  parse each .art file
  return list of RepositoryRecord
```

### Function: loadCheckouts(ctx)

**Responsibility:** Read all checkout records from the checkouts directory.

```pseudo
loadCheckouts(ctx)
  scan ctx.config.records.checkouts.path
  parse each .art file
  return list of CheckoutRecord
```

### Function: cloneRepo(location, remote)

**Responsibility:** Clone a git repository to the specified location.

```pseudo
cloneRepo(location, remote)
  git clone remote location
```

### Function: defaultLocation(repo)

**Responsibility:** Compute the default checkout location for a repository.

```pseudo
defaultLocation(repo)
  return "repos/" + repo.name
```
