# Troubleshooting

## Ruta rápida de diagnóstico

1. Ejecuta `bun run studio:init`.
2. Levanta backend con `bun run dev:server`.
3. Revisa salud en `http://localhost:17223/api/health`.
4. Si falla algo, abre `logs/tooling/*.latest.log`.

## Problemas comunes de arranque

### `codex` no existe o no responde

**Síntomas:** `codexCli.available: false`, jobs reales no inician.

**Verifica:** `codex --version`, instalación en PATH y reinicio de terminal.

### `codex app-server` no disponible

**Síntomas:** backend inicia pero generación no avanza, `appServer.running: false`.

**Verifica:** soporte de `app-server`, sesión autenticada y puerto WebSocket libre.

### Sesión de Codex expirada

**Síntomas:** CLI existe pero jobs fallan por permisos/autorización.

**Verifica:** reautentica Codex y reinicia `bun run dev:server`.

### Está corriendo solo la UI

**Síntomas:** `dev:ui` funciona pero no sincroniza jobs/assets.

**Verifica:** usa `bun run dev` o corre `dev:server` en paralelo.

### Puertos ocupados

**Síntomas:** errores de `listen` en Vite/Bun.

**Verifica:** cambia `STUDIO_SERVER_PORT` y/o `STUDIO_CODEX_WS_PORT` en `.env.local`.

## Cuando la consola no alcanza

Si `check`/`lint`/`test` falla y la salida se corta:

- revisa `logs/tooling/`
- usa `*.latest.log`
- comparte log exacto en issue/PR

## Problemas con Studio Library

Si la ruta por defecto no existe, define `STUDIO_LIBRARY_DIR` absoluto en `.env.local` y ejecuta `bun run studio:init` de nuevo.

## Storage y logs pesados

Ejecuta `bun run storage:audit` para revisar tamano de SQLite, WAL/SHM, logs, transcripts, references y payloads historicos inline sin imprimir contenido privado.
El audit tambien reporta thumbnails faltantes, duplicados de referencias por hash, tamano de `logs/tooling`, y payloads compactables recuperables vs no recuperables.

Desde la app, abre Studio Settings -> Storage Maintenance para ejecutar audit, plan de compactacion, backfill de thumbnails y prune de tooling logs mediante `/api/maintenance`.

`storage:compact` es dry-run por defecto. Para escribir cambios historicos debes detener el servidor local y usar:

```bash
bun run storage:compact -- --write --confirm=compact-inline-payloads
```

Los logs de backend rotan en `.studio/logs/history`. `/api/logs` y el panel de actividad muestran una ventana reciente, no un archivo historico infinito.
Los logs de tooling mantienen `.latest.log` por tarea y podan corridas timestamped automaticamente. Para limpiar manualmente desde terminal o desde Storage Maintenance:

```bash
bun run tooling:logs:prune
```

Para calentar thumbnails historicos faltantes sin tocar la base primero:

```bash
bun run storage:thumbnails:backfill
```

Para escribir el batch planeado:

```bash
bun run storage:thumbnails:backfill -- --limit=1000 --write --confirm=backfill-thumbnails
```

## Comandos útiles

```bash
bun run studio:init
bun run dev:server
bun run dev:ui
bun run validate:fast
bun run storage:audit
bun run storage:thumbnails:backfill
bun run check
bun run test
bun run build
```
