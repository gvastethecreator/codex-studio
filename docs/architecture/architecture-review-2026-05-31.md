# Architecture review — Codex Studio

Date: 2026-05-31

## Summary

- La fricción principal no está en ausencia de seams, sino en seams cuya **interface** todavía filtra demasiada **implementation**.
- El repo ya tiene deepening real en backend y shell, pero persisten módulos **shallow** por compatibilidad dual y por adapters de mapeo demasiado verbosos.
- Esta revisión prioriza cerrar seams incompletos para subir **locality** y **leverage**, sin reabrir ADRs ya encaminados.

## Recommendations

### 1. Deepen el módulo Studio Shell para reducir fan-in y fan-out de interface

**Recommendation strength**: Strong

**Files**

- `hooks/useStudioShell.ts`
- `components/AppContent.tsx`
- `lib/buildStudioHeaderToolbarProps.ts`
- `lib/buildStudioPageController.ts`

**Problem**

`useStudioShell.ts` concentra demasiado ensamblado y cruza invariantes de runtime, workspace, overlays, queue y navigation. El módulo existe, pero su **interface** sigue exponiendo demasiada **implementation**.

Deletion test: si se elimina `useStudioShell.ts`, la complejidad reaparece casi completa en `AppContent` y callers vecinos.

**Solution**

Reducir la interface de `Studio Shell` a un seam más pequeño: separar una policy de composición que absorba reglas entre toolbar, page controller y overlays, dejando `useStudioShell.ts` como fachada estable.

**Benefits**

- locality: cambios de coordinación de shell quedan en un módulo dedicado.
- leverage: callers consumen menos campos y menos reglas implícitas.
- tests: la policy de shell se prueba cruzando un seam único, sin montar todo el árbol.

**Before / After**

- Before: `useStudioShell.ts` mezcla composición, policy y mapping de varios seams.
- After: `useStudioShell.ts` queda como interface fina; la policy vive detrás de un módulo deep.

**Dependencies / sequencing**

- Debe ir primero para reducir churn del resto.
- Desbloquea recomendaciones 2, 3, 4 y 7.

**Documentation follow-ups**

- `docs/ARCHITECTURE.md` (sección `Studio Shell`).
- `docs/TECHNICAL_DEBT.md` (estado de deuda de shell).
- `docs/architecture/DEEPENING-ROADMAP.md` (estado y criterios de salida).

### 2. Deepen el módulo Workspace lifecycle para unir invariantes de catálogo + confirmación + switching

**Recommendation strength**: Strong

**Files**

- `hooks/useWorkspaceStrip.ts`
- `hooks/useStudioActionConfirmations.ts`
- `hooks/useCatalog.ts`
- `lib/workspaceLifecycle.ts`
- `lib/buildStudioHeaderToolbarProps.ts`
- `components/header/WorkspaceStrip.tsx`

**Problem**

La lógica de workspace sigue repartida entre strip, confirmaciones, catálogo y switching. El orden operativo es crítico, pero la **interface** sigue distribuida.

Deletion test: si se elimina cualquiera de esos módulos, la complejidad no desaparece; se redistribuye entre callers.

**Solution**

Profundizar `Workspace lifecycle` para encapsular invariantes de orden (clear-before-delete), sincronización con catálogo y transición de vista/switching detrás de un seam explícito.

**Benefits**

- locality: reglas de workspace se corrigen en un solo módulo.
- leverage: `HeaderToolbar` y `WorkspaceStrip` cruzan una interface mínima.
- tests: más cobertura por seam de lifecycle y menos fragilidad por eventos UI.

**Before / After**

- Before: policy repartida entre strip, confirmaciones, catálogo y toolbar mapping.
- After: policy centralizada detrás de un seam; UI cruza adapters delgados.

**Dependencies / sequencing**

- Después de recomendación 1.
- Desbloquea robustez de switching/delete sin coupling accidental.

**Documentation follow-ups**

- `docs/ARCHITECTURE.md` (sección `Command Center` + workspace).
- `docs/TECHNICAL_DEBT.md` (deuda de invariantes de workspace).

### 3. Deepen el módulo Studio Settings para retirar interface dual (dominios + compatibilidad plana)

**Recommendation strength**: Strong

**Files**

