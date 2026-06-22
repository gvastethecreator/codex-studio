# Tooling y flujo de calidad

Este documento resume el stack de desarrollo y los comandos operativos del repo.

## Ruta rápida

1. Usa `bun run check` durante el ciclo normal.
2. Valida con `bun run test`.
3. Cierra con `bun run build` o `bun run validate:full`.

## Stack actual

- Gestor de paquetes: **Bun**
- Toolchain UI: **Vite+**
- Bundler UI: **Vite 8 + Rolldown**
- Lint/format: **Oxlint + Oxfmt** vía Vite+
- Tests unitarios: **Vitest** vía Vite+
- Estilos: **Tailwind CSS v4**
- Animación React: **GSAP**

## Fuente de verdad

La configuración de tooling vive en `vite.config.ts`.

No dupliques configuración de ESLint/Prettier/Vitest fuera de ese archivo salvo excepción explícitamente documentada.

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

## Comandos de mantenimiento

```bash
bun run storage:audit
bun run storage:compact
bun run storage:thumbnails:backfill
bun run tooling:logs:prune
```

`storage:compact` y `storage:thumbnails:backfill` son dry-run por defecto. Los modos de escritura requieren `--write` y confirmacion explicita.
Para batches grandes de thumbnails, agrega `--limit=<n>` despues del nombre del comando y revisa cuantos rows tienen archivos fuente antes de escribir.

La misma superficie existe dentro de la app en Studio Settings -> Storage Maintenance. La UI llama endpoints locales bajo `/api/maintenance`, mantiene audit/plan como acciones directas, y reserva confirmacion explicita para los modos de escritura.

## Logs persistentes

Las tareas de calidad/build pasan por `scripts/tooling-task.ts` y escriben en `logs/tooling/`:

- `<task>-YYYY-MM-DDTHH-MM-SS.log`
- `<task>.latest.log`

Los logs timestamped se podan automaticamente por tarea. Usa `bun run tooling:logs:prune` o Studio Settings -> Storage Maintenance si necesitas forzar la limpieza manual.

## Checklist

- [ ] Usar `validate:fast` durante iteración.
- [ ] Usar `validate:full` antes de cerrar trabajo grande.
- [ ] Adjuntar logs relevantes si reportas fallos.

## Nota de rendimiento (Windows)

Puedes reducir carga del terminal/IDE ajustando:

- `OXFMT_THREADS`
- `OXLINT_THREADS`

Si necesitas detalle completo, revisa `logs/tooling/` en lugar de repetir comandos sólo para leer salida.
