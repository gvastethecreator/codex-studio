# Deuda técnica pendiente

Este documento enumera la deuda técnica que sigue siendo relevante tras la actualización actual.

## Alta prioridad

1. **Descomposición adicional de `components/AppContent.tsx`**
   - El componente ya delega bastante lógica a hooks y shells, pero todavía concentra demasiada composición de overlays, navegación y wiring entre contextos.
   - Próximo paso recomendado: seguir empujando wiring hacia `useStudioRuntime`, shells más pequeños y controladores de overlays más específicos.

2. **Migración completa del cache visual hacia consulta directa del catálogo**
   - La UI todavía persiste `GenerationBatch[]` en IndexedDB bajo `catalog-cache`, aunque SQLite/Image Catalog ya son la fuente duradera de verdad.
   - Avance 2026-05-25: `lib/studioCatalogView.ts` ya es un read model puro de Catalog Entries, y `lib/studioCatalogVisualBatchAdapter.ts` concentra la materialización transitoria a Visual Batch.
   - Avance 2026-05-25: `useStudioGallery` ya puede construir `imagesWithConfig` desde Catalog Entries cuando recibe `StudioCatalogView`; `useImageManager` también puede recibir imágenes materializadas desde Catalog Entries para selección/delete/select-all/clear counts. Visual Batches siguen como fallback compat.
   - Avance 2026-05-25: `useWorkspaceStrip` ya calcula thumbnails y counts desde `StudioCatalogView` cuando está disponible; `GenerationBatch[]` queda como fallback legacy.
   - Avance 2026-05-25: `TrashModal` ya recibe grupos archivados derivados de Catalog Entries mediante `buildArchivedImageGroupsFromCatalog()` en lugar de `GenerationBatch[]`.
   - Avance 2026-05-25: `DashboardModal` ya recibe `imagesCount` derivado del catálogo y callback de export, sin depender de `GenerationBatch[]` para display.
   - Avance 2026-05-25: `useVaultTransfer` ya exporta workspace snapshots mediante `buildLegacyVisualBatchSnapshot()` para marcar el borde `GenerationBatch[]` como compatibilidad legacy; ZIP images siguen prefiriendo `StudioCatalogView`.
   - Avance 2026-05-25: `studioLegacyVisualBatchStore` concentra keys `catalog-cache`/`catalog-trash` y validación de snapshots legacy; `catalog:source:verify` bloquea que esos strings se dispersen.
   - Avance 2026-05-25: `GlobalContext` ya expone `importLegacyVisualBatches`/`archiveLegacyVisualBatches` y el reducer usa acciones legacy explícitas para import/archive.
   - Avance 2026-05-25: recovery/runtime ya usan `mergeLegacyVisualBatches` y acción `MERGE_LEGACY_VISUAL_BATCHES`; no queda API pública genérica `mergeBatches`.
   - Avance 2026-05-25: generation pipeline ya usa `prependGeneratedVisualBatch` y acción `PREPEND_GENERATED_VISUAL_BATCH`; no queda API pública genérica `prependBatch`.
   - Avance 2026-05-25: `GlobalContext` ya expone `legacyVisualBatches`/`legacyVisualTrash` en lugar de `batches`/`trash` genéricos.
   - Avance 2026-05-25: `GlobalState` interno ya guarda `legacyVisualBatches`/`legacyVisualTrash`, y las acciones delete/favorite/clear/restore/empty restantes ya usan nombres `LEGACY_VISUAL`.
   - Avance 2026-05-25: gallery, workspace strip y vault transfer reciben `catalogView` como camino primario y `legacyVisualBatches` solo como fallback explícito.
   - Avance 2026-05-25: storage recovery recibe `legacyVisualBatches` explícito, y overlay/page controller usan `catalogVisualGroupCount`/`visualGroupsCount` para no presentar el conteo de catálogo como batch legacy.
   - Avance 2026-05-25: `useCatalog` ya no materializa `visualBatches`; expone solo Catalog Entries y `StudioCatalogView`. La materialización `GenerationBatch[]` queda localizada en el shell como edge de compatibilidad.
   - Guard 2026-05-25: `catalog:source:verify` corre dentro de `validate:full` y evita que `StudioCatalogView` vuelva a importar `GenerationBatch`/adapters visuales o que `useCatalog` lea `catalog-cache`.
   - Próximo paso recomendado: cerrar la brecha descrita por ADR-0013 reduciendo shell `catalogVisualBatches` y los últimos helpers `GenerationBatch[]` cuando grid/export puedan consumir Catalog Entries directamente.

