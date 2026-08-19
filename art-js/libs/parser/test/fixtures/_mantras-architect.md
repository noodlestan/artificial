# Architect: Art Mantras

## Why

The A·R·T·I·F·I·C·I·A·L·S acronym is curated interactively: per-letter word pools, promoted strong candidates, banned rejects, and composed mantras — currently done through conversation. This app turns that curation into a persistent, interactive workspace: generate acronym options for A.R.T.I.F.I.C.I.A.L.S by composing random mantras, promoting words into `strong`, banning rejects, reordering strong candidates, and saving the mantras worth keeping — with the entire state living in one plain JSON file next to the app.

## Intro

Super small app. No build requirements. Files only: `src/index.html`, `src/app.js`, `src/styles.css`, `src/serve.js`, `src/data.json` (plus the scaffolded `package.json` at the package root). Pure vanilla JS — no frameworks, no dependencies, no tooling, no bells and whistles. Must be served over basic HTTP (fetch does not work from `file://`); the single `serve` script starts the zero-dependency node http server.

## What — Requirements

### Data (`src/data.json`)

- `slots` — array of 11 slot records, one per letter of **A R T I F I C I A L S** (position disambiguates the 3 I's and 2 A's).
  - `id`: `"A1" | "R" | "T" | "I1" | "F" | "I2" | "C" | "I3" | "A2" | "L" | "S"`.
  - `letter`: the letter displayed in the mantra row.
  - `strong`: `string[]` — promoted candidates; order matters (fib-weighted sampling uses it, top gets the heaviest weight).
  - `pool`: `string[]` — every word ever suggested for this letter, including dropped ones (full history).
  - `banned`: `string[]` — words dropped/banned; starts empty.
  - `constant`: `boolean` — `true` only for `A1` (always: `strong = ["Artificial"]`, `pool = []`, `banned = []`, no controls ever).
  - The three I slots (`I1`, `I2`, `I3`) **start equal**: identical `strong`, `pool`, and `banned` (a mantra may therefore repeat a word across the I's).
- `mantras`: `string[]` — saved mantras, starts empty; newest on top. **Stored and persisted but not rendered in phase 1** (list rendering is phase 2, see Follow-ups).

### UI

- Top toolbar: **DOWNLOAD**, **+ mantra**, **shuffle** (re-roll the mantra).
- Mantra row — a single `<table>` (one `<tr>` per slot: letter `<th scope="row">`, word `<td>`, control `<td>`); one word per slot of the current (random) mantra; constant `A1` always shows "Artificial". Only one mantra exists at a time — the current random composition; the saved `mantras[]` list is never displayed in phase 1.
- Pick-up row — the control column of the mantra table (one button `<td>` per slot; empty under constant `A1`); its binding shows `+ strong` when the word came from `pool` (enabled), `✓ strong` when it came from `strong` (disabled).
- Strongs section — per letter, an ordered `<table>` of `strong[]` words, each row with **^** (up) and **v** (down) to reorder `strong[]` only, and **X** to move into `banned`.
- Banned section — native collapsible `<details>` titled **banned**; per letter, a `<table>` of banned words, each row with **?** (unban → back to `pool`) and **+** (banned → straight into `strong`).
- All controls are componentised buttons — created through `createButton(title, onPress)`, bindings change through the button api (see Layers → UI).

### Mantra composition (per non-constant slot)

- **50%** — weighted random pick from `strong[]`; weights from `createFibWeights(strong.length)` (decreasing Fibonacci fractions totalling 1); a slot with an empty `strong[]` skips this branch and picks from `pool`.
- **50%** — random word from `pool[]` (never from `strong` or `banned`); if `pool` has no candidate left (every word is strong or banned), fall back to randomising through `strong[]`.
- The composition is **stable until shuffle** — promoting a mantra word keeps it in the row (re-sourced to `strong`); only shuffle re-rolls.

### Data updates

Every interaction mutates the store; the store is the single source of truth. After each mutation, the affected section re-renders from the store through the `ui` api. Nothing is persisted except through **DOWNLOAD**.

### Initial data (seeding)

`src/data.json` ships pre-seeded:

- `strong` = the strong candidates from the originating session; the three I slots start equal (identical `strong`, `pool`, `banned`).
- `pool` = all words ever presented in that session (random candidates included) **plus** lexicon words derived from the artificials and domains sources (`fundamentals.md`, `domains/definitions/index.md`, `domains/_wip.md`, `_temp/_words/agent-words.md`, `_guide.md`).
- `banned` = `[]` (everything unbanned).

## How

### Principles

- single responsibility.
- don't go too far.
- componentise.
- dry.

### NFRs

- Vanilla JS only, no build step, no dependencies.
- Clean code: descriptive functions.
- Functions ordered from utils → … → `main()` entry point, which is last.
- Zero code in this architecture document — function declarations (params, responsibilities, pseudo code only) live in `_pseudo.md`.
- Semantic markup: grid sections render as `<table>` — the mantra row as one table (one `<tr>` per slot: letter `<th scope="row">`, word `<td>`, control `<td>`), strongs and banned as one `<table>` per letter. Structure follows this contract; the styling technique is the coder's choice.
- Scaffold by cloning practices in neighbours: a package of **app** type has a very different `package.json` (no TS, no build, no deps) — it is scaffolded by `Scaffolder Skeleton: Micro App` (plus `Scaffolder Skeleton: Package Common` for LICENSE), and its scripts come from `Package Script Set: Micro App Serve`.

### Architecture

One-directional flow, state → view:

- `store` — owns the data and every mutation (single source of truth).
- `shuffle(data)` — pure: derives the output view, never mutates.
- `ui` — static DOM shell built once by `mount()`; exposes the render api used for targeted section updates plus each component's intent slots (`apply` wires them).
- `apply` — wires events and orchestrates the initial render; after every mutation the handler re-renders the affected section through the `ui` api; owns the current output view.
- `onDownload` / `onNextShuffle` — defined in `run`'s closure (where the store is in scope), injected into `apply`.

**Output view contract** — `shuffle(data)` returns one entry per slot:

- `{ slotId, letter, word, source, canPromote }`.
- `source` ∈ `"strong" | "pool" | "constant"`.
- `canPromote` = `source === "pool"` (drives the pick-up button's enabled state).
- after a promote, the view entry's `source` becomes `"strong"` (the word stays in the row).

### Use cases (terse BDD)

- **Initial load** — given `data.json`, when the app starts → the store holds the data, the output is derived, all sections render.
- **Shuffle** — when shuffle is pressed → every slot re-rolls; the mantra row re-renders; each pick-up button binding re-derives from the fresh output (`+ strong` enabled from `pool`, `✓ strong` disabled from `strong`).
- **Promote (+ strong)** — given a mantra word from `pool`, when its pick-up button is pressed → the word moves to the **bottom** of that slot's `strong[]`; the row keeps the word; the button switches (through the button api) to its strong binding; the strongs section re-renders.
- **Reorder (^ / v)** — when a strong word is reordered → it moves one position within `strong[]` only; the strongs section re-renders.
- **Ban (X)** — when a strong word is banned → it moves to that slot's `banned[]`; strongs + banned sections re-render.
- **Unban (?)** — when a banned word is unbanned → it returns to `pool[]`; the banned section re-renders.
- **Banned → strong (+)** — when a banned word is promoted → it moves straight into `strong[]`; strongs + banned sections re-render.
- **Save (+ mantra)** — when the current composition is saved → it goes to the top of `mantras[]` (not rendered in phase 1).
- **Download** — when DOWNLOAD is pressed → the current `strong`, `pool`, `banned` per slot, slot identity, and `mantras` are persisted as `data.json`.
- **Pool exhausted** — when a slot has no pool candidate left → the pick falls back to randomising through `strong[]`.
- **Constant A1** — A1 always shows "Artificial"; no controls; never shuffled.

### Layers

The app is organised in six layers, each mapping 1:1 to a `Layer:` section in `_pseudo.md`, in runtime flow order:

1. **Entry Point** — startup + orchestration.
2. **Derivation** — pure mantra composition.
3. **Store** — state + mutations.
4. **UI** — component factories + render api.
5. **Persistence** — load / download.
6. **Serving** — zero-dep http server.

#### Layer: Entry Point

- `main` → `run(data)` → `apply(ui, store, output, onDownload, onNextShuffle)`; `onDownload` / `onNextShuffle` are defined in `run`'s closure (where the store is in scope) and injected into `apply`.
- `apply` is the single place where UI intents meet store mutations; every handler re-renders the affected sections through the `ui` api; it keeps the current output view (`onNextShuffle` returns the fresh one).
- `onNextShuffle` re-derives the output, re-renders the mantra, and returns the fresh output.

#### Layer: Derivation

- `shuffle(data)` derives one view entry per slot; pure, never mutates.
- composition (50/50 weighted-strong vs random-pool, Fibonacci-fraction weights, pool-exhausted fallback) as per What → Mantra composition; an exhausted-pool pick reports `source` = `strong`.

#### Layer: Store

- `createStore(data)` wraps the data; every mutation goes through it — promote, move up/down, ban, unban, banned→strong, save mantra, serialize.
- Promote appends to the **bottom** of `strong[]`.

#### Layer: UI

- UI split into **component factories**; each owns its element, the data it displays, and the events on its element; re-renders are targeted per section — no full-page redraws.
- **Buttons are componentised**: every control is `createButton(title, onPress)`; the button api (`setTitle`, `setEnabled`) lets bindings change after render.
- Components (details under `_pseudo.md`, Layer: UI): `mount` (composer), `createToolbar`, `createMantraRow`, `createStrongsSection`, `createBannedSection`, and the shared `createButton`.
- Pick-up button lifecycle as per Use cases → Promote / Shuffle; the binding is derived from the word's `source` — `+ strong` (enabled) from `pool`, `✓ strong` (disabled) from `strong`.
- Saved `mantras[]` list has no component in phase 1 (see Follow-ups).

#### Layer: Persistence

- `loadData()` fetches `data.json` relative to the app's own location (`src/`).
- `downloadData(data)` serialises the store to a `data.json` download; DOWNLOAD is the only write path.

#### Layer: Serving

- Single package script `serve` = `node src/serve.js`; basic static http server using only node's built-in `http` + `fs`, no dependencies, no build.
- Serves from the package's `src/` directory; content-type per file, 404 otherwise.

### Conventions

- Literals always created through `verbThing()` factory functions (factories act as the source of docs for data, replacing TS).
- No classes; no globals except `const FILE = "data.json"` (relative to the app's own location, `src/`) and the program's functions.
- Component factories own their element, their data, and their events.
- All function declarations live in `_pseudo.md`, entry point first, grouped by layer — this architecture document keeps the design, `_pseudo.md` keeps the functions.

## Follow-ups (phase 2)

- Render the saved `mantras[]` list (a mantras component; possibly browsing/reloading a saved mantra) — out of scope for phase 1, where only the one current random mantra exists.
