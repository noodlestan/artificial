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

**WorkspaceRecord:** `$WORKSPACE/.agents/domains/workspace/structures/workspace__structure.md`
**RepositoryRecord:** `$WORKSPACE/.agents/domains/workspace/structures/repository__structure.md`
**CheckoutRecord:** `$WORKSPACE/.agents/domains/workspace/structures/checkout__structure.md`

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
Checkout
  repo: RepositoryRecord
  record: { name, location, branch }   // persisted fields; branch is the recorded branch, not the scanned one
  exists: boolean
  branch: string                       // scanned branch (or record default before scan)
  remoteBranch: string | null          // null = no tracking branch (new/untracked)
  detached: boolean
  conflicts: boolean
  dirty: boolean
  hasRemote: boolean
  unpushed: number                     // 0 = nothing to push, >0 = commits ahead of remoteBranch
  issues: string[]
  extraneous: boolean
```

Notes: `name`/`location`/`branch` are read as `checkout.repo.name`, `checkout.record.location`, `checkout.branch`. A repo with no remote branch is not an issue — it has `remoteBranch: null` and push creates the branch on the remote.

### OperationsLog

Append-only log of side effects performed during a command. Side effects are typed operations created by factories in `src/private/operations/` and appended with `log(operation)`.

```
OperationsLog
  log(operation)        // append a typed Operation
  all() → Operation[]
  since(ts) → Operation[]
  latest(number) → Operation[]
```

### Operation

Typed operation records. Every operation carries the checkout it acted on, its outcome, and a `message()` used in the Operations Report.

```
OperationBase
  operation: string   // one of: clone | push | publish | branch created | linked | unlink
  ts: date
  checkout: Checkout
  outcome: 'success' | 'failure'
  message() → string

OperationSuccess extends OperationBase   // outcome: 'success'
OperationFailure extends OperationBase   // outcome: 'failure'
  error: string
  errorSerialized() → string

// Successes carry their specifics; failures mirror them and add error/errorSerialized:
CloneSuccess    { operation: 'clone', location }
PushSuccess     { operation: 'push', branch }
PublishSuccess  { operation: 'publish', package, version }
BranchSuccess   { operation: 'branch created', branch }
LinkedSuccess   { operation: 'linked', package, target }
UnlinkSuccess   { operation: 'unlink', package, source }

CloneFailure, PushFailure, PublishFailure, BranchFailure, LinkedFailure, UnlinkFailure
```

Factories (one file per factory in `src/private/operations/`): `createCloneSuccess(checkout)`, `createPushSuccess(checkout, branch)`, `createPushFailure(checkout, branch, error)`, `createBranchSuccess(checkout, branch, message?)`, and so on — messages are fixed by the factory unless noted.

## Reports

Every command that touches checkouts produces one or more reports. Reports are presented as markdown tables. Always the full table — no collapsing. Each report prints a header line (e.g. `Checkout Report:`), the table, and an empty line after the table. Presenters live in `src/private/present/` — one function per file (`format-table` shared).

### Checkout Report

The primary status table. Present after every command that reads or mutates checkouts. Headers: `repo | location | branch | states`; rows sorted by repo name; `states` is `issues` joined with `; ` or `clean`.

### Operations Report

Appended when a command performs side effects. Omitted when nothing was done. Headers: `'' | repo | operation | message`; column zero carries the outcome marker (🟢 success / 🔴 failure).

|     | repo        | operation       | message                 |
| --- | ----------- | --------------- | ----------------------- |
| 🟢  | artificial  | clone           | to repos/artificial     |
| 🟢  | purrception | push            | to origin/feat/x        |
| 🔴  | purrception | push            | failed to push some refs |

### Extraneous Report

Directories under the checkouts path with no matching record. Presented by `clone` (no-args) and `sanity`. Headers: `directory | branch | states`; rows read `record.location` and `record.branch`.

| directory      | branch | states            |
| -------------- | ------ | ----------------- |
| my-test-clone  | main   | clean             |
| old-experiment | -      | uncommitted files |

## Use Cases

### Command: clone [--all] [name] [target]

**Responsibility (clone --all):** Bootstrap workspace by cloning all repos, updating records, and presenting the Checkout Report with Operations Report.

**Responsibility (clone <repo>):** Clone a single repo for targeted work, update records, and present the Checkout Report with Operations Report.

**Responsibility (clone, no args):** Present the Checkout Report and Extraneous Report without cloning.

```pseudo
clone(all, name, target)
  ctx = createWorkspaceContext(config, root, store, log)
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
        ctx.log.log(createCloneSuccess(checkout))

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
      ctx.log.log(createCloneSuccess(checkout))

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

