# Plan: Art Mantras — 12-step race

**ID:** `art-mantras`

**Status:** `WORKING`

**Template:** `.agents/domains/plans/templates/plan.tart`

**Skill:** `write-plan`

## Summary

Race the art-mantras micro app to a committable, all-use-cases bootstrap — one thin committable increment per step, each verified with `npm run serve` + a clean browser console (no errors, no unexpected output). The scaffold (zero-code `src/` placeholders + `serve` script) and the design docs (`_architect.md`, `_pseudo.md`) are already committed; all 13 actions in `_wip.md` are open. The design contract is `_architect.md` + `_pseudo.md` — delegates never modify them; they report ready-to-apply snippets instead. Pseudo is the contract: function names, params, responsibilities, and call flow are fixed; DOM structure follows the markup contract (`<table>` grids — see `_architect.md` NFRs); the styling technique is the coder's choice.

## Source Tasks

No `task-{id}/task.md` files exist for this plan. Plan was generated from:

- [Art Mantras WIP — the 12-step race](artisans/apps/art-mantras/_wip.md)
- [Art Mantras Plan — design contract](artisans/apps/art-mantras/_architect.md)
- [Art Mantras Pseudo — function declarations](artisans/apps/art-mantras/_pseudo.md)

## Mandatory Reading

For the delegator (execution mechanics):

- `.agents/domains/plans/definitions/index.md` — plan, implementation-instructions, delegation, and report definitions.
- `.agents/domains/plans/files/index.md` — plan, instruction, delegation, and report file conventions.
- `.agents/domains/plans/structures/plan.art` — plan record fields and statuses.
- `.agents/skills/execute-plan/SKILL.md` — how this plan is executed by delegation.

For the delegatee (shared context; per-step context is in each instruction file):

- `artisans/apps/art-mantras/_guide.md` — module map: what each companion file contains and the reading order.
- `artisans/apps/art-mantras/_architect.md` — the design: Why, What, How, Follow-ups (no code).
- `artisans/apps/art-mantras/_pseudo.md` — function declarations, entry point first, grouped by layer; the contract.
- `artisans/apps/art-mantras/_wip.md` — only to identify the current step; NEVER modify it.

## Commits

### `serve-hello-world` - `COMMITTED`

**Commit Message:** `art-mantras: bootstrap serve hello world`

**Commit:** `cfd6311b`

**Instructions File:** `_backlog/plan-art-mantras/instructions/serve-hello-world.md`

**Report:** `_backlog/plan-art-mantras/instructions/serve-hello-world__report.md`

**Evidence:** `src/serve.js` (Serving-layer static server), `src/index.html` (hello-world page). Verified `node --check`, `npm run serve`, curl 200/404, clean console.

**Sub-Agent:** `serve-hello-world`

### `load-data` - `COMMITTED`

**Commit Message:** `art-mantras: bootstrap load data`

**Commit:** `21a29a7b`

**Instructions File:** `_backlog/plan-art-mantras/instructions/load-data.md`

**Report:** `_backlog/plan-art-mantras/instructions/load-data__report.md`

**Evidence:** `src/app.js` (`const FILE`, `loadData()`, `main()` — fetch + hold on DOM ready, `run()` deferred), `src/index.html` (module script tag). Verified `node --check`, `npm run serve`, curl 200 (/, app.js, data.json) / 404, clean serve log + node fetch simulation.

**Sub-Agent:** `load-data`

### `mount-shell` - `COMMITTED`

**Commit Message:** `art-mantras: mount static shell`

**Commit:** `10d29ce5`

**Instructions File:** `_backlog/plan-art-mantras/instructions/mount-shell.md`

**Report:** `_backlog/plan-art-mantras/instructions/mount-shell__report.md`

**Evidence:** `src/app.js` (Store staged `createStore`+`serialize`, Derivation complete `shuffle`+helpers, UI complete `mount`+factories+render api, Entry Point staged `run`), `src/index.html` (hello world heading removed). Verified `node --check`, `npm run serve` 200/404, headless run clicked all 94 buttons cleanly.

**Sub-Agent:** `mount-shell`

### `shell-tables` - `COMMITTED`

**Commit Message:** `art-mantras: shell tables markup`

**Commit:** `4eeab17b`

**Instructions File:** `_backlog/plan-art-mantras/instructions/shell-tables.md`

**Report:** `_backlog/plan-art-mantras/instructions/shell-tables__report.md` (see note in Feedback)

