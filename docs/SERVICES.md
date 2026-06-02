# Servicios e integración local

## Resumen

La app está separada en dos capas: frontend React/Vite y backend local Bun/Hono. La integración se mantiene mediante servicios y hooks con seams explícitos.

## Frontend

### `services/studioRuntime.ts`

Resuelve `apiBase` y metadatos de runtime (web o desktop) sin acoplar renderer a Electron.

### `hooks/useStudioRuntime.ts`

Orquesta estado de runtime para shell (sync, onboarding, diagnóstico y readiness).

### `services/localStudioService.ts`

Adaptador HTTP único de la UI hacia backend local:

- salud (`getStudioHealth`)
- sesión local Codex (`getLocalCodexSession`)
- jobs/proyectos/librerías/catálogo/logs
- inicio de app-server y reset de estudio

### `services/studioEventSource.ts`

Adaptador SSE compartido (`GET /api/events`) para jobs, assets, logs y estado de conexión.

### `services/localGenerationRun.ts`

Seam de ejecución local: crea jobs persistentes, espera estado terminal, consulta catálogo por `jobId` y materializa resultado para UI.

### `hooks/useLocalStudioSync.ts`

Sincroniza frontend con backend (catch-up HTTP + stream SSE + refresco de catálogo).

## Backend

### `apps/local-server/src/appFactory.ts`

Compone la API Hono local (`/api/health`, `/api/jobs`, `/api/catalog`, `/api/events`, `/library/*`, etc.).

### `apps/local-server/src/worker.ts`

Procesa jobs (`dry_run`, `codex_imagegen`) y publica eventos para el stream SSE.

### `apps/local-server/src/codex/*`

Seams de integración local con Codex (`session`, `models`, `processSupervisor`, `rpcClient`, `turn`).

### `apps/local-server/src/db.ts`

Persistencia SQLite para settings, jobs, catálogo, librerías y logs.

## Decisiones de integración

| Tema                 | Decisión                                |
| -------------------- | --------------------------------------- |
| Fuente durable       | SQLite + Image Catalog                  |
| Eventos en vivo      | SSE compartido (`/api/events`)          |
| Modelo visual legacy | `GenerationBatch[]` sólo compatibilidad |
| Runtime principal    | Codex vía `codex app-server`            |

## Próximo paso

Si vas a tocar flujos de ejecución o sincronización, revisa también `docs/ARCHITECTURE.md` y `docs/TECHNICAL_DEBT.md`.
