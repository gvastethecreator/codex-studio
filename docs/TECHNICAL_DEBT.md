# Deuda técnica pendiente

Este documento enumera la deuda técnica que sigue siendo relevante tras la actualización actual.

## Alta prioridad

1. **Descomposición adicional de `components/AppContent.tsx`**
   - El componente ya delega bastante lógica a hooks y shells, pero todavía concentra demasiada composición de overlays, navegación y wiring entre contextos.
   - Próximo paso recomendado: seguir empujando wiring hacia `useStudioRuntime`, shells más pequeños y controladores de overlays más específicos.

2. **Migración completa del cache visual hacia consulta directa del catálogo**
   - La UI ya no persiste el cache visual activo `GenerationBatch[]` en IndexedDB; `catalog-cache`/`catalog-trash` quedan como claves legacy de recovery mientras el grid aun usa Visual Batches en memoria.
   - Avance 2026-05-26: `legacyVisualBatches` extraido de `GlobalContext` a `LegacyVisualBatchContext`; luego reducido a registro de ids (`legacyVisualBatchIds`) para dedupe de recovery y append generado. Provider tree: `GlobalProvider > LegacyVisualBatchProvider > GenerationProvider`. `GlobalContext` reducido a logs, workspaces, bg config, toasts, debug panel.
   - Avance 2026-05-26: `legacyVisualTrash` eliminado de `GlobalState`/reducer/context — nunca era leido externamente, solo usado internamente para acciones espejo. `archiveLegacyVisualBatches`, `restoreLegacyVisualBatchFromTrash`, `restoreAllLegacyVisualBatchesFromTrash`, `emptyLegacyVisualTrash` removidos.
   - Avance 2026-05-26: `useStudioShell` ya no materializa `catalogVisualBatches: GenerationBatch[]` — usa `catalogVisualGroupCount: number` directo del `StudioCatalogView`. `useStudioOverlayController` recibe `catalogVisualGroupCount: number`.
   - Avance 2026-05-26: `studioCatalogVisualBatchAdapter` eliminado. La materializacion de imagenes de UI vive en `studioCatalogImageAdapter`; el snapshot legacy `GenerationBatch[]` vive en `studioLegacyVisualSnapshotExport`.
   - Avance 2026-05-26: `studioVisualBatchCatalog` eliminado. Los helpers catalog-first de imagen viven en `studioCatalogImageAdapter`; la materializacion `GenerationBatch[]` ya no tiene modulo generico.
   - Avance 2026-05-26: recovery ya no pasa `GenerationBatch[]` por `useStudioRuntime`; recibe ids existentes y emite `LegacyVisualBatchSnapshot` solo por el callback legacy.
   - Avance 2026-05-26: `runLocalGeneration` ya no devuelve `GenerationBatch`; devuelve datos locales derivados del catálogo y el batch legacy se construye solo en `localGenerationVisualBatchCompat`.
   - Avance 2026-05-26: `LegacyVisualBatchContext` ya expone `registerGeneratedLegacyVisualBatchRef` y el reducer usa `REGISTER_GENERATED_LEGACY_VISUAL_BATCH_REF`, evitando conservar snapshots completos en memoria.
   - Avance 2026-05-25: `lib/studioCatalogView.ts` ya es un read model puro de Catalog Entries.
   - Avance 2026-05-25: `useStudioGallery` ya puede construir `imagesWithConfig` desde Catalog Entries cuando recibe `StudioCatalogView`; `useImageManager` también puede recibir imágenes materializadas desde Catalog Entries para selección/delete/select-all/clear counts. Visual Batches siguen como fallback compat.
   - Avance 2026-05-25: `useWorkspaceStrip` ya calcula thumbnails y counts desde `StudioCatalogView` cuando está disponible; `GenerationBatch[]` queda como fallback legacy.
   - Avance 2026-05-25: `TrashModal` ya recibe grupos archivados derivados de Catalog Entries mediante `buildArchivedImageGroupsFromCatalog()` en lugar de `GenerationBatch[]`.
   - Avance 2026-05-25: `DashboardModal` ya recibe `imagesCount` derivado del catálogo y callback de export, sin depender de `GenerationBatch[]` para display.
   - Avance 2026-05-25: `useVaultTransfer` ya exporta workspace snapshots mediante `buildLegacyVisualBatchSnapshot()` para marcar el borde `GenerationBatch[]` como compatibilidad legacy; ZIP images siguen prefiriendo `StudioCatalogView`.
   - Avance 2026-05-25: `studioLegacyVisualBatchStore` concentra keys `catalog-cache`/`catalog-trash` y validación de snapshots legacy; `catalog:source:verify` bloquea que esos strings se dispersen.
   - Avance 2026-05-26: la importación visible de snapshot JSON legacy fue removida; ese formato queda export-only y las imagenes entran por External Output Sources.
   - Avance 2026-05-26: recovery/runtime ya convierten snapshots legacy a refs antes de llegar al reducer via `REGISTER_RECOVERED_LEGACY_VISUAL_BATCH_REFS`; no queda API pública genérica `mergeBatches`.
   - Avance 2026-05-26: generation pipeline ya usa `registerGeneratedLegacyVisualBatchRef` y el reducer registra solo refs con `REGISTER_GENERATED_LEGACY_VISUAL_BATCH_REF`; no queda API pública genérica `prependBatch`.
   - Avance 2026-05-26: `ensureWorkspaces` fue retirado de las opciones de recovery legacy porque no tenia efecto real; recovery ahora solo comunica `prepend` y `maxTotal`.
   - Avance 2026-05-26: `GlobalContext` ya no expone `legacyVisualBatches`/`legacyVisualTrash`; el context legacy expone solo `legacyVisualBatchIds` y acciones mínimas de compatibilidad.
   - Avance 2026-05-26: `GlobalState` ya no guarda `legacyVisualBatches`/`legacyVisualTrash`; los mirrors delete/favorite legacy fueron removidos.
   - Avance 2026-05-26: gallery, workspace strip y vault transfer reciben `catalogView` como camino primario; ya no aceptan `legacyVisualBatches` como fallback.
   - Avance 2026-05-26: storage recovery recibe ids legacy explícitos, y overlay/page controller usan `catalogVisualGroupCount`/`visualGroupsCount` para no presentar el conteo de catálogo como batch legacy.
   - Avance 2026-05-25: `useCatalog` ya no materializa `visualBatches`; expone solo Catalog Entries y `StudioCatalogView`. La materialización `GenerationBatch[]` queda localizada en el shell como edge de compatibilidad.
   - Guard 2026-05-25: `catalog:source:verify` corre dentro de `validate:full` y evita que `StudioCatalogView` vuelva a importar `GenerationBatch`/adapters visuales o que `useCatalog` lea `catalog-cache`.
   - Guard 2026-05-26: `catalog:source:verify` tambien bloquea que `LegacyVisualBatchContext` vuelva a usar `useIndexedDBStorage`, `catalog-cache`, `catalog-trash` o acceso directo a `utils/idb`, y que `legacyVisualBatchReducer` vuelva a importar snapshots completos.
   - Próximo paso recomendado: cerrar la brecha descrita por ADR-0013 reduciendo shell `catalogVisualBatches` y los últimos helpers `GenerationBatch[]` cuando grid/export puedan consumir Catalog Entries directamente.

