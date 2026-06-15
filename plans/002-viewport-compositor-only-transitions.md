# Plan 002: Make Viewport Transitions Compositor-Only

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report - do not improvise. When done, update the status row for this plan in
> `plans/README.md` unless a reviewer dispatched you and told you they maintain
> the index.
>
> **Drift check (run first)**:
> `git diff --stat 25bd32e4..HEAD -- components/shell/StudioViewport.tsx components/shell/StudioViewport.test.ts`
> Also run:
> `git status --short -- components/shell/StudioViewport.tsx components/shell/StudioViewport.test.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `25bd32e4`, 2026-06-15

## Why this matters

Route changes animate full-screen Studio surfaces. The current transition uses
`filter: blur(4px)`, which is more paint-heavy than transform/opacity and can
show up as navigation jank on large views. The project design guidance already
prefers transform and opacity motion, so this is a small, low-risk alignment
with the local design/performance rules.

## Current state

- `components/shell/StudioViewport.tsx` - lazy-renders the recipe, studio, and
  recipe-list route surfaces and applies page transition variants.
- `components/shell/StudioViewport.test.ts` - current route-key tests for the
  viewport.

Current excerpt from `components/shell/StudioViewport.tsx:19`:

```tsx
const viewVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.98,
    filter: 'blur(4px)',
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
```

Current excerpt from `components/shell/StudioViewport.tsx:39`:

```tsx
exit: (direction: number) => ({
  zIndex: 0,
  x: direction < 0 ? '50%' : '-50%',
  opacity: 0,
  scale: 0.98,
  filter: 'blur(4px)',
  transition: {
```

Current test style from `components/shell/StudioViewport.test.ts:20`:

```ts
describe('StudioViewport routing', () => {
  it('maps views to route keys for AnimatePresence transitions', () => {
    expect(resolveViewportRouteKey('studio', null)).toBe('studio');
```

## Commands you will need

| Purpose       | Command                                               | Expected on success    |
| ------------- | ----------------------------------------------------- | ---------------------- |
| Focused tests | `vp test run components/shell/StudioViewport.test.ts` | exit 0                 |
| Source guard  | `bun run scripts/ui-demand-surface-audit.ts`          | exit 0, `violations=0` |
| Full tests    | `bun run test`                                        | exit 0                 |
| Static check  | `bun run check`                                       | exit 0                 |
| Build         | `bun run build`                                       | exit 0                 |

## Scope

**In scope**:

- `components/shell/StudioViewport.tsx`
- `components/shell/StudioViewport.test.ts`
- optionally `scripts/ui-demand-surface-audit.ts` and
  `scripts/ui-demand-surface-audit.test.ts` if you add a source guard

**Out of scope**:

- `lib/gsapMotion.tsx` - defer broader GSAP startup removal to plan 005
- Recipe page code and individual recipe animations
- Any design restyle beyond removing full-screen blur from route transitions

## Git workflow

- Branch: `codex/002-viewport-compositor-only-transitions`
- Commit style: `fix: make viewport transitions compositor-only`
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Remove full-screen filter animation

Edit `components/shell/StudioViewport.tsx` so `viewVariants` uses only
compositor-friendly properties for route motion: `x`, `opacity`, `scale`, and
`zIndex`. Remove `filter` from `enter`, `center`, `exit`, and nested transition
objects.

Do not replace it with backdrop blur, box shadow animation, or another paint
heavy property.

**Verify**:
`Select-String -Path components/shell/StudioViewport.tsx -Pattern "filter|blur"` -> no matches.

### Step 2: Add a regression assertion

Prefer exporting a small testable helper or constant from
`StudioViewport.tsx`, such as `viewVariants`, if that does not create an import
cycle. Extend `components/shell/StudioViewport.test.ts` to assert that route
variants do not include a `filter` property in enter, center, or exit states.

If exporting the variants would meaningfully worsen the component boundary, add
a source-audit rule instead in `scripts/ui-demand-surface-audit.ts` that fails
when `StudioViewport.tsx` contains `filter: 'blur(`.

**Verify**:
`vp test run components/shell/StudioViewport.test.ts` -> exit 0.

### Step 3: Run source and build gates

Run the source guard and production build. This plan should not materially
change chunk sizes, but it should leave the existing gates green.

**Verify**:
`bun run scripts/ui-demand-surface-audit.ts` -> exit 0, `violations=0`.

## Test plan

- Extend `components/shell/StudioViewport.test.ts` if practical.
- If a source-audit rule is used, extend
  `scripts/ui-demand-surface-audit.test.ts` using its existing pattern.
- No browser visual test is required for this small change, but if Playwright is
  already being used in the implementation session, a quick route switch smoke
  is useful.

## Done criteria

- [ ] `StudioViewport.tsx` contains no `filter` or `blur` in route variants.
- [ ] A regression test or source-audit guard prevents reintroducing route blur.
- [ ] `vp test run components/shell/StudioViewport.test.ts` exits 0, or the
      source-audit test command exits 0 if that path was chosen.
- [ ] `bun run scripts/ui-demand-surface-audit.ts` exits 0.
- [ ] Full closeout gates from `plans/README.md` pass or exact blockers are recorded.
- [ ] `plans/README.md` status row updated.

## STOP conditions

Stop and report back if:

- `StudioViewport.tsx` has already been converted to compositor-only motion.
- Removing `filter` changes route key behavior or lazy route loading.
- A designer or product owner explicitly requires blur as a functional cue.
- The fix appears to require editing recipe pages or unrelated animation files.

## Maintenance notes

This plan intentionally does not remove GSAP or `motion/react`. Plan 005 handles
startup bundle composition after the route transition itself is cheaper.
