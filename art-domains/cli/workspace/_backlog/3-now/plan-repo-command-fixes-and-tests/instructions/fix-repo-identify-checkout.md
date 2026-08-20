# Instructions: fix repo command checkout identification

**Plan:** `plan-repo-command-fixes-and-tests`

**Commit.id:** `fix-repo-identify-checkout`

**Commit.message:** `fix(workspace-cli): repo command does not find checkout by location`

## Before you Start

::switch `agent-worker` — execute this instruction in worker mode.

These instructions are self-contained. Use `plan__bugs.md` for the full bug record; do not duplicate or rewrite its evidence in the report.

## Path Variables

| Variable   | Resolved Path                        | Purpose                     |
| ---------- | ------------------------------------ | --------------------------- |
| `$PROJECT` | Provided project checkout            | Artificial repository root. |
| `$PACKAGE` | `$PROJECT/art-domains/cli/workspace` | Workspace CLI package.      |

## Working Agreements

1. Keep this instruction and its report self-contained.
2. Work only on this bug and its regression coverage.
3. Do not commit or push without explicit approval.

## Goals

Make `repo <location>` resolve a recorded checkout by filesystem location as well as by checkout name, without changing unknown-checkout behavior.

## Mandatory Reading

- `$PACKAGE/_backlog/3-now/plan-repo-command-fixes-and-tests/plan__bugs.md`
- `$PACKAGE/src/commands/repo/runRepo.ts`
- `$PACKAGE/src/private/store/`
- `$PACKAGE/src/private/resources/`
- `$PACKAGE/src/commands/repo/runRepo.test.ts`

## Setup

From `$WORKSPACE/`:

```bash
npm ci
```

## Changes

### Step 1 — Confirm the root cause

1. Follow `runRepo` from its command argument to `checkoutNames`.
2. Confirm the current lookup calls `ctx.store.getCheckoutByName(name)` only.
3. Reproduce the bug with a checkout whose record name differs from its location, such as `Artificial @ bug-fixes` at `artificial-bug-fixes`.
4. Verify the name succeeds while the location produces `unknown checkout`.

### Step 2 — Apply the fix

1. Add or use a store lookup that resolves the input against checkout location, preserving exact name lookup.
2. Define precedence clearly when an input could match both a name and a location.
3. Keep unknown values as warnings/failures with the existing message contract.
4. Add focused tests for name lookup, location lookup, unknown lookup, and a location containing the configured checkout path only when that is part of the public input contract.

### Step 3 — Follow-up improvements

- Consider extracting input resolution into a named helper with a focused unit test.
- Document accepted `repo` identifiers in command architecture if location lookup becomes public behavior.

## Verification

Run focused verification before the full suite:

```bash
npm run test -- runRepo.test
```

From `$PACKAGE/`:

```bash
npm run lint:fix
npm run lint
npm run build
npm run test
```

## Final Verification

Confirm name and location inputs produce the same Repository and Package State Reports, unknown inputs remain explicit, and no unrelated command behavior changes.

## How to Report Back

Render a report beside this instruction containing changed files, root-cause evidence, tests, verification results, and follow-up suggestions. Report a blocker instead if the bug cannot be reproduced or fixed.
