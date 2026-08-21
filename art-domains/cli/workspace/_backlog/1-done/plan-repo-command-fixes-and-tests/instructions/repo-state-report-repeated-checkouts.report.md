# Report: avoid repeated repository reports for multiple checkouts

**Plan:** `plan-repo-command-fixes-and-tests`

**Commit.id:** `repo-state-report-repeated-checkouts`

**Commit:** `9c6c6c5` (pushed to `discover-records`)

## Root Cause

In `runRepo.ts`, package states were keyed by `checkout.record.name`:

```ts
allPackageStates.set(checkout.record.name, packageStates);
```

When multiple checkouts of the same repository exist (e.g., "Artificial @ main" and "Artificial @ bug-fixes"), the second checkout's packages overwrote the first's because `checkout.record.name` can be the same or collide for checkouts of the same repo. Additionally, presentation was split into two separate loops — all repository states first, then all package states — breaking the association between a checkout's repository report and its package report.

## Fix

1. Keyed all state maps by `checkout.record.location` (a stable unique identifier per checkout) instead of `checkout.record.name`.
2. Replaced flat arrays with Maps: `repositoryCheckoutStates` and `repositoryCheckoutPackages`.
3. Merged the two presentation loops into a single loop that presents each checkout's repository state followed immediately by its package states.
4. Extracted package traversal into `getRepositoryCheckoutPackages`, `createPackageStateRecord`, and `scanPackageStateRecord` in `src/private/repositories/`.

## Changed Files

| File                                                        | Change                                              |
| ----------------------------------------------------------- | --------------------------------------------------- |
| `src/commands/repo/runRepo.ts`                              | Key by location; use Maps; single presentation loop |
| `src/commands/repo/runRepo.test.ts`                         | Added regression test for two checkouts of one repo |
| `src/private/repositories/getRepositoryCheckoutPackages.ts` | New — extracts graph traversal                      |
| `src/private/repositories/createPackageStateRecord.ts`      | New — creates PackageStateRecord from graph data    |
| `src/private/repositories/scanPackageStateRecord.ts`        | New — populates version and published version       |

## Verification

```bash
npm run test -- runRepo.test   # 10/10 passed
npm run lint                    # clean
npm run build                   # clean
npm run test                    # 227/227 passed
```

## Fixture Details

The regression test creates two checkouts of one repository:

- `artificial` (name: "Artificial", location: "artificial")
- `artificial-bug-fixes` (name: "Artificial @ bug-fixes", location: "artificial-bug-fixes")

Each checkout has its own project/namespace/package records and distinct package versions (1.0.0 vs 2.0.0). The test asserts both versions appear in the output, confirming packages are not collapsed or overwritten.

## Follow-ups

- The `repo-identify-checkout` bug (looking up checkouts by location string) remains unfixed — it's a separate iteration.
- Consider a typed `CheckoutReportSection` structure to prevent mismatched state maps.
- Consider a dedicated report assembler so presentation ordering is independently testable.