### Command: branch <branch> [<repos...>]

**Responsibility:** Create and checkout a feature branch across multiple repos (all repos when none specified). Present Checkout Report + Operations Report.

```pseudo
branch(name, repoNames)
  ctx = createWorkspaceContext(config, root, store, log)
  repos = loadRepositories(ctx)
  repoNames = repoNames.length > 0 ? repoNames : repos.map(r => r.name)   // no repos → all

  for repoName in repoNames:
    repo = repos.find(r => r.name.toLowerCase() === repoName.toLowerCase())
    if not repo:
      print warning "unknown repo: " + repoName
      continue

    checkout = ctx.store.findCheckout(repo.name)
    if not checkout:
      print warning "not cloned: " + repo.name
      continue
    checkout = scanCheckout(ctx, checkout)
    if not checkout.exists:
      ctx.log.log(createBranchFailure(checkout, name, "repo not cloned"))
      continue

    dir = join(ctx.root, checkout.record.location)
    if hasLocalBranch(dir, name):
      git checkout name in dir
      ctx.log.log(createBranchSuccess(checkout, name, "switched to " + name))
    else:
      try:
        git checkout -b name in dir
        ctx.log.log(createBranchSuccess(checkout, name))
      catch error:
        ctx.log.log(createBranchFailure(checkout, name, error))

    updated = { ...checkout, branch: name, record: { ...checkout.record, branch: name } }
    ctx.store.setCheckout(updated)

  presentCheckoutReport(ctx.store)
  presentOperationsReport(ctx.log)
  ctx.store.syncRecords()
```

**Edge cases:**
- Unknown repo: warn on stderr, skip (no checkout to attach an operation to)
- Repo not cloned: log `branch created` failure "repo not cloned", skip
- Branch already exists: switch to the existing branch, log success "switched to {branch}"
- Uncommitted changes: warn but proceed (git checkout handles this)

### Command: link <repo> [namespaces] [packages]

**Responsibility:** Symlink local packages into other repos' node_modules for local dev. Present Operations Report.

```pseudo
link(repo, namespaces, packages)
  ctx = createWorkspaceContext(config, root, store, log)
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
      ctx.log.log(createLinkedSuccess(checkout, pkg.name, target))

  presentOperationsReport(ctx.log)
```

**Edge cases:**
- Consumer not cloned: skip with warning
- Existing symlink: replace
- Existing directory (npm-installed): error — don't overwrite without confirmation

### Command: unlink <repo> [namespaces] [packages]

**Responsibility:** Remove package symlinks and restore npm packages. Present Operations Report.

```pseudo
unlink(repo, namespaces, packages)
  ctx = createWorkspaceContext(config, root, store, log)
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
        ctx.log.log(createUnlinkSuccess(checkout, pkg.name, source))

  for dir in affected:
    npm install in dir

  presentOperationsReport(ctx.log)
```

**Edge cases:**
- Consumer not cloned: skip with warning
- Not a symlink: skip (npm-installed)
- Symlink doesn't exist: skip
- npm install fails: report error, continue

### Command: sanity [--auto]

**Responsibility:** Check git status across all repos plus the workspace root. Present Checkout Report + Extraneous Report + Operations Report. With --auto, push clean unpushed repos and sync records.

```pseudo
sanity(auto)
  ctx = createWorkspaceContext(config, root, store, log)

  ctx.store.loadExistingCheckouts()
  wsCheckout = ctx.store.addCheckout(workspaceRepo, ".")   // workspace root as a checkout
  scanCheckout(ctx, wsCheckout)
  scanAllCheckouts(ctx)
  scanExtraneousCheckouts(ctx)

  if auto:
    pushCleanCheckouts(ctx)   // per checkout: shouldPushCheckout → pushCheckout

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
  ctx = createWorkspaceContext(config, root, store, log)
  repos = loadRepositories(ctx)
  ctx.store.loadExistingCheckouts()
  scanAllCheckouts(ctx)

  for checkout in ctx.store.getAllCheckouts():
    // Push if clean, has remote, unpushed > 0
    if auto and not checkout.dirty and checkout.unpushed > 0 and checkout.hasRemote:
      git push origin checkout.branch
      updated = { ...checkout, unpushed: 0 }
      ctx.store.setCheckout(updated)
      ctx.log.log(createPushSuccess(checkout, checkout.branch))

    // Publish unpublished packages
    packages = findPackages(checkout.repo)
    for pkg in packages:
      if pkg.private: continue
      version = readPackageVersion(join(ctx.root, checkout.location, pkg.path, "package.json"))
      published = npmIsPublished(pkg.name, version)
      if not published and auto:
        npm publish --access public in pkg.path
        ctx.log.log(createPublishSuccess(checkout, pkg.name, version))

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

### Function: createWorkspaceContext(config, root, store, log)

**Responsibility:** Assemble a WorkspaceContext. The store and log are created by the command entry point (see the `src/index.ts` wiring — sanity pattern) because the store needs the config and root.

```pseudo
createWorkspaceContext(config, root, store, log)
  ctx.config = config
  ctx.root = root
  ctx.store = store
  ctx.log = log
  return ctx
