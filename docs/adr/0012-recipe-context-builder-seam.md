# ADR 0012: RecipeContextBuilder Seam — Interfaz Compartida para Construcción de Prompts entre Recetas

## Estado

Propuesto.

## Contexto

Cada uno de los 7 módulos de receta construye su propio `recipeContext` string de forma independiente con formatos ad-hoc:

| Receta | Formato de recipeContext | Líneas dedicadas |
|--------|-------------------------|-------------------|
| `StylesRecipe` | `*** STYLE TRANSFER PROTOCOL ***` (directivas en texto) | ~30 |
| `RemasterRecipe` | Prompt en lenguaje natural con parámetros (estilo, lighting, cámara) | ~20 |
| `SpritesheetRecipe` | JSON-schema `{ task_id, layout_constraints, visual_style, ... }` serializado a string | ~25 |
| `CinematicRecipe` | `--- STORYBOARD CONTACT SHEET ---` (directivas en texto) | ~25 |
| `CharacterSheetRecipe` | JSON-schema `{ task_id, sheet_type, design_constraints, ... }` | ~20 |
| `CameraAnglesRecipe` | `--- CAMERA VIEW PROMPT ---` + datos de cámara 3D | ~30 |
| `TimelineRecipe` | JSON-schema `{ task_id, sequence_index, direction, ... }` | ~25 |

Cada receta tiene su propio `useEffect` que ensambla, formatea y limpia el string de contexto. Esto suma **~175 líneas de lógica de construcción de prompts duplicada conceptualmente** (no literalmente, pero sí en propósito).

Si se quiere cambiar el protocolo de prompts (ej. agregar un `task_id` global, cambiar el formato de directivas, o versionar el protocolo), hay que tocar los 7 archivos.

### Deletion test

Si borramos la lógica de construcción de `recipeContext` de cada receta y la reemplazamos con un builder compartido:
- La complejidad de "cómo se serializa un recipeContext" se concentra en un módulo.
- Cada receta solo provee sus parámetros específicos (`{ style: 'anime', strength: 0.8 }` o `{ grid: '4x4', perspective: 'isometric' }`).
- Agregar una nueva receta es implementar un adapter que traduce parámetros de receta a un recipeContext string.

## Decisión

### Interfaz `RecipeContextBuilder`

Definir una interfaz compartida en `lib/recipeContext.ts`:

```ts
interface RecipeContextParams {
  taskId: string
  recipeId: string
  basePrompt: string
  negativePrompt?: string
  // Cada receta extiende con sus parámetros específicos
}

interface RecipeContextBuilder<T extends RecipeContextParams = RecipeContextParams> {
  /** Nombre del protocolo (ej. "codex-recipe-v1") */
  readonly protocol: string
  
  /** Construye el recipeContext string a partir de los parámetros */
  buildContext(params: T): string
  
  /** Extrae parámetros de un recipeContext existente (para re-edición) */
  parseContext?(context: string): T | null
}
```

Cada receta implementa un adapter:

```ts
// stylesContext.ts
const stylesContextBuilder: RecipeContextBuilder<StylesRecipeParams> = {
  protocol: 'codex-recipe-v1',
  buildContext(params) {
    return [
      `*** STYLE TRANSFER PROTOCOL v1 ***`,
      `task_id: ${params.taskId}`,
      `recipe: styles`,
      `style_pack: ${params.stylePack}`,
      `style: ${params.styleName}`,
      `fidelity_level: ${params.fidelity}`,
      `strength: ${params.strength}`,
      `base_prompt: ${params.basePrompt}`,
    ].join('\n')
  },
}
```

### Registro de builders

Un registry central asocia `recipeId` con su builder:

```ts
// lib/recipeContextRegistry.ts
const registry = new Map<string, RecipeContextBuilder>()

export function registerRecipeContext(recipeId: string, builder: RecipeContextBuilder) {
  registry.set(recipeId, builder)
}

export function buildRecipeContext(recipeId: string, params: RecipeContextParams): string {
  const builder = registry.get(recipeId)
  if (!builder) throw new Error(`No context builder registered for recipe: ${recipeId}`)
  return builder.buildContext(params)
}
```