3. **Completar las costuras de inyección de dependencias en backend**
   - `appFactory.ts` ya admite seams útiles, pero módulos como `db`, `logger`, partes del worker y algunos flujos Codex siguen apoyándose en singletons/globales.
   - Avance 2026-05-26: `providers:source:verify` bloquea que rutas y módulos backend no-provider importen compilers/executors concretos; la ejecución queda detrás de `apps/local-server/src/providers/`.
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
   - Guard 2026-05-25: `styles:render:verify` corre dentro de `styles:verify` y mantiene el render inicial de packs grandes acotado.
   - Avance 2026-05-26: `styles:render:verify` ahora consume `styleBrowserRenderPlan`, compartido con `StylesRecipe`, y mide secciones montadas/eager/placeholders más cards eager/planeadas. `pack_05` queda en 4 secciones montadas, 2 eager, 2 placeholders, 32 cards eager y 64 cards planeadas.
   - Avance 2026-05-26: pase browser real sobre `pack_05` en `http://127.0.0.1:5173/#recipe-styles` confirmó el presupuesto colapsado y expandido: expandido queda en 12 grupos, 2 eager, 10 placeholders, 32 cards renderizadas, 192 cards planeadas.
   - Próximo paso recomendado: si este check debe ser release gate, convertir el pase browser en script automatizado.

2. **Guías adicionales del modelo catalog-first**
   - Cuando avance ADR-0013 hará falta documentar con más detalle cómo migrarán Workspaces, Vault y filtros cuando el grid consuma el catálogo sin `GenerationBatch[]`.

3. **Retiro final de pack YAML legacy**
   - Cerrado 2026-05-26: los presets reales viven en manifests granulares y los YAML monolíticos de `scripts/style-migration/legacy-packs/` fueron eliminados. `styles:source:verify` falla si reaparecen YAML legacy allí o en `components/recipes/styles/packs/`.
   - Cerrado 2026-05-26: `style-default-utils` ya no tiene fallback YAML legacy; `audit-style-category-bases` consume manifests compuestos y los helpers viejos de expand/reorder quedaron como guards no destructivos.
   - Cerrado 2026-05-26: nuevos nombres explícitos `StyleRuntimePack` / `StyleRuntimePreset` y composer `composeStyleRuntimePacksFromManifests()` cubren UI Styles, runtime helpers, default asset pipeline y scripts de defaults/render.
   - Cerrado 2026-05-26: aliases runtime viejos `StylePack`, `StylePresetDef` y `composeStylePacksFromManifests()` retirados; `styles:source:verify` los bloquea fuera del guard/test de source audit.
   - Cerrado 2026-05-26: contratos Styles separados en `manifestTypes.ts` y `runtimeTypes.ts`; el viejo barrel `styles/types.ts` fue eliminado y `styles:source:verify` bloquea imports desde ese path.
   - Cerrado 2026-05-26: exports runtime de pack-summary y loaders generados migrados a nombres `StyleRuntime*`; `styles:source:verify` bloquea que vuelvan los nombres de pack runtime retirados.
   - Cerrado 2026-05-26: agregados templates repo-locales para nuevos Style Preset Manifests de imagen, sprite sheet y textura, más `styles:templates:verify`.
   - Cerrado 2026-05-26: agregados Recipe Module Examples `sprite_sheet` y `texture_generate` en `lib/recipeModuleExamples.ts`, con `recipes:examples:verify` integrado en `recipes:verify`; siguen `example_only` y no crean providers nuevos.
   - Próximo paso recomendado: convertir `texture_generate` en Recipe Module runtime solo cuando existan UI, builder y adapter explicitos.

## Cerrado recientemente

1. **Cobertura de default images en Style Preset Manifests**
   - Cerrado 2026-05-25: `SP01-081` ahora tiene default image versionada, manifest assets, taxonomy `hasDefaultImage: true`, runtime regenerado y `styles:verify` con 1,253/1,253 default images.
