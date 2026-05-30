# PRD: Codex Studio local-first

## Objetivo

Convertir la app visual actual en un estudio local para generar, revisar y gestionar imágenes usando la sesión autenticada de Codex/ChatGPT del propio usuario, sin requerir API keys en el flujo principal.

## Usuarios objetivo

- Creadores que quieren flujo local con librería persistente.
- Artistas técnicos que trabajan con prompts, recetas, referencias y exportaciones.
- Usuarios de Codex/ChatGPT que prefieren automatizar generación desde su entorno local.

## Requisitos funcionales

- Generación desde UI con jobs persistentes (`Generation Task`).
- Codex como runtime principal vía `codex app-server`.
- Assets/logs/transcripts en Studio Library configurable.
- Persistencia de jobs/catálogo/librerías/logs en SQLite.
- Soporte de cola transitoria UI + cola persistente backend.
- Importación de archivos desde External Output Sources registradas.

## Requisitos no funcionales

- No exigir `OPENAI_API_KEY` en flujo principal.
- Mantener Provider Secrets fuera de Studio Settings persistidos en SQLite.
- Backend local ejecutable con Bun.
- Tareas de VS Code para ejecutar, validar e inspeccionar logs.

## Fuera de alcance actual

- Operación multiusuario remota.
- Sincronización cloud.
- Empaquetado final soportado de Electron.
- Edición semántica perfecta de máscaras.
