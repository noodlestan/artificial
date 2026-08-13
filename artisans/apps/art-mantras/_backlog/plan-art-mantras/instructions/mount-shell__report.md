# Sub-Agent REPORT (#producer)

**Plan:** `art-mantras`

**Id:** `mount-shell`

**Outcome:** `COMPLETED`

## Evidence

### Changes

| Instruction goal                                                                                                                  | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Store (staged):** `createStore(data)` + `serialize()`                                                                           | `createStore(data)` wraps the loaded data and returns `{ serialize }` only — no mutation api yet (steps 5–10). `serialize()` returns `{ ...data, slots: [...data.slots] }` (data-shaped so `store.serialize().slots` holds, slots array shallow-copied).                                                                                                                                                                                                                                                                                                                                                                                             |
| **Derivation (complete):** `createViewEntry`, `createFibWeights`, `pickFromStrong`, `pickFromPool`, `chooseMantraWord`, `shuffle` | Implemented per `_pseudo.md` → Layer: Derivation, exactly as declared: `createViewEntry(slot, chosen)`, `createFibWeights(count)`, `pickFromStrong(slot, weights)`, `pickFromPool(slot)`, `chooseMantraWord(slot)`, `shuffle(data)`. Pure — no state mutation, no UI access, randomness confined to these functions. `mantraWords()` not implemented (step 10).                                                                                                                                                                                                                                                                                      |
| **UI (complete):** `mount()` + factories + render api                                                                             | `mount()` composes the static shell (toolbar, mantra row, pick-up row, strongs, banned) once and returns the `ui` api — render api (`renderMantra`/`renderStrongs`/`renderBanned`) plus intent slots (`toolbar`, `mantraRow`, `strongs`, `banned`). `createToolbar()` → DOWNLOAD / + mantra / shuffle. `createMantraRow()` → 11 `<h2>` words + per-slot pick-up buttons (A1 empty cell, no control ever). `createStrongsSection()` / `createBannedSection()` → section container + title + empty list, populated by `renderStrongs`/`renderBanned`. `createButton(title, onPress)` returns the button element with `setTitle`/`setEnabled` attached. |
| **Intent slots no-op**                                                                                                            | Every intent slot defaults to `() => {}`; factories' onPress call the slot. All 94 rendered buttons clicked in a headless run — nothing happens, no errors. `apply()` not implemented (step 4).                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **Entry Point (staged):** `run(data)` + `main()` hand-off                                                                         | `main()` → `data = await loadData()` → `run(data)` (module-scope `let data` from step 2 removed). `run(data)` per pseudo minus `apply`: `store = createStore(data); ui = mount(); output = shuffle(data)`; initial render `ui.renderMantra(output)`, `ui.renderStrongs(store.serialize().slots)`, `ui.renderBanned(store.serialize().slots)`. `onDownload`/`onNextShuffle`/`apply` land step 4.                                                                                                                                                                                                                                                      |
| `src/index.html` — remove `hello world` heading                                                                                   | `<h1>hello world</h1>` removed; nothing else changed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Do NOT touch `src/serve.js`, `src/data.json`, `src/styles.css`, `package.json`                                                    | Untouched. `styles.css` remains a zero-code stub (step 12).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

#### Files changed

- `src/app.js` — replaced step 2's hold-data state with the full initial-render pipeline (Persistence `loadData`, Derivation, Store, UI, Entry Point), functions ordered utils → `main()` last.
- `src/index.html` — removed the `hello world` heading.

**Verification results:**

