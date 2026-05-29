# Architecture review - Codex Studio

Date: 2026-05-29

## Summary

- La fricción principal sigue en módulos donde la **interface** todavía está cerca de la **implementation**: `Studio Shell`, `Local Generation Run`, `WorkerController`, `Local Studio Sync` y el módulo de composición del runtime backend.
- El batch aceptado del 2026-05-27 marcó la dirección correcta; esta revisión identifica deltas concretos para cerrar los huecos que siguen abiertos.
- El riesgo actual no es falta de seams, sino seams reales con **depth** parcial: demasiada coordinación visible para el caller y demasiado conocimiento cruzado para depurar o probar.

## Recommendations

### 1. Terminar el deepening del módulo Studio Shell y reducir su interface pública

**Recommendation strength**: Strong

**Files**

- `hooks/useStudioShell.ts`
- `components/AppContent.tsx`
- `lib/buildStudioPageController.ts`
- `lib/buildStudioHeaderToolbarProps.ts`
- `hooks/useStudioOverlayController.ts`

**Problem**

`useStudioShell` sigue siendo un módulo de coordinación muy ancho: integra navegación, generación, overlays, `Command Center`, `Studio Readiness`, `Local Studio Sync` y acciones de `Image Catalog` en una sola **interface**. El caller necesita entender demasiada **implementation** para tocar una sola ruta de comportamiento.

Deletion test: si se elimina `useStudioShell`, la complejidad reaparece en `AppContent` y en múltiples callers; no desaparece.

**Solution**

Mantener `useStudioShell` como módulo de composición final, pero mover la coordinación restante a módulos más profundos por flujo (por ejemplo, proyección de overlays, proyección de operaciones, y proyección de navegación) para que la interface de shell se reduzca a un ensamblado mínimo.

**Benefits**

- locality: cambios de shell se concentran por flujo y no en un único módulo gigante.
- leverage: callers consumen una interface más corta con más comportamiento útil.
- testability: permite pruebas por seam de flujo sin montar todo el shell.

**Before / After**

- Before: una interface de shell expone demasiados subárboles de estado y handlers.
- After: el módulo shell solo ensambla adapters profundos por flujo; su interface queda pequeña y estable.

**Dependencies / sequencing**

- Debe ejecutarse primero.
- Extiende ADR-0011 y ADR-0024.

**Documentation follow-ups**

- Actualizar `docs/ARCHITECTURE.md` en la sección de `Studio Shell`.
- Actualizar `docs/TECHNICAL_DEBT.md` y `docs/architecture/DEEPENING-ROADMAP.md` con el cierre de esta fase.

### 2. Mover la política completa de ciclo de vida al módulo Local Generation Run

**Recommendation strength**: Strong

**Files**

- `services/localGenerationRun.ts`
- `hooks/useGenerationPipeline.ts`
- `hooks/useStudioGenerationLifecycle.ts`
- `hooks/useStudioGenerationSession.ts`

**Problem**

La política de ciclo de vida sigue repartida: `Local Generation Run` devuelve outcomes, pero el pipeline todavía decide demasiado sobre mensajes, modal y reglas por flujo (`generate` vs `edit`). La **interface** visible para el caller sigue siendo más grande de lo necesario.

Deletion test: quitar `runLocalGenerationWithLifecycle` duplicaría la coreografía de jobs; quitar la lógica de pipeline repartiría reglas de ciclo de vida en varios módulos.

**Solution**

Profundizar `Local Generation Run` para centralizar outcome policy (incluyendo mensajes normalizados, clasificación de fallos/cancelación y pacing), dejando `useGenerationPipeline` como adapter UI del resultado.

**Benefits**

- locality: reglas de ciclo de vida se corrigen en un solo módulo.
- leverage: una interface de outcomes reutilizable para `generate` y `edit`.
- testability: pruebas de ciclo de vida cruzan un seam sin UI.

**Before / After**

- Before: ciclo de vida repartido entre run + pipeline + lifecycle hook.
- After: ciclo de vida concentrado en run; hooks UI hacen traducción visual.

**Dependencies / sequencing**