```

### Function: scanCheckout(ctx, checkout)

**Responsibility:** Read git state from filesystem, create a new checkout instance with updated state, and set it in the store. Returns the new checkout.

```pseudo
scanCheckout(ctx, checkout)
  dir = join(ctx.root, checkout.record.location)

  if not dirExists(dir):
    updated = { ...checkout, exists: false, issues: ["repo not cloned"] }
    ctx.store.setCheckout(updated)
    return updated

  issues = []
  try:
    branch = getCurrentBranch(dir)
    detached = isDetachedHead(dir)
    conflicts = hasMergeConflicts(dir)
    dirty = isDirty(dir)
    hasRemote = hasRemote(dir)
    remoteBranch = hasRemote ? getRemoteBranch(dir) : null
    unpushed = remoteBranch ? getUnpushedCount(dir, remoteBranch) : 0
  catch:
    issues.push("git error")

  if detached: issues.push("detached HEAD")
  if conflicts: issues.push("merge conflicts")
  if not hasRemote: issues.push("no remote")
  if dirty: issues.push("uncommitted files")
  if unpushed > 0: issues.push("N commits ahead")

  updated = { ...checkout, exists: true, branch, remoteBranch, detached, conflicts, dirty, hasRemote, unpushed, issues }
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

### Function: shouldPushCheckout(checkout)

**Responsibility:** Decide whether a checkout should be pushed by `sanity --auto`.

```pseudo
shouldPushCheckout(checkout)
  if not checkout.exists: return false
  if checkout.extraneous: return false
  if any issue blocks push: return false   // detached, conflicts, dirty, git error
  if checkout.unpushed === 0: return false
  if checkout.issues includes "no remote": return false
  return true
```

### Function: pushCheckout(ctx, checkout)

**Responsibility:** Push a checkout's branch to origin. Creates the branch on the remote when it has no upstream (`remoteBranch` null).

```pseudo
pushCheckout(ctx, checkout)
  try:
    git push origin checkout.branch in dir
    updated = { ...checkout, unpushed: 0, issues: issues minus "N commits ahead" }
    ctx.store.setCheckout(updated)
    ctx.log.log(createPushSuccess(checkout, checkout.branch))
  catch error:
    op = createPushFailure(checkout, checkout.branch, error)
    updated = { ...checkout, issues: issues plus op.message() }
    ctx.store.setCheckout(updated)
    ctx.log.log(op)
```

### Function: hasLocalBranch(dir, branch)

**Responsibility:** Check whether a branch exists locally in a repo.

```pseudo
hasLocalBranch(dir, branch)
  git rev-parse --verify --quiet refs/heads/branch in dir
  return exit code 0
```

### Function: presentCheckoutReport(store)

**Responsibility:** Present the Checkout Report ordered by repo name.

```pseudo
presentCheckoutReport(store)
  checkouts = store.getAllCheckouts()
  checkouts.sort(by repo name)
  print "Checkout Report:"
  print table (repo, location, branch, states)   // states = issues.join("; ") or "clean"
  print ""                                       // empty line after the table
```

### Function: presentOperationsReport(log)

**Responsibility:** Present the Operations Report. Omitted when no operations occurred.

```pseudo
presentOperationsReport(log)
  operations = log.all()
  if operations is empty:
    return

  print "Operations Report:"
  print table ('', repo, operation, message)   // '' = outcome marker: 🟢 success / 🔴 failure
  print ""
```

### Function: presentExtraneousReport(store)

**Responsibility:** Present the Extraneous Report. Omitted when none found.

```pseudo
presentExtraneousReport(store)
  extraneous = store.getExtraneous()
  if extraneous is empty:
    return

  print "Extraneous Report:"
  print table (directory, branch, states)   // directory = record.location, branch = record.branch
  print ""
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
