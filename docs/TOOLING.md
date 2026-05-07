# Tooling y flujo de calidad

Este documento resume el stack de desarrollo y los comandos operativos del repo tras la puesta al dia del toolchain.

## Stack actual

- **Package manager:** Bun
- **Toolchain UI:** Vite+
- **Bundler UI:** Vite 8 + Rolldown
- **Lint / format:** Oxlint + Oxfmt a traves de Vite+
- **Tests unitarios:** Vitest a traves de Vite+
- **Estilos:** Tailwind CSS v4 con tokens en `index.css`
- **Animaciones React:** GSAP

## Archivo fuente de verdad

La configuracion de tooling de la UI vive en `vite.config.ts`.

Ahí se centraliza:

- aliases de la app;
- `fmt`;
- `lint`;
- `test`;
- `staged`;
- plugins de Vite y Tailwind.

No se deben reintroducir configuraciones duplicadas de ESLint, Prettier o Vitest fuera de este archivo salvo una excepcion muy justificada y documentada.

## Comandos principales

```bash
bun run fmt
bun run fmt:check
bun run lint
bun run check
bun run test
bun run test:unit
bun run test:coverage
bun run build
bun run validate:fast
bun run validate:full
```

## Logs persistentes

Las tareas anteriores se ejecutan mediante `scripts/tooling-task.ts` y escriben logs en `logs/tooling/`.

Convenciones:

- `nombre-tarea-YYYY-MM-DDTHH-MM-SS.log` — corrida puntual;
- `nombre-tarea.latest.log` — ultimo estado conocido de esa tarea.

Esto permite:

- adjuntar un fallo concreto a un issue;
- revisar una corrida larga sin perder contexto por scroll;
- depurar errores intermitentes sin volver a ejecutar inmediatamente.

## Notas importantes

- `bun run build` valida tanto la UI como el backend local.
- `bun run validate:fast` es el loop corto recomendado durante refactors.
- `bun run validate:full` es el gate local antes de cerrar una tanda grande de cambios.
- Las tareas de VS Code en `.vscode/tasks.json` reflejan este mismo flujo con nombres cortos y emojis.

## Estabilidad del terminal integrado

Para evitar congelar el terminal integrado o saturar el IDE en Windows:

- `bun run fmt` y `bun run fmt:check` limitan Oxfmt a un numero razonable de hilos; el valor por defecto es `8` y se puede sobrescribir con `OXFMT_THREADS`.
- `bun run lint` y `bun run lint:fix` limitan Oxlint a un numero razonable de hilos; el valor por defecto es `8` y se puede sobrescribir con `OXLINT_THREADS`.
- `bun run build` y el paso de build dentro de `validate:full` ya no vuelcan el listado completo de assets en la consola: el terminal muestra un resumen corto y el detalle total queda en `logs/tooling/`.

Si necesitas el output completo de una corrida pesada, abre el log timestamped correspondiente en `logs/tooling/` en vez de repetir el comando solo para leer la consola.