- Segundo en el orden.
- Continúa la recomendación 2 del review 2026-05-27.

**Documentation follow-ups**

- Actualizar flujo de generación en `docs/ARCHITECTURE.md`.
- Marcar avance en `docs/architecture/DEEPENING-ROADMAP.md`.

### 3. Profundizar el seam de finalización de assets en WorkerController

**Recommendation strength**: Strong

**Files**

- `apps/local-server/src/worker.ts`
- `apps/local-server/src/outputOrganization.ts`
- `apps/local-server/src/library.ts`

**Problem**

`worker.ts` concentra demasiada **implementation** de finalización (move/rename, `publicUrl`, catalog registration, metadata embedding, events) dentro de un solo módulo operativo. Además, la construcción de `publicUrl` en `finalizeJobAsset` se resuelve con `discoveredImagePath` mientras el archivo puede ser movido a `organizedImagePath`, lo que debilita la **locality** del comportamiento correcto.

Deletion test: eliminar este tramo no elimina complejidad; la propaga a cada ejecución de provider.

**Solution**

Extraer un módulo profundo de finalización de asset con una interface explícita de `finalizeGeneratedAsset(job, discoveredPath, providerId, catalogContext)` y adapters internos para path organization, URL pública, metadata y persistencia.

**Benefits**

- locality: la lógica de finalización y rutas queda en un solo módulo.
- leverage: todos los providers reutilizan el mismo comportamiento consistente.
- testability: pruebas enfocadas sobre un seam único de finalización.

**Before / After**

- Before: finalización mezclada dentro de `worker.ts` con múltiples pasos acoplados.
- After: `worker.ts` orquesta; un módulo profundo encapsula finalización.

**Dependencies / sequencing**

- Tercero en el orden.
- Encaja con ADR-0014 (DI seams) y no lo contradice.

**Documentation follow-ups**

- Actualizar `docs/ARCHITECTURE.md` en backend runtime seams.
- Actualizar ADR-0014 de `Proposed` a estado alineado cuando cierre esta extracción.

### 4. Extraer adapters de runtime browser-only fuera de Local Generation Run

**Recommendation strength**: Worth exploring

**Files**

- `services/localGenerationRun.ts`
- `services/localStudioService.ts`
- `services/studioEventSource.ts`

**Problem**

`localGenerationRun.ts` mezcla orquestación de job con detalles browser-only (`window.setTimeout`, `FileReader`, `fetch` para data URL). La **interface** del módulo parece portable, pero su **implementation** fuerza un runtime concreto y reduce la claridad del seam para pruebas fuera de DOM.

Deletion test: eliminar helpers browser-only del módulo no quita complejidad de negocio; la reubica mejor detrás de adapters explícitos.

**Solution**

Separar adapters de runtime (`clock`, `binaryEncoder`, `sourceReader`) y dejar `Local Generation Run` como módulo de orquestación pura sobre esos adapters.

**Benefits**

- locality: diferencias de runtime se concentran en adapters dedicados.
- leverage: mismo módulo de orquestación para más de un entorno de prueba.
- testability: tests de run sin depender de globals browser.

**Before / After**

- Before: módulo de run conoce detalles de orígenes/temporizadores browser.
- After: módulo de run consume adapters; browser details quedan fuera.

**Dependencies / sequencing**

- Cuarto en el orden.
- Conviene hacerlo después de cerrar la recomendación 2.

**Documentation follow-ups**

- Actualizar `docs/ARCHITECTURE.md` en `Local Generation Run`.
- Si se vuelve decisión irreversible de runtime, abrir ADR nuevo; si no, registrar en roadmap.

### 5. Profundizar el módulo de composición backend en appFactory

**Recommendation strength**: Worth exploring

**Files**

- `apps/local-server/src/appFactory.ts`
- `apps/local-server/src/catalogRoutes.ts`
- `apps/local-server/src/workspaceRoutes.ts`
- `apps/local-server/src/worker.ts`

**Problem**

