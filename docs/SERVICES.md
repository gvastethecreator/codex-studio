# Servicios e Integracion Local

## Frontend

### `services/localStudioService.ts`

Adaptador unico de la UI hacia el backend local.

- `getStudioHealth()` verifica Codex CLI y `codex app-server`.
- `listProjects()` obtiene el proyecto local default.
- `createStudioJob()` crea jobs persistentes.
- `listStudioJobs()` sincroniza la cola persistente.
- `listStudioAssets()` importa la biblioteca local al grid.
- `listStudioLogs()` muestra logs del backend en la consola visual.
- `waitForStudioJob()` espera a que un job termine sin bloquear la UI.

### `hooks/useGenerationPipeline.ts`

Controla validaciones visuales, balance, modal y commit del `GenerationBatch`. No conoce la coreografia de jobs persistentes.

### `services/localGenerationRun.ts`

Convierte una configuracion visual en un `GenerationBatch`: crea jobs `codex_imagegen`, espera su finalizacion, filtra Local Assets por job, crea thumbnails y devuelve el batch listo para IndexedDB.

### `components/AppContent.tsx`

Orquesta la integracion:

- importa assets locales al cargar;
- refresca jobs/logs del backend cada 3 segundos;
- mezcla logs de UI y backend en los paneles;
- verifica la sesion local Codex desde el popover de credenciales;
- mantiene la interfaz original de workspaces, recipes, grid, modal y editor.

## Backend

### `apps/local-server/src/index.ts`

API Hono local:

- `GET /api/health`
- `GET /api/projects`
- `GET /api/jobs`
- `POST /api/jobs`
- `POST /api/jobs/:id/cancel`
- `GET /api/assets`
- `GET /api/logs`
- `GET /library/assets/:file`

### `worker.ts`

Procesa jobs `dry_run` y `codex_imagegen`. Para `codex_imagegen` lanza un turno en `codex app-server`, guarda transcript JSONL y copia el PNG generado a la biblioteca local.

### `db.ts`

SQLite local con tablas para settings, projects, jobs, assets, job events y system logs.

### `logger.ts`

Escribe logs en SQLite y en disco bajo `D:\AI-Studio-Library\logs`.

## Servicios Legacy

Los servicios directos de proveedores externos de la aplicacion original fueron retirados del flujo activo. La UI integrada no depende de API keys para generar imagenes.