Cada receta registra su builder en un archivo colocado junto a la receta (ej. `components/recipes/styles/stylesContext.ts`), manteniendo locality para los parámetros específicos de cada receta.

### Uso desde el pipeline

`useGenerationPipeline` o `localGenerationRun` obtienen el recipeContext llamando al registry en lugar de leerlo de `generationConfig.recipeContext` (que la receta ya pre-construyó):

```ts
// ANTES: la receta ya puso el string en config
const finalPrompt = `${config.prompt}\n\n${config.recipeContext}`

// DESPUÉS: el pipeline construye el contexto
const recipeContext = buildRecipeContext(recipeId, {
  taskId: generateTaskId(),
  basePrompt: config.prompt,
  ...recipeSpecificParams,
})
const finalPrompt = `${config.prompt}\n\n${recipeContext}`
```

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `lib/recipeContext.ts` | Nuevo — interfaz `RecipeContextBuilder` y `RecipeContextParams` |
| `lib/recipeContextRegistry.ts` | Nuevo — registry de builders |
| `components/recipes/styles/stylesContext.ts` | Nuevo — builder de Styles con sus tipos |
| `components/recipes/remaster/remasterContext.ts` | Nuevo — builder de Remaster |
| `components/recipes/spritesheet/spritesheetContext.ts` | Nuevo — builder de Spritesheet |
| `components/recipes/cinematic/cinematicContext.ts` | Nuevo — builder de Cinematic |
| `components/recipes/characterSheet/characterSheetContext.ts` | Nuevo — builder de Character |
| `components/recipes/cameraAngles/cameraAnglesContext.ts` | Nuevo — builder de Camera |
| `components/recipes/timeline/timelineContext.ts` | Nuevo — builder de Timeline |
| Cada `*Recipe.tsx` | Eliminar `useEffect` de construcción de contexto; pasar params al pipeline |
| `services/localGenerationRun.ts` | Integrar `buildRecipeContext` en el armado del prompt |
| `hooks/useGenerationPipeline.ts` | Pasar recipe params al pipeline en lugar de recipeContext pre-construído |

## Consecuencias

### Positivas

- **Locality**: El formato del protocolo de prompts vive en `lib/recipeContext.ts`. Un cambio de protocolo (ej. agregar `protocol_version: 2`) se hace en un solo lugar y todos los builders lo heredan.
- **Leverage**: Un autor de nueva receta implementa un `RecipeContextBuilder` adapter (~30 líneas). No necesita saber cómo otras recetas formatean sus prompts ni qué convenciones usa el pipeline.
- **Testability**: Cada builder es una función pura `params → string`. 100% testeable sin React, sin DOM, sin mocks. El registry es testeable con builders mock.
- **Re-edición**: El método opcional `parseContext` permite reconstruir los parámetros de una receta desde un recipeContext existente, habilitando "cargar config desde imagen generada".
- **Protocol versioning**: El campo `protocol` permite que el pipeline detecte recipeContexts viejos y aplique migraciones.

### Negativas

- **Indirección**: Las recetas ya no son dueñas de su formato de prompt. Si una receta necesita un formato muy específico que no encaja en el protocolo común, el builder puede ignorar el helper compartido y construir su string manualmente — la interfaz no fuerza un formato.
- **Migración**: Mover la construcción de contexto de `useEffect` en recetas al pipeline requiere coordinar el momento en que se resuelven los parámetros de receta.

### Riesgo

**Bajo**. El cambio es puramente aditivo al principio (los builders se crean sin romper las recetas existentes). La migración puede ser incremental: primero crear los builders, luego hacer que el pipeline los use opcionalmente, finalmente eliminar el `useEffect` de construcción en cada receta.

### Dependencias

- **ADR 0007** (Consolidate Generation Flows): El pipeline unificado de `localGenerationRun` es donde el `RecipeContextBuilder` se integraría naturalmente.
- **ADR 0010** (Context decomposition): Si `GenerationContext` expone `config.recipeParams` en lugar de `config.recipeContext`, la migración es más limpia.
