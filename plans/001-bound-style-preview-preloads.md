# Plan 001: Bound Style Preset Preview Preloading To Visible Cards

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report - do not improvise. When done, update the status row for this plan in
> `plans/README.md` unless a reviewer dispatched you and told you they maintain
> the index.
>
> **Drift check (run first)**:
> `git diff --stat 25bd32e4..HEAD -- components/recipes/StylesRecipe.tsx components/recipes/styleBrowserRenderPlan.ts components/recipes/styleBrowserRenderPlan.test.ts`
> Also run:
> `git status --short -- components/recipes/StylesRecipe.tsx components/recipes/styleBrowserRenderPlan.ts components/recipes/styleBrowserRenderPlan.test.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `25bd32e4`, 2026-06-15

## Why this matters

The Styles recipe currently computes a visual state for every preset in the
active pack and then manually creates an `Image` for every resolved preview
source. Several packs contain 120-140 presets, while the UI only initially
renders a bounded subset of cards. Preloading every preset preview defeats the
render-windowing work and can create a burst of network, decode, and memory
pressure when the user opens Styles.

## Current state

- `components/recipes/StylesRecipe.tsx` - Styles recipe UI and preload effect.
- `components/recipes/styleBrowserRenderPlan.ts` - existing render-plan helper
  used by the Styles recipe and budget scripts.
- `components/recipes/styleBrowserRenderPlan.test.ts` - existing unit tests for
  visible/eager style group behavior.

Current excerpt from `components/recipes/StylesRecipe.tsx:1191`:

```tsx
const presetVisualStateById = useMemo(() => {
  const stateMap = new Map<string, StylePresetVisualState>();

  const visiblePresets =
    currentPackId === FAVORITES_PACK_ID ? favoritePresets : activePack.presets || [];

  visiblePresets.forEach((preset) => {
    const presetPackId = getPackIdForPreset(preset);
    const presetPack = loadedStylePacksById[presetPackId] ?? activePack;
    const resultImages = images
      .filter((img) => hasStylePresetIdentity(img.config, preset.id))
      .sort((a, b) => b.createdAt - a.createdAt);
```

Current excerpt from `components/recipes/StylesRecipe.tsx:1236`:

```tsx
useEffect(() => {
  const sources = new Set<string>();
  for (const state of presetVisualStateById.values()) {
    if (state.exampleImageSrc) sources.add(state.exampleImageSrc);
  }

  sources.forEach((src) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
  });
}, [presetVisualStateById]);
```

Existing render-plan tests use synthetic packs; keep that style. Example from
`components/recipes/styleBrowserRenderPlan.test.ts:37`:

```ts
describe('styleBrowserRenderPlan', () => {
  it('matches Styles browser category window and eager render behavior', () => {
    const presets = [
      ...Array.from({ length: 20 }, (_, index) => preset(`a-${index}`, 'A')),
```

## Commands you will need

| Purpose             | Command                                                         | Expected on success    |
| ------------------- | --------------------------------------------------------------- | ---------------------- |
| Focused tests       | `vp test run components/recipes/styleBrowserRenderPlan.test.ts` | exit 0                 |
| Style render budget | `bun run styles:render`                                         | exit 0, `violations=0` |
| Full tests          | `bun run test`                                                  | exit 0                 |
| Static check        | `bun run check`                                                 | exit 0                 |
| Build               | `bun run build`                                                 | exit 0                 |

## Scope

**In scope**:

- `components/recipes/StylesRecipe.tsx`
- `components/recipes/styleBrowserRenderPlan.ts`
- `components/recipes/styleBrowserRenderPlan.test.ts`

**Out of scope**:

- Style preset manifests under `components/recipes/styles/manifests/**`
- Generated style runtime packs under `components/recipes/styleRuntimePacks.generated/**`
- Style default image assets under `assets/recipes/styles/**`
- Catalog search splitting work covered by plans 006 and 007

## Git workflow

- Branch: `codex/001-bound-style-preview-preloads`
- Commit style: use the repo's recent conventional style, for example
  `fix: bound style preview preloads`
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Extract a preload source planner

Add a pure helper in `components/recipes/styleBrowserRenderPlan.ts` that accepts:

- the current `presetVisualStateById` map, or a minimal `{ id, exampleImageSrc }`
  structure,
- `visibleStyleGroupEntries`,
- optional eager/favorites entries if the live component uses them,
- a maximum count derived from the render plan rather than the full pack.

The helper should return a de-duplicated array of URLs for only the preset cards
that are currently visible/eager. Do not include hidden category placeholders or
collapsed "show more" cards.

**Verify**:
`vp test run components/recipes/styleBrowserRenderPlan.test.ts` -> existing tests still pass.

### Step 2: Add regression tests for preload bounds

Extend `components/recipes/styleBrowserRenderPlan.test.ts` with at least these
cases:

- a pack with 100 presets across 5 categories returns preload URLs only for the
  initially visible planned cards,
- duplicate URLs are de-duplicated,
- when all categories are expanded, the result remains bounded by the render
  plan's expanded visible cards rather than all presets in the pack.

Use the existing synthetic `preset()` and `pack()` style. Add only minimal test
data; do not import generated pack data into this unit test.

**Verify**:
`vp test run components/recipes/styleBrowserRenderPlan.test.ts` -> all tests pass,
including the new preload-bound tests.

### Step 3: Wire `StylesRecipe` to the bounded helper

Replace the `useEffect` in `StylesRecipe.tsx` so it no longer iterates over
`presetVisualStateById.values()` directly. It should depend on the bounded
preload source list returned by the helper.

Keep the manual `new Image()` preload only if it is still useful for visible
cards. The important invariant is: opening a pack must not preload every
default/preview image in that pack.

**Verify**:
`vp test run components/recipes/styleBrowserRenderPlan.test.ts` -> exit 0.

### Step 4: Confirm style budgets still pass

Run the style render budget and ensure this change did not break the current
render-window assumptions.

**Verify**:
`bun run styles:render` -> exit 0 and reports `violations=0`.

## Test plan

- Add unit coverage in `components/recipes/styleBrowserRenderPlan.test.ts`.
- Model the tests after the existing synthetic pack tests in that same file.
- Do not add image-network tests; the pure helper should make the preload bounds
  machine-checkable without a browser.

## Done criteria

- [ ] `StylesRecipe.tsx` no longer preloads every `presetVisualStateById` entry.
- [ ] A pure helper defines which preset preview URLs can be preloaded.
- [ ] New tests prove the helper stays bounded and de-duplicates URLs.
- [ ] `vp test run components/recipes/styleBrowserRenderPlan.test.ts` exits 0.
- [ ] `bun run styles:render` exits 0 with `violations=0`.
- [ ] Full closeout gates from `plans/README.md` pass or exact blockers are recorded.
- [ ] No pack manifests, generated style packs, or style assets are modified.
- [ ] `plans/README.md` status row updated.

## STOP conditions

Stop and report back if:

- `StylesRecipe.tsx` no longer has the preload effect shown above and the new
  code already scopes preloads to visible cards.
- Bounding preloads requires changing style manifests, generated runtime packs,
  or asset files.
- The render plan cannot express the visible/eager cards without importing
  React or browser APIs into `styleBrowserRenderPlan.ts`.
- The focused test command fails twice after a reasonable fix attempt.

## Maintenance notes

Reviewers should look for accidental broad preloads reintroduced through hover
previews, favorites, or future "show all" behavior. If a future change adds
virtual scrolling or a different render plan, update the preload helper tests in
the same change.
