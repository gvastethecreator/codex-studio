# Detalles de Implementacion

## Enrutamiento

La app mantiene el enrutamiento liviano por hash para `studio`, `recipes`, recetas especificas, modal y editor. Esto conserva el comportamiento original de back/forward sin introducir `react-router`.

## Grid y Thumbnails

`ImageGrid` sigue usando el layout visual original. Las imagenes nuevas llegan desde el backend local como URLs servidas por `/library/*`; `utils/imageUtils.ts` genera thumbnails con canvas cuando el Catalog Entry todavia no trae una miniatura persistida.

## Generacion

`useGenerationPipeline` ya no llama servicios externos desde el browser. El flujo actual es:

1. La UI crea un job visual en `useQueueManager`.
2. `runLocalGeneration` crea uno o mas jobs persistentes `codex_imagegen` en el backend local.
3. `watchJob()` espera los estados terminales reutilizando un stream SSE compartido.
4. El worker usa `codex app-server` y la skill local de imagenes.
5. El asset se guarda en `assets/` y `thumbnails/` dentro de la Studio Library configurada (por ejemplo `%USERPROFILE%\AI-Studio-Library\assets` en Windows).
6. La UI consulta `/api/catalog` filtrando por `jobId`, materializa un `GenerationBatch` y lo persiste como cache visual en IndexedDB (`catalog-cache`).

## Cola Persistente

La cola visible conserva jobs efimeros de UI y, en paralelo, muestra los jobs persistentes del backend. Estos ultimos sobreviven a recargas o cierre de la pantalla porque viven en SQLite.

## Sincronizacion viva

`useLocalStudioSync` hace un catch-up inicial por HTTP y luego escucha jobs, logs y assets via `GET /api/events`. Si la conexion SSE se cae, el frontend vuelve a consultar el backend para recuperar estado antes de reconectar.

## Logs

La consola visual mezcla logs de UI con logs del backend local. El backend tambien escribe en disco bajo la carpeta `logs/` de la Studio Library configurada.

## Vault

La importacion/exportacion Vault sigue funcionando sobre los batches visuales de IndexedDB. La Studio Library externa y el Image Catalog siguen siendo independientes de ese formato: el cache visual se puede reconstruir desde el backend local cuando hace falta.
