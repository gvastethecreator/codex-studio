# Detalles de Implementacion

## Enrutamiento

La app mantiene el enrutamiento liviano por hash para `studio`, `recipes`, recetas especificas, modal y editor. Esto conserva el comportamiento original de back/forward sin introducir `react-router`.

## Grid y Thumbnails

`ImageGrid` sigue usando el layout visual original. Las imagenes nuevas llegan desde el backend local como URLs servidas por `/library/assets/:file`; `utils/imageUtils.ts` genera thumbnails con canvas y CORS habilitado para esas URLs locales.

## Generacion

`useGenerationPipeline` ya no llama servicios externos desde el browser. El flujo actual es:

1. La UI crea un job visual en `useQueueManager`.
2. El pipeline crea un job persistente `codex_imagegen` en el backend local.
3. El worker usa `codex app-server` y la skill local de imagenes.
4. El asset se guarda en `assets/` dentro de la Studio Library configurada (por ejemplo `%USERPROFILE%\AI-Studio-Library\assets` en Windows).
5. La UI registra el asset como `GenerationBatch` en IndexedDB.

## Cola Persistente

La cola visible conserva jobs efimeros de UI y, en paralelo, muestra los jobs persistentes del backend. Estos ultimos sobreviven a recargas o cierre de la pantalla porque viven en SQLite.

## Logs

La consola visual mezcla logs de UI con logs del backend local. El backend tambien escribe en disco bajo la carpeta `logs/` de la Studio Library configurada.

## Vault

La importacion/exportacion Vault sigue funcionando sobre los batches visuales de IndexedDB. La biblioteca local externa es independiente y se reimporta a la UI al cargar.
