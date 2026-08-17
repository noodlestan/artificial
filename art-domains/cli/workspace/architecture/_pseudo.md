# Pseudo: Workspace CLI

Mostly useful for prototyping data structures or interactions (but these are detailed in `architecture/{topic}.md` files once settled) and for defining expectations (BDD) and logic (pseudo) for use cases. Zero real code — bodies prescribe what to do, not how to implement.

## Entry Point

### Function: main()

**Responsibility:** Parse CLI arguments and route to the appropriate command handler.

```pseudo
main
  parse args with commander
  route to: clone | branch | repo | link | links | unlink | sanity | pull | push | sync | publish
```

## Data Structures

Detailed definitions live in `architecture/context-model.md`. Symbols relevant to the use cases below:

- **WorkspaceContext** — single object passed to all routines: `config`, `store`, `log`
- **CheckoutStore** — in-memory checkout identity: `addCheckout`, `getCheckoutForLocation`, `getCheckoutOfRepo`, `getCheckoutByName`, `updateCheckout`, `getAllCheckouts`
- **Checkout** — per-repo identity: `repo?`, `record` (name/location/branch/repository), `path`, and optional computed `scan` state
- **Records** — `WorkspaceRecord`, `RepositoryRecord`, `CheckoutRecord` (structure files in `.agents/domains/workspace/structures/`)

Every command starts by loading records into the store:

```pseudo
hydrate(ctx)
  repos = loadRepositoryRecords(ctx.config)
  records = loadCheckoutRecords(ctx.config, repos)
  hydrateStoreFromRecords(ctx.config, ctx.store, records)
```

## Operation Logs

Detailed definitions live in `architecture/operations-log.md`. Symbols relevant to the use cases below:

- **OperationsLog** — append-only: `log(operation)`, `all()`, `since(ts)`, `latest(n)`
- **Operation** — `operation` kind, `ts`, `checkout`, `outcome` (success/failure), `message()`
- **Kinds** — `clone`, `push`, `pull`, `publish`, `branch created`, `linked`, `unlink`
- **Factories** — one per kind in `src/private/operations/`: `createCloneSuccess`, `createPushSuccess`, `createPushFailure`, `createPullSuccess`, `createPullFailure`, `createBranchSuccess`, `createBranchFailure`, `createLinkedSuccess`, `createLinkedFailure`, `createUnlinkSuccess`, `createUnlinkFailure`, etc. Read-only commands (`repo`, `links`) never log operations — their failures surface as report states.

## Reports

Detailed definitions live in `architecture/reports.md`. Symbols relevant to the use cases below:

- **Workspace Report** — `repo | location | branch | states`; header `Workspace:`; presents workspace root status (1 row only); states = `issues.join("; ")` or `-`; presented after every command that reads or mutates checkouts
- **Checkout Report** — `repo | location | branch | states`; header `Checkouts:`; states = `issues.join("; ")` or `-`; presented after every command that reads or mutates checkouts
- **Operations Report** — `🟢/🔴 | repo | operation | message`; header `Operations Report:`; appended when side effects occurred
- **Extraneous Report** — `directory | branch | states`; header `Untracked:`; states = `issues.join("; ")` or `clean`; directories under the checkouts path with no matching record

## Use Cases

### Command: clone [--all] [name] [location]

**Responsibility (clone --all):** Bootstrap workspace by cloning all repos, updating records, and presenting the Checkout Report with Operations Report.

**Responsibility (clone <repo>):** Clone a single repo. The first argument is the repository name (manifest lookup, case-insensitive, `@scope/` prefix stripped). The optional second argument is a location basename under the config checkouts path. The checkout name is `<repo> @ <location>` when a location is given, otherwise the repo name. Multiple checkouts of the same repo are supported. Refuses when the target location is already used by another checkout.

**Responsibility (clone, no args):** Present the Checkout Report and Extraneous Report without cloning.

**Pseudo:**

