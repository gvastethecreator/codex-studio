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

## Comandos útiles

```bash
bun run studio:init
bun run dev:server
bun run dev:ui
bun run validate:fast
bun run check
bun run test
bun run build
```
