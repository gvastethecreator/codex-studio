# Troubleshooting

## Problemas comunes al arrancar

### `codex` no existe o no responde

Sintoma:

- `GET /api/health` muestra `codexCli.available: false`.
- Los jobs reales no arrancan.

Que revisar:

- confirma que `codex --version` funciona en tu terminal;
- asegúrate de que Codex esta instalado en PATH;
- vuelve a abrir la terminal si acabas de instalarlo.

### `codex app-server` no aparece disponible

Sintoma:

- el backend levanta, pero la generacion real falla o nunca progresa;
- el health-check muestra `appServer.running: false`.

Que revisar:

- que tu instalacion de Codex soporte `app-server`;
- que la sesion local este autenticada;
- que no haya otro proceso ocupando el puerto WebSocket configurado.

### La sesion de Codex expiro

Sintoma:

- el CLI existe, pero los jobs fallan por permisos o autorizacion;
- la UI sigue cargando, pero no aparecen resultados nuevos.

Que revisar:

- reautentica Codex en la maquina;
- reinicia `bun run dev:server` despues de volver a autenticarte.

### Solo levantaste la UI

Sintoma:

- `bun run dev:ui` funciona, pero el grid no sincroniza jobs ni assets locales;
- la UI muestra errores al consultar `localhost:4317`.

Que revisar:

- usa `bun run dev` para el flujo completo;
- o ejecuta `bun run dev:server` en paralelo si estas corriendo la UI por separado.

### Los puertos ya estan ocupados

Sintoma:

- el server no inicia o `vite`/Bun reportan errores de escucha.

Que revisar:

- cambia `STUDIO_SERVER_PORT` y/o `STUDIO_CODEX_WS_PORT` en `.env.local`;
- evita conflictos con otros servicios locales.

### `bun run check` / `bun run lint` / `bun run test` fallan y la consola no alcanza

Sintoma:

- el output en terminal se corta o no queda claro que fallo primero;
- quieres compartir el error exacto sin relanzar el comando.

Que revisar:

- abre `logs/tooling/`;
- usa el archivo `*.latest.log` de la tarea que fallo;
- si necesitas el historico completo, busca el archivo timestamped mas reciente.

Nota: las tareas principales de calidad se ejecutan a traves de `scripts/tooling-task.ts`, asi que todas dejan rastro persistente.

## Problemas con la biblioteca local

### La ruta por defecto no existe en tu sistema operativo

Por defecto el proyecto usa `D:\AI-Studio-Library`, que es comodo para Windows pero no aplica a macOS o Linux.

Solucion:

1. crea una ruta absoluta local para tu maquina;
2. actualiza `STUDIO_LIBRARY_DIR` en `.env.local`;
3. vuelve a ejecutar `bun run studio:init`.

Ejemplos:

- macOS: `/Users/<tu-usuario>/AI-Studio-Library`
- Linux: `/home/<tu-usuario>/AI-Studio-Library`

### No ves assets o logs donde esperabas

Que revisar:

- `STUDIO_LIBRARY_DIR` efectivo en `.env.local`;
- `GET /api/health` para confirmar `libraryDir`;
- la carpeta `logs/` dentro de tu biblioteca local.

## Comandos utiles para diagnostico rapido

```bash
bun run studio:init
bun run dev:server
bun run dev:ui
bun run fmt:check
bun run lint
bun run test:unit
bun run validate:fast
bun run check
bun run test
bun run build
```

Nota de rendimiento: `bun run check` ahora concentra formato, lint y type-check en un solo paso. Para debugging iterativo conviene usar `bun run validate:fast` y reservar `bun run validate:full` para la verificacion final.

Tambien puedes consultar:

- `http://localhost:4317/api/health`
- la carpeta de logs dentro de tu biblioteca local
- `logs/tooling/` para logs de calidad/build del repo
- `README.md` para el flujo de setup completo
