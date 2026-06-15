# Plan 007: Make Style Catalog Search Load Incrementally

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report - do not improvise. When done, update the status row for this plan in
> `plans/README.md` unless a reviewer dispatched you and told you they maintain
> the index.
>
> **Drift check (run first)**:
> `git diff --stat 25bd32e4..HEAD -- components/recipes/StylePresetCatalogSearchSurface.tsx components/recipes/stylePresetCatalogData.ts components/recipes/stylePresetManifests.ts components/recipes/stylePresetManifests.test.ts`
> Also run:
> `git status --short -- components/recipes/StylePresetCatalogSearchSurface.tsx components/recipes/stylePresetCatalogData.ts components/recipes/stylePresetManifests.ts components/recipes/stylePresetManifests.test.ts components/recipes/styles/manifests`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: L
- **Risk**: MED
- **Depends on**: plans/006-split-style-catalog-data-budget.md
- **Category**: perf
- **Planned at**: commit `25bd32e4`, 2026-06-15

## Why this matters

The catalog search surface is demand-mounted, which is good, but opening it
currently loads and parses the entire catalog before the user searches. After
plan 006 splits catalog chunks, the next improvement is to make the UI load only
the index/pack data needed for the current filter/search path, while preserving
the existing `limit: 80` result cap.

This plan is intentionally deferred until catalog-pack work is clear and plan
006 has landed.

## Current state

- `components/recipes/StylePresetCatalogSearchSurface.tsx` - UI surface for
  style catalog search.
- `components/recipes/stylePresetCatalogData.ts` - loads all pack/preset YAML
  and builds one catalog object.
- `components/recipes/stylePresetManifests.ts` - search implementation.
- `components/recipes/stylePresetManifests.test.ts` - existing catalog/search
  tests.

Current excerpt from `components/recipes/StylePresetCatalogSearchSurface.tsx:42`:

```tsx
useEffect(() => {
  let cancelled = false;
  void import('./stylePresetCatalogData')
    .then(({ loadStylePresetCatalog }) => loadStylePresetCatalog())
    .then((loaded) => {
      if (!cancelled) setCatalog(loaded);
    });
  return () => {
    cancelled = true;
  };
}, []);
```

Current excerpt from `components/recipes/StylePresetCatalogSearchSurface.tsx:54`:

```tsx
const results = useMemo(
  () =>
    catalog
      ? searchStylePresetCatalog(catalog, {
          query,
          packId: packId || undefined,
          task: task || undefined,
          limit: 80,
        })
      : [],
  [catalog, packId, query, task],
);
```

Current excerpt from `components/recipes/stylePresetManifests.ts:586`:

```ts
export function searchStylePresetCatalog(
  catalog: StylePresetCatalog,
  filters: StylePresetCatalogSearchFilters = {},
): StylePresetCatalogSearchResult[] {
  const query = normalizeSearchText(filters.query);
```

Current excerpt from `components/recipes/stylePresetManifests.ts:600`:

```ts
for (const entry of catalog.presets) {
  const { manifest, taxonomy } = entry;
  const tags = new Set(taxonomy.tags.map((value) => value.toLowerCase()));
  const supportedTasks = new Set(taxonomy.supportedTasks.map((value) => value.toLowerCase()));
```

## Commands you will need

| Purpose       | Command                                                       | Expected on success |
| ------------- | ------------------------------------------------------------- | ------------------- |
| Focused tests | `vp test run components/recipes/stylePresetManifests.test.ts` | exit 0              |
| Chunk budget  | `bun run ui:chunks`                                           | exit 0              |
| Build         | `bun run build`                                               | exit 0              |
| Full tests    | `bun run test`                                                | exit 0              |
| Static check  | `bun run check`                                               | exit 0              |

## Scope

**In scope**:

- `components/recipes/StylePresetCatalogSearchSurface.tsx`
- `components/recipes/stylePresetCatalogData.ts`
- `components/recipes/stylePresetManifests.ts`
- `components/recipes/stylePresetManifests.test.ts`
- new catalog index/loader files introduced by plan 006

