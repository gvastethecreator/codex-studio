# Next agent tasks for Codex Studio

Repo: `D:\DEV\codex-studio`

State: paused by the user for another agent. Do not mark the active goal as completed. The project improved, but it is not yet in a final professional-release state.

Update 2026-05-26: **Style Preset Authoring Tooling** and **Browser-Verified Styles Performance Gate** are completed in this branch. Unless the user asks to iterate on scaffold/gate UX, resume from **Live Recipe Prompt Quality Evaluation**.

Update 2026-05-30: pipeline follow-up work is split into three ready-to-pick docs:

- `docs/active/pipeline-token-efficiency-plan.md`: reduce tokens through compact `Compiled Provider Input`, Provider Session Contract reuse, batch context sharing, and safe metrics.
- `docs/active/pipeline-image-quality-plan.md`: improve output quality with structured visual specs, reference roles, prompt tightening, quality presets, and live review evidence.
- `docs/active/pipeline-queue-reliability-plan.md`: harden queue submission with task-spec validation, reference preflight, provider preflight, normalized errors, and dry-run smoke coverage.

Update 2026-06-26: **Queue/Recipes UI density and Reference Handoff** work added a backend-managed `/api/references/handoff` flow for oversized browser references. Large inline images should be persisted into the Studio Library `.studio/references/handoff-*` path before Browser Queue recovery needs to serialize them; queued jobs then carry `localPath`/`sourceUrl` refs instead of oversized `data:image` payloads.

Update 2026-06-26: **Compact Shell UI pass** tightened normal-use chrome after an `improve-interfaces` audit. Header controls, workspace strip, usage/status controls, composer dock, Queue rail, Queue cards, and Recipe cards now use smaller visual footprints while keeping dense hit targets. Route changes now use a scoped transform/opacity transition instead of generic slide/zoom classes.

## Resumption protocol

1. Read `AGENTS.md`, `CONTEXT.md`, `docs/ARCHITECTURE.md`, latest relevant `docs/adr/*.md`, `docs/active/professionalization-roadmap.md`, `docs/active/professionalization-handoff.md`, `docs/TECHNICAL_DEBT.md`, and `SKILLS.md`.
2. Use PowerShell without profile (`login:false` / `-NoProfile`) because the local profile/oh-my-posh previously caused hangs/noise.
3. Preserve the dirty worktree. Many files are intentionally modified. Do not revert unrelated changes.
4. Pick one vertical slice. Add focused tests/guards where useful.
5. Validate with focused `bun run test -- <files>` and `bun run check -- <files>`, then the relevant domain gate and `bun run build`.

## Last verified slice

Latest focused work fixed and verified:

- Added `styles:scaffold`, a non-destructive CLI for new granular presets. It dry-runs by default, requires `--write` to mutate, scaffolds from repo-local image/sprite/texture templates, accepts category id or exact category name, updates both pack-level and category `presetRefs`, and supports optional `--default-image`.
- Updated `SKILLS.md` and `docs/STYLE_PRESET_AUTHORING.md` to document the scaffold-first flow.
- Style/recipe queue now snapshots attachments before clearing the composer, so users can enqueue one image-guided style job and attach more images without reloading.
- Backend task assets include queued attachments.
- Task summary exposes total timing, queue wait, provider turn, asset import, token usage, and prompt estimate.
- Recent Results panel is compact with internal scroll.
- Recent Results can open a lightweight carousel from the Queue panel.
- Queue cards are compacted for denser job scanning.
- Recipe section cards use a vertical TCG-style layout with recipe artwork.
- Oversized browser references can use the Studio Library reference handoff path instead of failing recovery solely because inline bytes exceed 512 KB.
- Carousel resolver has focused coverage.
- Compact shell pass tightened header/workspace/status controls, bottom composer, Queue rail/cards, and Recipes grid/card density.
- Route transitions use the `studio-route-enter` transform/opacity helper with reduced-motion coverage.

Fresh commands that passed:

