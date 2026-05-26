# Services and Local Integration

## Frontend

### `services/studioRuntime.ts`

Resolves `apiBase` and runtime metadata (web or desktop) without coupling the renderer to Electron.

- `resolveStudioRuntime()` exposes `kind`, `label`, `apiBase`, and capabilities.
- `resolveStudioApiBase()` returns the effective HTTP base for the local backend.
- `isDesktopStudioRuntime()` distinguishes web from the desktop shell.

### `hooks/useStudioRuntime.ts`

Runtime-facing orchestrator for the shell.

- composes `useLocalStudioSync`, `useStudioOnboarding`, and `useStudioDiagnostics`;
- exposes `diagnostics`, `localCodexSession`, `readiness`, `runtime`, and `refreshRuntime()`;
- prevents `AppContent` from wiring health, sync, and onboarding manually.

### `services/localStudioService.ts`

Single UI adapter toward the local backend.

- `getStudioHealth()` verifies the backend, Studio Library, Codex CLI, and `codex app-server`.
- `getLocalCodexSession()` reads the local ChatGPT/Codex session used by the product.
- `getCodexModelCatalog()` discovers local models exposed by the app-server.
- `startStudioAppServer()` requests app-server lifecycle startup.
- `resetStudioData()` clears backend-managed DB, assets, logs, and state.
- `listProjects()`, `createStudioJob()`, `listStudioJobs()`, `getStudioJobDetail()`, and `cancelStudioJob()` manage the persistent queue.
- `listLibraries()` and `queryCatalog()` expose the main library and catalog surfaces.
- `listStudioLogs()` shows backend logs in the visual console.
- `getCodexAccountStatus()` remains as a compatibility alias for the legacy endpoint.
- `getStudioApiBase()` and `toStudioAssetUrl()` build stable local URLs for assets and thumbnails.

### `services/studioEventSource.ts`

Shared SSE adapter for live backend events.

- `createStudioEventStream()` exposes `onJobUpdate`, `onAssetAdded`, `onLogAdded`, and `onConnectionChange`.
- `watchJob()` waits for a persistent job to reach a terminal state without reintroducing dedicated polling.
- one SSE connection can feed general sync and concurrent generations.

### `hooks/useGenerationPipeline.ts`

Controls visual validation, balance, modal state, and `GenerationBatch` commit. It does not know persistent-job orchestration details.

### `services/localGenerationRun.ts`

Converts a visual configuration into local generation results and a compatibility `GenerationBatch` edge.

- creates persistent `codex_imagegen` jobs;
- waits for completion with `watchJob()` over a shared SSE stream;
- queries `/api/catalog` filtered by `jobId`;
- materializes UI image data from Catalog Entries at the compatibility edge.

### `hooks/useLocalStudioSync.ts`

Keeps the UI aligned with the local backend.

- performs initial HTTP catch-up for jobs, logs, and catalog;
- reuses `createStudioEventStream()` for jobs, logs, and assets;
- refreshes catalog-backed UI state without making Visual Batches the durable model;
- exposes session verification and recovery hooks used by the shell.

### `lib/studioReadiness.ts` y `lib/studioDiagnostics.ts`

Pure builders that convert health + Local Codex Session into readable snapshots for onboarding, header, and system panels.

### `components/AppContent.tsx`

Orchestrates the integration:

- consumes `useStudioRuntime()` as the aggregate local-backend seam;
- mixes UI and backend logs in panels;
- renders catalog-derived images while SQLite remains the durable model;
- verifies the local Codex session from the credentials popover;
- keeps the original workspace, recipe, grid, modal, and editor flow usable.

## Backend

### `apps/local-server/src/appFactory.ts`

Local Hono API:

- `GET /api/health`
- `POST /api/app-server/start`
- `GET /api/codex/models`
- `GET /api/codex/session`
- `GET /api/codex/account` (compatibility)
- `POST /api/studio/reset`
- `GET /api/projects`
- `GET /api/jobs`
- `GET /api/jobs/:id`
- `POST /api/jobs`
- `POST /api/jobs/:id/cancel`
- `GET /api/libraries`
- `POST /api/libraries`
- `PUT /api/libraries/:id/default`
- `DELETE /api/libraries/:id`
- `GET /api/catalog`
- `GET /api/catalog/search`
- `GET /api/catalog/:id`
- `PATCH /api/catalog/:id`
- `DELETE /api/catalog/:id`
- `POST /api/catalog/:id/restore`
- `POST /api/catalog/:id/embed`
- `GET /api/logs`
- `GET /api/events`
- `GET /library/*`
- `app.route('/api/workspaces', ...)`

### `worker.ts`

Processes `dry_run` and `codex_imagegen` jobs. For `codex_imagegen`, it runs a turn through `codex app-server`, writes a JSONL transcript, updates catalog/assets, and emits events consumed by the frontend SSE stream.

### `apps/local-server/src/codex/`

Concentrates the main seams for the local Codex backend.

- `localCodexSession.ts`: canonical read of the local ChatGPT/Codex session.
- `modelCatalog.ts`: catalog of models available in the local app-server.
- `processSupervisor.ts`: ensure + diagnostics for `codex app-server`.
- `rpcClient.ts`: JSON-RPC transport to the app-server.
- `sessionPool.ts`: session/thread reuse for imagegen.
- `turn.ts`: Codex Turn orchestration.

### `db.ts`

Local SQLite with tables for settings, projects, jobs, assets, catalog, libraries, job events, and system logs.

### `logger.ts`

Writes logs to SQLite and to disk under the configured Studio Library `logs/` folder.

## Legacy surfaces

- `Visual Batch` and `GenerationBatch[]` remain visual compatibility surfaces, not the durable model.
- `/api/codex/account` and `/api/assets` survive for compatibility, but the canonical newer UI surfaces are `Local Codex Session`, `/api/catalog`, and `GET /api/events`.
- Direct external-provider services from the original app are outside the active integrated pipeline. The integrated UI does not depend on API keys for image generation.