```pseudo
clone(options)                            // { all, repoName, checkoutInput }
  ctx = createWorkspaceContext(config, store, log)
  hydrate(ctx)

  if options.all: cloneAll(ctx, repos)
  else if options.repoName: cloneSpecific(ctx, repos, options.repoName, options.checkoutInput)
  else: cloneStatus(ctx)

  presentCheckoutReport(ctx.config, ctx.store.getAllCheckouts())
  presentOperationsReport(ctx.log)

cloneAll(ctx, repos)
  for repo in repos:
    if not ctx.store.getCheckoutOfRepo(repo.name):
      checkout = createCheckout(ctx.config, repo.name, repo)
      ctx.store.addCheckout(checkout)

  for checkout in ctx.store.getAllCheckouts():
    cloneIfMissing(ctx, checkout)

cloneSpecific(ctx, repos, repoName, checkoutInput)
  canonical = repoName without "@scope/" prefix
  repo = repos.find(r => r.name.toLowerCase() === canonical.toLowerCase())
  if not repo:
    ctx.log.log(createCloneFailure(undefined, `unknown repo "${repoName}"`))
    return

  location = createCheckoutLocation(repo, checkoutInput)

  elsewhere = ctx.store.getCheckoutOfRepo(repo.name)
  if elsewhere and elsewhere.record.location !== location:
    msg = `checkout for '${repo.name}' exists at ${elsewhere.record.location}. Cannot clone to ${location}.`
    ctx.log.log(createCloneFailure(elsewhere, msg))
    return

  existing = ctx.store.getCheckoutForLocation(location)
  if existing and existing.repo?.name !== repo.name:
    msg = `location ${location} is already used by checkout '${existing.record.name}'.`
    ctx.log.log(createCloneFailure(existing, msg))
    return

  if not existing:
    name = checkoutInput ? `${repo.name} @ ${checkoutInput}` : repo.name
    checkout = createCheckout(ctx.config, location, repo, "main", name)
    ctx.store.addCheckout(checkout)
    saveCheckoutRecord(ctx.config, checkout.record.name, checkout.record)

  cloneIfMissing(ctx, checkout)
  scanCheckoutState(checkout)

cloneStatus(ctx)
  scanAllCheckoutsStates(ctx.store)
  presentCheckoutReport(ctx.config, ctx.store.getAllCheckouts())
```

### Command: branch <branch> [<checkout-location...>]

**Responsibility:** Create and checkout a feature branch across multiple checkouts (all checkouts when none specified), update checkout records and present Checkout Report + Operations Report. The optional arguments are checkout locations (basenames under the checkouts path).

**Pseudo:**

```pseudo
branch(branch, checkoutLocations)
  ctx = createWorkspaceContext(config, store, log)
  hydrate(ctx)

  locations = checkoutLocations non-empty
    ? checkoutLocations
    : ctx.store.getAllCheckouts().map(c => c.record.location)

  for location in locations:
    checkout = ctx.store.getCheckoutForLocation(location)
    if not checkout:
      ctx.log.log(createBranchFailure(branch, "not cloned", checkout))
      continue

    checkout = scanCheckoutState(checkout)
    if not checkout.exists:
      ctx.log.log(createBranchFailure(branch, "checkout not cloned", checkout))
      continue

    try:
      outcome = createOrSwitchBranch(checkout.path, branch)      // "created" | "switched"
      ctx.log.log(createBranchSuccess(checkout, branch, outcome === "created" ? `created ${branch}` : `switched to ${branch}`))

      updated = { ...checkout, record: { ...checkout.record, branch } }
      ctx.store.updateCheckout(updated)
      scanned = scanCheckoutState(updated)
      saveCheckoutRecord(ctx.config, scanned.record.name, scanned.record)
    catch error:
      ctx.log.log(createBranchFailure(branch, error, checkout))
      continue

  presentCheckoutReport(ctx.config, ctx.store.getAllCheckouts())
  presentOperationsReport(ctx.log)
```

### Command: repo [<checkoutNames...>]

**Responsibility:** List the packages of active checkouts (all checkouts when none specified). Read each checkout's project records — project first, then namespaces, then packages — resolve each package's `package.json` (current version) and query `npm info` (published version). Present Checkout Report + Package State Report.

**Pseudo:**