```bash
bun run test -- scripts/scaffold-style-preset.test.ts
bun run check -- scripts/scaffold-style-preset.ts scripts/scaffold-style-preset.test.ts SKILLS.md docs/STYLE_PRESET_AUTHORING.md package.json
bun run styles:templates:verify
bun run styles:source:verify
bun run test -- scripts/style-manifest-files.test.ts lib/stylesBrowserGate.test.ts scripts/report-style-render-budget.test.ts
bun run check -- scripts/verify-styles-browser-gate.ts package.json
bun run styles:render:verify
bun run ui:source:verify
bun run styles:browser:verify -- --url=http://localhost:3001/#recipe-styles
bun run test
bun run test -- hooks/useStudioGenerationActions.test.ts hooks/useQueueManager.test.ts services/localGenerationRun.test.ts apps/local-server/src/jobDetails.test.ts lib/studioCarouselImage.test.ts
bun run check -- hooks/useStudioGenerationActions.ts hooks/useStudioGenerationActions.test.ts components/QueuePanel.tsx components/DebugPanel.tsx components/recipes/StylesRecipe.tsx hooks/useGenerationConfig.ts services/localGenerationRun.ts apps/local-server/src/jobDetails.ts lib/studioCarouselImage.ts
bun run build
```

## Top-priority pending tasks

### 1. Style Preset authoring tooling

Problem: presets are now granular, but authoring still requires manual YAML creation plus pack/category ref edits.

Tasks:

- Add a non-destructive `styles:scaffold` script.
- Default to dry-run; require `--write` for mutation.
- Inputs: `--preset=<ID>`, `--pack=<pack_id>`, `--category=<category id or exact name>`, `--name=<Name>`, `--template=style|sprite|texture`, optional `--default-image=<path>`.
- Output: create `components/recipes/styles/manifests/presets/<pack>/<PRESET_ID>.yaml`.
- Update both pack-level `presetRefs` and the selected category `presetRefs`.
- Refuse overwrite/duplicate refs.
- Emit next steps: add default image, run preset validation, regenerate runtime.
- Add tests for planning/ref generation/duplicate refusal without touching real manifests.
- Update `SKILLS.md` and `docs/STYLE_PRESET_AUTHORING.md`.

Useful files:

- `scripts/style-manifest-files.ts`
- `components/recipes/styles/manifests/templates/*.template.yaml`
- `components/recipes/styles/manifestTypes.ts`
- `docs/STYLE_PRESET_AUTHORING.md`
- `SKILLS.md`

Validation:

```bash
bun run test -- scripts/scaffold-style-preset.test.ts
bun run check -- scripts/scaffold-style-preset.ts scripts/scaffold-style-preset.test.ts SKILLS.md docs/STYLE_PRESET_AUTHORING.md
bun run styles:templates:verify
bun run styles:source:verify
```

### 2. Browser-verified Styles performance gate (completed in this branch)

Completed:

- Added optional `styles:browser` / `styles:browser:verify` command backed by `scripts/verify-styles-browser-gate.ts`.
- The gate now runs via `tsx` on Node because Playwright launch hung under Bun on Windows.
- The script checks `pack_05` collapsed and expanded DOM counts, verifies the catalog surface is unmounted before open and mounted after open, runs the `boudoir` search scenario, and captures console/page issues after a timestamped reload.
- `scripts/style-manifest-files.ts` now has a Node fs fallback so the gate can load manifest data outside Bun.
- For clean console validation on dev, start the UI with `VITE_ENABLE_REACT_SCAN=false`.
- Latest passing command: `bun run styles:browser:verify -- --url=http://localhost:3001/#recipe-styles`.

Only revisit if you want to:

- wire `styles:browser:verify` into broader release validation,
- tighten the lazy-resource heuristics beyond DOM demand-mount confirmation, or
- harden port/host discovery so `--url` is less manual.

Useful validation:

```bash
bun run styles:render:verify
bun run ui:source:verify
bun run ui:chunks:verify
bun run styles:browser:verify -- --url=http://localhost:3001/#recipe-styles
bun run build
```

### 3. Live Recipe prompt-quality evaluation

Problem: compact Recipe Provider Directives save tokens, and the repo now has a dedicated live-comparison harness, but representative Codex evidence still needs to be collected.

