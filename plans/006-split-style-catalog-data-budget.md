# Plan 006: Split Style Catalog Data Before Raising Its Budget

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report - do not improvise. When done, update the status row for this plan in
> `plans/README.md` unless a reviewer dispatched you and told you they maintain
> the index.
>
> **Drift check (run first)**:
> `git diff --stat 25bd32e4..HEAD -- components/recipes/stylePresetCatalogData.ts components/recipes/StylePresetCatalogSearchSurface.tsx scripts/report-ui-chunks.ts scripts/report-ui-chunks.test.ts`
> Also run:
> `git status --short -- components/recipes/stylePresetCatalogData.ts components/recipes/StylePresetCatalogSearchSurface.tsx scripts/report-ui-chunks.ts scripts/report-ui-chunks.test.ts components/recipes/styles/manifests`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: MED
- **Depends on**: catalog-agent-clear
- **Category**: perf
- **Planned at**: commit `25bd32e4`, 2026-06-15

## Why this matters

The `stylePresetCatalogData` chunk currently passes its budget with only 75
bytes of headroom. Raising the budget would hide the scaling problem. The
correct fix is to split catalog data so adding packs or presets does not keep
inflating one monolithic demand chunk.

This plan is intentionally deferred. Another agent is working on catalog/pack
state; do not execute until that work is paused, merged, or cleared.

## Current state

- `components/recipes/stylePresetCatalogData.ts` - demand-loaded catalog data
  module. It contains glob maps for every pack manifest and every preset YAML.
- `components/recipes/StylePresetCatalogSearchSurface.tsx` - opens the catalog
  surface and imports `stylePresetCatalogData`.
- `scripts/report-ui-chunks.ts` - current chunk budget definitions.
- `scripts/report-ui-chunks.test.ts` - unit tests for chunk-budget behavior.

Current chunk budget measured by advisory pass:

- `stylePresetCatalogData-BlVasvN6.js`: 225,205 bytes.
- Budget from `report-ui-chunks.ts`: 225,280 bytes.
- Headroom: 75 bytes.

Current excerpt from `components/recipes/stylePresetCatalogData.ts:12`:

```ts
const packManifestFiles = import.meta.glob('./styles/manifests/packs/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: false,
}) as Record<string, ManifestGlobLoader>;

const presetManifestFiles = import.meta.glob('./styles/manifests/presets/**/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: false,
}) as Record<string, ManifestGlobLoader>;
```

Current excerpt from `components/recipes/stylePresetCatalogData.ts:105`:

```ts
export async function loadStylePresetCatalog(): Promise<LoadedStylePresetCatalog> {
  if (catalogCache) return catalogCache;
  if (catalogPromise) return catalogPromise;

  catalogPromise = (async () => {
    const [packsRaw, presetManifests] = hasManifestGlobs()
      ? await Promise.all([
          loadYamlObjects<StylePackManifest>(packManifestFiles),
          loadYamlObjects<StylePresetManifest>(presetManifestFiles),
        ])
```

Current excerpt from `scripts/report-ui-chunks.ts:60`:

```ts
{
  id: 'style-catalog-data',
  pattern: /^stylePresetCatalogData-[\w-]+\.js$/,
  maxBytes: 220 * KIB,
  required: true,
  note: 'Catalog YAML glob map should stay demand-loaded and scale with manifest count.',
},
```

## Commands you will need

| Purpose       | Command                                                                                        | Expected on success           |
| ------------- | ---------------------------------------------------------------------------------------------- | ----------------------------- |
| Focused tests | `vp test run components/recipes/stylePresetManifests.test.ts scripts/report-ui-chunks.test.ts` | exit 0                        |
| Chunk budget  | `bun run ui:chunks`                                                                            | exit 0; no catalog data cliff |
| Build         | `bun run build`                                                                                | exit 0                        |
| Full tests    | `bun run test`                                                                                 | exit 0                        |
| Static check  | `bun run check`                                                                                | exit 0                        |

## Scope

