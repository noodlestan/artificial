# Sub-Agent REPORT (#producer)

**Plan:** `fix-reported-bugs`

**Instruction Id:** `fix-clone-custom-location-wrong-name`

**Outcome:** `COMPLETED`

## Evidence

### Changes

Fixed checkout name and path computation for custom location clones. The `createCheckout` default name was missing a space before `@` (`' @'target` → `' @ ' + target`), and existing tests encoded this buggy behavior.

#### Files changed

| File                                            | Change                                                                                                                                                          |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/private/store/createCheckout.ts`           | Fixed default name: `r?.name + ' @' + target` → `r?.name + ' @ ' + target`                                                                                      |
| `src/private/store/createCheckout.test.ts`      | Updated 2 test expectations to use `'Foo Bar @ fix-test'` (with space)                                                                                          |
| `src/private/store/createCheckoutStore.test.ts` | Updated 2 test expectations to use `'Foo Bar @ fix-test'` (with space)                                                                                          |
| `src/commands/clone/cloneSpecific.test.ts`      | Added 2 new tests: custom location clone uses correct name `Foo @ bar` at path `repos/foo-bar`; default location clone uses repo name `Foo` at path `repos/foo` |

### Verification

- Build: green (`npm run build`)
- Tests: 200/200 passed (`npm run test`)

## Blockers (if any)

None.

## Feedback

### For the planner

No issues. Instruction was clear and self-contained.

### For the technical writers

No issues.

### For the crew

No issues.
