# ADR 0010: Decompose God-Object Contexts — Action Creators en Lugar de Raw Dispatch Setters

## Estado

Propuesto.

## Contexto

`GlobalContext` expone **7 `React.Dispatch<SetStateAction<...>>`** setters sin procesar a todos los consumidores del contexto:

```ts
// GlobalContext.tsx — miembros expuestos
setWorkspaces: React.Dispatch<SetStateAction<Workspace[]>>
setActiveWorkspaceId: React.Dispatch<SetStateAction<string>>
setBatches: React.Dispatch<SetStateAction<GenerationBatch[]>>
setTrash: React.Dispatch<SetStateAction<GenerationBatch[]>>
setIsBackgroundEnabled: React.Dispatch<SetStateAction<boolean>>
setBgConfig: React.Dispatch<SetStateAction<BackgroundConfig>>
```

Esto significa que **cualquier componente en cualquier parte del árbol puede mutar `batches` o `trash` directamente**, sin guardrails, validación, o manejo de side effects. El callback `restoreFromTrash` es un hack que llama `setBatches` *dentro* del updater de `setTrash` — un patrón que funciona accidentalmente pero es frágil:

```ts
const restoreFromTrash = useCallback((batchId: string) => {
  setTrash(prev => prev.filter(b => b.id !== batchId))
  setBatches(prev => {
    const restored = trash.find(b => b.id === batchId)
    return restored ? [restored, ...prev] : prev
  })
}, [trash, setBatches, setTrash])
```

`GenerationContext` hace **spread de 3 hooks** en un solo objeto de 25 miembros:

```ts
const pipelineHook = useGenerationPipeline({ ... })
const configHook = useGenerationConfig({ ... })
const modalHook = useModalManager({ ... })

const value = { ...configHook, ...pipelineHook, ...modalHook, /* + 4 local states */ }
```

Esto crea un contrato implícito y frágil: si dos hooks agregan una propiedad con el mismo nombre, una sobreescribe a la otra silenciosamente sin warning. Cualquier cambio de estado en cualquiera de los 3 hooks re-renderiza a todos los consumidores del contexto, sin importar qué propiedad usan.

### Deletion test

Si borramos los raw dispatch setters y los reemplazamos con action creators:
- La complejidad de coordinar transiciones multi-estado (restaurar de trash actualiza batches y trash simultáneamente) se concentra en un reducer.
- Los callers ganan una interfaz semántica (`addBatch(batch)` en vez de `setBatches(prev => [...prev, batch])`).
- Las reglas de negocio (deduplicación al agregar batches, límite de logs en 500 entradas) se aplican en un solo lugar.

## Decisión

### GlobalContext: `useReducer` en lugar de múltiples `useState`

Reemplazar los 7 `useState` con un `useReducer` que maneje un `GlobalState` unificado. Exponer solo **action creators** tipados:

```ts
type GlobalAction =
  | { type: 'ADD_BATCH'; batch: GenerationBatch }
  | { type: 'TRASH_BATCH'; batchId: string }
  | { type: 'RESTORE_FROM_TRASH'; batchId: string }
  | { type: 'RESTORE_ALL_FROM_TRASH' }
  | { type: 'CREATE_WORKSPACE'; workspace: Workspace }
  | { type: 'DELETE_WORKSPACE'; id: string }
  | { type: 'RENAME_WORKSPACE'; id: string; name: string }
  | { type: 'ADD_LOG'; entry: LogEntry }
  | { type: 'SET_BG_CONFIG'; config: BackgroundConfig }
  // ...

interface GlobalContextType {
  // State (read-only)
  logs: LogEntry[]
  workspaces: Workspace[]
  activeWorkspaceId: string
  batches: GenerationBatch[]
  trash: GenerationBatch[]
  // ...
  
  // Actions (lo único que muta)
  addBatch: (batch: GenerationBatch) => void
  trashBatch: (batchId: string) => void
  restoreFromTrash: (batchId: string) => void
  restoreAllFromTrash: () => void
  createWorkspace: (workspace: Workspace) => void
  deleteWorkspace: (id: string) => void
  renameWorkspace: (id: string, name: string) => void
  addLog: (entry: LogEntry) => void
  setBgConfig: (config: BackgroundConfig) => void
  // ...
}
```

