# Responsive Mobile Implementation

Status: implemented and verified.

## Goal

Make Codex Studio functional on phone and tablet viewports without regressing the current desktop shell.

## Scope

- Preserve desktop Command Center, route loading, and demand-mounted surface ownership.
- Put mobile layout policy in shell/shared UI seams before route-specific fixes.
- Keep provider, catalog, generation, and library behavior unchanged.

## Implemented Plan

1. Mobile readiness gate
   - Added `ui:responsive` and `ui:responsive:verify`.
   - Gate captures `compact`, `mobile`, `tablet`, and `desktop` screenshots.
   - Gate checks studio, recipes, key recipes, queue, settings, and chat for horizontal overflow and blocked primary controls.

2. Shell responsive contract
   - Added shared CSS variables for mobile header, dock, safe area, recipe dock space, and available chrome block.
   - Queue rail now receives shell knowledge of bottom dock visibility.

3. Queue and composer hardening
   - Queue mobile overlay no longer depends on fixed `top-24`.
   - Composer popovers and recipe dropdowns use viewport-constrained mobile sheet behavior.
   - Mobile touch targets increased where controls were dense.
   - Mobile header commands collapse runtime, provider/settings, chat, activity, archive, and help into a command menu instead of keeping the desktop toolbar visible.
   - Mobile composer keeps prompt, upload, controls, and generate visible; generation settings and prompt tools open in a dedicated controls sheet.

4. Recipe blockers
   - Styles keeps desktop sidebars at `xl+`, with a mobile setup panel for references, style slots, strengths, clear, and generate.
   - Spritesheet no longer subtracts sidebar width on phone; cell editor becomes a mobile sheet and starts closed on small viewports.
   - Camera, Timeline, Remaster, Cinematic, Character Sheet, and Character Lab received mobile canvas/dock sizing guards.

5. Shared recipe mobile layout
   - `RecipeLayout` now exposes a stable content class and scrollable/wrapping dock behavior.
   - Bottom docks avoid horizontal overflow and use safe-area padding on mobile.

6. Browse, edit, and modal polish
   - Image grid drops to one column below 480px.
   - Image editor uses pointer events for touch/mouse input and a compact mobile controls panel.
   - Dashboard, Trash, and Queue use full-height/mobile-sheet behavior under small breakpoints.

7. Closeout
   - `bun run ui:responsive:verify -- --url=http://localhost:3000 --timeout=45000` passed with 38 scenarios and 0 violations, including the mobile composer controls sheet.
   - `bun run test` passed: 145 files, 519 tests.
   - `bun run check` passed: formatting, lint, and type checks.
   - `bun run build` passed: UI build, UI chunk verify, and server type-check.
   - `bun run styles:browser:verify -- --url=http://localhost:3000/#recipe-styles --timeout=60000` was run and remains blocked by pre-existing style render budget drift plus local backend CORS errors on port `17223`.
