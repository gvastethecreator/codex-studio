# Detalles de implementación

## Resumen

El flujo actual evita acoplar la UI a proveedores externos desde navegador y centraliza la ejecución real en backend local.

## Routing

Se mantiene routing hash-based liviano para studio, recipes, modales y editor, preservando navegación back/forward sin introducir `react-router`.

## Grid y miniaturas

`ImageGrid` conserva layout visual principal. Las imágenes nuevas llegan como URLs servidas por `/library/*`.

## Flujo de generación

1. La UI crea un job visual transitorio.
2. `runLocalGeneration` crea jobs persistentes en backend local.
3. `watchJob()` espera estados terminales sobre SSE.
4. `worker` ejecuta vía Provider Boundary (Codex principal).
5. Se escriben assets/transcripts/metadatos en Studio Library.
6. La UI consulta `/api/catalog` por `jobId` y renderiza desde Catalog Entries.

## Cola persistente

La cola visible mezcla jobs transitorios (UI) y jobs persistentes (SQLite). Los persistentes sobreviven recargas/cierre de UI.

## Sincronización en vivo

`useLocalStudioSync` hace catch-up HTTP y luego escucha `GET /api/events`. Si se corta SSE, refresca estado antes de reconectar.

## Logs

La consola visual combina logs de UI y backend; además el backend persiste logs en disco dentro de Studio Library.

## Compatibilidad legacy

`GenerationBatch[]` y Vault JSON quedan como superficies de compatibilidad/recovery, no como modelo durable principal.