**Evidence:** `src/app.js` — grid sections converted to semantic `<table>` markup: `createMantraRow()` single `<table>` with `<th scope="row">` letter / word `<td>` / control `<td>` (constant A1 → empty control cell, no button); `createStrongsSection()` per-letter `<table>`s (word `<td>` + ^/v/X controls); `createBannedSection()` per-letter `<table>`s inside native `<details>` (empty list → empty body, section present); toolbar unchanged. Zero behavior change. Verified `node --check`, `npm run serve` 200/404 clean, headless DOM sim — one mantra `<table>` with 11 `<tr>`, per-letter strongs tables, `<details>` banned section, all 94 buttons still inert.

**Sub-Agent:** `shell-tables`

### `bind-shuffle` - `COMMITTED`

**Commit Message:** `art-mantras: bind shuffle`

**Commit:** `a3261ea2`

**Instructions File:** `_backlog/plan-art-mantras/instructions/bind-shuffle.md`

**Report:** `_backlog/plan-art-mantras/instructions/bind-shuffle__report.md`

**Evidence:** `src/app.js` — Entry Point lands `apply()` with FIRST wired intent: `onNextShuffle` closure in `run()` (`out = shuffle(store.serialize())` → `ui.renderMantra(out)` → `return out`); `apply(ui, store, output, onNextShuffle)` staged (initial render + wire `ui.toolbar.shuffle -> onNextShuffle()` only); `run(data)` hands off to `apply()`; all other intent slots remain no-ops. Verified `node --check`, `npm run serve` 200, headless re-roll sim — 5 distinct mantra compositions across clicks, pick-up bindings reset, A1 constant, DOWNLOAD/+ mantra inert, no console errors.

**Sub-Agent:** `bind-shuffle`

### `bind-promote` - `COMMITTED`

**Commit Message:** `art-mantras: bind promote`

**Instructions File:** `_backlog/plan-art-mantras/instructions/bind-promote.md`

**Commit:** `dcc28d0`

**Report:** `_backlog/plan-art-mantras/instructions/bind-promote__report.md` (commit `7a2689b`)

**Evidence:** `src/app.js` — added `createStore().promoteToStrong(slotId, word)` and wired `ui.mantraRow.promote` to preserve the current row entry, switch it to disabled `✓ strong`, and re-render the mantra and strongs sections. Verified with `node --check`, `npm run serve`, HTTP 200/404 checks, in-process DOM promotion verification, shuffle regression, constant A1, inert later controls, and no console errors.

**Sub-Agent:** `Faraday` (`019fe616-a8b7-7dd2-9dbc-86c4621497d5`) — delegated 2026-08-09

### `bind-reorder` - `PLANNED`

**Commit Message:** `art-mantras: bind reorder`

**Instructions File:** `_backlog/plan-art-mantras/instructions/bind-reorder.md`

**Sub-Agent:** (pending)

### `bind-ban` - `DRAFT`

**Commit Message:** `art-mantras: bind ban`

**Instructions File:** `_backlog/plan-art-mantras/instructions/bind-ban.md` (draft)

**Sub-Agent:** (pending)

### `bind-unban` - `DRAFT`

**Commit Message:** `art-mantras: bind unban`

**Instructions File:** `_backlog/plan-art-mantras/instructions/bind-unban.md` (draft)

**Sub-Agent:** (pending)

### `bind-banned-to-strong` - `DRAFT`

**Commit Message:** `art-mantras: bind banned to strong`

**Instructions File:** (pending — written when this commit is delegated)

**Sub-Agent:** (pending)

### `bind-save` - `DRAFT`

**Commit Message:** `art-mantras: bind save mantra`

**Instructions File:** (pending — written when this commit is delegated)

**Sub-Agent:** (pending)

### `bind-download` - `DRAFT`

**Commit Message:** `art-mantras: bind download`

**Instructions File:** (pending — written when this commit is delegated)

**Sub-Agent:** (pending)

### `edge-cases-polish` - `DRAFT`

**Commit Message:** `art-mantras: edge cases and polish`

**Instructions File:** (pending — written when this commit is delegated)

**Sub-Agent:** (pending)

## Follow ups

- Race execution cycle — one commit per delegator session; after each delegation the planner session analyses the sub-agent report and feedback and authors the next instruction batch (increasing sizes, e.g. 2–3, then 4–5–6). Remaining commits move `DRAFT` → `PLANNED` as their instruction files are written.
- Phase 2 — render the saved `mantras[]` list (a mantras component; possibly browsing/reloading a saved mantra). Out of scope for the race (only the one current random mantra exists in phase 1). From `_architect.md` → Follow-ups.
- `_module.md` next-move routines (break down responsibilities, tighten plan, abstract, commit) remain the planner's contract between race steps.

## Feedback

- (delegator, 2026-08-09) — delegated `bind-promote` verbatim to worker `Anscombe`; blocked during mandatory reading.
- (delegator, 2026-08-09) — blocker: the instruction references a missing `artificials/.../_architect.md`; the checkout has the design contract as `_plan.md` under the requested `checkouts/artificial` root. Report: `instructions/bind-promote__report.md`.