```pseudo
repo(checkoutNames)
  ctx = createWorkspaceContext(config, store, log)
  hydrate(ctx)

  if checkoutNames is empty:
    targets = ctx.store.getAllCheckouts()
  else:
    targets = []
    for name in checkoutNames:
      checkout = resolveCheckoutByName(ctx.store, name)
      if not checkout:
        warn "unknown checkout: {name}"
        continue
      targets.push(checkout)

  for checkout in targets:
    projects = readProjectRecords(ctx, checkout)
    if projects is empty:
      updated = { ...checkout, issues: [...checkout.issues, "no project records"] }
      ctx.store.updateCheckout(updated)
      continue

    packageStates = []
    for project in projects:
      for ns in project.namespaces:
        for pkg in ns.packages:
          pkgPath = join(checkout.path, project.path, ns.path, pkg.path)
          version = readPackageVersion(join(pkgPath, "package.json"))   // null if missing
          if version is null:
            altPath = join(checkout.path, project.path, pkg.path)       // try without namespace
            version = readPackageVersion(join(altPath, "package.json"))
            if version is not null: pkgPath = altPath
          states = []
          if version is null:
            states.push("no package.json")
            published = null
          else if version === "0.0.0":
            published = null                                            // skip npm info for unpublished marker
          else:
            published = npmInfo(pkg.canonicalName)                      // try/catch -> null, suppress stderr
            if published is null: published = "unknown"                 // don't add to states
          packageStates.push({
            canonicalName: pkg.canonicalName, version, published,
            branch: checkout.record.branch, directory: pkgPath, states
          })

    presentCheckoutReport(ctx.config, ctx.store.getAllCheckouts())
    presentPackageStateReport(checkout, packageStates)
```

### Function: resolveCheckoutByName(store, input)

**Responsibility:** Resolve a checkout by name, handling multiple input formats (exact name, "Repository:" prefix, slug format, location). Returns the matching checkout or null.

**Pseudo:**

```pseudo
resolveCheckoutByName(store, input)
  checkout = store.getCheckoutByName(input)
  if checkout: return checkout

  normalized = input.replace(/^Repository:\s*/i, '').trim()
  if normalized !== input:
    checkout = store.getCheckoutByName(normalized)
    if checkout: return checkout

  slug = normalized.toLowerCase().replace(/\s+/g, '-')
  checkout = store.getCheckoutByName(slug)
  if checkout: return checkout

  checkout = store.getCheckoutForLocation(slug)
  if checkout: return checkout

  return null
```

### Command: link <location> <package> [<target>]

**Responsibility:** Symlink a source package from a repo checkout location into a target location's `node_modules` for local development. The `<location>` and `<target>` params are both checkout locations and must resolve to existing checkouts. If `<target>` is omitted, the link is created in root workspace `node_modules/`. Present Operations Report.

**Pseudo:**

```pseudo
link(location, package, target)
  ctx = createWorkspaceContext(config, store, log)
  hydrate(ctx)

  sourceCheckout = ctx.store.getCheckoutForLocation(location)
  if not sourceCheckout:
    ctx.log.log(createLinkedFailure(undefined, package, "unknown location " + location))
    presentOperationsReport(ctx.log)
    return

  projects = readProjectRecords(ctx, sourceCheckout)
  pkg = findPackage(projects, package)          // search by canonicalName, then by name
  if not pkg:
    ctx.log.log(createLinkedFailure(sourceCheckout, package, "unknown package"))
    presentOperationsReport(ctx.log)
    return

  pkgPath = join(sourceCheckout.path, pkg.projectPath, pkg.namespacePath, pkg.path)
  targetCheckout = target ? ctx.store.getCheckoutForLocation(target) : null
  targetDir = targetCheckout ? targetCheckout.path : join(ctx.config.root.path, "node_modules")
  linkTarget = join(targetDir, "node_modules", pkg.canonicalName)
  ensureDir(dirname(linkTarget))                // scoped names need @scope dir
  rm -rf linkTarget                              // replace existing symlink or npm-installed dir
  ln -s pkgPath linkTarget

  ctx.log.log(createLinkedSuccess(sourceCheckout, pkg.canonicalName, linkTarget))
  presentOperationsReport(ctx.log)
```

### Command: links

**Responsibility:** Show symlink sources. Scan the workspace root `node_modules` and every known repository project's `node_modules` (project records at `{checkout}/ops/records/projects`). Collect symlinks — including scoped `@scope/pkg` subdirectories. Present the Symlink Report. Read-only: no operations are logged.

**Pseudo:**

