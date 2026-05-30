# Guía de desarrollo

Esta guía resume convenciones para entender, extender y contribuir a Codex Studio.

## Ruta rápida

1. Revisa `CONTEXT.md` + `docs/ARCHITECTURE.md`.
2. Implementa cambios pequeños con seams claros.
3. Valida con `bun run check`, `bun run test`, `bun run build`.

## Convenciones de proyecto

- TypeScript estricto (evitar `any`).
- Contratos compartidos en `packages/shared` o `types.ts`.
- Frontend local-first: usa `services/localStudioService.ts` / `services/studioEventSource.ts`.
- Modelo durable: SQLite/Image Catalog.
- `GenerationBatch[]` = compatibilidad visual, no fuente de verdad.
- Toolchain unificado en `vite.config.ts`.

## Recetas

Al agregar/modificar una receta:

1. Actualiza `lib/recipeModules.ts`.
2. Mantén params derivados y builders fuera de componentes React.
3. Valida con `recipes:verify` y `recipes:source:verify`.

## Persistencia y seguridad

- Estado durable en Studio Library + SQLite backend.
- Storage de navegador solo para compatibilidad/conveniencia UI.
- No guardar Provider Secrets en SQLite, logs, metadata ni docs.

## Estilos y rendimiento

- Tailwind v4 + tokens compartidos.
- Preferir superficies demand-mounted.
- Evitar dependencias pesadas en startup.

## DX y debugging

- Logs de calidad/build en `logs/tooling/`.
- Si falla un gate, adjunta log concreto en issue/PR.
