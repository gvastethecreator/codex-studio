# Architecture review - Codex Studio

Date: 2026-05-29

## Summary

- El repo avanzó en **depth** real (por ejemplo: `workerAssetFinalizer`, `workerAssetPathing`, rutas extraídas en `appFactory`, y `localStudioSyncProjection`), pero todavía hay módulos cuya **interface** expone demasiada **implementation**.
- La fricción actual está más en “última milla” de deepening que en extracciones grandes nuevas: cerrar seams incompletos para subir **locality** y mantener **leverage**.
- Esta revisión actualiza el batch del 2026-05-27 con foco en deltas vigentes y en lo que ya no aplica.

## Recommendations

### 1. Cerrar el deepening del módulo Studio Shell (fase final de interface)

**Recommendation strength**: Strong

**Files**

- `hooks/useStudioShell.ts`
- `components/AppContent.tsx`
- `hooks/useStudioRuntime.ts`
- `lib/buildStudioPageController.ts`
- `lib/buildStudioHeaderToolbarProps.ts`

**Problem**

`useStudioShell` todavía cruza demasiadas superficies en una sola **interface**. Aunque ya hay varios módulos extraídos, la **implementation** sigue visible para el caller por el volumen de dependencias y coordinación en un solo módulo.

Deletion test: si se elimina `useStudioShell`, la complejidad reaparece en `AppContent` y en callers de shell; no desaparece.

**Solution**

Terminar la fase final de deepening para que `Studio Shell` sea principalmente un módulo de ensamblado con menos detalle operativo expuesto. Mantener el seam, pero con menos conocimiento cruzado en su interface.

**Benefits**

- locality: cambios de shell se concentran por módulo y no en un único punto de coordinación ancho.
- leverage: la interface de shell entrega más comportamiento con menos superficie.
- testability: pruebas de shell por seam con menor setup transversal.

**Before / After**

- Before: `Studio Shell` concentra demasiada coordinación detallada.
- After: `Studio Shell` conserva el seam principal, pero con una interface más pequeña y estable.

**Dependencies / sequencing**

- Primero en el orden.
- Continúa ADR-0011 y ADR-0024, sin conflicto.

**Documentation follow-ups**

- Actualizar `docs/ARCHITECTURE.md` en `Studio Shell`.
- Actualizar estado en `docs/architecture/DEEPENING-ROADMAP.md` y `docs/TECHNICAL_DEBT.md`.

### 2. Profundizar el módulo Studio Generation Session para eliminar política duplicada

**Recommendation strength**: Strong

**Files**

- `hooks/useStudioGenerationSession.ts`
- `hooks/useGenerationPipeline.ts`
- `services/localGenerationRun.ts`
- `hooks/useStudioGenerationLifecycle.ts`

**Problem**

La clasificación de outcomes ya está en `Local Generation Run`, pero `useGenerationPipeline` todavía repite parte de la política de interacción (mensajes, modal, diferencias generate/edit). La **interface** cruzada entre módulos sigue siendo más grande de lo necesario.

Deletion test: si se quita la capa de lifecycle del run, la complejidad reaparece en pipeline y sesión; si se quita pipeline sin deepening, la política queda repartida.

**Solution**

Concentrar una política única de outcome para generación/edición detrás del seam de sesión, dejando pipeline como adapter de UI con mínima lógica propia.

**Benefits**

- locality: reglas de outcome se corrigen en un solo módulo.
- leverage: mismo comportamiento para `generate` y `edit` detrás de una interface coherente.
- testability: pruebas de política sin acoplar toda la UI.

**Before / After**

- Before: policy repartida entre run, lifecycle y pipeline.
- After: policy concentrada; pipeline queda delgado.

**Dependencies / sequencing**

- Segundo en el orden.
- Continúa el batch aceptado de 2026-05-27.

**Documentation follow-ups**

- Actualizar sección `Local Generation Run` en `docs/ARCHITECTURE.md`.
- Actualizar tracker en `docs/architecture/DEEPENING-ROADMAP.md`.

### 3. Separar el módulo Studio Settings en seams por dominio operativo

**Recommendation strength**: Worth exploring

**Files**

- `hooks/useStudioSettings.ts`
- `services/localStudioService.ts`
- `components/StudioSettingsModal.tsx`

**Problem**

`useStudioSettings` mezcla en una misma **implementation**: Studio Settings editables, Provider capability/preflight y operaciones de External Output Source. El resultado es una **interface** muy ancha para callers de UI y baja **locality** al cambiar una sola preocupación.

Deletion test: si se elimina este módulo, la complejidad se dispersa por múltiples callers; hoy está concentrada, pero en una sola unidad demasiado ancha.

**Solution**

Mantener un seam principal para la UI, pero con módulos profundos internos por dominio (Settings editables, Provider runtime diagnostics, External Output Source) para reducir acoplamiento entre flujos.

**Benefits**

- locality: cada flujo operativo cambia en un módulo propio.
- leverage: callers de `Studio Settings` consumen una interface menos ruidosa.
- testability: pruebas por flujo sin stubs cruzados innecesarios.

**Before / After**

- Before: una sola interface para tres dominios de comportamiento.
- After: módulos profundos por dominio detrás de un seam de UI estable.

**Dependencies / sequencing**

- Tercero en el orden.
- No contradice ADR-0023 ni ADR-0030.

**Documentation follow-ups**

- Actualizar `docs/ARCHITECTURE.md` en `Studio Settings` y Provider diagnostics.
- Actualizar `docs/TECHNICAL_DEBT.md` con la deuda separada por dominio.

### 4. Finalizar deepening del módulo appFactory extrayendo stream/events y library serving

**Recommendation strength**: Strong

**Files**