```pseudo
links()
  ctx = createWorkspaceContext(config, store, log)
  hydrate(ctx)

  links = scanNodeModules(join(ctx.config.root.path, "node_modules"), "workspace root")

  for checkout in ctx.store.getAllCheckouts():
    projects = readProjectRecords(ctx, checkout)
    if projects is empty:
      warn "no project records for {checkout.record.name}"
      continue
    for project in projects:
      dir = join(checkout.path, project.path, "node_modules")
      links += scanNodeModules(dir, checkout.record.location)

  presentSymlinkReport(links)

scanNodeModules(dir, location)
  result = []
  if not dirExists(dir): return result
  for entry in listDirectories(dir):
    entryPath = join(dir, entry)
    if entry starts with "@":
      for sub in listDirectories(entryPath):
        if isSymlink(join(entryPath, sub)):
          result.push({ package: "@" + entry + "/" + sub, location })
    else if isSymlink(entryPath):
      result.push({ package: entry, location })
  return result
```

### Command: unlink <location> <package> [<target>]

**Responsibility:** Remove a package symlink created by `link` and restore the published version with `npm install`. Params mirror `link`. Present Operations Report.

**Pseudo:**

```pseudo
unlink(location, package, target)
  ctx = createWorkspaceContext(config, store, log)
  hydrate(ctx)

  sourceCheckout = ctx.store.getCheckoutForLocation(location)
  if not sourceCheckout:
    ctx.log.log(createUnlinkFailure(undefined, package, "unknown location " + location))
    presentOperationsReport(ctx.log)
    return

  projects = readProjectRecords(ctx, sourceCheckout)
  pkg = findPackage(projects, package)
  if not pkg:
    ctx.log.log(createUnlinkFailure(sourceCheckout, package, "unknown package"))
    presentOperationsReport(ctx.log)
    return

  targetCheckout = target ? ctx.store.getCheckoutForLocation(target) : null
  targetDir = targetCheckout ? targetCheckout.path : join(ctx.config.root.path, "node_modules")
  linkTarget = join(targetDir, "node_modules", pkg.canonicalName)

  if not isSymlink(linkTarget):
    return                                    // npm-installed or absent — nothing to remove

  rm linkTarget
  npm install in targetDir
  ctx.log.log(createUnlinkSuccess(sourceCheckout, pkg.canonicalName, linkTarget))
  presentOperationsReport(ctx.log)
```

### Command: pull

**Responsibility:** Pull from origin for all clean checkouts. No arguments — acts only on clean branches. Present Checkout Report + Operations Report.

**Pseudo:**

```pseudo
pull()
  ctx = createWorkspaceContext(config, store, log)
  hydrate(ctx)
  scanAllCheckoutsStates(ctx.store)

  for checkout in ctx.store.getAllCheckouts():
    if isCleanCheckout(checkout) and checkout.isBehind:
      doPullCheckout(ctx, checkout)

  presentCheckoutReport(ctx.config, ctx.store.getAllCheckouts())
  presentOperationsReport(ctx.log)
```

### Command: push

**Responsibility:** Push to origin for all clean checkouts. No arguments — acts only on clean branches. Try pull first if behind. Present Checkout Report + Operations Report.

**Pseudo:**

```pseudo
push()
  ctx = createWorkspaceContext(config, store, log)
  hydrate(ctx)
  scanAllCheckoutsStates(ctx.store)

  for checkout in ctx.store.getAllCheckouts():
    if isCleanCheckout(checkout) and checkout.unpushed > 0:
      if checkout.isBehind:
        doPullCheckout(ctx, checkout)
      pushCheckout(ctx, checkout)

  presentCheckoutReport(ctx.config, ctx.store.getAllCheckouts())
  presentOperationsReport(ctx.log)
```

### Command: sync

**Responsibility:** Sync all clean checkouts — pull then push regardless of captured states. No arguments — acts only on clean branches. Present Checkout Report + Operations Report.

**Pseudo:**

```pseudo
sync()
  ctx = createWorkspaceContext(config, store, log)
  hydrate(ctx)
  scanAllCheckoutsStates(ctx.store)

  for checkout in ctx.store.getAllCheckouts():
    if isCleanCheckout(checkout):
      doPullCheckout(ctx, checkout)
      pushCheckout(ctx, checkout)

  presentCheckoutReport(ctx.config, ctx.store.getAllCheckouts())
  presentOperationsReport(ctx.log)
```

