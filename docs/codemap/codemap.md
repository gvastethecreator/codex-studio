# Code map · codex-studio

generated: 2026-08-18T12:00:00Z
commit: 3dd225d12ed4
scope: .

counts: 20 nodes · 80 edges · 0 flows · 0 unknown

## Modules

- `app` · `App.tsx` · module · App
  callers: other-modules (imports)
  callees: components (imports), contexts (imports), external-dependencies (imports)
  tests: (none)
  entry: App.tsx:App

- `apps-local-server` · `apps/local-server` · service · Apps
  callers: repository (calls), scripts (imports)
  callees: constants (imports), external-dependencies (imports), lib (imports), packages-shared (imports)
  tests: apps/local-server/src/animationGifEncoder.test.ts, apps/local-server/src/animationSequenceRoutes.test.ts, apps/local-server/src/appFactory.test.ts, apps/local-server/src/assetLogRoutes.test.ts, apps/local-server/src/catalog.test.ts
  entry: apps/local-server/src/index.ts:studio

- `components` · `components` · interface · Components
  callers: app (imports), hooks (imports), lib (imports), scripts (imports), scripts-style-migration (imports)
  callees: constants (imports), contexts (imports), external-dependencies (imports), hooks (imports), lib (imports), packages-shared (imports), services (imports), types (imports), utils (imports)
  tests: components/ToolbarLiveStatus.test.tsx, components/header/QueueProgressBar.test.ts, components/overlays/StudioSystemOverlays.test.tsx, components/recipes/AnimationSequenceRecipe.test.tsx, components/recipes/SpritesheetRecipe.test.tsx
  entry: components/recipes/styles/collections/index.ts:export * from './styleCollectionDefinitions';

- `constants` · `constants.ts` · module · Constants
  callers: apps-local-server (imports), components (imports), contexts (imports), hooks (imports), lib (imports), scripts (imports), services (imports), types (imports), utils (imports)
  callees: types (imports)
  tests: apps/local-server/src/providers/grokImagineInput.test.ts, components/recipes/AnimationSequenceRecipe.test.tsx, components/recipes/SpritesheetRecipe.test.tsx, contexts/GenerationIsolation.runtime.test.tsx, hooks/useGenerationConfig.test.ts
  entry: constants.ts:MODELS

- `contexts` · `contexts` · module · Contexts
  callers: app (imports), components (imports), hooks (imports), repository (calls)
  callees: constants (imports), external-dependencies (imports), hooks (imports), lib (imports), packages-shared (imports), services (imports), types (imports), utils (imports)
  tests: contexts/GenerationIsolation.runtime.test.tsx, contexts/RuntimeLogIsolation.runtime.test.tsx, contexts/globalReducer.test.ts
  entry: contexts/GenerationContext.tsx:useRequiredGenerationContext

- `external-dependencies` · `App.tsx` · external · External
  callers: app (imports), apps-local-server (imports), components (imports), contexts (imports), hooks (imports), lib (imports), lib-recipecontextbuilders (imports), other-modules (imports), packages-shared (imports), scripts (imports), scripts-style-migration (imports), services (imports), skills-imagegen-scripts-image-gen (imports), skills-imagegen-scripts-remove-chroma-key (imports), types (imports), utils (imports)
  callees: (none)
  tests: (none)
  entry: App.tsx:react

- `hooks` · `hooks` · module · Hooks
  callers: components (imports), contexts (imports), lib (imports), repository (calls)
  callees: components (imports), constants (imports), contexts (imports), external-dependencies (imports), lib (imports), packages-shared (imports), services (imports), types (imports), utils (imports)
  tests: hooks/catalogEventRefreshPolicy.test.ts, hooks/catalogMutationReconciliationPolicy.test.ts, hooks/localStudioSyncProjection.test.ts, hooks/localStudioSyncRefreshPolicy.test.ts, hooks/studioDiagnosticsRefreshPolicy.test.ts
  entry: hooks/catalogEventRefreshPolicy.ts:mergeCatalogRefreshScopes

