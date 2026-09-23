# Validación del kit de ejecución

## Alcance de esta ampliación

El kit añade guías, procedimientos, ejemplos vinculados a fuentes, casos de prueba y un helper de solo lectura. No cambia presets, datos de usuario, proveedor, políticas de generación ni la implementación de archivo/merge. La entrada es [START-HERE.md](START-HERE.md), también referenciada desde `AGENTS.md`.

La primera publicación del kit fue `52c3e3d81ee34862ea0b767ee045d712d5db7d4a`. Una corrección posterior ajusta tres fixtures: el material depende del modificador seleccionado, la cámara del perfil y el mecanismo técnico de su función. No imponer roble, vista lateral o radiografía a categorías incompatibles.

## Comprobación ejecutada localmente

Comando: `node scripts/style-curation/agent-kit.mjs self-test`.

Resultado: código 0; 139 comprobaciones de integridad/regresión pasadas; 121 categorías, 1.689 presets, 24 procedimientos, 12 ejemplos y 15 fixtures. Ejecutado con Node 22.16.0 sobre la copia del catálogo y las fuentes del PR, incluida la corrección de fixtures. El helper usa APIs estándar y puede invocarse con Bun; esta ejecución local no certifica una ejecución completa de Vitest ni los gates de la aplicación.

`agent-kit.test.ts` integra el self-test en Vitest. No se ejecutó localmente `bun run test`, `bun run check` ni `bun run build`: Bun y las dependencias completas del repositorio no estaban disponibles en el entorno de autoría. La comprobación de formato de los archivos nuevos sigue pendiente; no se ha aplicado ninguna excepción al formateador.

## Bloqueo observado en CI

En [CI run 35822129408](https://github.com/gvastethecreator/codex-studio/actions/runs/35822129408), job Validate `107056033107`, `bun run validate:release` terminó con código 1 en `architecture:verify` / `recipes:source:verify`.

El log identifica exactamente:

- `components/recipes/intentionalStyleCompile.test.ts`: marcador `recipeContextBuilders`.
- `components/recipes/styleCurationBoundary.test.ts`: marcador `recipeContextBuilders`.

El audit interpreta esos imports de tests como dependencia de una superficie de recetas hacia el constructor de contexto. La ejecución se detuvo en ese control: no atribuirle resultados de pasos posteriores. Estos dos archivos no fueron cambiados por la ampliación del kit. No se desactivó el audit para hacer pasar CI.

Para resolverlo, revisar `scripts/recipe-module-source-audit.ts`, sus pruebas y los dos imports concretos. Elegir una ubicación de tests de integración que respete la arquitectura, o una distinción entre tests y código de producción respaldada por regresiones y revisión. No agregar excepciones amplias, alterar strings para evadir la detección ni borrar las pruebas. Esta decisión queda fuera de una tarea que solo modifica la redacción de un preset.

Después de corregir el bloqueo, ejecutar formato sobre los archivos del kit, `bun run test -- scripts/style-curation/agent-kit.test.ts`, y el gate completo pertinente. Registrar comandos y resultados nuevos; no reutilizar el registro histórico de 1.426 tests de la primera implementación como prueba de estos cambios adicionales.

## Lo que no está certificado

No se generaron ni evaluaron imágenes. Los doce ejemplos son propuestas de un campo, no presets completos aprobados. Los hashes comprueban consistencia de fuentes/archivos, no calidad artística, autenticidad de logs o identidad de quien firma una revisión. Un reporte estructuralmente válido puede seguir en estado pendiente. La curaduría visual sigue requiriendo revisión real.