- `hooks/useStudioSettings.ts`
- `hooks/useStudioShell.ts`
- `hooks/useStudioOverlayController.ts`
- `components/StudioSettingsModal.tsx`

**Problem**

`useStudioSettings.ts` ya expone dominios (`settingsDomain`, `providerDomain`, `outputSourcesDomain`), pero también mantiene una superficie plana duplicada. Esa duplicación vuelve **shallow** el módulo: más interface sin más comportamiento.

Deletion test: si se elimina la superficie plana, la complejidad no reaparece en callers migrados; desaparece ruido.

**Solution**

Completar migración de callers a interface por dominios y retirar la superficie plana duplicada.

**Benefits**

- locality: cada dominio cambia sin contaminar los otros.
- leverage: menos campos en la interface con la misma capacidad.
- tests: fixtures más pequeños y deterministas por dominio.

**Before / After**

- Before: interface dual (dominios + plano) con reglas repetidas.
- After: interface única por dominios con adapters UI delgados.

**Dependencies / sequencing**

- Después de recomendación 1.
- No contradice ADR-0023 ni ADR-0030.

**Documentation follow-ups**

- `docs/ARCHITECTURE.md` (`Studio Settings` + runtime preflight).
- `docs/TECHNICAL_DEBT.md` (cerrar deuda de compatibilidad plana).

### 4. Deepen el módulo Command Center projection para encapsular policy de estado y transiciones

**Recommendation strength**: Worth exploring

**Files**

- `lib/buildStudioHeaderToolbarProps.ts`
- `lib/buildStudioPageController.ts`
- `components/HeaderToolbar.tsx`
- `hooks/useStudioHeaderToolbarConfig.test.ts`

**Problem**

La proyección ya está concentrada y tiene test directo de toolbar, pero la **interface** de entrada sigue ancha y la cobertura de invariantes de proyección es parcial (más orientada a happy path).

Deletion test: si se elimina la proyección, reaparece mapping extenso en shell; el seam aporta valor, pero su **depth** todavía es limitado.

**Solution**

Definir una policy de proyección del `Command Center` con invariantes explícitas (runtime tone, queue totals, switching side-effects) y ampliar test surface a casos no felices.

**Benefits**

- locality: policy de proyección y transición en un módulo.
- leverage: menos wiring manual desde shell.
- tests: más confianza en invariantes, no solo en mapping básico.

**Before / After**

- Before: mapping útil con entradas verbosas y cobertura parcial.
- After: policy más deep con invariantes explícitas y pruebas más completas.

**Dependencies / sequencing**

- Después de recomendación 1.
- Alineado con ADR-0024.

**Documentation follow-ups**

- `docs/ARCHITECTURE.md` (`Command Center`).
- `docs/architecture/DEEPENING-ROADMAP.md` (sub-item de projection policy).

### 5. Deepen el módulo Local Studio Sync policy para modelar eventos más allá de asset/disconnect

**Recommendation strength**: Worth exploring

**Files**

- `hooks/useLocalStudioSync.ts`
- `hooks/localStudioSyncRefreshPolicy.ts`
- `hooks/localStudioSyncProjection.ts`

**Problem**

La policy actual refresca en `onAssetAdded` y desconexión. Es correcta, pero su **interface** sigue mínima para ráfagas y reconexiones complejas.

Deletion test: si se elimina `localStudioSyncRefreshPolicy.ts`, la complejidad de coalescing vuelve a `useLocalStudioSync.ts`.

**Solution**

Expandir la policy como módulo deep: categorías de evento explícitas, reglas de coalescing por tipo y refresh diferido/retry de reconexión.

**Benefits**

- locality: estrategia de refresh en un módulo.
- leverage: `useLocalStudioSync.ts` queda como ensamblado estable.
- tests: cobertura de policy sin montar stream completo.

**Before / After**

- Before: policy correcta pero estrecha.
- After: policy explícita para comportamiento bajo carga/reconexión.

**Dependencies / sequencing**

- Después de recomendaciones 1 y 4.
- Alineado con ADR-0029; sin conflicto.

**Documentation follow-ups**

- `docs/ARCHITECTURE.md` (`Local Studio Sync`).
- `docs/TECHNICAL_DEBT.md` (criterios de salida de sync policy).

### 6. Deepen la verificación del módulo createStudioApp para cubrir composición no feliz

**Recommendation strength**: Strong

**Files**