- `lib` · `lib` · module · Lib
  callers: apps-local-server (imports), components (imports), contexts (imports), hooks (imports), lib-recipecontextbuilders (imports), scripts (imports), services (imports), utils (imports)
  callees: components (imports), constants (imports), external-dependencies (imports), hooks (imports), lib-recipecontextbuilders (imports), lib-stylethumbnailpacks-generated (imports), packages-shared (imports), services (imports), types (imports), utils (imports)
  tests: apps/local-server/src/providers/grokImagineInput.test.ts, components/QueuePanel.test.ts, components/StudioSettingsModal.test.ts, hooks/useStudioGallery.test.ts, hooks/useStudioGenerationActions.test.ts
  entry: lib/activeRecipeIndicator.ts:getActiveRecipeIndicator

- `lib-recipecontextbuilders` · `lib/recipeContextBuilders` · interface · Lib
  callers: lib (imports)
  callees: external-dependencies (imports), lib (imports), packages-shared (imports), types (imports)
  tests: lib/recipeContextBuilders/index.test.ts
  entry: lib/recipeContextBuilders/index.ts:RECIPE_CONTEXT_BUILDERS

- `lib-stylethumbnailpacks-generated` · `lib/styleThumbnailPacks.generated` · module · Lib
  callers: lib (imports)
  callees: (none)
  tests: (none)
  entry: lib/styleThumbnailPacks.generated/index.ts:loadGeneratedStyleThumbnailPack

- `other-modules` · `main.tsx` · module · Other Modules
  callers: (none)
  callees: app (imports), external-dependencies (imports)
  tests: (none)
  entry: main.tsx:rootElement

- `packages-shared` · `packages/shared` · module · Packages
  callers: apps-local-server (imports), components (imports), contexts (imports), hooks (imports), lib (imports), lib-recipecontextbuilders (imports), scripts (imports), services (imports), types (imports), utils (imports)
  callees: external-dependencies (imports)
  tests: apps/local-server/src/animationSequenceRoutes.test.ts, apps/local-server/src/appFactory.test.ts, apps/local-server/src/assetLogRoutes.test.ts, apps/local-server/src/catalogCommands.test.ts, apps/local-server/src/catalogRoutes.test.ts
  entry: packages/shared/src/index.ts:export * from './types';