### Command: publish [--auto]

**Responsibility:** Push repos and publish packages to npm. Present Checkout Report + Operations Report. Records are updated by the commands themselves via `saveCheckoutRecord`; there is no global records sync step.

**Pseudo:**

```pseudo
publish(auto)
  ctx = createWorkspaceContext(config, store, log)
  hydrate(ctx)
  scanAllCheckoutsStates(ctx.store)

  for checkout in ctx.store.getAllCheckouts():
    // Push if clean, has remote, unpushed > 0
    if auto and shouldPushCheckout(checkout):
      pushCheckout(ctx, checkout)

    // Publish unpublished packages
    projects = readProjectRecords(ctx, checkout)
    for project in projects:
      for ns in project.namespaces:
        for pkg in ns.packages:
          dir = join(checkout.path, project.path, ns.path, pkg.path)
          pkgJson = readPackageJson(join(dir, "package.json"))
          if not pkgJson or pkgJson.private: continue
          published = npmIsPublished(pkg.canonicalName, pkgJson.version)
          if not published and auto:
            npm publish --access public in dir
            ctx.log.log(createPublishSuccess(checkout, pkg.canonicalName, pkgJson.version))

  presentCheckoutReport(ctx.config, ctx.store.getAllCheckouts())
  presentOperationsReport(ctx.log)
```

## Auxiliary Functions

### Function: createWorkspaceContext(config, store, log)

**Responsibility:** Assemble a WorkspaceContext. The store and log are created by the command entry point (see the `src/index.ts` wiring — sanity pattern) because the store needs the config.

```pseudo
createWorkspaceContext(config, store, log)
  return { config, store, log }
```

### Function: createWorkspaceCheckout(config)

**Responsibility:** Build a temporary checkout instance for the workspace root. Never persisted, never merged into the store. Used for workspace status reporting.

```pseudo
createWorkspaceCheckout(config)
  return {
    repo: null,
    record: {
      name: "WORKSPACE",
      location: ".",
      branch: getCurrentBranch(config.root.path),
      repository: null,
    },
    path: config.root.path,
    exists: true, remoteBranch: null, detached: false, conflicts: false,
    dirty: false, hasRemote: false, unpushed: 0, isBehind: false, issues: [], extraneous: false,
  }
```

### Function: isCleanCheckout(checkout)

**Responsibility:** Whether a checkout is clean (no uncommitted changes, no conflicts, not detached).

```pseudo
isCleanCheckout(checkout)
  if not checkout.exists: return false
  if checkout.extraneous: return false
  if checkout.dirty: return false
  if checkout.conflicts: return false
  if checkout.detached: return false
  return true
```

### Function: pullCheckout(checkout)

**Responsibility:** Pull a checkout's branch from origin. Returns a `PullResult` with the updated checkout and success/error status.

```pseudo
pullCheckout(checkout)
  git = simpleGit(checkout.path)
  try:
    git.pull("origin", checkout.record.branch)
    updated = { ...checkout, isBehind: false, issues: checkout.issues.filter(i => not /\d+ commit behind/.test(i)) }
    return { checkout: updated, success: true }
  catch error:
    return { checkout, success: false, error }
```

### Function: createCheckout(config, target, repo?, branch?, name?)

**Responsibility:** Build a checkout instance. `target` is the location; `safePath` normalises it. The absolute `path` is `join(config.root.path, config.clone.path, location)`. Branch defaults to `main`; name defaults to `<repo> @ <target>`.

```pseudo
createCheckout(config, target, repo?, branch?, name?)
  location = safePath(target)
  return {
    repo,
    record: {
      name: name || (repo ? `${repo.name} @ ${target}` : target),
      location,
      branch: branch ?? "main",
      repository: repo?.name,
    },
    path: join(config.root.path, config.clone.path, location),
    exists: false, remoteBranch: null, detached: false, conflicts: false,
    dirty: false, hasRemote: false, unpushed: 0, isBehind: false, issues: [], extraneous: false,
  }
```

### Function: createCheckoutLocation(repo, target?)

