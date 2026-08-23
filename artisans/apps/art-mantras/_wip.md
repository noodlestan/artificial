# WIP: Art Mantras

Parking lot and progress tracker for the art-mantras module. Architecture lives in `_architect.md`; function declarations live in `_pseudo.md`; companion files are described in `_guide.md`; this file tracks actions, progress, and questions. Per-commit race state is recorded in `_backlog/plan-art-mantras/plan.md` → Commits.

## Actions

- [ ] **step 7 — use case: reorder (^ / v)**: bind move-up / move-down within `strong[]` only — strongs re-render.
- [ ] **step 8 — use case: ban (X)**: bind ban — strong word into `banned[]`, strongs + banned re-render.
- [ ] **step 9 — use case: unban (?)**: bind unban — banned word back to `pool[]`, banned re-render.
- [ ] **step 10 — use case: banned → strong (+)**: bind banToStrong — banned word straight into `strong[]`, strongs + banned re-render.
- [ ] **step 11 — use case: save (+ mantra)**: bind save — current composition to the top of `mantras[]` (not rendered in phase 1).
- [ ] **step 12 — use case: download**: bind DOWNLOAD — serialize the store and download `data.json`.
- [ ] **step 13 — edge cases + polish**: verify the pool-exhausted and empty-`strong[]` fallbacks; `styles.css`; final `apply` orchestration review against `_architect.md`.

## Questions

- (none open).
