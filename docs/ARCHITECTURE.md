# Arquitectura

## Visión general

Codex Studio mantiene una SPA React/Vite como interfaz principal, pero la ejecución real de generación ocurre en un backend local Bun/Hono. Ese backend supervisa `codex app-server`, persiste estado en SQLite, sirve assets de Studio Library y emite eventos SSE en vivo.

```mermaid
graph TD
    UI["React/Vite UI"] --> COMMAND["Command Center"]
    UI --> PIPE["useGenerationPipeline"]
    UI --> RUNTIME["useStudioRuntime"]
    PIPE --> RUN["Local Generation Run"]
    RUNTIME --> SYNC["Local Studio Sync"]
    RUN --> API["Bun/Hono local API :17223"]
    SYNC --> API
    API --> EVENTS["GET /api/events (SSE)"]
    EVENTS --> RUN
    EVENTS --> SYNC
    API --> CATALOG["/api/catalog + /library/*"]
    API --> SETTINGS["Studio Settings"]
    API --> DB["SQLite .studio/studio.sqlite"]
    API --> LIB["Studio Library .studio + outputs"]
    API --> PROVIDERS["Provider Boundary"]
    PROVIDERS --> CODEX["Codex Product Runtime"]
    CODEX --> CX["codex app-server ws://127.0.0.1:17224"]
    CX --> TURN["Codex image turns"]
    PROVIDERS --> FAL["fal.ai hosted API"]
    PROVIDERS --> GOOGLE["Google Gemini image API"]
    PROVIDERS --> COMFY["ComfyUI local runtime"]
```

## Seams principales

