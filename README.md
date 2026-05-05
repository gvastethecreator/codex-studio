# Codex Image Studio

Studio local para generar, revisar y administrar imagenes con la interfaz original de la aplicacion, un backend Bun/Hono local y la sesion autenticada de Codex/ChatGPT mediante `codex app-server`.

No requiere `OPENAI_API_KEY` ni una API key de Google para el flujo principal. La generacion real se dispara como jobs locales `codex_imagegen`; los assets, transcripts, logs y la base SQLite viven fuera del proyecto por defecto en `D:\AI-Studio-Library`.

## Ejecutar

```bash
bun install
bun run studio:init
bun run dev
```

- UI: http://localhost:3000
- API local: http://localhost:4317/api/health
- Biblioteca por defecto: `D:\AI-Studio-Library`
- Logs: `D:\AI-Studio-Library\logs`
- SQLite: `D:\AI-Studio-Library\db\studio.sqlite`

## Scripts

```bash
bun run dev          # backend local + UI real integrada
bun run dev:server   # Hono API + codex app-server supervisor
bun run dev:ui       # Vite sobre la app original
bun run studio:init  # crea carpetas, SQLite y proyecto default
bun run check        # TypeScript completo
bun run build        # build UI + check backend
```

Tambien hay tareas de VSCode en `.vscode/tasks.json` para inicializar, levantar, validar y abrir logs.

## Documentacion activa

- [Plan Codex Image Studio](./docs/active/codex-image-studio-plan.md)
- [ADR 0001](./docs/adr/0001-local-codex-image-studio.md)
- [Arquitectura](./docs/ARCHITECTURE.md)
- [Servicios](./docs/SERVICES.md)
