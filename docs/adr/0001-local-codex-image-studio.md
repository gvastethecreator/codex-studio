# ADR 0001: Codex Image Studio local sin API key

## Estado

Aceptado.

## Contexto

La aplicacion actual es una SPA React/Vite orientada a generacion de imagenes con Gemini desde el navegador. El nuevo objetivo es convertirla en un studio local para generar y administrar imagenes con la cuenta autenticada de Codex/ChatGPT del usuario, evitando `OPENAI_API_KEY`.

La documentacion oficial de Codex app-server describe una integracion local programatica mediante JSON-RPC y turns/threads. La skill local `$imagegen` permite generar o editar imagenes desde Codex sin requerir una API key directa cuando se usa el modo integrado de Codex.

## Decision

Construiremos un studio local con estas piezas:

- Backend local TypeScript ejecutado con Bun.
- Hono para REST y SSE.
- `codex app-server` como proceso local supervisado por el backend.
- SQLite como fuente de verdad dentro de una biblioteca externa.
- React/Vite como UI del studio.
- `D:\AI-Studio-Library` como biblioteca externa por defecto.
- `$imagegen` como motor de generacion real invocado por turns de Codex.

La automatizacion visual de Codex/ChatGPT no sera ruta critica. Podra agregarse despues como fallback auxiliar si algun flujo no esta expuesto por app-server.

## Consecuencias

### Positivas

- No se requiere `OPENAI_API_KEY`.
- El usuario trabaja con la sesion local autenticada de Codex/ChatGPT.
- La cola puede sobrevivir al cierre de la UI.
- La biblioteca es portable y separada del codigo fuente.
- SQLite permite consultas, auditoria y recuperacion.
- Logs y transcripts permiten depurar generaciones reales.

### Negativas

- El studio depende de Codex instalado, logueado y disponible en la maquina.
- La integracion con app-server puede cambiar y requiere validacion contra el proceso real.
- El backend debe gestionar procesos hijos, logs y errores de app-server.
- El descubrimiento de imagenes generadas puede necesitar multiples estrategias.

## Alternativas consideradas

### OpenAI API directa

Descartada porque requiere `OPENAI_API_KEY`, que el usuario no tiene ni quiere usar como requisito.

### Solo SPA con IndexedDB

Descartada porque no puede supervisar una cola persistente, manejar procesos locales, SQLite, filesystem ni `codex app-server` de forma robusta.

### Automatizar UI visual de ChatGPT/Codex

Descartada como ruta critica por fragilidad. Puede quedar como fallback auxiliar.

### Backend sin framework con `Bun.serve`

Descartado para la primera implementacion porque REST, SSE, middleware y errores quedan mas mantenibles con Hono sin introducir un framework pesado.

## Reglas de implementacion

- No guardar secretos de API de OpenAI.
- No guardar assets generados dentro del repo salvo fixtures/placeholders.
- No borrar fisicamente por defecto; usar soft delete y `.trash`.
- Guardar prompt original, prompt expandido y prompt final usado.
- Guardar logs en UI y disco.
- Guardar transcripts crudos del app-server cuando existan.
- Implementar primero dry run local y luego Codex real.