- `repository` · `package.json` · module · Repository
  callers: (none)
  callees: apps-local-server (calls), contexts (calls), hooks (calls), scripts (calls)
  tests: (none)
  entry: package.json:{

- `scripts` · `scripts` · service · Scripts
  callers: repository (calls)
  callees: apps-local-server (imports), components (imports), constants (imports), external-dependencies (imports), lib (imports), packages-shared (imports), types (imports)
  tests: scripts/audit-style-preset-dna-completeness.test.ts, scripts/audit-style-preset-scene-lock.test.ts, scripts/catalog-first-source-audit.test.ts, scripts/check-docs.test.ts, scripts/devPortFinder.test.ts
  entry: scripts/audit-provider-inputs.ts:argValue

- `scripts-style-migration` · `scripts/style-migration` · database · Scripts
  callers: (none)
  callees: components (imports), external-dependencies (imports)
  tests: (none)
  entry: scripts/style-migration/enrich-pack-01-photo-dna.ts:argValue

- `services` · `services` · service · Services
  callers: components (imports), contexts (imports), hooks (imports), lib (imports)
  callees: constants (imports), external-dependencies (imports), lib (imports), packages-shared (imports), types (imports), utils (imports)
  tests: services/animationSequenceRunCoordinator.test.ts, services/localGenerationRun.stream.test.ts, services/localGenerationRun.test.ts, services/localGenerationRuntimeAdapters.test.ts, services/studio-api/api.test.ts
  entry: services/animationSequenceRunCoordinator.ts:createAnimationSequenceRunCoordinator

- `skills-imagegen-scripts-image-gen` · `skills/imagegen/scripts/image_gen.py` · service · Skills
  callers: (none)
  callees: external-dependencies (imports)
  tests: (none)
  entry: skills/imagegen/scripts/image_gen.py:_NullContext

- `skills-imagegen-scripts-remove-chroma-key` · `skills/imagegen/scripts/remove_chroma_key.py` · service · Skills
  callers: (none)
  callees: external-dependencies (imports)
  tests: (none)
  entry: skills/imagegen/scripts/remove_chroma_key.py:_die

- `types` · `types.ts` · module · Types
  callers: components (imports), constants (imports), contexts (imports), hooks (imports), lib (imports), lib-recipecontextbuilders (imports), scripts (imports), services (imports), utils (imports)
  callees: constants (imports), external-dependencies (imports), packages-shared (imports)
  tests: contexts/GenerationIsolation.runtime.test.tsx, hooks/useWorkspaceStrip.test.ts, lib/activeRecipeIndicator.test.ts, lib/imageGridPresentation.test.ts, lib/recipeIdentity.test.ts
  entry: types.ts:Attachment

- `utils` · `utils` · module · Utils
  callers: components (imports), contexts (imports), hooks (imports), lib (imports), services (imports)
  callees: constants (imports), external-dependencies (imports), lib (imports), packages-shared (imports), types (imports)
  tests: utils/catalogImageGenerationConfig.test.ts, utils/fileUtils.test.ts, utils/imageGenSizing.test.ts
  entry: utils/catalogImageGenerationConfig.ts:isRecordLike

## Edges

- app -> components · imports
- app -> contexts · imports
- app -> external-dependencies · imports
- apps-local-server -> constants · imports
- apps-local-server -> external-dependencies · imports
- apps-local-server -> lib · imports
- apps-local-server -> packages-shared · imports
- components -> constants · imports
- components -> contexts · imports
- components -> external-dependencies · imports
- components -> hooks · imports
- components -> lib · imports
- components -> packages-shared · imports
- components -> services · imports
- components -> types · imports
- components -> utils · imports
- constants -> types · imports
- contexts -> constants · imports
- contexts -> external-dependencies · imports
- contexts -> hooks · imports
- contexts -> lib · imports
- contexts -> packages-shared · imports
- contexts -> services · imports
- contexts -> types · imports
- contexts -> utils · imports
- hooks -> components · imports
- hooks -> constants · imports
- hooks -> contexts · imports
- hooks -> external-dependencies · imports
- hooks -> lib · imports
- hooks -> packages-shared · imports
- hooks -> services · imports
- hooks -> types · imports
- hooks -> utils · imports
- lib -> components · imports
- lib -> constants · imports
- lib -> external-dependencies · imports
- lib -> hooks · imports
- lib -> lib-recipecontextbuilders · imports
- lib -> lib-stylethumbnailpacks-generated · imports
- lib -> packages-shared · imports
- lib -> services · imports
- lib -> types · imports
- lib -> utils · imports
- lib-recipecontextbuilders -> external-dependencies · imports
- lib-recipecontextbuilders -> lib · imports
- lib-recipecontextbuilders -> packages-shared · imports
- lib-recipecontextbuilders -> types · imports
- other-modules -> app · imports
- other-modules -> external-dependencies · imports
- packages-shared -> external-dependencies · imports
- repository -> apps-local-server · calls
- repository -> contexts · calls
- repository -> hooks · calls
- repository -> scripts · calls
- scripts -> apps-local-server · imports
- scripts -> components · imports
- scripts -> constants · imports
- scripts -> external-dependencies · imports
- scripts -> lib · imports
- scripts -> packages-shared · imports
- scripts -> types · imports
- scripts-style-migration -> components · imports
- scripts-style-migration -> external-dependencies · imports
- services -> constants · imports
- services -> external-dependencies · imports
- services -> lib · imports
- services -> packages-shared · imports
- services -> types · imports
- services -> utils · imports
- skills-imagegen-scripts-image-gen -> external-dependencies · imports
- skills-imagegen-scripts-remove-chroma-key -> external-dependencies · imports
- types -> constants · imports
- types -> external-dependencies · imports
- types -> packages-shared · imports
- utils -> constants · imports
- utils -> external-dependencies · imports
- utils -> lib · imports
- utils -> packages-shared · imports
- utils -> types · imports

## Unknown

- none

## Flows

- none
