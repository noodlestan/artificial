# Pseudo: Art Mantras

Function declarations for the art-mantras micro app: name, params, and **responsibility**, with pseudo code bodies. Presented entry point first (the locked anchor), then grouped by layer (each layer maps to a section of `_architect.md`). Zero real code. The runtime file orders functions from utils → `main()` last (see `_architect.md` NFRs). Component render bodies are implementation (the coder's domain) — the architect prescribes parts, ownership, events, responsibility, and the markup contract (grids render as `<table>` — see `_architect.md` NFRs); the styling technique is the coder's choice.

## Layer: Entry Point

### Function: main()

**Responsibility:** Wait for DOM readiness, load the data, and hand off to `run(data)`.

```pseudo
main
  on DOM ready:
    data = await loadData()
    run(data)          // staged in the race: step 2 (load-data) holds data only; run() lands in step 3 (mount-shell)
```

### Function: run(data)

**Responsibility:** Orchestrate startup from the loaded data: create the store, mount the UI shell, derive the initial output view, define the download/shuffle callbacks (where the store is in scope), and apply it.

```pseudo
run(data)                          // staged: step 3 (mount-shell) landed minus apply/onDownload/onNextShuffle; full contract lands step 4 (bind-shuffle)
  store = createStore(data)
  ui = mount()
  output = shuffle(data)
  onDownload    = () -> downloadData(store.serialize())
  onNextShuffle = () -> { out = shuffle(store.serialize()); ui.renderMantra(out); return out }
  apply(ui, store, output, onDownload, onNextShuffle)
```

### Function: apply(ui, store, output, onDownload, onNextShuffle)

**Responsibility:** Wire every UI intent to store mutations and orchestrate targeted section re-renders; runs the initial render. The single place where intents meet mutations; owns the current output view — `onNextShuffle` hands back the fresh output.

```pseudo
apply(ui, store, output, onDownload, onNextShuffle)
  currentOutput = output

  // initial render
  ui.renderMantra(currentOutput)
  ui.renderStrongs(store.serialize().slots)
  ui.renderBanned(store.serialize().slots)

  // intent wiring -> mutation + targeted re-renders
  ui.toolbar.download   -> onDownload()
  ui.toolbar.saveMantra -> store.saveMantra(mantraWords(currentOutput)); feedback
  ui.toolbar.shuffle    -> currentOutput = onNextShuffle()   // fresh output; mantra re-rendered inside
  ui.mantraRow.promote  -> store.promoteToStrong(slotId, word)
                           currentOutput entry for slotId: source = "strong"  // keep the word; binding switches via render
                           ui.renderMantra(currentOutput)
                           ui.renderStrongs(store.serialize().slots)
  ui.strongs.moveUp     -> store.moveUp(slotId, index); ui.renderStrongs(...)
  ui.strongs.moveDown   -> store.moveDown(slotId, index); ui.renderStrongs(...)
  ui.strongs.ban        -> store.banWord(slotId, index)
                           ui.renderStrongs(...); ui.renderBanned(...)
  ui.banned.unban       -> store.unbanWord(slotId, word); ui.renderBanned(...)
  ui.banned.banToStrong -> store.banToStrong(slotId, word)
                           ui.renderStrongs(...); ui.renderBanned(...)
```

### Function: onDownload()

**Responsibility:** Closure callback in `run` — serialize the current store state and download it as `data.json`.

```pseudo
onDownload
  data = store.serialize()
  downloadData(data)
```

### Function: onNextShuffle()

**Responsibility:** Closure callback in `run` — re-derive the output view, re-render the mantra (resetting every pick-up button binding), and return the fresh output for `apply` to keep as the current output.

```pseudo
onNextShuffle
  out = shuffle(store.serialize())
  ui.renderMantra(out)
  return out
```

## Layer: Derivation (pure)

### Function: shuffle(data)

**Responsibility:** Derive the output view from data without mutating it: one entry per slot — `{ slotId, letter, word, source, canPromote }` (source ∈ strong | pool | constant). Constant slot always yields "Artificial".

```pseudo
shuffle(data)
  view = []
  for each slot in data.slots:
    chosen = chooseMantraWord(slot)
    view.push(createViewEntry(slot, chosen))
  return view
```

### Function: createViewEntry(slot, chosen)

**Responsibility:** Build one output view entry for a slot from its chosen word — `{ slotId, letter, word, source, canPromote }`; `canPromote` is true only when the word came from the pool (drives the pick-up button's enabled state).

```pseudo
createViewEntry(slot, chosen)
  return {
    slotId: slot.id
    letter: slot.letter
    word: chosen.word
    source: chosen.source
    canPromote: chosen.source == "pool"
  }
```

### Function: createFibWeights(count)

**Responsibility:** Return `count` decreasing Fibonacci fractions totalling 1; index 0 is the heaviest weight (applies to the top of `strong[]`).

```pseudo
createFibWeights(count)
  fibs = fibonacci numbers, count terms       // 1, 1, 2, 3, ...
  reversed = fibs reversed                    // heaviest first
  total = sum(reversed)
  return reversed[i] / total for each i
```

### Function: pickFromStrong(slot, weights)

**Responsibility:** Weighted random pick from `slot.strong[]` using `weights`; source is "strong".

```pseudo
pickFromStrong(slot, weights)
  r = random()                                // 0..1
  walk weights accumulating; choose strong[index] where r lands
  return { word: strong[index], source: "strong" }
```

### Function: pickFromPool(slot)

**Responsibility:** Random word from `slot.pool[]`, skipping words already in `strong` or `banned`; source is "pool". If the pool holds no usable candidate (every word is strong or banned), fall back to randomising through `strong[]` — or any pool word if `strong` is empty too (last resort).

```pseudo
pickFromPool(slot)
  candidates = pool — strong — banned
  if candidates empty:
    if strong empty:
      return { word: random(pool), source: "pool" }    // last resort: any word ever suggested
    return { word: random(strong), source: "strong" }  // exhausted pool: randomise through strong
  return { word: random(candidates), source: "pool" }
```

### Function: chooseMantraWord(slot)

**Responsibility:** 50/50 between weighted strong pick and random pool pick; a slot with no strong words picks from the pool only; the constant slot returns its fixed word.

```pseudo
chooseMantraWord(slot)
  if slot.constant: return { word: "Artificial", source: "constant" }
  if slot.strong empty: return pickFromPool(slot)     // no strong words to weight-pick
  coin = random()
  if coin < 0.5: return pickFromStrong(slot, createFibWeights(slot.strong.length))
  else:          return pickFromPool(slot)
```

### Function: mantraWords(output)

**Responsibility:** Extract the current composition's words from the output view, one word per slot in order — the mantra to save.

```pseudo
mantraWords(output)
  return [entry.word for each entry in output]
```

## Layer: Store (state + mutations)

### Function: createStore(data)

**Responsibility:** Wrap data as the single source of truth; return the mutation api.

```pseudo
createStore(data)
  hold data internally
  return { promoteToStrong, moveUp, moveDown, banWord, unbanWord, banToStrong, saveMantra, serialize }
```

### Function: promoteToStrong(slotId, word)

**Responsibility:** Append `word` to the **bottom** of that slot's `strong[]`.

```pseudo
promoteToStrong(slotId, word)
  slot = find(slotId)
  slot.strong.push(word)
```

### Function: moveUp(slotId, index)

**Responsibility:** Swap the strong word at `index` with the one above; reorders `strong[]` only.

```pseudo
moveUp(slotId, index)
  if index > 0: swap strong[index], strong[index — 1]
```

### Function: moveDown(slotId, index)

**Responsibility:** Swap the strong word at `index` with the one below; reorders `strong[]` only.

```pseudo
moveDown(slotId, index)
  if index < strong.length — 1: swap strong[index], strong[index + 1]
```

### Function: banWord(slotId, index)

**Responsibility:** Move the strong word at `index` into `banned[]`.

```pseudo
banWord(slotId, index)
  word = strong.remove(index)
  banned.push(word)
```

### Function: unbanWord(slotId, word)

**Responsibility:** Remove `word` from `banned[]`; it returns to `pool[]` (pool already holds the full history).

```pseudo
unbanWord(slotId, word)
  banned.remove(word)
```

### Function: banToStrong(slotId, word)

**Responsibility:** Move `word` straight from `banned[]` into `strong[]`.

```pseudo
banToStrong(slotId, word)
  banned.remove(word)
  strong.push(word)
```

### Function: saveMantra(mantra)

**Responsibility:** Add the current composition to the top of `mantras[]`.

```pseudo
saveMantra(mantra)
  mantras.unshift(mantra)
```

### Function: serialize()

**Responsibility:** Return the current data object.

```pseudo
serialize
  return { ...data, slots: [...data.slots] }   // data object with slots shallow-copied
```

## Layer: UI (component factories + api used by apply)

Each component is created by a **componentFactory**; the factory owns the component's element, the data it displays, and the events bound on its own element. **Buttons are componentised** — every control is `createButton(title, onPress)`; bindings change after render through the button api. `mount()` composes the static shell once from the factories and returns the `ui` api — the render api plus each component's intent slots (wired by `apply`). Re-renders are targeted per section from store state — no full-page redraws. Component render bodies are implementation (the coder's); responsibility and ownership only are prescribed here.

### Component Factory: createButton(title, onPress)

**Params:** `title` (string — current label), `onPress` (function — click handler)
**Data owned:** none
**Events bound:** its own click → `onPress`
**Responsibility:** Build a button with the given title; bind `onPress` to its click; expose the button api so bindings can change after render.

```pseudo
createButton(title, onPress)
  element = buildButtonElement(title)
  element.onClick -> onPress()
  api = {
    setTitle(t)      // change the label through the button api
    setEnabled(bool) // disable when the word is already strong
  }
  return element + api
```

### Composer: mount()

**Responsibility:** Compose the static DOM shell once from the component factories; return the `ui` api — the render api plus each component's intent slots for `apply` to wire.

```pseudo
mount
  toolbar   = createToolbar()
  mantraRow = createMantraRow()
  strongs   = createStrongsSection()
  banned    = createBannedSection()
  return ui = {
    renderMantra, renderStrongs, renderBanned     // render api
    toolbar, mantraRow, strongs, banned           // intent slots (wired by apply)
  }
```

### Component Factory: createToolbar()

**Data owned:** none (static buttons)
**Events bound:** download, save-mantra, shuffle intents
**Responsibility:** Render the top toolbar (buttons via `createButton`); expose intent slots for `apply` to wire (`download`, `saveMantra`, `shuffle`).

```pseudo
createToolbar
  element = buildToolbarElement()
  toolbar = { element, download: null, saveMantra: null, shuffle: null }  // intent slots, wired by apply
  download = createButton("DOWNLOAD", () -> toolbar.download())
  save     = createButton("+ mantra", () -> toolbar.saveMantra())
  shuffle  = createButton("shuffle",  () -> toolbar.shuffle())
  return toolbar
```

### Component Factory: createMantraRow()

**Data owned:** the current output view (one entry per slot)
**Events bound:** promote intent per slot (through each slot's pick-up button)
**Responsibility:** Render the 11 mantra words and the per-slot pick-up buttons from the output view as a single `<table>` (one `<tr>` per slot: letter `<th scope="row">`, word `<td>`, control `<td>`); manage the pick-up button binding lifecycle. The constant slot (A1) renders an empty control cell — no button ever.

```pseudo
createMantraRow
  element = buildMantraRowElement()
  mantra = { element, promote: null }               // intent slot, wired by apply
  render(output)
    for each entry in output:
      if entry.source == "constant":                // A1: word fixed — no control ever
        render empty control cell
        continue
      button = createButton("+ strong", () -> mantra.promote(entry.slotId, entry.word))
      word text = entry.word
      if entry.source == "pool":
        button.setTitle("+ strong"); button.setEnabled(true)
      else:                                         // strong pick, promoted, or exhausted pool
        button.setTitle("\u2713 strong"); button.setEnabled(false)
  return mantra
```

### Component Factory: createStrongsSection()

**Data owned:** slots' strong lists
**Events bound:** move-up, move-down, ban intents per word (buttons via `createButton`)
**Responsibility:** Render the per-letter ordered strong lists as `<table>`s (one per letter: word rows with ^ / v / X controls).

```pseudo
createStrongsSection
  element = buildStrongsElement()
  strongs = { element, moveUp: null, moveDown: null, ban: null }  // intent slots, wired by apply
  render(slots)
    per-letter ordered strong lists with controls:
      up   = createButton("^", () -> strongs.moveUp(slotId, index))
      down = createButton("v", () -> strongs.moveDown(slotId, index))
      ban  = createButton("X", () -> strongs.ban(slotId, index))
  return strongs
```

### Component Factory: createBannedSection()

**Data owned:** slots' banned lists
**Events bound:** unban, promote-from-banned intents per word (buttons via `createButton`)
**Responsibility:** Render the collapsible banned section (table per letter).

```pseudo
createBannedSection
  element = buildBannedElement()              // native <details>
  banned = { element, unban: null, banToStrong: null }  // intent slots, wired by apply
  render(slots)
    banned words per letter with controls:
      unban    = createButton("?", () -> banned.unban(slotId, word))
      toStrong = createButton("+", () -> banned.banToStrong(slotId, word))
  return banned
```

### Function: ui.renderMantra(output)

**Responsibility:** Re-render the mantra row from the given output view (delegates to the mantra-row component; resets pick-up button bindings).

```pseudo
renderMantra(output)
  mantraRow.render(output)
```

### Function: ui.renderStrongs(slots)

**Responsibility:** Re-render the strongs section from the given slots (delegates to the strongs component).

```pseudo
renderStrongs(slots)
  strongs.render(slots)
```

### Function: ui.renderBanned(slots)

**Responsibility:** Re-render the banned section from the given slots (delegates to the banned component).

```pseudo
renderBanned(slots)
  banned.render(slots)
```

## Layer: Persistence

### Function: loadData()

**Responsibility:** Fetch `data.json` (relative to the app's own location) and parse it.

```pseudo
loadData
  response = fetch(FILE)
  return response.json()
```

### Function: downloadData(data)

**Responsibility:** Serialize data to a blob and trigger a download named `data.json`.

```pseudo
downloadData(data)
  blob = createBlob(JSON.stringify(data))
  anchor = createAnchor(blob, "data.json")
  anchor.click()
```

## Layer: Serving (node, zero deps)

### Function: serve entry (serve.js)

**Responsibility:** Static http server over `src/` using only `node:http` and `node:fs`; serve existing files with a content-type, respond 404 otherwise.

```pseudo
serve entry
  server = createHttpServer(handler)
  handler(req, res)
    path = urlToFile(req.url)                 // under src/
    if file exists: respond content + content-type
    else: respond 404
  server.listen(8000)
```