3. **Completar las costuras de inyección de dependencias en backend**
   - `appFactory.ts` ya admite seams útiles, pero módulos como `db`, `logger`, partes del worker y algunos flujos Codex siguen apoyándose en singletons/globales.
   - Próximo paso recomendado: extender ADR-0014 para habilitar tests aislados de catálogo, worker y lifecycle.

## Prioridad media

1. **Consolidación de naming entre Studio Runtime y Studio Readiness**
   - La documentación ya distingue ambos conceptos, pero el código todavía usa `studioRuntime.ts` y `useStudioRuntime.ts` para capas distintas (adapter vs orchestrator).
   - Próximo paso recomendado: evaluar si el hook agregado debe renombrarse o documentarse como superficie distinta antes de exponer más extensiones.

2. **Logging frontend uniforme**
   - Persisten usos directos de `console.*` en varios componentes y utilidades.
   - Próximo paso recomendado: introducir un adapter de logging compartido para UI con niveles y trazas más consistentes.

3. **Paridad total de animación en la capa GSAP local**
   - La nueva compatibilidad local desacopla la app de `motion/react`, pero todavía no replica toda la semántica de exit/layout animations.
   - Próximo paso recomendado: reforzar `AnimatePresence` para transiciones de salida complejas y listas animadas.

4. **Cobertura de tests de UI**
   - La suite unitaria ya corre con Vitest, pero el coverage del frontend visual sigue siendo modesto.
   - Próximo paso recomendado: agregar pruebas de integración de `Toolbar`, `QueuePanel`, `StudioPage` y `useLocalStudioSync`.

5. **Dependencias del stack**
   - Tras cada actualización mayor de Vite+, Rolldown u OXC conviene revisar compatibilidad real del repo y no asumir estabilidad total del ecosistema.
   - Próximo paso recomendado: revisar trimestralmente `bun outdated` y volver a ejecutar `validate:full`.

6. **Auditoría final de artefactos para release open source**
   - Ya se limpiaron `output/`, `tmp/` y `generated/`, y se purgó el historial de `*.png`, pero antes del release conviene revisar de nuevo que no reaparezcan prompts locales, muestras derivadas, cards PNG o archivos de trabajo con nombres/franquicias de terceros.
   - Próximo paso recomendado: ejecutar una revisión final de `git ls-files` y `git rev-list --objects --all` sobre artefactos locales para validar que el release candidate conserve únicamente las cards versionadas en `webp`.

## Prioridad baja

1. **Code splitting de recetas pesadas**
   - Las recetas más ricas todavía pueden beneficiarse de `React.lazy()` y separación de chunks.
   - Avance 2026-05-25: `CameraAnglesRecipe` ya separa `three` mediante import dinámico del viewport y bajó a 22.83 KB. Siguen relevantes el `index` principal y `StylePresetCatalogSearchSurface`.
   - Avance 2026-05-25: `index` bajó a 446.20 KB tras sacar `react-scan` de producción, cargar ZIP/export solo al exportar, y separar background/rutas. Queda más relevante `StylePresetCatalogSearchSurface`; `three.module` sigue grande pero demand-loaded.
   - Avance 2026-05-25: `StylePresetCatalogSearchSurface` bajó a 7.22 KB separando shell UI, data glob y parser YAML. El próximo trabajo ya no es chunk splitting básico sino medición render real.
   - Guard 2026-05-25: `ui:chunks:verify` corre dentro de `bun run build` y falla si las superficies separadas vuelven a superar sus presupuestos.
   - Guard 2026-05-25: `ui:source:verify` corre dentro de `validate:full` y falla si imports estáticos conocidos vuelven a montar superficies pesadas en shells de startup.
   - Guard 2026-05-25: `styles:render:verify` corre dentro de `styles:verify` y mantiene el render inicial de packs grandes acotado a 4 categorías / 64 preset cards como máximo.

2. **Guías adicionales del modelo catalog-first**
   - Cuando avance ADR-0013 hará falta documentar con más detalle cómo migrarán Workspaces, Vault y filtros cuando el grid consuma el catálogo sin `GenerationBatch[]`.

3. **Retiro final de pack YAML legacy**
   - Los presets reales ya viven en manifests granulares, y `styles:source:verify` bloquea presets legacy-only, pero `components/recipes/styles/packs/*.yaml` sigue versionado como entrada de migración/compatibilidad.
   - Próximo paso recomendado: eliminar o mover esos packs legacy cuando el script de migración y tests de compatibilidad dejen de necesitarlos.

## Cerrado recientemente

1. **Cobertura de default images en Style Preset Manifests**
   - Cerrado 2026-05-25: `SP01-081` ahora tiene default image versionada, manifest assets, taxonomy `hasDefaultImage: true`, runtime regenerado y `styles:verify` con 1,253/1,253 default images.