**Responsibility:** Compute the checkout location for a repo (with optional location suffix): `safePath(target ? repo.name + " " + target : repo.name)`.

```pseudo
createCheckoutLocation(repo, target?)
  return safePath(target ? repo.name + " " + target : repo.name)
```

### Function: hydrateStoreFromRecords(config, store, records)

**Responsibility:** Turn persisted checkout records into checkout instances and add them to the store. Called by every command after loading records.

```pseudo
hydrateStoreFromRecords(config, store, records)
  for record in records:
    checkout = createCheckout(config, record.checkout.location, record.repo, record.checkout.branch, record.checkout.name)
    store.addCheckout(checkout)
```

### Function: scanCheckoutState(checkout)

**Responsibility:** Read git state from the filesystem and return a new checkout with computed state in `scan`; never mutate `repo`, `record`, or `path`.

**Pseudo:**

```pseudo
scanCheckoutState(checkout)

  // FS layer
  if not dirExists(checkout.path):
    return { ...checkout, scan: createCheckoutNoClonedScan() }

  scan.exists = true

  // Git layer
  try:
    updated.branch = getCurrentBranch(checkout.path)
    updated.detached = isDetachedHead(checkout.path)
    updated.conflicts = hasMergeConflicts(checkout.path)
    updated.dirty = isDirty(checkout.path)
    updated.hasRemote = hasRemote(checkout.path)

    hasBranch = updated.branch !== "-" and updated.branch !== "HEAD"
    if updated.hasRemote and hasBranch:
      updated.remoteBranch = getRemoteBranch(checkout.path)
      updated.unpushed = getUnpushedCount(checkout.path, updated.remoteBranch)
      updated.isBehind = getBehindCount(checkout.path, updated.remoteBranch) > 0
  catch:
    updated.issues.push("git error")

  // Issue layer
  if not updated.repo: updated.issues.unshift("unknown project")
  if updated.detached: updated.issues.push("detached HEAD")
  if not updated.detached and updated.branch !== updated.record.branch:
    updated.issues.push("wrong branch")
  if updated.conflicts: updated.issues.push("merge conflicts")
  if not updated.hasRemote: updated.issues.push("no remote")
  if updated.dirty: updated.issues.push("uncommitted files")
  if updated.unpushed > 0:
    updated.issues.push(updated.unpushed === 1 ? "1 commit ahead" : "N commits ahead")
  if updated.isBehind:
    behindCount = getBehindCount(checkout.path, updated.remoteBranch)
    updated.issues.push(behindCount === 1 ? "1 commit behind" : "N commits behind")

  return { ...checkout, scan }
```

### Function: scanAllCheckoutsStates(store)

**Responsibility:** Scan all checkouts in the store (store capability).

**Pseudo:**

```pseudo
scanAllCheckoutsStates(store)
  for checkout in store.getAllCheckouts():
    updated = scanCheckoutState(checkout)
    store.updateCheckout(updated)
```

### Function: scanExtraneousCheckouts(config)

**Responsibility:** Scan for extraneous (non-record based) checkouts under config.clone.path. Returns the extraneous checkouts. Unreadable checkouts path is silently ignored.

**Pseudo:**

```pseudo
scanExtraneousCheckouts(config)
  checkoutsPath = join(config.root.path, config.clone.path)
  result = []

  try:
    for entry in listDirectories(checkoutsPath) where isDirectory:
      location = relative(checkoutsPath, entry)
      checkout = createExtraneousCheckout(config, location)
      scanned = scanCheckoutState(checkout)
      result.push(scanned)
  catch:
    // checkouts path doesn't exist or can't be read

  return result
```

### Function: shouldPushCheckout(checkout)

**Responsibility:** Decide whether a checkout should be pushed by `sanity --auto` / `publish --auto`.

**Pseudo:**

```pseudo
shouldPushCheckout(checkout)
  if not checkout.scan?.exists: return false
  if checkout.scan.issues.some(doesIssueBlockPush): return false
  if checkout.scan.unpushed === 0: return false
  return true
```

### Function: doesIssueBlockPush(issue)

**Responsibility:** Whether an issue prevents pushing.

**Pseudo:**

```pseudo
doesIssueBlockPush(issue)
  return issue includes "uncommitted"
      or issue includes "no remote"
      or issue includes "merge conflicts"
      or issue includes "detached HEAD"
```

