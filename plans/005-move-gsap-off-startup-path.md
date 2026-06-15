# Plan 005: Move GSAP Compatibility Off The Startup Path

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report - do not improvise. When done, update the status row for this plan in
> `plans/README.md` unless a reviewer dispatched you and told you they maintain
> the index.
>
> **Drift check (run first)**:
> `git diff --stat 25bd32e4..HEAD -- vite.config.ts lib/gsapMotion.tsx components/Toolbar.tsx components/shell/StudioViewport.tsx components/studio/StudioOperationsRail.tsx components/AppContent.tsx`
> Also run:
> `git status --short -- vite.config.ts lib/gsapMotion.tsx components/Toolbar.tsx components/shell/StudioViewport.tsx components/studio/StudioOperationsRail.tsx components/AppContent.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: L
- **Risk**: MED
- **Depends on**: plans/002-viewport-compositor-only-transitions.md
- **Category**: perf
- **Planned at**: commit `25bd32e4`, 2026-06-15

## Why this matters

The production `index` chunk currently passes the 500 KiB startup budget, but
only by about 18 KiB. The local `motion/react` alias points at a GSAP-backed
compatibility layer, and startup components import `motion/react`, which pulls
GSAP concepts into the initial bundle. Moving startup chrome away from the
GSAP-backed compatibility layer should create headroom without removing richer
motion from demand-mounted overlays and recipe surfaces.

## Current state

- `vite.config.ts` aliases `motion/react` to local GSAP compatibility.
- `lib/gsapMotion.tsx` imports `gsap` and `@gsap/react` at module load.
- Startup chrome imports `motion/react` through `Toolbar`,
  `StudioViewport`, and `StudioOperationsRail`.
- Current measured `ui:chunks` output from the advisory pass:
  `index-TLuBFAK6.js` = 493,766 bytes, max = 512,000 bytes, headroom = 18,234.

Current excerpt from `vite.config.ts:25`:

```ts
resolve: {
  alias: {
    '@': path.resolve(rootDir, '.'),
    'motion/react': path.resolve(rootDir, 'lib/gsapMotion.tsx'),
  },
},
```

Current excerpt from `lib/gsapMotion.tsx:12`:

```ts
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);
```

Current excerpt from `components/Toolbar.tsx:31`:

```tsx
import { AnimatePresence, MotionDiv, type Variants } from 'motion/react';
```

Current excerpt from `components/studio/StudioOperationsRail.tsx:1`:

```tsx
import React from 'react';
import { AnimatePresence, MotionDiv } from 'motion/react';
```

Current excerpt from `components/AppContent.tsx:5`:

```tsx
import { HeaderToolbar } from './HeaderToolbar';
import { StudioOperationsRail } from './studio/StudioOperationsRail';
import { StudioGenerationDock } from './shell/StudioGenerationDock';
import { StudioViewport } from './shell/StudioViewport';
```

## Commands you will need

| Purpose       | Command                                                                                                    | Expected on success                                              |
| ------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Source search | `rg -n "motion/react" components/Toolbar.tsx components/shell components/studio components/AppContent.tsx` | no startup-path matches remain                                   |
| Build         | `bun run build`                                                                                            | exit 0                                                           |
| Chunk budget  | `bun run ui:chunks`                                                                                        | exit 0; `main-index` headroom improves or at least remains green |
| GSAP check    | PowerShell command in Step 4                                                                               | no `gsap` matches in the built `index-*.js`                      |
| Full tests    | `bun run test`                                                                                             | exit 0                                                           |
| Static check  | `bun run check`                                                                                            | exit 0                                                           |

## Scope

**In scope**:

- `components/Toolbar.tsx`
- `components/shell/StudioViewport.tsx`
- `components/studio/StudioOperationsRail.tsx`
- small local helper components for CSS-based presence/transition if needed
- tests/source audits needed to keep startup imports clean

**Out of scope**:

- Demand-mounted overlays such as `ImageCarousel`, modals, and recipe pages
  unless they are proven to be imported by startup chrome
- Removing the `motion/react` alias globally
- Rewriting `lib/gsapMotion.tsx`
- Visual redesign of the toolbar or queue panel

## Git workflow

- Branch: `codex/005-move-gsap-off-startup-path`
- Commit style: `perf: move gsap off startup path`
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Confirm startup import graph

Before editing, identify all startup-path `motion/react` imports. Treat these
as the first candidates:

- `components/Toolbar.tsx`
- `components/shell/StudioViewport.tsx`
- `components/studio/StudioOperationsRail.tsx`
- any direct child imported by `components/AppContent.tsx` that imports
  `motion/react`

**Verify**:
`rg -n "motion/react" components/Toolbar.tsx components/shell components/studio components/AppContent.tsx`
prints only the expected startup candidates.

### Step 2: Replace viewport and rail motion with CSS transitions

Plan 002 should already have removed blur from `StudioViewport`. Replace
`MotionDiv`/`AnimatePresence` usage in `StudioViewport` and
`StudioOperationsRail` with React conditional rendering plus CSS classes or a
small local transition helper that does not import GSAP.

Keep behavior simple:

- route surfaces still switch by `key`,
- queue rail still opens/closes without layout breakage,
- no animated `filter`, `height`, or expensive paint-heavy properties.

**Verify**:
`rg -n "motion/react" components/shell components/studio/StudioOperationsRail.tsx`
prints no matches.

### Step 3: Replace toolbar popover motion on the startup path

`Toolbar.tsx` imports `motion/react` for popovers and small enter/exit effects.
Replace those with either:

- conditional rendering plus Tailwind/CSS transition classes, or
- a tiny local `Presence` helper that uses React state and CSS transitionend
  without GSAP.

Do not change toolbar interaction semantics, shortcut handling, file drop
behavior, prompt state, or generation actions.

**Verify**:
`rg -n "motion/react" components/Toolbar.tsx` prints no matches.

### Step 4: Build and confirm GSAP left the startup chunk

Run the production build, then inspect the built index chunk.

PowerShell verification command:

```powershell
$f=(Get-ChildItem dist/assets -Filter index-*.js | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
[regex]::Matches((Get-Content -LiteralPath $f -Raw), 'gsap').Count
```

Expected result: `0`. If the result is not `0`, run:

```powershell
rg -n "motion/react" components hooks lib --glob "*.tsx" --glob "*.ts"
```

and identify which startup import still pulls the alias in.

**Verify**:
`bun run build` -> exit 0; GSAP match count in built index is `0`.

### Step 5: Check chunk headroom

Run the chunk budget and compare main-index headroom against the pre-plan
baseline of 18,234 bytes.

**Verify**:
`bun run ui:chunks` -> exit 0. `main-index` should remain green and ideally
show more than 18,234 bytes of headroom.

## Test plan

- Existing `components/shell/StudioViewport.test.ts` should continue to pass.
- Add or update source-audit tests if you add a startup import guard.
- Manual smoke after implementation: open the app, switch between Studio,
  Recipes, and one recipe; open/close the queue rail and toolbar popovers.

## Done criteria

- [ ] Startup-path files no longer import `motion/react`.
- [ ] Demand-mounted files may still import `motion/react`.
- [ ] Production `index-*.js` contains no `gsap` string matches.
- [ ] `bun run ui:chunks` exits 0 and `main-index` remains below 500 KiB.
- [ ] Toolbar, viewport, and queue rail behavior remain functionally intact.
- [ ] Full closeout gates from `plans/README.md` pass or exact blockers are recorded.
- [ ] `plans/README.md` status row updated.

## STOP conditions

Stop and report back if:

- Removing `motion/react` from startup requires rewriting demand-mounted overlay
  components.
- The built `index` still contains GSAP after all obvious startup imports are
  removed and the remaining importer is unclear.
- CSS replacement breaks toolbar input, file drop, modal, or queue semantics.
- The app's design direction requires keeping GSAP route/popover animations on
  startup despite the chunk pressure.

## Maintenance notes

Keep `lib/gsapMotion.tsx` available for richer demand-mounted surfaces. The goal
is startup headroom, not a project-wide animation purge.
