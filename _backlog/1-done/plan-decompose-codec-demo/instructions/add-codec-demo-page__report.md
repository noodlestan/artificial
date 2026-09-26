# Sub-Agent REPORT (#producer)

**Plan:** `decompose-codec-demo`

**Iteration Id:** `add-codec-demo-page`

**Outcome:** `COMPLETED`

## Evidence

### Changes

| Goal                                                                                | Change                                                                                                                                                               |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Give the codec demo its own route and more than one sample                          | Added a second `DemoSource` to `DEMO_SOURCES` and created a new `/codec-demo` page with a dropdown to switch between demos.                                          |
| Edits are local — typing changes what is parsed and shown, and changes nothing else | `CodecDemo.tsx` owns only selection state; the draft state remains inside `CodeDemo.tsx`, so edits never propagate back to the source list.                          |
| Switching resets — choosing a different demo restores that demo's pristine markdown | `CodeDemo`'s `createEffect` re-seeds the draft from the `markdown` prop whenever the selected source changes, so switching away and back restores the original text. |

#### Files changed

- `apps/art-md-web/src/components/demos/code/sources.ts` — Appended a second `DemoSource` (`schema-registry`) to `DEMO_SOURCES`; `HOME_DEMO_SOURCE` left unchanged.
- `apps/art-md-web/src/components/demos/code/CodecDemo.tsx` — New Solid island: owns `selectedId` state, renders a `<select>` with `aria-label="Demo"`, displays the selected source's `title`/`description`, and mounts `<CodeDemo markdown={...} />`.
- `apps/art-md-web/src/components/demos/code/CodecDemo.module.css` — New styles for the select, info block, and fallback message; uses existing CSS tokens.
- `apps/art-md-web/src/components/pages/codec-demo/CodecDemo.astro` — New page-scoped wrapper mounting the island with `client:only="solid-js"`.
- `apps/art-md-web/src/pages/codec-demo.astro` — New route on `PageLayout`, passing `content` with `title` and `description`; no nested `main-section`.
- `apps/art-md-web/src/components/pages/home/HomeDemo.astro` — Added a link to `/codec-demo` below the home page demo.

## Blockers (if any)

None.

## Feedback

Not requested.