### Function: pushCleanCheckouts(ctx)

**Responsibility:** Push every checkout in the store that passes `shouldPushCheckout`. Used by `sanity --auto`.

**Pseudo:**

```pseudo
pushCleanCheckouts(ctx)
  for checkout in ctx.store.getAllCheckouts():
    if not shouldPushCheckout(checkout): continue
    pushCheckout(ctx, checkout)
```

### Function: pushCheckout(ctx, checkout)

**Responsibility:** Push a checkout's branch to origin and clear the "commits ahead" issue on success.

**Pseudo:**

```pseudo
pushCheckout(ctx, checkout)
  git = simpleGit(checkout.path)
  try:
    git push origin checkout.record.branch
    updated = { ...checkout, unpushed: 0, issues: checkout.issues.filter(i => not /\d+ commit/.test(i)) }
    ctx.store.updateCheckout(updated)
    ctx.log.log(createPushSuccess(checkout, checkout.record.branch))
  catch error:
    op = createPushFailure(checkout, checkout.record.branch, error)
    updated = { ...checkout, issues: [...checkout.issues, op.message()] }
    ctx.store.updateCheckout(updated)
    ctx.log.log(op)
```

### Function: hasLocalBranch(dir, branch)

**Responsibility:** Check whether a branch exists locally in a repo.

**Pseudo:**

```pseudo
hasLocalBranch(dir, branch)
  git rev-parse --verify --quiet refs/heads/branch in dir
  return output non-empty (exit code 0)
```

### Function: createOrSwitchBranch(dir, branch)

**Responsibility:** Switch to the branch when it exists locally, otherwise create it.

**Pseudo:**

```pseudo
createOrSwitchBranch(dir, branch)
  git = simpleGit(dir)
  if hasLocalBranch(dir, branch):
    git.checkout(branch)
    return "switched"
  git.checkoutLocalBranch(branch)
  return "created"
```

### Function: cloneIfMissing(ctx, checkout)

**Responsibility:** Clone a checkout when its directory is missing. Returns the rescanned checkout, or null when nothing was cloned (already exists, or no repo known).

**Pseudo:**

```pseudo
cloneIfMissing(ctx, checkout)
  scanned = scanCheckoutState(checkout)
  if scanned.exists: return scanned
  if not scanned.repo: return null

  try:
    git clone scanned.repo.remote scanned.path     // simpleGit("").clone(remote, path)
  catch error:
    ctx.log.log(createCloneFailure(scanned, error))
    return null

  rescan = scanCheckoutState(scanned)
  ctx.log.log(createCloneSuccess(rescan))

  actualBranch = getCurrentBranch(scanned.path)
  saveCheckoutRecord(ctx.config, rescan.record.name, {
    name: rescan.record.name,
    repository: rescan.repo?.name,
    location: rescan.record.location,
    branch: actualBranch || "main",
  })
  return rescan
```

### Function: presentWorkspaceReport(workspace)

**Responsibility:** Present the Workspace Report (1 row only). Always presented before the Checkout Report.

**Pseudo:**

```pseudo
presentWorkspaceReport(workspace)
  if workspace is undefined: return
  print "Workspace:"
  print table (repo, location, branch, states)
    // repo = "-"
    // location = workspace.record.location
    // states = workspace.scan?.issues.join("; ") or "-"
  print ""                                       // empty line after the table
```

### Function: presentCheckoutReport(config, checkouts)

**Responsibility:** Present the Checkout Report ordered by repo name; checkouts without a remote last.

**Pseudo:**

```pseudo
presentCheckoutReport(config, checkouts)
  items = [...checkouts]
  items.sort(no remote last, then by repo name)
  print "Checkouts:"
  print table (repo, location, branch, states)
    // repo = checkout.repo?.name or "-"
    // location = join(config.clone.path, checkout.record.location)
    // states = checkout.scan?.issues.join("; ") or "-"
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
  print table ('', repo, operation, message)
    // '' = outcome marker: 🟢 success / 🔴 failure
    // repo = op.checkout?.repo?.name or "unknown"
  print ""
```

### Function: presentExtraneousReport(extraneous)

**Responsibility:** Present the Extraneous Report. Omitted when none found.

**Pseudo:**