El reducer maneja toda la lógica de transición, incluyendo:
- **Deduplicación**: `ADD_BATCH` verifica que no exista un batch con el mismo `batch_id` en batches ni en trash.
- **Transiciones multi-estado**: `RESTORE_FROM_TRASH` remueve de trash y agrega a batches en una sola acción atómica.
- **Límite de logs**: `ADD_LOG` mantiene el cap de 500 entradas.
- **Validación**: workspace default no puede ser eliminado.

### GenerationContext: Named sub-objects en lugar de spread

En lugar de hacer spread de hooks:

```ts
// ANTES: 25 miembros planos, contrato implícito
const value = { ...configHook, ...pipelineHook, ...modalHook, activeRecipe, ... }
```

Agrupar en sub-objetos con nombre:

```ts
// DESPUÉS: 4 sub-objetos, contrato explícito
const value = {
  config: { generationConfig, setGenerationConfig, updateGenerationConfig, ... },
  pipeline: { executeGeneration, isGenerating, activeGenerationConfig, ... },
  modal: { modalImage, isModalOpen, openModal, closeModal, ... },
  recipe: { activeRecipe, setActiveRecipe },
}
```

Los consumidores scoped su re-render al sub-objeto que necesitan:

```ts
const { config } = useGeneration()
// Solo re-renderiza cuando config.generationConfig cambia,
// no cuando pipeline.isGenerating cambia.
```

Esto requiere `useMemo` en el provider para estabilizar cada sub-objeto:

```ts
const configValue = useMemo(() => ({ generationConfig, setGenerationConfig, ... }), [generationConfig])
const pipelineValue = useMemo(() => ({ executeGeneration, isGenerating, ... }), [isGenerating, executeGeneration])
```

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `contexts/GlobalContext.tsx` | `useState` → `useReducer`, exponer action creators, eliminar raw setters |
| `contexts/GenerationContext.tsx` | Spread → 4 sub-objetos con `useMemo` |
| `components/AppContent.tsx` | Adaptar consumo de setters → action creators |
| `components/Toolbar.tsx` | `useGlobal().addToast` ya viene por props; sin cambios |
| Todos los consumidores de `useGlobal()` | Reemplazar `setBatches(...)` por `addBatch(...)`, etc. |

## Consecuencias

### Positivas

- **Locality**: Toda la lógica de transición de estado global vive en un reducer. Un bug en `restoreFromTrash` se diagnostica y arregla en un solo lugar.
- **Leverage**: Los callers usan `addBatch(batch)` — obtienen deduplicación, validación y persistencia sin saber que existen. La interfaz es una acción, la implementación es múltiples validaciones y transiciones.
- **Testability**: El reducer es una función pura `(state, action) => state` — 100% testeable sin React, sin IndexedDB, sin context providers. Los action creators son funciones que devuelven objetos de acción — también puras.
- **AI-navegabilidad**: Entender "cómo se agrega un batch" es leer el caso `ADD_BATCH` en el reducer. Hoy hay que rastrear `setBatches` a través de 5+ archivos.
- **Safety**: Ningún componente puede mutar `batches` sin pasar por el reducer. Las reglas de negocio se aplican consistentemente.

### Negativas

- **Diff grande**: Todos los consumidores de `useGlobal()` necesitan actualizarse de `setX(...)` a `actionX(...)`.
- **Curva de aprendizaje**: `useReducer` es menos familiar que `useState` para devs nuevos en React.
- **Memoization overhead**: Los 4 sub-objetos de `GenerationContext` requieren `useMemo` correcto para evitar re-renders innecesarios. Un `useMemo` mal configurado puede empeorar el rendimiento.

### Riesgo

**Medio**. El refactor es mecánico (renombrar setters → actions) pero toca muchos archivos. El reducer debe preservar exactamente el comportamiento actual de los 7 `useState` dispersos. Se recomienda implementar con tests del reducer primero, luego migrar consumidores archivo por archivo.