**Out of scope**:

- Editing preset content or manifest schema
- Default image generation
- Raising result limits or changing the visual design of catalog cards
- Rewriting the main Styles browser

## Git workflow

- Branch: `codex/007-incremental-style-catalog-search-loading`
- Commit style: `perf: load style catalog search incrementally`
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Confirm plan 006 landed

Do not start if `stylePresetCatalogData.ts` is still one monolithic module with
all pack and preset glob paths. This plan depends on split pack/index loaders.

**Verify**:
`bun run ui:chunks` -> exits 0 and shows split catalog chunks rather than one
near-budget `stylePresetCatalogData` chunk.

### Step 2: Add a lightweight searchable index

Introduce or reuse a compact catalog index that contains only the fields needed
to render initial search results and filters:

- preset id and name,
- pack id and pack name,
- category id/name,
- tags/tasks,
- default-image availability or preview pointer if already available cheaply.

The index should be enough for the surface to populate pack/task filters and
show limited result rows without parsing every full YAML document.

**Verify**:
`vp test run components/recipes/stylePresetManifests.test.ts` -> exit 0 after
adding index search tests.

### Step 3: Search the index first, load full preset data on demand

Refactor `StylePresetCatalogSearchSurface.tsx` so opening the surface loads the
small index first. Full pack/preset data should load only when needed, such as:

- applying a preset,
- selecting a result that requires full manifest data,
- narrowing to a specific pack where full pack load is acceptable.

Keep cancellation behavior from the current effect. If the user types quickly,
avoid overlapping full loads where a later query makes an earlier one obsolete.

**Verify**:
`vp test run components/recipes/stylePresetManifests.test.ts` -> exit 0.

### Step 4: Preserve result semantics

The existing `searchStylePresetCatalog` behavior caps results at 80 and matches
query text against id, name, category, domain, tags, avoid rules, and visual DNA.
For index search, document any fields not available in the lightweight index.
If exact parity is not possible without loading full YAML, keep an explicit
fallback path that loads the relevant pack(s) when the query needs full fields.

**Verify**:
Add tests showing:

- pack/task filters work from the index,
- result limit remains 80,
- applying/selecting a result loads enough full data to preserve existing
  behavior.

### Step 5: Build and inspect interaction cost

Run build and chunk budget. The catalog search UI shell should remain small,
and index chunks should be budgeted by plan 006.

**Verify**:
`bun run build` -> exit 0.
`bun run ui:chunks` -> exit 0.

## Test plan

- Extend `components/recipes/stylePresetManifests.test.ts` with index search
  coverage.
- If a new loader module is introduced, add tests for cache behavior and
  cancellation-safe repeated calls.
- Manual smoke after implementation: open catalog search, type a query, switch
  pack/task filters, select a result, apply a result.

## Done criteria

- [ ] Opening catalog search no longer loads/parses all full preset YAML before
      the first result list can render.
- [ ] Search/filter result semantics remain compatible or documented fallbacks
      load full data only when needed.
- [ ] Result limit remains 80.
- [ ] `vp test run components/recipes/stylePresetManifests.test.ts` exits 0.
- [ ] `bun run ui:chunks` exits 0.
- [ ] Full closeout gates from `plans/README.md` pass or exact blockers are recorded.
- [ ] `plans/README.md` status row updated.

## STOP conditions

Stop and report back if:

- Plan 006 has not landed.
- Exact search parity requires loading all full YAML on open anyway.
- The catalog-pack agent is still actively changing manifests or catalog loader
  files.
- Incremental loading would require changing public preset IDs, manifest schema,
  or apply-preset behavior.

## Maintenance notes

Future catalog features should choose deliberately between index fields and
full-manifest fields. If a new filter depends on full YAML-only data, add a test
that proves the fallback loads only the needed pack(s).