```pseudo
presentExtraneousReport(extraneous)
  if extraneous is empty:
    return

  print "Untracked:"
  print table (directory, branch, states)
    // directory = record.location, branch = record.branch
    // states = scan?.issues.join("; ") or "clean"
  print ""
```

### Function: loadWorkspaceConfig(root)

**Responsibility:** Load and parse the workspace config from `.art-workspace.mts`. Falls back to the default config (with a warning) when the manifest is missing.

**Pseudo:**

```pseudo
loadWorkspaceConfig(root)
  if .art-workspace.mts not exists:
    warn ".art-workspace.mts not found at {root}; Using default config."
    return default config with root.path = root

  bundle with esbuild (ESM, node platform)
  write temp .mjs
  import temp file
  config = imported default
  config.root.path = root
  return config
```

### Function: loadRepositoryRecords(config)

**Responsibility:** Read all repository records from the records directory. Empty when the directory is missing.

**Pseudo:**

```pseudo
loadRepositoryRecords(config)
  dir = join(config.root.path, config.records.repositories.path)
  if not dirExists(dir): return []
  files = list .art files in dir
  return files.map(f => readRepositoryRecord(join(dir, f)))
```

### Function: loadCheckoutRecords(config, repos)

**Responsibility:** Read all checkout records from the checkouts directory and pair them with their repository record (when found). Empty when the directory is missing.

**Pseudo:**

```pseudo
loadCheckoutRecords(config, repos)
  dir = join(config.root.path, config.records.checkouts.path)
  if not dirExists(dir): return []

  records = []
  for file in .art files in dir:
    record = readCheckoutRecord(join(dir, file))
    if not record.name:
      warn "checkout record with empty name, skipped"
      continue
    repo = repos.find(r => r.name === record.repository)
    records.push({ repo, checkout: record })     // repo may be undefined
  return records
```

### Function: saveCheckoutRecord(config, name, record)

**Responsibility:** Write a checkout record as an `.art` file under the checkouts records path, rendering the record template (`{{ name }}`, `{{ repository }}`, `{{ location }}`, `{{ branch }}`). The file name is the record name lowercased with spaces replaced by dashes.

**Pseudo:**

```pseudo
saveCheckoutRecord(config, name, record)
  template = read template at config.records.checkouts.template (or hardcoded default)
  content = render(template, record)
  fileName = join(config.root.path, config.records.checkouts.path, name.toLowerCase().replace(/\s+/g, "-") + ".art")
  if not record.repository: drop the "Repository:" line from content
  mkdir dirname(fileName), recursive
  write file fileName with content
  return fileName
```

### Function: readProjectRecords(ctx, checkout)

**Responsibility:** Read a checkout's project records — project first, then namespaces, then packages — and link them by name. Read-only; mirrors `loadRepositoryRecords`/`loadCheckoutRecords` but for the record kinds living inside the checkout at `ops/records/{projects|namespaces|packages}`.

**Pseudo:**

```pseudo
readProjectRecords(ctx, checkout)
  recordsDir = join(checkout.path, "ops/records")

  projects   = parse each .art in join(recordsDir, "projects")    // ProjectRecord
  namespaces = parse each .art in join(recordsDir, "namespaces")  // ProjectNamespace
  packages   = parse each .art in join(recordsDir, "packages")    // ProjectPackage

  for project in projects:
    project.namespaces = namespaces.filter(ns => project.namespaceNames.includes(ns.name))
    for ns in project.namespaces:
      ns.packages = packages.filter(pkg => ns.packageNames.includes(pkg.name))
      for name in ns.packageNames where not found:
        warn "unknown package: {name}"

    for name in project.namespaceNames where not resolved:
      warn "unknown namespace: {name}"

  return projects
```

### Function: findPackage(projects, package)

**Responsibility:** Locate a package across the checkout's projects by canonical name first, then by plain name. Returns the resolved `ProjectPackage` (with its `project.path` and `namespace.path` context) or null.

**Pseudo:**

```pseudo
findPackage(projects, package)
  for project in projects:
    for ns in project.namespaces:
      for pkg in ns.packages:
        if pkg.canonicalName === package or pkg.name === package:
          return { ...pkg, projectPath: project.path, namespacePath: ns.path }
  return null
```
