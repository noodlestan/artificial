# WIP: Art Mantras

Parking lot and progress tracker for the art-mantras module. Design lives in `_plan.md`; function declarations live in `_pseudo.md`; companion files are described in `_guide.md`; this file tracks actions, progress, and questions. Per-commit race state is recorded in the plan file (`artificials/_backlog/plan-art-mantras/plan.md` → Commits).

## Actions

- [x] run `npm install` in `artificials/` to register the new workspace — done; `npm run serve` works.
- race to a committable bootstrap, then implement all use cases — one small verifiable step at a time; each step is a thin committable increment, verified with `npm run serve` + a clean browser console (no errors, no unexpected output):
  - [x] **step 1 — bootstrap: serve hello world**: done — commit `cfd6311b` (`art-mantras: bootstrap serve hello world`). `src/serve.js` (Serving) + minimal `src/index.html`; verified `node --check`, serve, curl 200/404, clean console.
  - [x] **step 2 — bootstrap: load data**: done — commit `21a29a7b` (`art-mantras: bootstrap load data`). `loadData()` (Persistence) fetches the seeded `src/data.json` on DOM ready and holds it in module scope, `run()` deferred to step 3; verified `node --check`, serve, curl 200/404, clean console.
  - [x] **step 3 — shell: mount static UI (no bindings yet)**: done — commit `10d29ce5` (`art-mantras: mount static shell`). `mount()` composes toolbar (DOWNLOAD / + mantra / shuffle), mantra row (11 `<h2>` words from the initial `shuffle()` output), pick-up row (A1 empty cell; pool → `+ strong` enabled, strong → `✓ strong` disabled), strongs + banned sections; intent slots no-op; verified `node --check`, serve 200/404, headless run clicked all 94 buttons cleanly.
  - [~] **step 4 — markup: convert shell to semantic tables**: delegated — instruction `artificials/_backlog/plan-art-mantras/instructions/shell-tables.md` (commit `shell-tables` PLANNED). convert the mantra row to a single `<table>` (letter `<th scope="row">` / word `<td>` / control `<td>`), strongs + banned sections to per-letter `<table>`s — behavior unchanged, all buttons inert.
- [~] **step 5 — use case: shuffle**: delegated — instruction `artificials/_backlog/plan-art-mantras/instructions/bind-shuffle.md` (commit `bind-shuffle` PLANNED). render the shuffle button, bind it, and mutate — re-derive the output and re-render the mantra row (pick-up bindings reset). Verify it re-rolls.
  - [ ] **step 6 — use case: promote (+ strong)**: bind the pick-up promote — word to the **bottom** of `strong[]`, row keeps the word, button switches to the strong binding, strongs re-render.
  - [ ] **step 7 — use case: reorder (^ / v)**: bind move-up / move-down within `strong[]` only — strongs re-render.
  - [ ] **step 8 — use case: ban (X)**: bind ban — strong word into `banned[]`, strongs + banned re-render.
  - [ ] **step 9 — use case: unban (?)**: bind unban — banned word back to `pool[]`, banned re-render.
  - [ ] **step 10 — use case: banned → strong (+)**: bind banToStrong — banned word straight into `strong[]`, strongs + banned re-render.
  - [ ] **step 11 — use case: save (+ mantra)**: bind save — current composition to the top of `mantras[]` (not rendered in phase 1).
  - [ ] **step 12 — use case: download**: bind DOWNLOAD — serialize the store and download `data.json`.
  - [ ] **step 13 — edge cases + polish**: verify the pool-exhausted and empty-`strong[]` fallbacks; `styles.css`; final `apply` orchestration review against `_plan.md`.

## Questions

- (none open).
