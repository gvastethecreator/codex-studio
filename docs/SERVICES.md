# Services And Local Integration

## Summary

The app is split into two layers: a React/Vite frontend and a local Bun/Hono backend. Integration stays behind explicit service and hook seams.

## Frontend

### `services/studioRuntime.ts`

Resolves `apiBase` and runtime metadata for web or desktop contexts without coupling the renderer to Electron.

### `hooks/useStudioRuntime.ts`

Orchestrates shell runtime state: sync, onboarding, diagnostics, and readiness.

### `services/localStudioService.ts`

Single HTTP adapter from the UI to the local backend:

- health (`getStudioHealth`)
- local Codex session (`getLocalCodexSession`)
- jobs, projects, libraries, catalog, and logs
- app-server startup and studio reset

### `services/studioEventSource.ts`

Shared SSE adapter (`GET /api/events`) for jobs, assets, logs, and connection state.

### `services/localGenerationRun.ts`

Local execution seam: creates persistent jobs, waits for terminal state, queries the catalog by `jobId`, and materializes the result for the UI.

### `hooks/useLocalStudioSync.ts`

Keeps the frontend synchronized with the backend through HTTP catch-up, the SSE stream, and catalog refresh.

## Backend

### `apps/local-server/src/appFactory.ts`

Composes the local Hono API (`/api/health`, `/api/jobs`, `/api/catalog`, `/api/events`, `/library/*`, and related routes).

### `apps/local-server/src/worker.ts`

Processes jobs (`dry_run`, `codex_imagegen`) and publishes events for the SSE stream.

### `apps/local-server/src/codex/*`

Local Codex integration seams: `session`, `models`, `processSupervisor`, `rpcClient`, and `turn`.

### `apps/local-server/src/db.ts`

SQLite persistence for settings, jobs, catalog entries, libraries, and logs.

## Integration Decisions

| Topic               | Decision                               |
| ------------------- | -------------------------------------- |
| Durable source      | SQLite + Image Catalog                 |
| Live events         | Shared SSE (`/api/events`)             |
| Legacy visual model | `GenerationBatch[]` compatibility only |
| Primary runtime     | Codex through `codex app-server`       |

## Next Step

Before changing execution or sync flows, also review `docs/ARCHITECTURE.md` and `docs/TECHNICAL_DEBT.md`.