- `apps/local-server/src/appFactory.ts`
- `apps/local-server/src/runtimeRoutes.ts`
- `apps/local-server/src/libraryAssetVariants.ts`

**Problem**

`appFactory` ya ganó **depth** con múltiples rutas extraídas, pero todavía mantiene inline dos áreas con mucha **implementation**: SSE (`/api/events`) y serving de `Local Asset` (`/library/*`). Eso reduce **locality** en cambios de transporte y cacheado de assets.

Deletion test: quitar `appFactory` hoy seguiría dispersando estas dos áreas; el módulo conserva complejidad legítima, pero con seams aún incompletos.

**Solution**

Completar la extracción de SSE y serving de library hacia módulos profundos dedicados, manteniendo `appFactory` como composición de runtime.

**Benefits**

- locality: stream y asset-serving evolucionan sin tocar el módulo de composición.
- leverage: `appFactory` queda como interface clara de wiring.
- testability: pruebas de stream/cache headers sin levantar toda la app.

**Before / After**

- Before: composición + stream + serving en el mismo módulo.
- After: composición del runtime separada de stream/serving.

**Dependencies / sequencing**

- Cuarto en el orden.
- Continúa ADR-0014 y ADR-0029, sin conflicto.

**Documentation follow-ups**

- Actualizar `docs/ARCHITECTURE.md` en seams de backend runtime.
- Actualizar `docs/architecture/DEEPENING-ROADMAP.md` (item de appFactory).

### 5. Ajustar el módulo Local Studio Sync para un seam de refresh más explícito

**Recommendation strength**: Worth exploring

**Files**

- `hooks/useLocalStudioSync.ts`
- `hooks/localStudioSyncRefreshPolicy.ts`
- `services/studioEventSource.ts`

**Problem**

La extracción de refresh policy ya existe, pero la policy actual es mínima (`onAssetAdded`, `onConnectionChange`) y su **interface** no expresa con claridad reglas de coalescing/backpressure para ráfagas de eventos. La **locality** mejoró, pero el seam aún es delgado para crecimiento operativo.

Deletion test: eliminar `localStudioSyncRefreshPolicy` volvería a inyectar reglas implícitas en el hook principal; hoy aporta valor, pero su depth puede crecer.

**Solution**

Profundizar el módulo de policy para modelar explícitamente refrescos por tipo de evento y reconexión, manteniendo `useLocalStudioSync` como ensamblado de stream + projection + policy.

**Benefits**

- locality: reglas de refresh/reconnect viven en un solo módulo.
- leverage: callers conservan una interface estable mientras la policy evoluciona.
- testability: pruebas específicas de ráfagas y reconexiones.

**Before / After**

- Before: policy correcta pero con poco depth operativo.
- After: policy explícita y más profunda sin ensanchar callers.

**Dependencies / sequencing**

- Quinto en el orden.
- Conviene después de 1 y 4 para evitar churn de shell/runtime.

**Documentation follow-ups**

- Actualizar sección `Local Studio Sync` en `docs/ARCHITECTURE.md`.
- Actualizar `docs/TECHNICAL_DEBT.md` y roadmap con criterios de salida.

### 6. Revisar naming/seam en Local Generation Run para reducir señal codex-only en módulo neutral

**Recommendation strength**: Speculative

**Files**

- `services/localGenerationRun.ts`
- `lib/recipeModules.ts`
- `apps/local-server/src/workerRouting.ts`

**Problem**

`runSingleCodexImagegenJob` vive dentro de un módulo que resuelve `Generation Provider` desde `Studio Settings`. El comportamiento ya es mayormente provider-neutral, pero el naming y parte del flujo todavía señalan una **interface** más específica que la **implementation** real.

Deletion test: eliminar esta parte no quita complejidad; la reubica y puede confundir seams de provider.

**Solution**

Revisar el seam para que el módulo exprese con más precisión su rol provider-neutral, sin reabrir decisiones de Provider Boundary ya aceptadas.

**Benefits**

- locality: reduce ambigüedad semántica en el módulo de run.
- leverage: mejor AI-navigability sobre el seam de Generation Provider.
- testability: fixtures de provider más claras para callers.

**Before / After**

- Before: naming específico en una implementation cada vez más neutral.
- After: naming/seam alineados con el contrato real.

**Dependencies / sequencing**

- Sexto en el orden.
- Ejecutar solo después de cerrar recomendaciones 2 y 4.

**Documentation follow-ups**

- Si se acepta, actualizar `docs/ARCHITECTURE.md` y `docs/active/professionalization-roadmap.md`.
- No requiere ADR nuevo salvo cambio de contrato duro.

## Suggested execution order

1. Cerrar deepening de `Studio Shell` (reduce churn global para el resto).
2. Consolidar policy de `Studio Generation Session` / `Local Generation Run`.
3. Separar `Studio Settings` por dominio operativo.
4. Completar extracción de SSE + library serving en `appFactory`.
5. Profundizar policy de `Local Studio Sync` con reglas explícitas de refresh.
6. Revisar naming/seam de `Local Generation Run` (especulativo, al final).

## Documentation fan-out

- `docs/ARCHITECTURE.md`: actualizar seams de `Studio Shell`, `Local Generation Run`, `Local Studio Sync`, y backend runtime composition.
- `docs/architecture/DEEPENING-ROADMAP.md`: registrar estado por recomendación aceptada y dependencias.
- `docs/TECHNICAL_DEBT.md`: alinear prioridad y estado con este batch.
- `docs/adr/0014-backend-dependency-injection-seams.md`: actualizar estado cuando se cierre la fase backend pendiente.
- `docs/adr/`: abrir ADR nuevo solo si una recomendación aceptada introduce una decisión difícil de revertir.
