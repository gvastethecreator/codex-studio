# Codex Studio

> Estudio de imágenes local-first que usa tu sesión autenticada de Codex/ChatGPT — sin `OPENAI_API_KEY` para el flujo principal.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Bun](https://img.shields.io/badge/runtime-Bun-black?logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)

**Estado actual: preview open-source temprana.** La base técnica ya funciona bien en local. El foco ahora es dejar onboarding, documentación y DX en nivel “instalable en minutos”.

## Ruta rápida

1. Instala dependencias y prepara la librería local:
	- `bun install`
	- `bun run studio:init`
2. Arranca el entorno:
	- `bun run dev`
3. Verifica que todo responde:
	- UI: <http://localhost:17222>
	- API local: <http://localhost:17223/api/health>

## ¿Por qué llama la atención este proyecto?

- **No exige API key** para el flujo principal con Codex.
- **Aprovecha tu sesión local** autenticada de Codex/ChatGPT.
- **Cola persistente de jobs** con trazabilidad sobre SQLite.
- **Assets, logs y transcripts fuera del repo**, en una Studio Library configurable.
- **UI creativa completa**: recetas, workspaces, grid visual y herramientas de revisión.
- **Arquitectura extensible** con frontera de proveedores (Codex-first).

## Cómo funciona

1. La UI React/Vite recibe prompts, recetas e imágenes de referencia.
2. El backend local Bun/Hono crea y supervisa jobs persistentes.
3. `codex app-server` ejecuta turns reales para generar/editar imágenes.
4. La Studio Library guarda assets, SQLite, transcripts y logs.
5. La UI sincroniza por HTTP + SSE y mantiene compatibilidad visual para seguir operativa.

## Requisitos

- **Bun** en PATH — [bun.sh](https://bun.sh)
- **Codex CLI** instalado y autenticado con login de ChatGPT en la misma máquina.
- Soporte de `codex app-server` en esa instalación.
- Navegador moderno con IndexedDB.

Si falta Codex o la sesión local, la UI puede abrir pero no completará generaciones reales. Ver [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md).

## Configuración local

El backend toma variables desde `.env.local`. Puedes dejar que `bun run studio:init` lo cree o copiar `.env.example`.

Variables principales:

- `STUDIO_LIBRARY_DIR`
- `STUDIO_SERVER_PORT`
- `STUDIO_CODEX_WS_PORT`
- `VITE_STUDIO_API_BASE`

Variables opcionales para shell de Electron:

- `STUDIO_ELECTRON_API_BASE`
- `STUDIO_ELECTRON_RENDERER_URL`

Ejemplos de ruta de librería:

- Windows: `%USERPROFILE%\AI-Studio-Library`
- macOS: `/Users/<tu-usuario>/AI-Studio-Library`
- Linux: `/home/<tu-usuario>/AI-Studio-Library`

## Scripts útiles

```bash
bun run dev
bun run dev:server
bun run dev:ui
bun run dev:electron
bun run studio:init
bun run fmt
bun run lint
bun run check
bun run test
bun run build
bun run validate:fast
bun run validate:full
```

## Detalles clave

| Tema | Decisión |
|------|----------|
| Fuente de verdad durable | `SQLite + Image Catalog` |
| Cache visual compatible | `GenerationBatch[]` en IndexedDB (solo compatibilidad) |
| Eventos en vivo | `GET /api/events` (SSE) |
| Sesión local canónica | `/api/codex/session` |
| Filosofía de producto | Codex-first, local-first, library-backed |

## Estructura del repositorio

```text
.
├─ apps/local-server/
├─ components/
├─ contexts/
├─ docs/
├─ hooks/
├─ packages/shared/
├─ scripts/
└─ services/
```

## Documentación principal

- [`CONTEXT.md`](./CONTEXT.md) — vocabulario canónico del dominio.
- [`AGENTS.md`](./AGENTS.md) — reglas operativas para agentes.
- [`SKILLS.md`](./SKILLS.md) — flujos especializados.
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — arquitectura vigente.
- [`docs/SERVICES.md`](./docs/SERVICES.md) — mapa de servicios e integraciones.
- [`docs/DEV_GUIDE.md`](./docs/DEV_GUIDE.md) — convenciones de desarrollo.
- [`docs/TOOLING.md`](./docs/TOOLING.md) — comandos y calidad.
- [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md) — diagnóstico rápido.

## Checklist de validación rápida

- [ ] `bun run studio:init` completa sin errores.
- [ ] `bun run dev` levanta UI + backend.
- [ ] `GET /api/health` responde correctamente.
- [ ] Puedes abrir la UI y ver el estado de readiness.

## Próximo paso

Si quieres contribuir, empieza por [`CONTRIBUTING.md`](./CONTRIBUTING.md). Si quieres entender prioridades de producto, sigue en [`ROADMAP.md`](./ROADMAP.md).