- (planner, 2026-08-09) — resolved: the `_plan.md` → `_architect.md` rename is committed in `3dd1b78`; the fresh delegation completed against the current checkout. Implementation is `dcc28d0`; report corrected and committed as `7a2689b`.

- (planner, 2026-08-08) — delegation session: `shell-tables` + `bind-shuffle` both completed. `shell-tables` had no `DIRECTIVE FEEDBACK:` directive so no report file was rendered; the trail lives in this plan record and the commit `4eeab17b`. `bind-shuffle` rendered its report to `instructions/bind-shuffle__report.md` (commit `a3261ea2`).

- `shell-tables` (COMPLETED) — commit `4eeab17b`, exactly `src/app.js` (+52/-46). Semantic `<table>` markup landed; behavior unchanged (94 buttons inert); headless DOM sim passed.

- `bind-shuffle` (COMPLETED) — commit `a3261ea2`, exactly `src/app.js` (+18/-3). Re-roll verified headlessly (5 distinct mantra compositions across clicks, A1 constant, bindings reset, DOWNLOAD/+ mantra inert).

- (planner, 2026-08-08) — applied: snippet 1 → `art-mantras/_architect.md` Layer: Serving ("package's `src/` directory"); snippet 2 → instruction verification wording ("modified by this delegation; pre-existing changes not counted"). Next instruction batch authored: `load-data`, `mount-shell`, `bind-shuffle` (commits → `PLANNED`).

- `serve-hello-world` (COMPLETED) — `_architect.md` Layer: Serving says "Serves from the package directory" while `_pseudo.md`/instruction say "over `src/`". Implemented the explicit reading (serves from `src/`). Ready-to-apply snippet suggested for `_architect.md` (see report).
- `serve-hello-world` (COMPLETED) — instruction Final-Verification criterion "git status shows ONLY the two files modified" cannot hold literally when the working tree carries pre-existing unrelated changes; verified only the intended two files were changed this session (see report).

- (planner, 2026-08-08) — delegation prep for `load-data` choked (session resumed; no report/commit produced). Evaluated: nothing lost — `load-data` remains `PLANNED` with its instruction ready to relay. Delegatee feedback from `serve-hello-world` fully applied (snippets above).

- `load-data` (COMPLETED) — staged deferral: `_pseudo.md` `main()` hands off to `run(data)` but step 2 holds data only; implemented step contract (`run()` re-added in step 3), ready-to-apply snippet offered for `_pseudo.md`. Minor: `main()` made async (`await loadData()`) so the holder receives resolved data, not a Promise (see report).

- (planner, 2026-08-08) — supersession decided: `_delegate.md` retired; the plans model (plan/instruction/report files) is the delegation model. References cleaned from the instruct files, this plan, and the module `_guide.md`.

- (planner, 2026-08-08) — load-data delegatee feedback applied: `_pseudo.md` `main()` annotated (`await loadData()`, staged `run(data)` note); `mount-shell` instruct Step 4 updated to `data = await loadData()`.

- (planner, 2026-08-08) — mount-shell delegatee feedback applied: report snippets 1-3+5 into `mount-shell.md` `## Changes` (Derivation signatures, `createButton(title, onPress)`, `serialize()` data-shaped, mutation api names); deferred intent names corrected in `bind-shuffle.md`; `_pseudo.md` `serialize()` body + `run()` staging annotation. Note: the delegator's commit `10d29ce5` was dangling (branch pointer orphaned by a concurrent session commit); adopted via fast-forward — no code lost.

- `mount-shell` — relay came back with a replay of the load-data wrap-up (commit `21a29a7b` re-reported; no new report/commit produced). Evaluated: nothing lost — `mount-shell` remains `PLANNED` with its instruction ready; re-relay in a fresh (non-resumed) delegator session so it re-reads the plan and picks the next `PLANNED` commit.

- `mount-shell` (COMPLETED) — derivation/UI signatures in instruction `## Changes` conflict with `_pseudo.md` (contract wins: `createViewEntry(slot, chosen)`, `createButton(title, onPress)`); `serialize()` returns the data object with slots shallow-copied (`{ ...data, slots: [...data.slots] }`) so `.slots` and `downloadData` hold; store mutation-member names in instruction (`promote`, `ban`, `unban`, `reorder`, `strongPromote`, `banToStrong`, `saveMantra`) differ from `_pseudo.md` (`promoteToStrong`, `moveUp`, `moveDown`, `banWord`, `unbanWord`, `banToStrong`, `saveMantra`) — flagging for the next instruction batch. Ready-to-apply snippets in the report.
