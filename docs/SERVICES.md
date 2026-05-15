# Servicios e Integracion Local

## Frontend

### `services/studioRuntime.ts`

Resuelve `apiBase` y metadatos del runtime (web o desktop) sin acoplar el renderer a Electron.

- `resolveStudioRuntime()` expone `kind`, `label`, `apiBase` y capacidades.
- `resolveStudioApiBase()` devuelve la base HTTP efectiva para el backend local.
- `isDesktopStudioRuntime()` permite distinguir web vs shell desktop.

### `hooks/useStudioRuntime.ts`

Orquestador de seams runtime-facing para el shell.

- compone `useLocalStudioSync`, `useStudioOnboarding` y `useStudioDiagnostics`;
- expone `diagnostics`, `localCodexSession`, `readiness`, `runtime` y `refreshRuntime()`;
- evita que `AppContent` tenga que coser manualmente health, sync y onboarding.

### `services/localStudioService.ts`

Adaptador unico de la UI hacia el backend local.

- `getStudioHealth()` verifica backend, Studio Library, Codex CLI y `codex app-server`.
- `getLocalCodexSession()` lee la sesion local ChatGPT/Codex usada por el producto.
- `getCodexModelCatalog()` descubre los modelos locales expuestos por el app-server.
- `startStudioAppServer()` pide arrancar el lifecycle del app-server.
- `resetStudioData()` limpia DB, assets, logs y estado manejado por backend.
- `listProjects()`, `createStudioJob()`, `listStudioJobs()`, `getStudioJobDetail()` y `cancelStudioJob()` manejan la cola persistente.
- `listLibraries()` y `queryCatalog()` exponen la superficie principal de bibliotecas y catalogo.
- `listStudioLogs()` muestra logs del backend en la consola visual.
- `getCodexAccountStatus()` se conserva como alias de compatibilidad para el endpoint legacy.
- `getStudioApiBase()` y `toStudioAssetUrl()` construyen URLs locales estables para assets y thumbnails.

### `services/studioEventSource.ts`

Adaptador SSE compartido para eventos vivos del backend.

- `createStudioEventStream()` expone `onJobUpdate`, `onAssetAdded`, `onLogAdded` y `onConnectionChange`.
- `watchJob()` espera a que un job persistente llegue a un estado terminal sin reintroducir polling dedicado.
- una sola conexion SSE puede alimentar sincronizacion general y generaciones concurrentes.

### `hooks/useGenerationPipeline.ts`

Controla validaciones visuales, balance, modal y commit del `GenerationBatch`. No conoce la coreografia de jobs persistentes.

### `services/localGenerationRun.ts`

Convierte una configuracion visual en un `GenerationBatch`.

- crea jobs `codex_imagegen` persistentes;
- espera su finalizacion con `watchJob()` sobre un stream SSE compartido;
- consulta `/api/catalog` filtrado por `jobId`;
- materializa imagenes y thumbnails para el cache visual en IndexedDB.

### `hooks/useLocalStudioSync.ts`

Mantiene la UI alineada con el backend local.

- hace catch-up inicial de jobs, logs y catalogo por HTTP;
- reutiliza `createStudioEventStream()` para jobs, logs y assets;
- importa Catalog Entries al cache `GenerationBatch[]` que sigue usando el grid actual;
- expone `verifyCodexSession()` y recuperacion de batches huerfanos.

### `lib/studioReadiness.ts` y `lib/studioDiagnostics.ts`

Builders puros para convertir health + Local Codex Session en snapshots legibles por onboarding, header y paneles del sistema.

### `components/AppContent.tsx`

Orquesta la integracion:

- consume `useStudioRuntime()` como seam agregado del backend local;
- mezcla logs de UI y backend en los paneles;
- renderiza el cache visual `GenerationBatch[]` mientras el catalogo vive en SQLite;
- verifica la sesion local Codex desde el popover de credenciales;
- mantiene la interfaz original de workspaces, recipes, grid, modal y editor.

## Backend

### `apps/local-server/src/appFactory.ts`

API Hono local:

- `GET /api/health`
- `POST /api/app-server/start`
- `GET /api/codex/models`
- `GET /api/codex/session`
- `GET /api/codex/account` (compatibilidad)
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

Procesa jobs `dry_run` y `codex_imagegen`. Para `codex_imagegen` lanza un turno en `codex app-server`, guarda transcript JSONL, actualiza catalogo/assets y emite eventos que consume el stream SSE del frontend.

### `apps/local-server/src/codex/`

Concentra las costuras principales del backend local de Codex.

- `localCodexSession.ts`: lectura canonica de la sesion local ChatGPT/Codex.
- `modelCatalog.ts`: catalogo de modelos disponibles en el app-server local.
- `processSupervisor.ts`: ensure + diagnostico de `codex app-server`.
- `rpcClient.ts`: transporte JSON-RPC hacia el app-server.
- `sessionPool.ts`: reutilizacion de sesiones/thread para imagegen.
- `turn.ts`: orquestacion de un Codex Turn.

### `db.ts`

SQLite local con tablas para settings, projects, jobs, assets, catalogo, libraries, job events y system logs.

### `logger.ts`

Escribe logs en SQLite y en disco bajo la carpeta `logs/` de la Studio Library configurada.

## Superficies legacy

- `Visual Batch` y `GenerationBatch[]` siguen siendo la cache visual actual de la UI, no el modelo duradero.
- `/api/codex/account` y `/api/assets` sobreviven por compatibilidad, pero las superficies canonicas para la UI nueva son `Local Codex Session`, `/api/catalog` y `GET /api/events`.
- Los servicios directos de proveedores externos de la aplicacion original quedaron fuera del pipeline activo; la UI integrada no depende de API keys para generar imagenes.
