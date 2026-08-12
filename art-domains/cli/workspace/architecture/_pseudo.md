# Pseudo: Workspace CLI

Mostly useful for prototyping data structures or interactions (but these are detailed in `architecture/{topic}.md` files once settled) and for defining expectations (BDD) and logic (pseudo) for use cases. Zero real code — bodies prescribe what to do, not how to implement.

## Entry Point

### Function: main()

**Responsibility:** Parse CLI arguments and route to the appropriate command handler.

```pseudo
main
  parse args with commander
  route to: clone | branch | link | sanity | publish
```

## Data Structures

Detailed definitions live in `architecture/context-model.md`. Symbols relevant to the use cases below:

- **WorkspaceContext** — single object passed to all routines: `config`, `root`, `store`, `log`
- **CheckoutStore** — in-memory checkout state: `addCheckout`, `loadExistingCheckouts`, `findCheckout` (case-insensitive), `setCheckout`, `getAllCheckouts`, `markExtraneous`, `syncRecords`
- **Checkout** — per-repo state: `repo`, `record` (name/location/branch), `exists`, `branch`, `remoteBranch`, `dirty`, `unpushed`, `issues`, `extraneous`
- **Records** — `WorkspaceRecord`, `RepositoryRecord`, `CheckoutRecord` (structure files in `.agents/domains/workspace/structures/`)

## Operation Logs

Detailed definitions live in `architecture/operations-log.md`. Symbols relevant to the use cases below:

- **OperationsLog** — append-only: `log(operation)`, `all()`, `since(ts)`, `latest(n)`
- **Operation** — `operation` kind, `ts`, `checkout`, `outcome` (success/failure), `message()`
- **Kinds** — `clone`, `push`, `publish`, `branch created`, `linked`, `unlink`
- **Factories** — one per kind in `src/private/operations/`: `createCloneSuccess`, `createPushSuccess`, `createPushFailure`, `createBranchSuccess`, `createBranchFailure`, etc.

## Reports

Detailed definitions live in `architecture/reports.md`. Symbols relevant to the use cases below:

- **Checkout Report** — `repo | location | branch | states`; presented after every command that reads or mutates checkouts
- **Operations Report** — `🟢/🔴 | repo | operation | message`; appended when side effects occurred
- **Extraneous Report** — `directory | branch | states`; directories under checkouts path with no matching record

## Use Cases

### Command: clone [--all] [name] [location]

**Responsibility (clone --all):** Bootstrap workspace by cloning all repos, updating records, and presenting the Checkout Report with Operations Report.

**Responsibility (clone <repo>):** Clone a single repo. The first argument is the repository name (manifest lookup). The optional second argument is a location basename under the config checkouts path. The checkout name is the location basename (or the repo name when no location is given). Multiple checkouts of the same repo are supported.

**Responsibility (clone, no args):** Present the Checkout Report and Extraneous Report without cloning.

### Command: branch <branch> [<checkoutNames...>]

**Responsibility:** Create and checkout a feature branch across multiple checkouts (all checkouts when none specified), update checkout records and present Checkout Report + Operations Report.

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

### Command: publish [--auto]

**Responsibility:** Push repos and publish packages to npm. Present Checkout Report + Operations Report.

**Pseudo:**

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

**Pseudo:**

```pseudo
scanCheckout(ctx, checkout)
  dir = join(ctx.root, checkout.record.location)

  if not dirExists(dir):
    updated = { ...checkout, exists: false, issues: ["no checkout"] }
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

  if checkout.repo.remote === '':
    issues.unshift("unknown project")

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

**Pseudo:**

```pseudo
scanAllCheckouts(ctx)
  for checkout in ctx.store.getAllCheckouts():
    scanCheckout(ctx, checkout)
```

### Function: scanExtraneousCheckouts(ctx)

**Responsibility:** Scan for extraneous (non-record based) checkouts under config.clone.path.

**Pseudo:**

```pseudo
scanExtraneousCheckouts(ctx)
  checkoutsPath = join(ctx.root, ctx.config.clone.path)
  recordedLocations = ctx.store.getAllCheckouts().map(c => c.location)

  for dir in listDirectories(checkoutsPath):
    location = relative(ctx.root, dir)
    if location not in recordedLocations:
      checkout = ctx.store.markExtraneous(location)
      scanCheckout(ctx, checkout)
```

### Function: shouldPushCheckout(checkout)

**Responsibility:** Decide whether a checkout should be pushed by `sanity --auto`.

**Pseudo:**

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

**Pseudo:**

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

**Pseudo:**

```pseudo
hasLocalBranch(dir, branch)
  git rev-parse --verify --quiet refs/heads/branch in dir
  return exit code 0
```

### Function: presentCheckoutReport(store)

**Responsibility:** Present the Checkout Report ordered by repo name.

**Pseudo:**

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

**Pseudo:**

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

**Pseudo:**

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

**Pseudo:**

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

**Pseudo:**

```pseudo
loadRepositories(ctx)
  scan ctx.config.records.repositories.path
  parse each .art file
  return list of RepositoryRecord
```

### Function: loadCheckouts(ctx)

**Responsibility:** Read all checkout records from the checkouts directory.

**Pseudo:**

```pseudo
loadCheckouts(ctx)
  scan ctx.config.records.checkouts.path
  parse each .art file
  return list of CheckoutRecord
```

### Function: cloneRepo(location, remote)

**Responsibility:** Clone a git repository to the specified location.

**Pseudo:**

```pseudo
cloneRepo(location, remote)
  git clone remote location
```

### Function: defaultLocation(repo)

**Responsibility:** Compute the default checkout location for a repository.

**Pseudo:**

```pseudo
defaultLocation(repo)
  return "repos/" + repo.name
```
