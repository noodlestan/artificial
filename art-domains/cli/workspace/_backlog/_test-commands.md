# Workspace CLI Test Commands

Test scenarios: delete checkouts and clone all, clone specific repos, dirty file detection, custom locations, checkout record recreation, extraneous checkout detection, branch/unpushed detection, auto-push, extraneous detection works, location overrides work, unpushed detection handles repos without tracking branches.

## Prerequisites

- Both repos (ops-workspace and artificial) must be pushed to remote
- All changes committed

## Test 1: Delete checkouts, clone all again

```bash
# Delete all checkouts
rm -rf repos/artificial repos/purrception repos/purrtrait repos/purrpose repos/no-comply repos/workspace-tooling

# Clone all repos
npm run workspace -- clone --all

# Verify all repos are cloned
ls -la repos/

# Run sanity to verify status
npm run workspace:sanity
```

## Test 2: Delete checkout, clone specific repo

```bash
# Delete artificial checkout
rm -rf repos/artificial

# Clone only artificial
npm run workspace -- clone artificial

# Verify it's cloned
ls -la repos/artificial

# Run sanity
npm run workspace:sanity
```

## Test 3: Clone same repo again (should report exists)

```bash
# Clone artificial again (already exists)
npm run workspace -- clone artificial

# Should report "All repos are green" or show current status
npm run workspace:sanity
```

## Test 4: Add dirty file, clone should report dirty

```bash
# Add a dirty file to artificial
echo "test" > repos/artificial/dirty.txt

# Clone artificial again
npm run workspace -- clone artificial

# Should report "uncommitted files"
npm run workspace:sanity

# Clean up
rm repos/artificial/dirty.txt
```

## Test 5: Compare clone status with sanity

```bash
# Run clone without arguments (status mode)
npm run workspace -- clone

# Run sanity
npm run workspace:sanity

# Both should show similar output
```

## Test 6: Clone to custom location

```bash
# Clone purrception to custom location
npm run workspace -- clone purrception custom/purrception-test

# Verify it's cloned to custom location
ls -la custom/purrception-test

# Check if checkout record was created/updated
cat _records/checkouts/purrception.art

# Run sanity to see both locations
npm run workspace:sanity

# Clean up
rm -rf custom/purrception-test
```

## Test 7: Delete all checkout records, clone all should recreate them

```bash
# Delete all checkout records
rm -rf _records/checkouts/*.art

# Clone all repos
npm run workspace -- clone --all

# Verify checkout records were recreated
ls -la _records/checkouts/

# Run sanity
npm run workspace:sanity
```

## Test 8: Micro-change in repo, clone and sanity report dirty

```bash
# Make a micro-change in purrception
echo "// test" >> repos/purrception/README.md

# Clone purrception
npm run workspace -- clone purrception

# Should report "uncommitted files"
npm run workspace:sanity

# Clean up
git -C repos/purrception checkout README.md
```

## Test 9: Branch manually, commit, clone and sanity report unpushed

```bash
# Branch purrception to tmp-branch
cd repos/purrception
git checkout -b tmp-branch

# Make a change and commit
echo "// micro change" >> README.md
git add README.md
git commit -m "test: micro change"

# Go back to workspace root
cd ../..

# Clone purrception
npm run workspace -- clone purrception

# Should report current branch as tmp-branch and "not pushed"
npm run workspace:sanity

# Test auto-push
npm run workspace -- sanity --auto

# Should now show "pushed? = now"
npm run workspace:sanity

# Clean up: switch back to main and delete tmp-branch
cd repos/purrception
git checkout main
git branch -D tmp-branch
cd ../..
```

## Test 10: Extraneous checkout detection

```bash
# Create an extraneous checkout (directory without record)
mkdir -p repos/extraneous-test
cd repos/extraneous-test
git init
git config user.email "test@example.com"
git config user.name "Test"
echo "test" > README.md
git add .
git commit -m "initial"
cd ../..

# Run sanity — should detect extraneous checkout
npm run workspace:sanity

# Clean up
rm -rf repos/extraneous-test
```

## Test 11: Clone status mode (no arguments)

```bash
# Run clone without arguments
npm run workspace -- clone

# Should show status of all checkouts (like sanity)
```

## Test 12: Unknown repo name

```bash
# Try to clone unknown repo
npm run workspace -- clone unknown-repo

# Should error with "unknown repo"
```

## Test 13: Verify extraneous checkouts are marked

```bash
# Create extraneous directory
mkdir -p repos/test-extraneous
cd repos/test-extraneous
git init
git config user.email "test@example.com"
git config user.name "Test"
echo "test" > README.md
git add .
git commit -m "initial"
cd ../..

# Run sanity
npm run workspace:sanity

# Should show "test-extraneous (extraneous)" in the output

# Clean up
rm -rf repos/test-extraneous
```

## Cleanup Commands

```bash
# Reset all repos to clean state
cd repos/artificial && git checkout main && git clean -fd && cd ../..
cd repos/purrception && git checkout main && git clean -fd && cd ../..
# ... repeat for other repos

# Remove any test artifacts
rm -rf custom/
rm -f repos/*/dirty.txt
```
