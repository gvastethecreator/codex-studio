# Codex Image Studio Local Plan

## Objetivo

Convertir esta aplicacion en un studio local para generar, organizar y administrar imagenes usando la sesion autenticada de Codex/ChatGPT en esta maquina, sin requerir `OPENAI_API_KEY`.

El studio debe usar `codex app-server` como integracion programatica local y `$imagegen` como skill de generacion cuando se ejecute una generacion real.

## Decisiones fijadas

- No se usara `OPENAI_API_KEY` como requisito del producto.
- El motor primario sera `codex app-server`, ejecutado localmente y supervisado por el backend.
- La automatizacion visual de Codex/ChatGPT queda como fallback auxiliar, no como ruta critica.
- La biblioteca vivira fuera del repo, por defecto en `D:\AI-Studio-Library`.
- La ruta de biblioteca se configurara con `STUDIO_LIBRARY_DIR` en `.env.local`.
- La fuente de verdad local sera SQLite dentro de la biblioteca externa.
- La cola de generacion correra en el backend aunque la UI se cierre.
- La UI hablara con el backend por REST y recibira progreso/logs por SSE.
- La app se reorganizara hacia estructura monorepo local con `apps/` y `packages/`.
- Bun sera el runtime y gestor de scripts principal.
- El backend sera TypeScript con Bun + Hono.
- El primer bloque debe incluir dry run local y generacion real via Codex `$imagegen`.
- La UI principal tendra prompt libre; las recetas seran presets/workflows avanzados.
- El prompt engineering sera controlado: visible, activable y trazable.
- Se guardaran metadata limpia, transcripts crudos y logs operativos.
- La UI tendra visor de logs.
- El borrado sera soft delete por defecto con papelera fisica y limpieza explicita.
- Habra projects formales y biblioteca global.
- VSCode tendra tasks para inicializar, lanzar y verificar el studio.

## Arquitectura objetivo

```text
codex-studio/
  App.tsx / components/ / hooks/ / services/
  apps/
    local-server/
      src/
  packages/
    shared/
      src/
  docs/
    active/
    adr/
  .vscode/
```

```text
D:\AI-Studio-Library\
  db\studio.sqlite
  assets\
  thumbnails\
  references\
  masks\
  exports\
  transcripts\
  logs\
    studio.log
    worker.log
    app-server.log
    errors.log
    history\
  .trash\
```

## Flujo tracer bullet

### Paso 1: Dry run local

1. `bun run studio:init` crea biblioteca, logs y SQLite.
2. UI crea o usa un project default.
3. UI crea un job `dry_run`.
4. Backend registra job en SQLite.
5. Worker escribe eventos y logs.
6. Backend genera/copia un asset placeholder a `assets/`.
7. Backend crea thumbnail basico o referencia equivalente.
8. UI recibe eventos SSE y muestra asset/logs.

### Paso 2: Codex real

1. UI crea un job `codex_imagegen`.
2. Backend inicia o reutiliza project/thread Codex.
3. Backend llama `codex app-server` para iniciar un turn con `$imagegen`.
4. Backend guarda transcript crudo en `transcripts/`.
5. Backend detecta la imagen generada en la salida/eventos o en `$CODEX_HOME/generated_images`.
6. Backend copia el asset final a la biblioteca externa.
7. Backend registra asset, job_events, logs y estado final.
8. UI muestra resultado y transcript/logs asociados.

## API local inicial

REST:

```text
GET  /api/health
GET  /api/settings
POST /api/settings/library
GET  /api/projects
POST /api/projects
GET  /api/jobs
POST /api/jobs
POST /api/jobs/:id/cancel
GET  /api/assets
GET  /api/logs
```

SSE:

```text
GET /api/events
```

Eventos:

```text
project.created
job.created
job.running
job.progress
job.completed
job.failed
asset.created
log.appended
server.health
```

## Modelo de datos inicial

Tablas:

- `settings`
- `projects`
- `jobs`
- `assets`
- `codex_threads`
- `codex_turns`
- `job_events`
- `system_logs`

Estados de job:

```text
queued
running
needs_review
completed
failed
cancelled
```

Tipos de job:

```text
dry_run
codex_imagegen
prompt_enhance
prompt_critique
asset_edit
```

## Prompt y trazabilidad

Cada job de imagen debe conservar:

- `original_prompt`
- `expanded_prompt`
- `final_prompt_used`
- `recipe_id`
- `project_id`
- `codex_thread_id`
- `codex_turn_id`
- `asset_ids`
- `transcript_path`
- `logs`

El sistema no reescribe prompts en silencio. El usuario debe poder activar una version mejorada de forma explicita.

## VSCode tasks

Tasks requeridas:

- `studio:init`
- `dev: studio all`
- `dev: ui`
- `dev: server`
- `check`
- `build`
- `open: library logs`

## Riesgos tecnicos

- La API exacta de `codex app-server` puede requerir ajuste despues de probar el JSON-RPC real.
- `$imagegen` puede guardar outputs bajo rutas internas de Codex; el worker debe soportar descubrimiento por eventos y por escaneo controlado.
- El app-server depende de que Codex este instalado y logueado localmente.
- Las generaciones reales pueden necesitar aprobaciones o cambios de permisos segun configuracion local de Codex.
- Esta carpeta no es un git worktree al momento de iniciar el cambio, asi que hay que evitar operaciones destructivas y documentar archivos tocados.

## Criterio de exito del primer bloque

- `bun run studio:init` crea `D:\AI-Studio-Library` con estructura, SQLite y logs.
- `bun run dev` levanta backend y UI.
- La UI muestra health, projects, jobs, logs y assets.
- Un job dry run completa y crea un asset local visible.
- Un job Codex real intenta ejecutar `$imagegen`, guarda logs/transcript y reporta exito o error diagnosticable.
- VSCode puede lanzar init/dev/check desde tasks.