Tasks:

- Use `recipes:evaluate` reports to choose representative recipe cases.
- Use `recipes:evaluate:live` dry-run output to confirm the exact legacy/directives cases and prompt deltas you want to review.
- Run `recipes:evaluate:live -- --execute` for representative legacy-vs-directive comparisons when the local Codex session is ready.
- Fill the generated Markdown review template; keep output quality notes as job/catalog refs plus reviewer notes, without storing secrets or large generated assets in the repo.
- Do not remove legacy Recipe Context from stored job metadata until quality evidence is good.
- Keep the denoise workaround intact: `Apply a heavy strong denoise to the resulting image.`

Useful files:

- `scripts/evaluate-recipe-prompts.ts`
- `scripts/evaluate-recipe-prompts-live.ts`
- `lib/recipeProviderDirectives.ts`
- `apps/local-server/src/codex/imagegenContract.ts`
- `apps/local-server/src/providers/codexProvider.ts`

Validation:

```bash
bun run recipes:verify
bun run recipes:evaluate:live -- --recipe=styles --out=logs/recipe-prompt-quality
bun run providers:verify
```

### 4. Catalog-first UI closeout

Problem: Catalog Entries are the durable truth, but legacy Visual Batch compatibility still exists.

Tasks:

- Continue shrinking `LegacyVisualBatchContext`.
- Move remaining grid/export flows to direct Catalog Entry read models.
- Keep Visual Batch only at explicit import/export/recovery compatibility edges until it can be deleted.
- Add/extend guards if `GenerationBatch` or `useLegacyVisualBatches()` spreads again.
- Document the final removal plan for the ADR-0013 follow-up.

Useful files:

- `contexts/LegacyVisualBatchContext.tsx`
- `contexts/legacyVisualBatchReducer.ts`
- `lib/studioCatalogView.ts`
- `lib/studioCatalogImageAdapter.ts`
- `lib/studioLegacyVisualSnapshotExport.ts`
- `lib/localGenerationVisualBatchCompat.ts`
- `scripts/catalog-first-source-audit.ts`

Validation:

```bash
bun run catalog:source:verify
bun run test -- contexts/legacyVisualBatchReducer.test.ts lib/localGenerationVisualBatchCompat.test.ts lib/studioWorkspaceExport.test.ts scripts/catalog-first-source-audit.test.ts
bun run build
```

### 5. Settings and External Output UX

Problem: settings/output-source backend exists, but the UX still needs polish for professional file workflows.

Tasks:

- Improve registered External Output Source file selection and import UX.
- Preserve the rule: registration is not import.
- Add better empty/loading/error states for source scanning.
- Add clearer output folder preview based on date/provider/model/recipe options.
- Make filename template validation visible before saving.
- Never delete/move external source files unless explicitly requested.

Useful files:

- `components/StudioSettingsModal.tsx`
- `hooks/useStudioSettings.ts`
- `services/localStudioService.ts`
- `apps/local-server/src/outputSources.ts`
- `apps/local-server/src/outputOrganization.ts`

Validation:

```bash
bun run library:layout:verify
bun run check -- components/StudioSettingsModal.tsx hooks/useStudioSettings.ts services/localStudioService.ts apps/local-server/src/outputSources.ts apps/local-server/src/outputOrganization.ts
bun run build
```

### 6. Command Center closeout

Problem: the top toolbar is the Command Center, but final command/menu polish remains.

Tasks:

- Audit all global status/provider/usage/settings/library controls and ensure they live in the toolbar or in toolbar-opened Demand-Mounted Surfaces.
- Keep the toolbar compact; deeper settings belong in a modal.
- Verify runtime status, provider, queue count, recent previews, and usage fit at desktop and narrow widths.
- Add focused rendered tests if possible.

Useful files:

- `components/HeaderToolbar.tsx`
- `components/ui/TopToolbar.tsx`
- `hooks/useStudioHeaderToolbarConfig.ts`
- `hooks/useStudioShell.ts`
- `components/header/UsageStatusCard.tsx`

Validation:

