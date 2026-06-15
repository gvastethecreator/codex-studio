# Plan 003: Expand Style Render Budget Coverage For Broad Searches

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report - do not improvise. When done, update the status row for this plan in
> `plans/README.md` unless a reviewer dispatched you and told you they maintain
> the index.
>
> **Drift check (run first)**:
> `git diff --stat 25bd32e4..HEAD -- scripts/report-style-render-budget.ts scripts/report-style-render-budget.test.ts components/recipes/styleBrowserRenderPlan.ts components/recipes/styleBrowserRenderPlan.test.ts`
> Also run:
> `git status --short -- scripts/report-style-render-budget.ts scripts/report-style-render-budget.test.ts components/recipes/styleBrowserRenderPlan.ts components/recipes/styleBrowserRenderPlan.test.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-bound-style-preview-preloads.md
- **Category**: tests
- **Planned at**: commit `25bd32e4`, 2026-06-15

## Why this matters

The current style render budget is useful, but its search coverage only checks
one narrow query. That means broad searches, favorites-only views, or worst-case
packs can regress without a guard. After plan 001 scopes preview preloads to the
render plan, the budget should explicitly protect broad render/search paths too.

## Current state

- `scripts/report-style-render-budget.ts` - produces the style render budget
  report and CLI output.
- `scripts/report-style-render-budget.test.ts` - validates current budget
  assumptions.
- `components/recipes/styleBrowserRenderPlan.ts` - shared render planning logic.

Current excerpt from `scripts/report-style-render-budget.ts:25`:

```ts
const MAX_INITIAL_RENDERED_CATEGORIES = STYLE_CATEGORY_INITIAL_RENDER_LIMIT;
const MAX_INITIAL_RENDERED_PRESET_CARDS =
  STYLE_CATEGORY_INITIAL_RENDER_LIMIT * STYLE_GROUP_INITIAL_RENDER_LIMIT;
const MAX_EXPANDED_GROUP_PRESET_CARDS = 128;
const MAX_EAGER_PRESET_CARDS = STYLE_BROWSER_EAGER_SECTION_LIMIT * STYLE_GROUP_INITIAL_RENDER_LIMIT;

const SEARCH_SCENARIOS = [
  {
    packId: 'pack_01',
    query: 'boudoir',
    maxRenderedPresetCards: STYLE_GROUP_INITIAL_RENDER_LIMIT,
    minMatchedPresetCards: 1,
  },
] as const;
```

Current excerpt from `scripts/report-style-render-budget.test.ts:43`:

```ts
expect(report.searchScenarios).toEqual([
  expect.objectContaining({
    packId: 'pack_01',
    query: 'boudoir',
    matchedPresetCards: 1,
    eagerPresetCards: 1,
    plannedPresetCards: 1,
    initialRenderedPresetCards: 1,
  }),
]);
```

Measured current report from the advisory pass:

- `pack_16`: 140 presets, 42 initial cards, largest expanded category 30.
- `pack_15`: 137 presets, 48 initial cards.
- `pack_05`: 135 presets, 53 initial cards.
- `pack_02`: 128 presets, only 2 categories, largest expanded category 119.
- Only search scenario: `pack_01` query `boudoir`, 1 match.

## Commands you will need

| Purpose       | Command                                                                                                    | Expected on success    |
| ------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------- |
| Focused tests | `vp test run scripts/report-style-render-budget.test.ts components/recipes/styleBrowserRenderPlan.test.ts` | exit 0                 |
| Render budget | `bun run styles:render`                                                                                    | exit 0, `violations=0` |
| Full tests    | `bun run test`                                                                                             | exit 0                 |
| Static check  | `bun run check`                                                                                            | exit 0                 |
| Build         | `bun run build`                                                                                            | exit 0                 |

## Scope

**In scope**:

- `scripts/report-style-render-budget.ts`
- `scripts/report-style-render-budget.test.ts`
- `components/recipes/styleBrowserRenderPlan.ts`
- `components/recipes/styleBrowserRenderPlan.test.ts`

**Out of scope**:

- Style pack manifest content
- Generated runtime pack data
- Catalog search data splitting from plans 006 and 007
- Raising budgets without adding coverage

## Git workflow

- Branch: `codex/003-expand-style-render-budget-search-coverage`
- Commit style: `test: expand style render budget coverage`
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Add broad search stress scenarios

Extend `scripts/report-style-render-budget.ts` so search coverage includes more
than the narrow `pack_01/boudoir` case. Add scenarios that represent broad
matches and high-card packs without changing manifest data. Good starting set:

- an empty-query or all-presets scenario for `pack_02`, because its largest
  category currently has 119 presets,
- a high-preset-count pack such as `pack_16`,
- a favorites-style scenario if `styleBrowserRenderPlan.ts` exposes enough data
  to simulate favorites without the UI.

Each scenario should assert:

- matched cards are nonzero,
- initial rendered cards stay under the existing initial-card budget,
- eager cards stay under `MAX_EAGER_PRESET_CARDS`.

**Verify**:
`vp test run scripts/report-style-render-budget.test.ts` -> update expectations
and get exit 0.

### Step 2: Keep budget failures actionable

When a search scenario fails, the violation string should include pack id, query
or scenario name, matched card count, and rendered card count. Avoid generic
"search failed" output.

**Verify**:
`bun run styles:render` -> output remains readable and exits 0.

### Step 3: Align render-plan tests if needed

If you add a shared helper in `styleBrowserRenderPlan.ts` for stress scenarios
or preload bounds from plan 001, add unit tests in
`components/recipes/styleBrowserRenderPlan.test.ts`. Do not duplicate full
generated pack data in unit tests.

**Verify**:
`vp test run scripts/report-style-render-budget.test.ts components/recipes/styleBrowserRenderPlan.test.ts` -> exit 0.

## Test plan

- Update `scripts/report-style-render-budget.test.ts` to assert the new
  scenarios by scenario name or pack id.
- Preserve the existing checks for initial categories, eager cards, and expanded
  category limits.
- Add unit tests in `styleBrowserRenderPlan.test.ts` only if new pure helper
  logic is introduced.

## Done criteria

- [ ] Search budget coverage has at least three meaningful scenarios, including
      a broad/high-card pack scenario.
- [ ] `bun run styles:render` exits 0 with `violations=0`.
- [ ] `vp test run scripts/report-style-render-budget.test.ts components/recipes/styleBrowserRenderPlan.test.ts` exits 0.
- [ ] No style manifests, generated runtime packs, or assets are modified.
- [ ] Full closeout gates from `plans/README.md` pass or exact blockers are recorded.
- [ ] `plans/README.md` status row updated.

## STOP conditions

Stop and report back if:

- The current render budget script has already been rewritten to include broad
  search/favorites stress cases.
- Adding broad scenarios fails because live pack data changed substantially; in
  that case report the new pack counts instead of weakening the budget.
- Passing the budget appears to require raising limits rather than preserving
  the current render-window behavior.

## Maintenance notes

Future style-pack expansions should update the stress scenario list if a new
pack exceeds current high-card packs. Keep this script focused on render cost,
not on validating manifest semantics.