`appFactory.ts` cruza demasiadas responsabilidades: bootstrap, health/readiness, rutas, output sources, provider preflight, jobs, SSE y asset serving. La **interface** de creación es chica, pero la **implementation** tiene acoplamiento alto y baja **locality** para cambios de una sola ruta.

Deletion test: si se elimina `appFactory.ts`, gran parte de la complejidad reaparece fragmentada sin una composición clara; hoy concentra demasiado, pero no con seams internos suficientemente profundos.

**Solution**

Mantener `createStudioApp` como interface de entrada y extraer módulos profundos por flujo de runtime backend (readiness, jobs, output sources, stream, assets) con adapters explícitos.

**Benefits**

- locality: cambios de un flujo backend no arrastran todo el factory.
- leverage: un módulo de composición pequeño sobre módulos de flujo profundos.
- testability: permite pruebas de flujo sin montar todo el runtime.

**Before / After**

- Before: un módulo grande registra múltiples flujos heterogéneos.
- After: composición principal pequeña y flujos encapsulados por seam.

**Dependencies / sequencing**

- Quinto en el orden.
- Sigue la dirección de ADR-0029 y ADR-0014.

**Documentation follow-ups**

- Actualizar `docs/ARCHITECTURE.md` (runtime backend seams).
- Añadir pasos en `docs/architecture/DEEPENING-ROADMAP.md`.

### 6. Cerrar el deepening del módulo Local Studio Sync con política de refresh explícita

**Recommendation strength**: Worth exploring

**Files**

- `hooks/useLocalStudioSync.ts`
- `hooks/localStudioSyncProjection.ts`
- `services/studioEventSource.ts`

**Problem**

Aunque la proyección ya salió a `localStudioSyncProjection`, la política de refresh sigue acoplada al hook: `onAssetAdded` dispara refresh implícito, reconnect dispara refresh, y no hay un adapter explícito de coalescing/debounce para el `Image Catalog`. La **interface** del módulo oculta reglas de carga con potencial de ruido.

Deletion test: al borrar `useLocalStudioSync`, reaparece la complejidad de stream + refresh policy en varios callers.

**Solution**

Separar la política de refresh en un módulo profundo de sincronización (`syncRefreshPolicy`) y dejar `useLocalStudioSync` como ensamblado de stream + projection + policy.

**Benefits**

- locality: reglas de reconexión/refresh viven en un solo módulo.
- leverage: callers mantienen una interface estable de actividad.
- testability: pruebas específicas para reconnect, burst de eventos y refresh coalescing.

**Before / After**

- Before: stream y refresh policy conviven en el mismo hook.
- After: refresh policy cruza un seam explícito y testeable.

**Dependencies / sequencing**

- Sexto en el orden.
- Continúa la recomendación 6 del review 2026-05-27.

**Documentation follow-ups**

- Actualizar sección `Local Studio Sync` en `docs/ARCHITECTURE.md`.
- Actualizar tracker en `docs/architecture/DEEPENING-ROADMAP.md`.

## Suggested execution order

1. Terminar deepening de `Studio Shell` para reducir superficie de coordinación visible.
2. Consolidar ciclo de vida en `Local Generation Run` para estabilizar outcomes.
3. Extraer finalización de assets en `WorkerController` para ganar locality backend inmediata.
4. Extraer adapters runtime browser-only en `Local Generation Run` para mejorar testability.
5. Dividir `appFactory` por flujos de runtime backend sin romper la interface de entrada.
6. Cerrar deepening de `Local Studio Sync` con policy explícita de refresh.

## Documentation fan-out

- `docs/ARCHITECTURE.md`: actualizar seams de `Studio Shell`, `Local Generation Run`, worker backend, `Local Studio Sync`, y composición runtime.
- `docs/architecture/DEEPENING-ROADMAP.md`: registrar estado y pasos por recomendación aceptada.
- `docs/TECHNICAL_DEBT.md`: alinear cola de deuda con este batch.
- `docs/adr/0014-backend-dependency-injection-seams.md`: actualizar estado al cerrar extracción backend.
- `docs/adr/`: abrir ADR nuevo solo si una decisión de seam/runtime es dura de revertir.