```bash
bun run ui:source:verify
bun run check -- components/HeaderToolbar.tsx components/ui/TopToolbar.tsx hooks/useStudioHeaderToolbarConfig.ts hooks/useStudioShell.ts components/header/UsageStatusCard.tsx
bun run build
```

### 7. Backend dependency injection

Problem: the logger seam exists and app factory now has more route-level seams, but DB/worker/lifecycle still rely on singletons/global modules in places.

Current status:

- Done: `createStudioApp` accepts injected catalog store, DB store, worker, logger, app-server lifecycle, library routes, and workspace routes.
- Done: composition tests cover injected library/workspace route listing, codex failure paths, app-server lifecycle, catalog commands, project routes, and worker cancel behavior.
- Remaining: deeper data functions still default to singleton-backed modules behind those route seams, so continue extracting only where it simplifies isolated tests or removes route-handler coupling.

Tasks:

- Extend remaining backend dependencies only where practical.
- Keep route handlers thin.
- Preserve Provider Boundary import guards.
- Add isolated backend tests around injected dependencies.

Useful files:

- `apps/local-server/src/appFactory.ts`
- `apps/local-server/src/worker.ts`
- `apps/local-server/src/db.ts`
- `apps/local-server/src/catalogStore.ts`
- `apps/local-server/src/codex/*`

Validation:

```bash
bun run providers:verify
bun run test -- apps/local-server/src/appFactory.test.ts apps/local-server/src/worker.test.ts apps/local-server/src/catalogRoutes.test.ts
bun run build
```

## Medium-priority pending tasks

### 8. Recipe modules for new asset types

Current examples exist for `sprite_sheet` and `texture_generate`, but they are `example_only`.

Tasks:

- Promote a task only after UI, builder, provider directives, and adapter execution are explicit.
- Add runtime Recipe Module metadata only when provider behavior is clear.
- Keep task names provider-independent.

Validation:

```bash
bun run recipes:examples:verify
bun run recipes:verify
```

### 9. Frontend logging adapter

Problem: direct `console.*` usage remains scattered.

Tasks:

- Add a frontend logging adapter with levels.
- Keep debug/activity surfaces Demand-Mounted.
- Avoid leaking Provider Secrets or local paths in user-visible logs.

### 10. Studio Runtime naming cleanup

Problem: docs distinguish Studio Runtime and Studio Readiness, but code naming can still confuse adapter vs orchestrator.

Tasks:

- Decide whether `useStudioRuntime` should be renamed or documented as the orchestration layer.
- Keep `services/studioRuntime.ts` as the static runtime resolution adapter unless an ADR changes it.

### 11. UI test coverage

Tasks:

- Add focused tests for `Toolbar`, `QueuePanel` rendered compact results, `StudioPage`, and `useLocalStudioSync`.
- Prefer pure helper extraction when full DOM tests are too heavy.

### 12. Release artifact audit

Tasks:

- Re-run the final scan before release candidate.
- Ensure no generated images, SQLite DBs, transcripts, logs, prompts, `.env.local`, or local output folders are committed.
- Confirm only intended versioned default cards in `.webp` remain.

Useful commands:

```bash
git status --short
git ls-files
```

## Suggested skills

- `caveman`: keep communication brief; the user prefers this mode.
- `handoff`: for future pause/resume docs.
- `improve-codebase-architecture`: for provider/catalog/DI slices.
- `diagnose`: for runtime bugs, UI regressions, or Windows tooling failures.
- `playwright`: for browser validation/perf screenshots if adding browser gates.
- `openai-docs`: only when changing Codex official integration semantics.

## Do not

- Do not mark the active goal complete.
- Do not collapse Codex-first product semantics into a generic provider router.
- Do not store Provider Secret values in SQLite, logs, transcripts, screenshots, or docs.
- Do not reintroduce monolithic legacy style pack YAML.
- Do not delete/move Studio Library data unless the user explicitly asks.
- Do not run broad formatting over the entire dirty tree casually.

## Recommended next first slice

Start with **Browser-Verified Styles Performance Gate**. The static/render-plan checks already exist and manual browser verification was proven, but the reusable release-gate script is still missing.
