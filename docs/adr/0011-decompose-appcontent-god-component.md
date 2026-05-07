# ADR 0011: Decompose AppContent God Component — Separar Router de Orchestrator

## Estado

Propuesto.

## Contexto

`AppContent.tsx` tiene **919 líneas** y mezcla **14 concerns** distintos. Es el componente más grande del proyecto y el punto de fricción #1 para AI-navegabilidad: entender "cómo funciona la vista de estudio" requiere leer 919 líneas de código.

Destructura **38 propiedades** de dos contextos (`useGlobal` 18 + `useGeneration` 20) y consume **6 hooks custom**. Contiene un router manual de 60 líneas basado en `hashchange` que parsea fragmentos de hash (`#recipes`, `#recipe-{id}`, `#editor`, `#modal`) y orquesta view transitions.

### Violaciones directas de CONTEXT.md

1. **Pipeline de generación inline para edición** (línea ~420): `AppContent` importa `runLocalGeneration` directamente de `services/localGenerationRun` para ejecutar ediciones de imagen. Esto viola: _"The generation pipeline should not know Persistent Job creation, polling, Local Asset filtering or thumbnail creation outside the Local Generation Run module."_ — este es el mismo problema que ADR 0007 pero con otra feature.

2. **Deep scan de IndexedDB** (línea ~514): `AppContent` importa `getAllEntries` desde `utils/idb` y escanea IndexedDB directamente para recuperar batches huérfanos. Esto viola: _"The React app should not know backend polling or Local Asset import mechanics outside the Local Studio Sync module."_

3. **Deep scan de localStorage** (línea ~534): `AppContent` escanea `localStorage` directamente para recuperar batches del vault.

### Concerns mezclados (14)

| Concern | Líneas aprox. | Debería estar en |
|---------|--------------|------------------|
| Hash-based routing | ~60 | `useHashRouter` hook |
| Workspace CRUD | ~80 | `useWorkspaceManager` hook o `WorkspacePage` |
| View navigation | ~40 | Router + page components |
| Generation trigger | ~30 | `Toolbar` via callback |
| Image editing orchestration | ~60 | `useGenerationPipeline` (ADR 0007) |
| File import/export | ~100 | `useFileTransfer` hook |
| Deep Scan recovery | ~80 | `useLocalStudioSync` |
| Trash modal state | ~15 | Local state en `TrashModal` parent |
| Limit modal state | ~15 | `useModalManager` |
| Onboarding modal orchestration | ~20 | `useStudioOnboarding` |
| Dashboard modal orchestration | ~15 | Local state |
| Background toggle | ~10 | `HeaderToolbar` via callback |
| Drop/paste handlers | ~40 | `DropZoneOverlay` + `Toolbar` |
| Glue code | ~350 | Desaparece al decomponer |

### Deletion test

Si borramos `AppContent` y lo reemplazamos con un router + page components:
- La complejidad de hash-routing reaparecería en un hook `useHashRouter` — locality ganada.
- La complejidad de workspace CRUD reaparecería en `WorkspacePage` o `HeaderToolbar` — ya estaba ahí, solo que dispersa.
- La complejidad de deep scan recovery reaparecería en `useLocalStudioSync` — donde CONTEXT.md dice que debe estar.
- El glue code (coordinación entre concerns) desaparece porque cada page component solo se preocupa de su view.

## Decisión

### Fase 1: Extraer `useHashRouter`

Hook con interfaz:

```ts
function useHashRouter(): {
  currentView: 'studio' | 'recipes' | 'recipe'
  activeRecipeId: string | null
  navigateTo: (view: string, params?: Record<string, string>) => void
}
```

Internamente maneja `hashchange` listener, parseo de fragmentos, y view transitions. Expone una interfaz declarativa que los page components consumen sin saber que la URL usa hash fragments.

### Fase 2: Crear page components

| Page Component | Props | Responsabilidad |
|----------------|-------|-----------------|
| `StudioPage` | `batches, trash, isGenerating, ...` (10 props) | Grid + toolbar + queue + carousel |
| `RecipesPage` | `onSelectRecipe` | Galería de recetas |
| `RecipePage` | `activeRecipe, generationConfig, onGenerate, ...` (8 props) | RecipeRouter + toolbar |

`AppContent` se reduce a:

```tsx
function AppContent() {
  const { currentView, activeRecipeId, navigateTo } = useHashRouter()
  
  return (
    <div className="app-shell">
      <HeaderToolbar currentView={currentView} onViewChange={navigateTo} ... />
      {currentView === 'studio' && <StudioPage />}
      {currentView === 'recipes' && <RecipesPage onSelectRecipe={id => navigateTo('recipe', { id })} />}
      {currentView === 'recipe' && <RecipePage activeRecipeId={activeRecipeId} />}
    </div>
  )
}
```

### Fase 3: Migrar deep scan recovery a `useLocalStudioSync`

El código de deep scan (~80 líneas) se mueve a `useLocalStudioSync` como un método `recoverOrphanedBatches()`. Se ejecuta en el `useEffect` de montaje del hook, donde ya existe lógica de inicialización. `AppContent` no necesita saber que existe.

### Fase 4: Delegar edición de imagen a `useGenerationPipeline`

Extender `useGenerationPipeline` con `executeEdit(image, maskDataUrl, editPrompt)` que internamente llama a `runLocalGeneration` con `inputImage`. `AppContent` solo pasa el callback a `ImageEditorModal`.

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `hooks/useHashRouter.ts` | Nuevo — router basado en hash |
| `components/StudioPage.tsx` | Nuevo — página principal de studio |
| `components/RecipesPage.tsx` | Ya existe, adaptar props |
| `components/RecipePage.tsx` | Nuevo — wrapper de RecipeRouter con toolbar |
| `components/AppContent.tsx` | Reducción de 919 → ~100 líneas |
| `hooks/useLocalStudioSync.ts` | Agregar `recoverOrphanedBatches` |
| `hooks/useGenerationPipeline.ts` | Agregar `executeEdit` |

## Consecuencias

### Positivas

- **Locality**: Un bug en navegación de recetas se diagnostica en `useHashRouter`. Un bug en deep scan recovery se diagnostica en `useLocalStudioSync`. Hoy todo está en un solo archivo de 919 líneas.
- **Leverage**: `StudioPage` expone una interfaz de ~10 props y encapsula todo el comportamiento de la vista principal. Un futuro dev que quiera entender la vista de studio lee `StudioPage`, no 919 líneas de glue code.
- **Testability**: `useHashRouter` es un hook con interfaz declarativa — testeable con `renderHook`. `StudioPage` recibe props, no consume contextos directamente — testeable con mock props.
- **CONTEXT.md compliance**: Las tres violaciones actuales (pipeline inline, deep scan de IDB, deep scan de localStorage) desaparecen. El código se mueve a los módulos donde CONTEXT.md dice que debe estar.
- **AI-navegabilidad**: Preguntar "cómo funciona la vista de recetas" ahora es leer `RecipePage.tsx` (~50 líneas) y `RecipeRouter.tsx` (~120 líneas). Hoy es leer `AppContent.tsx` (919 líneas) y buscar la sección relevante.

### Negativas

- **Props drilling temporal**: `StudioPage` necesita ~10 props que hoy obtiene de contextos. Esto es aceptable porque son props que describen la interfaz del page component.
- **Riesgo de regresión en navegación**: El `hashchange` handler actual tiene comportamiento sutil (view transitions, limpieza de estado al navegar). Migrarlo requiere preservar exactamente ese comportamiento.

### Riesgo

**Medio**. La descomposición es mayormente extracción mecánica — mover código de un archivo grande a archivos pequeños. El riesgo principal está en el router (comportamiento sutil de `hashchange` + view transitions) y en el deep scan recovery (lógica de recuperación de batches que es inherentemente frágil).

### Dependencias

- **ADR 0010** (Context decomposition): Los page components se benefician de contextos con interfaces limpias (action creators, sub-objetos con nombre).
- **ADR 0006** (SSE Job Watcher): Ya implementado. `useLocalStudioSync` ya usa SSE.
- **ADR 0007** (Consolidate Generation Flows): Cubre específicamente el pipeline inline de edición. Este ADR amplía el scope a toda la descomposición del componente.

## Relación con ADR 0007

ADR 0007 propone consolidar el pipeline de generación inline de edición moviéndolo a `localGenerationRun.ts`. Este ADR (0011) absorbe ese cambio como parte de la Fase 4. Si ADR 0007 se implementa primero, la Fase 4 de este ADR ya está resuelta. Si no, se implementan juntos.
