# Codex Studio Architecture Deepening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the five requested architecture deepening slices in the requested order: Image Catalog, Style Default Asset Pipeline, backend DI, Studio Shell sessions, and structured recipe identity.

**Architecture:** Move durable studio state behind deeper Modules whose Interfaces expose the project vocabulary from `CONTEXT.md`: Image Catalog, Catalog Entry, Local Generation Run, Studio Shell, Studio Readiness, and Style Default Asset Pipeline. Keep Visual Batch as a temporary Adapter where needed, but make durable Catalog Entries the test surface for new work.

**Tech Stack:** TypeScript, React 19, Vite+, Bun/Hono, SQLite via `bun:sqlite`, Vitest-compatible `vite-plus/test`.

---

## File Structure

- `hooks/useCatalog.ts`: new frontend Module that reads Catalog Pages directly, handles loading/pagination/refresh, and exposes Catalog Entries as the primary Interface.
- `lib/studioCatalogView.ts`: pure selectors/adapters for Catalog Entries, including Visual Batch compatibility only where the current UI still needs it.
- `hooks/useLocalStudioSync.ts`: stop importing broad catalog windows into `catalog-cache`; keep backend jobs/logs/events and trigger catalog refresh callbacks.
- `services/localGenerationRun.ts`: return generated Catalog Entries alongside the temporary Visual Batch Adapter.
- `contexts/GlobalContext.tsx`: remove durable reliance on `catalog-cache` and `catalog-trash` as the primary image store once consumers move to `useCatalog`.
- `lib/styleDefaultAssetPipeline.ts`: new Module that owns style default planning, job adoption, manifest/failure shaping, and evidence.
- `scripts/generate-style-defaults.ts`, `scripts/recover-style-default-cache-assets.ts`, `scripts/reconcile-style-default-assets.ts`: CLI Adapters around `lib/styleDefaultAssetPipeline.ts`.
- `apps/local-server/src/dbStore.ts`: backend DB Adapter/Store factory around `Database` and current DB operations.
- `apps/local-server/src/appFactory.ts`, `apps/local-server/src/worker.ts`: receive DB/worker lifecycle Adapters instead of default singletons.
- `hooks/useStudioGallerySession.ts`, `hooks/useStudioGenerationSession.ts`, `hooks/useStudioActivitySession.ts`, `hooks/useStudioOverlaySession.ts`: deeper Studio Shell Modules.
- `lib/recipeIdentity.ts`: structured recipe identity helpers that read/write `recipeId`, `recipeParams`, preset ids, and Catalog Entry metadata without substring matching.

## Task 1: Image Catalog As UI Read Interface

**Files:**

- Create: `lib/studioCatalogView.ts`
- Create: `hooks/useCatalog.ts`
- Test: `lib/studioCatalogView.test.ts`
- Test: `hooks/useCatalog.test.ts` if hook test support is already established; otherwise keep the first slice pure in `lib/studioCatalogView.test.ts`.
- Modify: `hooks/useLocalStudioSync.ts`
- Modify: `services/localGenerationRun.ts`
- Modify: `contexts/GlobalContext.tsx`

- [ ] **Step 1: Write failing tests for Catalog Entry grouping and Visual Batch compatibility**