**In scope**:

- `components/recipes/stylePresetCatalogData.ts`
- new per-pack catalog loader modules if needed
- `components/recipes/StylePresetCatalogSearchSurface.tsx`
- `components/recipes/stylePresetManifests.test.ts`
- `scripts/report-ui-chunks.ts`
- `scripts/report-ui-chunks.test.ts`

**Out of scope**:

- Editing preset YAML content
- Regenerating or changing default images
- Raising the style catalog data budget as the primary fix
- Plans 001-005

## Git workflow

- Branch: `codex/006-split-style-catalog-data-budget`
- Commit style: `perf: split style catalog data`
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Coordinate with the catalog-pack agent

Before editing, confirm no other agent is actively changing:

- `components/recipes/styles/manifests/**`
- `components/recipes/styleRuntimePacks.generated/**`
- `components/recipes/stylePresetCatalogData.ts`
- `components/recipes/StylePresetCatalogSearchSurface.tsx`

If those files are actively changing, stop and wait for a merged/stable state.

**Verify**:
`git status --short -- components/recipes/styles/manifests components/recipes/styleRuntimePacks.generated components/recipes/stylePresetCatalogData.ts components/recipes/StylePresetCatalogSearchSurface.tsx`
is understood and does not include active unknown work that would be overwritten.

### Step 2: Split the glob map by pack or index module

Refactor the catalog data module so one generated or static module no longer
contains every preset path. Acceptable approaches:

- per-pack loader modules, each with its own preset glob,
- a small catalog index module plus lazy per-pack data modules,
- a generated loader registry if the repo already has a generation pattern that
  fits.

Keep `loadStylePresetCatalog()` as a compatible API if possible, but make its
implementation compose smaller chunks.

**Verify**:
`vp test run components/recipes/stylePresetManifests.test.ts` -> exit 0.

### Step 3: Keep chunk budgets honest

Update `scripts/report-ui-chunks.ts` so the old single
`stylePresetCatalogData` budget no longer creates a 75-byte cliff. Prefer
budgets that enforce:

- a small catalog shell/index chunk,
- per-pack chunks below a defined max,
- no unbudgeted catalog data chunk above the large-chunk threshold.

Do not simply raise `style-catalog-data` from 220 KiB to a larger number.

**Verify**:
`vp test run scripts/report-ui-chunks.test.ts` -> exit 0.

### Step 4: Build and inspect chunks

Run the production build and chunk report. Record the before/after catalog
chunk names and sizes in the implementation summary.

**Verify**:
`bun run build` -> exit 0.
`bun run ui:chunks` -> exit 0.

## Test plan

- Existing `components/recipes/stylePresetManifests.test.ts` should continue to
  prove catalog loading/search semantics.
- `scripts/report-ui-chunks.test.ts` should cover the new budget shape and fail
  if a large monolithic catalog data chunk returns.

## Done criteria

- [ ] No single style catalog data chunk sits within a few bytes of its budget.
- [ ] Catalog loading/search behavior remains compatible for callers.
- [ ] `bun run ui:chunks` exits 0 with meaningful catalog budgets.
- [ ] `vp test run components/recipes/stylePresetManifests.test.ts scripts/report-ui-chunks.test.ts` exits 0.
- [ ] No preset YAML, generated runtime pack, or default image content changes
      unless explicitly coordinated with the catalog-pack agent.
- [ ] Full closeout gates from `plans/README.md` pass or exact blockers are recorded.
- [ ] `plans/README.md` status row updated.

## STOP conditions

Stop and report back if:

- The catalog-pack agent is still changing in-scope files.
- Splitting data requires changing manifest schema or preset content.
- The only way to pass `ui:chunks` is raising the old monolithic budget.
- Vite groups the split modules back into one large chunk and the chunking cause
  is not obvious.

## Maintenance notes

When new packs are added, budget tests should fail with actionable names if a
single pack or index chunk becomes too large. Keep this plan focused on chunk
shape; incremental search behavior belongs to plan 007.