- `hooks/useStudioShell.ts`: materializes the `Studio Shell` by composing deeper shell-facing seams instead of owning catalog, page, and command wiring inline.
- `hooks/useStudioViewState.ts`: groups shell-local queue, editor, preview, and overlay visibility state so `useStudioShell.ts` can cross smaller view-state surfaces instead of a flat list of UI setters.
- `hooks/useStudioNavigation.ts`: groups recipe, modal, editor, and shell navigation concerns so route synchronization and overlay closing rules cross one deeper navigation seam instead of another flat argument list.
- `hooks/useStudioSettings.ts`: groups editable `Studio Settings`, provider capability/runtime-preflight reads, and External Output Source loading/import commands behind one shell-facing data surface instead of a wider spread of settings fields and callbacks.
- `hooks/useStudioActivitySession.ts`: groups selected-job inspection state and debug-panel toggling so shell activity wiring crosses focused `selection` and `debugPanel` surfaces instead of another flat list of runtime-detail props.
- `hooks/useCatalog.ts`: exposes the `Image Catalog` read seam plus `useStudioCatalogController()` for catalog mutations, queue-result previews, trash grouping, and refresh choreography.
- `hooks/useStudioGenerationSession.ts`: groups queue and generation-action surfaces so the `Studio Shell` no longer consumes another flat spread of generation-session fields.
- `services/studioRuntime.ts`: resolves the backend API base and runtime metadata without coupling the renderer to Electron.
- `hooks/useStudioRuntime.ts`: aggregates sync, onboarding, diagnostics, readiness, and session verification for shell consumers.
- `lib/queueStateMachine.ts`: centralizes queue slot selection, abort classification, and per-job queue execution results so `useQueueManager.ts` can stay focused on queue orchestration instead of owning the full execution lifecycle inline.
- `hooks/useLocalStudioSync.ts`: performs HTTP catch-up, subscribes to `GET /api/events`, mirrors backend jobs/logs, and refreshes the catalog.
- `services/localGenerationRun.ts`: creates Generation Task jobs, waits for terminal states with `watchJob()`, queries `/api/catalog?job_id=...`, and returns catalog-derived local result data.
- `services/localGenerationVisualBatchCompat.ts`: builds the legacy Visual Batch only at the compatibility edge.
- `services/localStudioService.ts`: the UI's single HTTP adapter to the local backend.
- `services/studioEventSource.ts`: shared SSE adapter for jobs, assets, logs, and connection state.
- `lib/studioCatalogView.ts`: pure Catalog Entry read model. It groups and filters catalog data without depending on Visual Batches or IndexedDB.
- `lib/studioCatalogImageAdapter.ts`: materializes UI images from Catalog Entries.
- `lib/studioLegacyVisualSnapshotExport.ts`: builds legacy `GenerationBatch[]` snapshots only for export compatibility.
- `lib/buildStudioPageController.ts`: concentrates `Studio Page` debug, grid, and operations projection and also exposes the shared `buildStudioViewportController()` presentation seam, so route view, recipe props, and dock visibility stop being rebuilt inline in `useStudioShell.ts`.
- `lib/buildStudioHeaderToolbarProps.ts`: concentrates `Command Center` and header-toolbar transitions, runtime status derivation, queue counts, and provider fallback in one seam.
- `hooks/useStudioOverlayController.ts`: keeps the lower-level overlay controller seam and now also exposes a deeper shell-overlay seam that derives `Studio Settings` library fallback and background-toggle choreography from runtime/settings modules instead of leaving that wiring inline in `useStudioShell.ts`.
- `lib/studioReadiness.ts` and `lib/studioDiagnostics.ts`: pure builders for onboarding, header status, and system panels.
- `apps/local-server/src/settingsRoutes.ts`: groups editable `Studio Settings` read/patch HTTP behavior so `appFactory.ts` keeps runtime composition concerns.
- `apps/local-server/src/codexRoutes.ts`: groups Local Codex Session and model/account route behavior (`/api/codex/*`) behind one backend seam.
- `apps/local-server/src/librariesRoutes.ts`: groups Studio Library list/create/default/remove HTTP behavior (`/api/libraries/*`) behind one backend seam.
- `apps/local-server/src/projectRoutes.ts`: groups project listing/creation HTTP behavior (`/api/projects`) and keeps event/log side effects out of `appFactory.ts` inline handlers.
- `apps/local-server/src/jobRoutes.ts`: groups job list/detail/cancel/create HTTP behavior (`/api/jobs/*`) and keeps provider-blocker/reference-processing orchestration out of `appFactory.ts` inline handlers.
- `apps/local-server/src/assetLogRoutes.ts`: groups lightweight asset/log list HTTP behavior (`/api/assets`, `/api/logs`) into a dedicated backend seam.
- `apps/local-server/src/runtimeRoutes.ts`: groups runtime health/bootstrap/app-server-start HTTP behavior (`/api/health`, `/api/bootstrap-config`, `/api/app-server/start`) into a dedicated backend seam.
- `apps/local-server/src/studioControlRoutes.ts`: groups Studio control HTTP behavior (`/api/studio/reset`) into a dedicated backend seam.
- `apps/local-server/src/providerRoutes.ts` and `apps/local-server/src/outputSourceRoutes.ts`: keep provider capability/preflight and External Output Source HTTP behavior out of `appFactory.ts` inline handlers.
- `apps/local-server/src/eventStreamRoutes.ts`: groups SSE event stream behavior (`/api/events`) into a dedicated backend seam.
- `apps/local-server/src/libraryRoutes.ts`: groups local asset serving behavior (`/library/*`) including thumbnail variant fallback and cache headers into a dedicated backend seam.
- `components/shell/StudioViewport.tsx`: demand-mounted route shell that lazy-loads studio and recipe surfaces.
- `components/recipes/styles/manifests/`: granular source of truth for Style Pack Manifests and Style Preset Manifests.

## Flujo de generación