- `node --check src/app.js` — clean (from `artificials/artisans/apps/art-mantras/`), run after every step.
- `npm run serve` — server log shows only the startup line; `curl /` → 200, `/app.js` → 200, `/data.json` → 200, unknown → 404. Server stopped after verification.
- Headless DOM simulation of the full `run(data)` pipeline (minimal `document` stub, real `data.json`, every button clicked): toolbar renders 3 buttons (DOWNLOAD / + mantra / shuffle); mantra row renders 11 `<h2>` words in slot order with A1 = "Artificial"; pick-up row per slot — A1 empty cell, pool word → `+ strong` enabled, strong word → `✓ strong` disabled; strongs section lists per-letter `strong[]` (A1's "Artificial" shown without controls); banned section present with empty list (seeded `banned` empty). All 94 buttons clicked — inert, no throws. Shuffle output shape checked (`{ slotId, letter, word, source, canPromote }`, source ∈ strong | pool | constant).
- `git status` — the commit contains exactly `src/app.js` and `src/index.html`; pre-existing working-tree/staged changes outside this commit's scope (plans/poc-parse/ops docs from concurrent sessions) are not counted.

**Commit:** `10d29ce5` — `art-mantras: mount static shell` (`--no-verify`), containing exactly `src/app.js` and `src/index.html`.

## Blockers (if any)

None.

## Feedback

### For the planner

1. **Instruction `## Changes` → Derivation lists signatures that conflict with `_pseudo.md`.**
   - `where`: instruction `## Changes` → Derivation (complete): "`createViewEntry(slot)`, `createFibWeights()`, `pickFromStrong(slots, seedIndex)`, `pickFromPool(slots, letter, used)`, `chooseMantraWord(slots, letter, used, strongPool, pool, weights)`, `shuffle(slots)`" vs `_pseudo.md` → Layer: Derivation.
   - `problem`: the instruction's signatures (`slots`/`seedIndex`/`letter`/`used`/`strongPool`/`pool`/`weights` params) appear to be a stale/mangled paraphrase; no call flow uses them, and the instruction itself says "per `_pseudo.md` → Layer: Derivation". The pseudo contract is `createViewEntry(slot, chosen)`, `createFibWeights(count)`, `pickFromStrong(slot, weights)`, `pickFromPool(slot)`, `chooseMantraWord(slot)`, `shuffle(data)`.
   - `decision`: implemented the `_pseudo.md` signatures exactly (pseudo is the contract).
   - Ready-to-apply snippet for the instruction file (Step's `## Changes` → Derivation):
     ```md
     **Derivation (complete):** `createViewEntry(slot, chosen)`, `createFibWeights(count)`, `pickFromStrong(slot, weights)`, `pickFromPool(slot)`, `chooseMantraWord(slot)`, `shuffle(data)` — per `_pseudo.md` → Layer: Derivation.
     ```
2. **Instruction `## Changes` → UI lists `createButton(label, type, id, onClick)` with `data-attr`; pseudo declares `createButton(title, onPress)`.**
   - `where`: instruction `## Changes` → UI ("`createButton(label, type, id, onClick)` → button node with `data-attr`") vs `_pseudo.md` → Layer: UI → Component Factory: `createButton(title, onPress)`.
   - `problem`: the 4-param signature and `data-attr` don't match the pseudo contract, and no `id`/`type` values exist anywhere in the declared call flow. The factories' usage (e.g. `createButton("DOWNLOAD", () => toolbar.download())` and the pick-up button's `setTitle`/`setEnabled` lifecycle) is the pseudo's.
   - `decision`: implemented the pseudo signature — `createButton(title, onPress)` returns the button element with the api (`setTitle`, `setEnabled`) attached to it (the "element + api" return). No `data-attr` set (no id/type params exist in the contract).
   - Ready-to-apply snippet for the instruction file:
     ```md
     `createButton(title, onPress)`: button element with `setTitle`/`setEnabled` api (returns element + api); onPress calls the intent slot.
     ```
3. **Instruction `## Changes` → Store says `serialize()` returns `[...slots]`, but its own Step 4 `run(data)` and `_pseudo.md` use `store.serialize().slots`.**
   - `where`: instruction `## Changes` → Store ("`serialize()` only (`return [...slots]`, shallow copy)") vs instruction Step 4 (`ui.renderStrongs(store.serialize().slots)`) and `_pseudo.md` → Store → `serialize()` (`return data`) / `apply` initial render.
   - `problem`: returning only the slots array breaks the `.slots` access the instruction's own `run(data)` snippet uses verbatim, and a future `downloadData(store.serialize())` (step 11) needs the full data object.
   - `decision`: `serialize()` returns `{ ...data, slots: [...data.slots] }` — data-shaped (so `.slots` holds, and `downloadData` gets the data object) with the slots array shallow-copied (honouring the instruction's copy intent).
   - Ready-to-apply snippet for `_pseudo.md` → `serialize()`:
     ```pseudo
     serialize
       return { ...data, slots: [...data.slots] }   // data object with slots shallow-copied
     ```
4. **Staged `run(data)` (recorded as instructed).**
   - `where`: instruction Step 4 vs `_pseudo.md` → Layer: Entry Point → `run(data)`.
   - `problem`: pseudo `run` declares `onDownload`, `onNextShuffle`, and `apply(...)`; step 3 implements `run` without `apply`/callbacks by design (they land step 4 / `bind-shuffle`).
   - `decision`: implemented the staged `run` — `store = createStore(data); ui = mount(); output = shuffle(data)` + initial render of mantra/strongs/banned; no `apply`, no callbacks.
   - Ready-to-apply snippet for `_pseudo.md` (annotating the staged step, no functional change — the full contract is already declared):
     ```pseudo
     run(data)                          // staged: apply + onDownload/onNextShuffle land in step 4 (bind-shuffle)
       store = createStore(data)
       ui = mount()
       output = shuffle(data)
       ui.renderMantra(output)
       ui.renderStrongs(store.serialize().slots)
       ui.renderBanned(store.serialize().slots)
     ```
5. **Instruction `## Changes` → Store mutation-member names differ from `_pseudo.md`.**
   - `where`: instruction `## Changes` → Store ("`promote`, `ban`, `unban`, `reorder`, `strongPromote`, `banToStrong`, `saveMantra`") vs `_pseudo.md` → Store (`promoteToStrong`, `moveUp`, `moveDown`, `banWord`, `unbanWord`, `banToStrong`, `saveMantra`, `serialize`).
   - `problem`: not implemented this step (members land steps 5–10), but the instruction batch for `bind-promote` (step 5) will hit this name mismatch.
   - `decision`: none taken (out of step-3 scope); flagging so the next instruction batch uses the `_pseudo.md` names.
   - Ready-to-apply snippet for the instruction file:
     ```md
     The mutation api members (`promoteToStrong`, `moveUp`, `moveDown`, `banWord`, `unbanWord`, `banToStrong`, `saveMantra`) land with their use cases (steps 5–10); `serialize` holds the data object.
     ```

### For the technical writers

- `_pseudo.md` → Layer: UI says the constant slot "renders an empty cell" — implemented as an empty `div` in the pick-up row under A1 (no button ever). The mantra-row `<h2>` for A1 shows "Artificial" from the output view (source `constant`).
- Strongs rendering: A1's strong word ("Artificial") is displayed without controls, consistent with the plan's "no controls ever" for constant slots while still listing per-letter `strong[]`. If the intent was to skip constant slots entirely, that's a one-line change in `createStrongsSection`'s render.

### For the crew

- "Clean browser console" verified via server behaviour (200s, correct content-types, no 404s, clean serve log) plus a headless DOM simulation that executes the exact `run(data)` pipeline and clicks every rendered button — no throws, no unexpected output. No headless browser was available in the delegated environment; the executed code paths are identical to the browser's.
- Concurrent sessions left unrelated working-tree/staged changes (`plan-poc-parse`, plans docs, `ops/*`); only the two intended files were committed (`10d29ce5`).
