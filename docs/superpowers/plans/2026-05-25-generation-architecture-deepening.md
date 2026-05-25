# Codex Studio Generation Architecture Deepening

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement task-by-task. Track progress with the checklist below.

**Goal:** Fix the five architecture seams found in the 2026-05-25 pass: Generation Task intake, Catalog Entry commands, Recipe Modules, Style Preset Manifests, and Demand-Mounted Surfaces.

**Architecture:** Make Generation Task Specs the durable job intake contract, keep Provider-specific compilation behind provider adapters, put Catalog Entry mutations behind command modules, let Recipe Modules produce task-level specs, normalize Style Preset Manifests before UI use, and mount heavy Studio surfaces only when needed.

**Tech Stack:** TypeScript, React 19, Vite+, Bun/Hono, SQLite through `bun:sqlite`, tests through `vite-plus/test`.

## Task 1: Generation Task Intake

**Files:**

- Modify: `packages/shared/src/types.ts`
- Modify: `apps/local-server/src/db.ts`
- Modify: `apps/local-server/src/dbStore.ts`
- Modify: `apps/local-server/src/appFactory.ts`
- Modify: `apps/local-server/src/providers/types.ts`
- Modify: `apps/local-server/src/providers/codexProvider.ts`
- Modify: `apps/local-server/src/worker.ts`
- Modify: `services/localGenerationRun.ts`
- Test: `packages/shared/src/generationContracts.test.ts`
- Test: `apps/local-server/src/providers/codexProvider.test.ts`

- [x] Add failing tests proving a job can carry a source Generation Task Spec and provider id.
- [x] Persist and map the source spec/provider id on jobs.
- [x] Send `image_generate` jobs from Local Generation Run while preserving `codex_imagegen` compatibility.
- [x] Compile Codex inputs from the stored source spec, not only the final prompt string.

## Task 2: Catalog Entry Commands

**Files:**

- Create: `apps/local-server/src/catalogCommands.ts`
- Test: `apps/local-server/src/catalogCommands.test.ts`
- Modify: `apps/local-server/src/appFactory.ts`

- [x] Add failing tests for update, soft delete, restore, purge, and not-found command results.
- [x] Wrap Catalog Entry mutations in a command module that owns event publishing.
- [x] Keep route handlers thin and HTTP-shaped.

## Task 3: Recipe Modules

**Files:**

- Create: `lib/recipeModules.ts`
- Test: `lib/recipeModules.test.ts`
- Modify: `lib/recipeContext.ts`
- Modify: `services/localGenerationRun.ts`

- [x] Add failing tests for building a Generation Task Spec from recipe params.
- [x] Expose registered Recipe Modules that build recipe context and task specs.
- [x] Use the module interface when creating Local Generation Run job specs.

## Task 4: Style Preset Manifests

**Files:**

- Create: `components/recipes/stylePresetManifests.ts`
- Test: `components/recipes/stylePresetManifests.test.ts`
- Modify: `components/recipes/stylesData.ts`

- [x] Add failing tests for normalizing legacy YAML packs into Style Preset Manifests.
- [x] Export manifest metadata separately from compatibility `STYLE_PACKS`.
- [x] Keep existing recipe UI behavior unchanged.

## Task 5: Demand-Mounted Surfaces

**Files:**

- Test: `components/overlays/StudioSystemOverlays.test.tsx`
- Modify: `components/overlays/StudioSystemOverlays.tsx`

- [x] Add failing tests proving closed system surfaces are not instantiated.
- [x] Mount Debug, Dashboard, Onboarding, and Settings surfaces only when their open flags are true.
- [x] Preserve existing close/export/reset handlers.

## Completion Audit

- [x] Focused tests for each new seam.
- [x] `bun run test`
- [ ] `bun run check` (blocked by pre-existing global formatting drift outside this change)
- [x] `bun run build`