1. The user works in the UI: prompt, recipe, attachments, batch count, provider, and workspace.
2. `useGenerationPipeline` delegates execution to the local generation runner.
3. The runner resolves the Recipe Module, creates a `batch-*` local run id, builds provider-independent Generation Task Specs with `spec-*` ids, creates one or more Persistent Jobs, and waits through the shared SSE stream.
4. The backend worker executes each job through the Provider Boundary.
5. Codex remains the primary adapter and runs turns against `codex app-server`.
6. External adapters compile the same Generation Task Spec into compact provider-specific inputs and only execute when concrete runtime preflight passes.
7. Completed jobs write Local Assets, Catalog Entries, transcripts, and logs into the Studio Library.
8. The UI refreshes `/api/catalog` by `jobId` and renders catalog-derived images.
9. Legacy Visual Batch compatibility is built only for remaining grid/recovery edges.

## Estado y persistencia

- SQLite is the local source of truth for jobs, cataloged assets, libraries, projects, settings, job events, and system logs.
- The Studio Library is an external local folder. By default it lives under the user's home directory, for example `%USERPROFILE%\AI-Studio-Library` on Windows.
- Internal state lives under `.studio/`; generated outputs, thumbnails, exports, and trash assets live under `outputs/`.
- IndexedDB no longer persists the active visual cache. Legacy keys such as `catalog-cache` and `catalog-trash` remain recovery-only compatibility surfaces.
- `LegacyVisualBatchContext` stores only lightweight refs for recovery dedupe and generated append compatibility.
- External Output Sources are read-only candidates until selected files are explicitly imported as Local Assets into the Studio Library.

## Sesión local y readiness

- The main product flow is blocked on **ChatGPT login** through the local Codex CLI.
- The default Codex flow does not require `OPENAI_API_KEY`.
- `/api/codex/session` is the canonical Local Codex Session read.
- `/api/codex/account` remains as a compatibility alias.
- Studio Readiness combines backend reachability, Studio Library health, Codex CLI availability, `codex app-server`, and Local Codex Session state.

## Provider Boundary

The Provider Boundary keeps Generation Tasks provider-independent:

- Recipe Modules produce Generation Task Specs.
- Providers compile specs into compact provider-specific Compiled Provider Inputs.
- Provider Secrets remain outside SQLite-backed Studio Settings.
- Providers must return the same local contract: job state, Local Assets, Catalog Entries, metadata, logs, and diagnostics.
- Planned providers stay blocked until a concrete executor can produce or import Local Assets.

Current concrete adapters:

- **Codex:** primary product runtime through `codex app-server`.
- **fal.ai:** hosted executor using `FAL_KEY` or `FAL_API_KEY` from backend env only.
- **Google Gemini image API:** hosted executor using `GOOGLE_API_KEY`, `GEMINI_API_KEY`, or `NANO_BANANA_API_KEY` from backend env only.
- **ComfyUI:** local executor using `COMFY_API_URL` or `COMFYUI_API_URL` plus `COMFY_WORKFLOW_TEMPLATE_PATH`.

## Superficies demand-mounted

Large or optional UI surfaces should not inflate startup:

- recipe pages are lazy-loaded by route;
- style catalog search mounts on demand;
- heavy catalog data, YAML parsing, ZIP export, Three.js, and visual background effects are lazy-loaded;
- `ui:source:verify` and `ui:chunks:verify` guard against regressions.

## Superficies de automatización

Codex SDK or scripts are automation surfaces, not the product runtime. They are used for audits, migrations, checks, and maintenance:

- `catalog:source:verify`
- `providers:verify`
- `recipes:verify`
- `styles:verify`
- `ui:source:verify`
- `ui:chunks:verify`
- `library:layout:verify`

## Objetivos de arquitectura open-source

- Keep setup local-first and Codex-first.
- Keep user assets and runtime state outside the repo.
- Keep provider secrets out of catalog metadata, logs, transcripts, screenshots, and docs.
- Prefer deep seams with small interfaces over shallow pass-through modules.
- Make diagnostics actionable for first-time users.
