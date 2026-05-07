# Codex Studio

Studio local-first para generar, revisar y administrar imagenes con la sesion autenticada de Codex/ChatGPT del usuario a traves de `codex app-server`.

> Estado actual: **preview open-source temprana**. La base tecnica ya es util localmente; ahora el objetivo es pulir onboarding, documentacion y ergonomia para que mas gente pueda instalarla sin conocer el historial interno del repo.

## Que hace interesante a este proyecto

- **No depende de `OPENAI_API_KEY`** para el flujo principal.
- **Usa la sesion local de Codex/ChatGPT** ya autenticada en la maquina.
- **Mantiene una cola persistente** con jobs locales y trazabilidad en SQLite.
- **Guarda assets, logs y transcripts fuera del repo**, en una biblioteca local configurable.
- **Conserva la UI creativa original** con recetas, workspaces, grid visual y herramientas de revision.

## Como funciona

1. La UI React/Vite recibe prompts, recetas, referencias y acciones del usuario.
2. El backend local Bun/Hono crea y supervisa jobs persistentes.
3. `codex app-server` ejecuta los turns reales de Codex para generar o editar imagenes.
4. La biblioteca local guarda assets, SQLite, transcripts y logs operativos.
5. La UI sincroniza jobs, assets y actividad para que el studio siga siendo usable aunque la generacion ocurra fuera del navegador.

## Requisitos previos

Antes de levantar el studio conviene tener esto listo:

- **Bun** instalado y disponible en PATH.
- **Codex CLI** instalado y autenticado en la misma maquina.
- Soporte para `codex app-server` desde esa instalacion de Codex.
- Un navegador moderno con soporte para IndexedDB.

Si falta Codex o la sesion local no esta disponible, la UI puede iniciar pero la generacion real no va a completar. En ese caso revisa [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md).

## Inicio rapido

```bash
bun install
bun run studio:init
bun run dev
```

Despues de eso deberias tener:

- UI: <http://localhost:3000>
- API local: <http://localhost:4317/api/health>
- Biblioteca por defecto: `~/AI-Studio-Library` (en Windows normalmente `%USERPROFILE%\AI-Studio-Library`)
- Logs: `~/AI-Studio-Library/logs`
- SQLite: `~/AI-Studio-Library/db/studio.sqlite`

### Primer arranque

`bun run studio:init` crea la estructura de la biblioteca local, inicializa SQLite, genera un proyecto default y crea `.env.local` si todavia no existe.

El repositorio ahora tambien incluye un `.env` base con placeholders seguros para que herramientas, tareas y nuevos entornos tengan variables explicitas desde el primer clone. Los valores específicos de tu máquina deben seguir yendo en `.env.local`.

La UI abre automaticamente una guia de primer arranque para verificar backend local, Codex CLI, `codex app-server` y la ruta de biblioteca. Tambien puedes reabrirla desde el boton `Setup` del header.

Si solo quieres levantar una parte del sistema:

- `bun run dev:ui` — UI Vite sin backend local.
- `bun run dev:server` — backend Hono + supervisor de `codex app-server`.
- `bun run dev:electron` — shell desktop Electron sobre el flujo local de desarrollo.

## Configuracion local

El backend carga valores desde `.env.local`. Puedes dejar que `bun run studio:init` lo cree automaticamente o copiar la plantilla desde `.env.example`.

Variables disponibles:

- `STUDIO_LIBRARY_DIR`
- `STUDIO_SERVER_PORT`
- `STUDIO_CODEX_WS_PORT`

Variables opcionales para la shell Electron:

- `STUDIO_ELECTRON_API_BASE` — reutiliza un backend local ya corriendo si no quieres usar `http://localhost:4317`.
- `STUDIO_ELECTRON_RENDERER_URL` — apunta la shell desktop a un dev server Vite distinto del default `http://localhost:3000`.

Ejemplos de ruta para la biblioteca:

- Windows: `%USERPROFILE%\AI-Studio-Library`
- macOS: `/Users/<tu-usuario>/AI-Studio-Library`
- Linux: `/home/<tu-usuario>/AI-Studio-Library`

## Scripts utiles

```bash
bun run dev          # backend local + UI integrada
bun run dev:server   # Hono API + codex app-server supervisor
bun run dev:ui       # UI Vite+ (vp dev)
bun run dev:electron # shell Electron para desarrollo local
bun run studio:init  # crea biblioteca, SQLite y proyecto default
bun run fmt          # formato con Oxfmt via Vite+
bun run lint         # lint con Oxlint via Vite+
bun run check        # formato + lint + type-check unificados via Vite+
bun run test         # suite de unit tests con Vitest via Vite+
bun run test:unit    # subset rapido para iteracion
bun run test:coverage # cobertura HTML + resumen en consola
bun run validate:fast # loop rapido: unit tests + verificacion server
bun run validate:full # gate completo: check + tests + build
bun run build        # build UI (Vite+/Rolldown) + verificacion backend
bun run preview:electron # prueba la shell Electron cargando `dist/`
bun run tooling:logs # abre `logs/tooling` con los ultimos logs de comandos
```

Para iterar durante un refactor grande, usa `bun run validate:fast` y deja `bun run validate:full` para el cierre final. `bun run check` ahora corre el loop unificado de formato, lint y type-check sobre Vite+, asi que es el comando recomendado para validar cambios de forma local.

Tambien hay tareas de VS Code en `.vscode/tasks.json` para inicializar, levantar, validar y abrir los logs de la biblioteca.

### Logs de tooling

Los comandos de calidad y build (`fmt`, `lint`, `check`, `test`, `build`, `validate:*`) escriben logs persistentes en `logs/tooling/`.

- cada ejecucion genera un archivo timestamped;
- ademas se actualiza un `*.latest.log` por tarea;
- esto facilita depurar fallos intermitentes sin tener que repetir una corrida solo para leer la consola.

## Estructura del repositorio

```text
.
├─ apps/local-server/     # backend local Bun/Hono y worker
├─ components/            # UI principal del studio
├─ contexts/              # estado global y de generacion
├─ docs/                  # arquitectura, servicios, ADRs y guias
├─ hooks/                 # sincronizacion, pipeline y persistencia
├─ packages/shared/       # tipos compartidos entre UI y backend
├─ scripts/               # scripts de inicializacion y utilidades internas
└─ services/              # adaptadores frontend hacia el backend local
```

## Documentacion recomendada

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — vista general del sistema.
- [`docs/SERVICES.md`](./docs/SERVICES.md) — mapa de servicios y puntos de integracion.
- [`docs/DEV_GUIDE.md`](./docs/DEV_GUIDE.md) — convenciones para extender recetas y UI.
- [`docs/TOOLING.md`](./docs/TOOLING.md) — stack de tooling actual, comandos y logs.
- [`docs/ELECTRON.md`](./docs/ELECTRON.md) — estrategia y restricciones para una futura build desktop.
- [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md) — errores comunes de setup y ejecucion.
- [`docs/IMPLEMENTATION_LOG.md`](./docs/IMPLEMENTATION_LOG.md) — registro de tareas aplicadas en la puesta al dia.
- [`docs/TECHNICAL_DEBT.md`](./docs/TECHNICAL_DEBT.md) — deuda tecnica conocida y siguientes focos.
- [`docs/adr/0001-local-codex-studio.md`](./docs/adr/0001-local-codex-studio.md) — decision arquitectonica fundacional.
- [`ROADMAP.md`](./ROADMAP.md) — prioridades del producto para la etapa open-source.

## Contribuir

Si quieres ayudar a preparar el proyecto para un release open-source mas solido, revisa [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Licencia

Este repositorio se distribuye bajo la licencia [MIT](./LICENSE).
