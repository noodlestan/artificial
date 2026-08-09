# WIP: Art Mantras

Parking lot and progress tracker for the art-mantras module. Architecture lives in `_architect.md`; function declarations live in `_pseudo.md`; companion files are described in `_guide.md`; this file tracks actions, progress, and questions. Per-commit race state is recorded in `_backlog/plan-art-mantras/plan.md` → Commits.

## Actions

- [x] run `npm install` at the repository root to register the new workspace — done; `npm run serve` works.
- race to a committable bootstrap, then implement all use cases — one small verifiable step at a time; each step is a thin committable increment, verified with `npm run serve` + a clean browser console (no errors, no unexpected output):
  - [x] **step 1 — bootstrap: serve hello world**: done — commit `cfd6311b` (`art-mantras: bootstrap serve hello world`). `src/serve.js` (Serving) + minimal `src/index.html`; verified `node --check`, serve, curl 200/404, clean console.
  - [x] **step 2 — bootstrap: load data**: done — commit `21a29a7b` (`art-mantras: bootstrap load data`). `loadData()` (Persistence) fetches the seeded `src/data.json` on DOM ready and holds it in module scope, `run()` deferred to step 3; verified `node --check`, serve, curl 200/404, clean console.
  - [x] **step 3 — shell: mount static UI (no bindings yet)**: done — commit `10d29ce5` (`art-mantras: mount static shell`). `mount()` composes toolbar (DOWNLOAD / + mantra / shuffle), mantra row (11 `<h2>` words from the initial `shuffle()` output), pick-up row (A1 empty cell; pool → `+ strong` enabled, strong → `✓ strong` disabled), strongs + banned sections; intent slots no-op; verified `node --check`, serve 200/404, headless run clicked all 94 buttons cleanly.
  - [x] **step 4 — markup: convert shell to semantic tables**: done — commit `4eeab17b` (`art-mantras: shell tables markup`). The mantra row is one `<table>`; strongs and banned sections are per-letter `<table>`s. Verified with `node --check`, serve 200/404 checks, and headless DOM inspection; controls remained inert.
- [x] **step 5 — use case: shuffle**: done — commit `a3261ea2` (`art-mantras: bind shuffle`). The shuffle button re-derives and re-renders the mantra row; pick-up bindings reset. Verified with `node --check`, serve, headless re-roll simulation, constant A1, inert later controls, and no console errors.
  - [x] **step 6 — use case: promote (+ strong)**: done — commit `dcc28d0` (`art-mantras: implement bind-promote`). Pool-sourced words append to the bottom of `strong[]`, remain in the row, switch to disabled `✓ strong`, and re-render strongs; verified with `node --check`, serve/HTTP checks, DOM promotion verification, shuffle regression, constant A1, inert later controls, and no console errors.
  - [ ] **step 7 — use case: reorder (^ / v)**: bind move-up / move-down within `strong[]` only — strongs re-render.
  - [ ] **step 8 — use case: ban (X)**: bind ban — strong word into `banned[]`, strongs + banned re-render.
  - [ ] **step 9 — use case: unban (?)**: bind unban — banned word back to `pool[]`, banned re-render.
  - [ ] **step 10 — use case: banned → strong (+)**: bind banToStrong — banned word straight into `strong[]`, strongs + banned re-render.
  - [ ] **step 11 — use case: save (+ mantra)**: bind save — current composition to the top of `mantras[]` (not rendered in phase 1).
  - [ ] **step 12 — use case: download**: bind DOWNLOAD — serialize the store and download `data.json`.
  - [ ] **step 13 — edge cases + polish**: verify the pool-exhausted and empty-`strong[]` fallbacks; `styles.css`; final `apply` orchestration review against `_architect.md`.

## Questions

- (none open).