- `apps/local-server/src/appFactory.ts`
- `apps/local-server/src/appFactory.test.ts`
- `apps/local-server/src/jobRoutes.ts`
- `apps/local-server/src/runtimeRoutes.ts`

**Problem**

`createStudioApp` ya tiene test surface directo para wiring base (codex/projects/catalog), pero faltan casos de composición no feliz (errores de adapters, wiring de worker/dependencias en rutas críticas). El seam es deep, pero con verificación parcial.

Deletion test: si se elimina `createStudioApp`, reaparece wiring de runtime en muchos lugares.

**Solution**

Expandir tests de composición con adapters fake y fallas controladas: rutas montadas, dependencia inyectada en rutas críticas y propagación de error modes esperados por seam.

**Benefits**

- locality: regresiones de wiring se detectan en un módulo.
- leverage: cambios en rutas/dependencias se validan sin levantar runtime completo.
- tests: cobertura de seam crítico también en error modes.

**Before / After**

- Before: seam de composición con pruebas base pero sin cubrir suficientes caminos no felices.
- After: seam de composición con verificación explícita de wiring y fallas.

**Dependencies / sequencing**

- Puede avanzar en paralelo con recomendaciones 4 y 5.
- Alineado con ADR-0014.

**Documentation follow-ups**

- `docs/ARCHITECTURE.md` (backend composition seam).
- `docs/adr/0014-backend-dependency-injection-seams.md` (actualizar progreso/estado).

### 7. Deepen el módulo Studio Overlay Controller para reducir traducción de interface dominio→UI

**Recommendation strength**: Worth exploring

**Files**

- `hooks/useStudioOverlayController.ts`
- `components/overlays/types.ts`
- `hooks/useStudioShell.ts`

**Problem**

`buildStudioShellOverlayController()` traduce dominios (`settingsDomain`, `providerDomain`, `outputSourcesDomain`, runtime/onboarding) hacia una interface plana extensa de `systemOverlays`. Ese adapter es mecánicamente grande y tiende a bajo **depth**.

Deletion test: si se elimina esa traducción, la complejidad reaparece en `useStudioShell.ts` o callers de overlays.

**Solution**

Profundizar el seam de overlays para alinear mejor la interface de `systemOverlays` con dominios operativos y reducir mapeo manual repetitivo.

**Benefits**

- locality: cambios de overlays de sistema sin tocar mapeos cruzados en shell.
- leverage: interface más corta para overlays con menos ruido de wiring.
- tests: seam más fácil de probar por dominio.

**Before / After**

- Before: adapter extenso que aplana múltiples dominios en una sola estructura.
- After: adapter más deep con menos traducción mecánica.

**Dependencies / sequencing**

- Después de recomendación 1.
- Conviene después de recomendación 3 para evitar doble migración de settings.

**Documentation follow-ups**

- `docs/ARCHITECTURE.md` (sección overlays/shell).
- `docs/architecture/DEEPENING-ROADMAP.md` (ítem de overlay policy seam).

## Suggested execution order

1. **Recomendación 1** — reduce ancho de interface del `Studio Shell` y baja churn global.
2. **Recomendación 2** — estabiliza invariantes de workspace detrás de un seam único.
3. **Recomendación 3** — elimina compatibilidad plana de `Studio Settings`.
4. **Recomendación 7** — alinea overlays con dominios para recortar traducción plana extensa.
5. **Recomendación 4** — consolida policy de `Command Center` y su test surface.
6. **Recomendación 6** — amplía verificación del seam de composición backend en error modes.
7. **Recomendación 5** — profundiza refresh policy de sync una vez establecida la proyección/shell.

## Documentation fan-out

- `CONTEXT.md`: no requiere términos nuevos por ahora.
- `docs/adr/0014-backend-dependency-injection-seams.md`: actualizar progreso; evaluar cambio de `Proposed` a `Accepted` al cerrar verificación de composición.
- `docs/ARCHITECTURE.md`: actualizar secciones `Studio Shell`, `Command Center`, `Studio Settings`, `Local Studio Sync`, overlays de sistema y composición backend.
- `docs/architecture/DEEPENING-ROADMAP.md`: actualizar ítems, dependencias y estado por recomendación aceptada.
- `docs/TECHNICAL_DEBT.md`: alinear prioridad y criterios de salida con este batch.