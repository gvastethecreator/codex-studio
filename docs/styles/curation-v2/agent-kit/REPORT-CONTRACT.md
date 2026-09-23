# Contrato del reporte de ejecución

Generar un punto de partida con `agent-kit.mjs template`; no reutilizar un fingerprint de otra categoría o selección. El JSON es un reporte de trabajo, no un nuevo contrato de runtime ni una autorización de migración.

## Estructura

`schemaVersion`, `taskId`, `inputFingerprint` y `selectedPresetIds` deben coincidir con la ficha. `status` admite `blocked`, `text-ready`, `visual-review-needed` o `accepted`.

`classifications` contiene una entrada por preset seleccionado con `presetId`, `kind` y `reason`. `kind` admite `style`, `modifier`, `profile` o `theme`; no `mixed`.

`decisions` contiene `presetId`, `action`, `reason` e `invariants` (array no vacío). Las acciones son `keep`, `derive`, `propose-variant`, `propose-archive` y `escalate`. Adjuntar además un ledger editorial con campo, antes, después, motivo y riesgo. No afirmar que `propose-archive` ya ocultó un preset.

`commands` contiene el comando exacto, `status` (`passed`, `failed`, `not-run`) y `exitCode` real (entero o `null` si no se ejecutó). Conservar los logs fuera de Git. Un error no puede marcarse passed ni una prueba pendiente puede usar código cero. El helper verifica consistencia del registro, no autentica su ejecución.

`blockers` explica precondiciones o decisiones sin resolver. `remaining` enumera trabajo no realizado. No quitar pendientes para que el estado parezca mejor. Una ficha resuelve un subconjunto, no autoriza a marcar toda la categoría como aprobada.

## Evidencia visual

`visual` contiene `status` (`not-run`, `pending`, `failed`, `passed`), `runs` y `humanReview` (`null` mientras no exista una revisión).

Cada comparación en `runs` contiene `presetId` (original seleccionado), `caseId`, `provider`, `model`, `settings`, `seed` (valor real o `null`), `beforePath`, `beforeSha256`, `afterPath` y `afterSha256`. Las rutas son relativas al repositorio bajo `.local/style-curation/evidence/` y apuntan a imágenes existentes. No compartir credenciales ni subir imágenes generadas al commit.

Registrar asimismo ID y versión del derivado, prompt efectivo, rol y hash de referencias, parámetros soportados, fecha, observaciones por check y diferencias entre repetición A/B. El helper verifica existencia y hash de los archivos mínimos; el revisor debe inspeccionar las imágenes y estos datos adicionales. No demuestra identidad del modelo, comparabilidad experimental ni ausencia de duplicación de contenido.

Para `passed`, `humanReview` requiere `reviewer` y `recordPath` de una revisión existente. La presencia del archivo no autentica que lo escribió una persona: nunca inventar una firma o aprobación del usuario. El helper exige dos comparaciones registradas por caso seleccionado. Los cinco sujetos comunes se interpretan según el contrato del tipo de preset, no como obligación de quitar sus mecanismos especializados.

Para `accepted`, además deben estar cubiertos todos los presets, no quedar bloqueos o pendientes y constar como pasados `bun run styles:verify`, `bun run test`, `bun run check` y `bun run build`. Un caso incompatible o un proveedor no disponible mantiene el lote pendiente/bloqueado; no se falsea una imagen para sortear el requisito.

## Interpretar el validador

`structurallyValid: true` significa que el reporte es coherente con las reglas verificadas. No significa que el trabajo esté aceptado. Leer también `reportedStatus`; el resultado siempre incluye `automaticVisualApproval: false`. Esta herramienta no inspecciona píxeles, no lee artísticamente una imagen y no valida una firma humana.

El helper es de solo lectura. No archiva, renombra, fusiona ni modifica fuentes. Su comprobación de hashes detecta entradas distintas; el audit existente sigue siendo necesario para comprobar que el índice generado corresponde al YAML actual.