```ts
import { describe, expect, it } from 'vite-plus/test';
import type { CatalogImage } from '../packages/shared/src';
import { createCatalogView, materializeVisualBatchesFromCatalog } from './studioCatalogView';

function image(overrides: Partial<CatalogImage>): CatalogImage {
  return {
    id: overrides.id ?? 'image-1',
    libraryId: 'library-1',
    filePath: `C:/library/assets/${overrides.id ?? 'image-1'}.png`,
    thumbnailPath: null,
    publicUrl: `/library/assets/${overrides.id ?? 'image-1'}.png`,
    thumbnailUrl: null,
    prompt: 'prompt',
    negativePrompt: null,
    aspectRatio: '2:3',
    imageSize: '1024x1536',
    width: null,
    height: null,
    mimeType: 'image/png',
    fileSizeBytes: null,
    jobId: overrides.jobId ?? 'job-1',
    workspaceId: overrides.workspaceId ?? 'default',
    batchId: overrides.batchId ?? 'batch-1',
    recipeId: overrides.recipeId ?? null,
    isFavorite: overrides.isFavorite ?? false,
    isDeleted: overrides.isDeleted ?? false,
    deletedAt: null,
    tags: [],
    generationConfig: overrides.generationConfig ?? null,
    createdAt: overrides.createdAt ?? '2026-05-24T00:00:00.000Z',
  };
}

describe('studioCatalogView', () => {
  it('keeps Catalog Entries as the primary read model while grouping only for visual compatibility', () => {
    const entries = [
      image({ id: 'a', batchId: 'batch-a', createdAt: '2026-05-24T00:00:02.000Z' }),
      image({ id: 'b', batchId: 'batch-a', createdAt: '2026-05-24T00:00:01.000Z' }),
    ];

    const view = createCatalogView(entries);

    expect(view.entries.map((entry) => entry.id)).toEqual(['a', 'b']);
    expect(view.byId.get('a')?.batchId).toBe('batch-a');
    expect(materializeVisualBatchesFromCatalog(view)).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run focused test and verify RED**

Run: `vp test run lib/studioCatalogView.test.ts`

Expected: FAIL because `lib/studioCatalogView.ts` does not exist.

- [ ] **Step 3: Implement `studioCatalogView` as the pure Catalog Entry Module**

Expose `createCatalogView(entries)`, `filterCatalogEntries(view, filters)`, and `materializeVisualBatchesFromCatalog(view)` by reusing the existing `materializeVisualBatchImage` logic internally.

- [ ] **Step 4: Run focused test and verify GREEN**

Run: `vp test run lib/studioCatalogView.test.ts`

Expected: PASS.

- [ ] **Step 5: Stop `useLocalStudioSync` from owning catalog import state**

Change `useLocalStudioSync` so it mirrors backend jobs/logs/events and accepts an optional `onCatalogChanged` callback. Asset/catalog events call that callback instead of importing `limit: 200` into `GenerationBatch[]`.

- [ ] **Step 6: Introduce `useCatalog` and migrate the first consumer**

Create `useCatalog(filters)` around `queryCatalog` and use it from the Studio Gallery session or the nearest existing gallery seam. Keep a Visual Batch Adapter at the edge only while `ImageGrid` still expects `GeneratedImageWithConfig[]`.

## Task 2: Style Default Asset Pipeline Module

**Files:**

- Create: `lib/styleDefaultAssetPipeline.ts`
- Test: `lib/styleDefaultAssetPipeline.test.ts`
- Modify: style default scripts to call the Module as CLI Adapters.

- [ ] **Step 1: Write failing tests for plan/evidence shape**
- [ ] **Step 2: Implement pure planning for preset jobs**
- [ ] **Step 3: Implement manifest/failure entry builders**
- [ ] **Step 4: Move CLI scripts onto the Module without changing their command flags**
- [ ] **Step 5: Run focused and full tests**

## Task 3: Backend DI Stores And Lifecycle

**Files:**

- Create: `apps/local-server/src/dbStore.ts`
- Test: `apps/local-server/src/dbStore.test.ts`
- Modify: `apps/local-server/src/db.ts`
- Modify: `apps/local-server/src/appFactory.ts`
- Modify: `apps/local-server/src/worker.ts`

- [ ] **Step 1: Write failing tests for isolated in-memory DB Store**
- [ ] **Step 2: Implement DB Store Adapter around current DB functions**
- [ ] **Step 3: Let `createStudioApp` receive stores and worker lifecycle Adapters**
- [ ] **Step 4: Remove module-scope default worker creation from app construction path**
- [ ] **Step 5: Run backend tests and full tests**

## Task 4: Studio Shell Session Modules

**Files:**

- Create: `hooks/useStudioGallerySession.ts`
- Create: `hooks/useStudioGenerationSession.ts`
- Create: `hooks/useStudioActivitySession.ts`
- Create: `hooks/useStudioOverlaySession.ts`
- Modify: `hooks/useStudioShell.ts`
- Test: focused hook/pure-config tests for each extracted session where existing patterns allow.

- [ ] **Step 1: Write failing tests for the first extracted session Interface**
- [ ] **Step 2: Extract Gallery session**
- [ ] **Step 3: Extract Generation session**
- [ ] **Step 4: Extract Activity/Readiness session**
- [ ] **Step 5: Extract Overlay session**
- [ ] **Step 6: Verify `useStudioShell` only composes session Interfaces**

## Task 5: Structured Recipe Identity

**Files:**

- Create: `lib/recipeIdentity.ts`
- Test: `lib/recipeIdentity.test.ts`
- Modify: `components/recipes/StylesRecipe.tsx`
- Modify: `components/recipes/TimelineRecipe.tsx`
- Modify: `components/recipes/CameraAnglesRecipe.tsx`
- Modify: Catalog Entry generation config builders where needed.

- [ ] **Step 1: Write failing tests for recipe identity matching without prompt substrings**
- [ ] **Step 2: Implement structured recipe identity helpers**
- [ ] **Step 3: Replace substring matching in style, timeline, and camera recipes**
- [ ] **Step 4: Ensure Catalog Entry metadata carries the same identity through generation**
- [ ] **Step 5: Run focused tests and full validation**

## Completion Audit

- [ ] `bun run test`
- [ ] `bun run check`
- [ ] `bun run build`
- [ ] Inspect `git diff --stat` and confirm changes match only the five requested slices.
- [ ] Verify no new durable image state is hidden behind `catalog-cache` or substring-only recipe identity.
