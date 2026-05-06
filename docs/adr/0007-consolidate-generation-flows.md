# ADR 0007: Consolidate Generation Flows

## Estado

Propuesto.

## Contexto

La arquitectura documentada en `CONTEXT.md` establece:

> *"The generation pipeline should not know Persistent Job creation, polling, Local Asset filtering or thumbnail creation outside the Local Generation Run module."*

Sin embargo, `components/AppContent.tsx` (líneas 417-476, función `handleExecuteEdit`) implementa un pipeline de generación completo inline para el flujo de edición de imágenes:

```ts
// AppContent.tsx líneas 417-476 (resumido)
const handleExecuteEdit = async (editPrompt, editImageSrc, hotspotCoords, size) => {
  const projects = await listProjects()
  const job = await createStudioJob({ kind: 'codex_imagegen', prompt, references: [...] })
  const result = await waitForStudioJob(job.id)
  const assets = await listStudioAssets()
  const matching = assets.filter(a => a.jobId === job.id)
  // construye GenerationBatch manualmente, genera thumbnails...
}
```

Esto duplica la lógica de `services/localGenerationRun.ts`:
- `runSingleCodexImagegenJob` ya hace: `listProjects()` → `createStudioJob()` → `waitForStudioJob()` → `listStudioAssets()` (filtrado por jobId) → `createThumbnail()` → retorna `GeneratedImage[]`.
- `runLocalGeneration` ya hace: loop de `batchCount` → construye `GenerationBatch`.

Dos **implementaciones** del mismo concepto. Una respeta la arquitectura documentada; la otra (en `AppContent`) la viola, importando directamente `createStudioJob`, `listProjects`, `listStudioAssets`, `waitForStudioJob`, `toStudioAssetUrl`.

**Deletion test**: si borramos `handleExecuteEdit`, la funcionalidad de editar imágenes desaparece — pero toda la complejidad de generación que duplica ya existe en `localGenerationRun.ts`. La complejidad no se concentraría, solo se eliminaría código redundante.

## Decisión

Extender la interfaz de `runSingleCodexImagegenJob` para soportar generación con una imagen de entrada (edición/remix):

```ts
interface CodexImagegenJobOptions {
  config: ImageGenerationConfig
  workspaceId: string
  inputImage?: {
    src: string        // URL o dataUrl de la imagen a editar
    prompt?: string    // instrucción de edición (opcional, se combina con config.prompt)
  }
  signal?: AbortSignal
  onProgress?: ProgressCallback
}

function runSingleCodexImagegenJob(opts: CodexImagegenJobOptions): Promise<GeneratedImage[]>
```

Cuando `inputImage` está presente, el módulo:
1. Convierte `inputImage.src` a un dataUrl (si es URL de library, fetchea la imagen).
2. Crea una referencia con la imagen de entrada (usa el Reference Manager de ADR 0003).
3. Construye el prompt combinando `inputImage.prompt` (instrucción de edición) con `config.prompt`.
4. El resto del pipeline es idéntico: crear job, esperar (vía SSE en el futuro), importar assets, crear thumbnails.

`AppContent.handleExecuteEdit` se reduce a:

```ts
const handleExecuteEdit = async (editPrompt, editImageSrc, hotspotCoords, size) => {
  setBatches(prev => [...prev, placeholderBatch])
  await runLocalGeneration({
    config: { ...currentConfig, prompt: combinePrompt(currentConfig.prompt, editPrompt) },
    workspaceId: activeWorkspaceId,
    inputImage: { src: editImageSrc, prompt: editPrompt },
    onProgress: updatePlaceholderBatch
  })
}
```

### Diferencias con el flujo de generación normal

| Aspecto | Generación normal | Edición |
|---------|-------------------|---------|
| Prompt | `config.prompt` + recipe + sizing | `editPrompt` + `config.prompt` + sizing |
| Referencias | `config.attachments` | `config.attachments` + `inputImage.src` como referencia |
| batchCount | `config.batchCount` | Siempre 1 (override) |
| Placeholder | Muestra un placeholder por batch | Muestra el placeholder inmediatamente |

La función `runLocalGeneration` ya recibe `config` con `batchCount`; para ediciones el caller pasa `batchCount: 1` en el config.

## Cambios archivo por archivo

### Editar

- **`services/localGenerationRun.ts`**:
  - `runSingleCodexImagegenJob` acepta `inputImage?: { src, prompt }`.
  - Si `inputImage.src` es una URL de library, la fetchea y convierte a dataUrl.
  - Si hay `inputImage`, lo agrega como referencia usando `processReferences` (ADR 0003).
  - Si hay `inputImage.prompt`, lo combina con `config.prompt` (instrucción de edición como prefijo).
  
- **`components/AppContent.tsx`**:
  - `handleExecuteEdit` (líneas 417-476) se reemplaza con una llamada a `runLocalGeneration`.
  - Se eliminan los imports directos de `createStudioJob`, `listProjects`, `listStudioAssets`, `waitForStudioJob`, `toStudioAssetUrl` desde `AppContent.tsx`.
  - `handleExecuteEdit` ahora maneja el placeholder batch y llama al pipeline unificado.

### Sin cambios

- `hooks/useGenerationPipeline.ts` — ya llama a `runLocalGeneration`, no necesita cambios.
- `components/ImageEditorModal.tsx` — sigue llamando a `handleExecuteEdit` con los mismos parámetros.

## Consecuencias

### Positivas

- **Locality**: Solo hay un lugar donde se define cómo se crea un Persistent Job, se espera su completion, se importan Local Assets y se crean thumbnails. Ese lugar es `localGenerationRun.ts`.
- **Leverage**: Agregar un tercer tipo de generación (ej. "variación" a partir de una imagen existente) es agregar un parámetro a la misma función, no duplicar el pipeline.
- **ADR compliance**: Se cumple la decisión arquitectónica documentada en `CONTEXT.md`.
- **AppContent se achica**: ~60 líneas eliminadas del god component de 931 líneas.
- **Tests**: El flujo de edición se puede testear a través de la misma interfaz de `runSingleCodexImagegenJob`, sin montar componentes React.

### Negativas

- `localGenerationRun.ts` gana ~30 líneas para manejar el caso `inputImage`. El módulo sigue siendo enfocado (orquestación de generación).
- La conversión de URL de library a dataUrl requiere un `fetch` dentro del pipeline. Esto es un efecto secundario que podría extraerse a su propio módulo si crece.

## Tests

```ts
// Edición con inputImage
const result = await runSingleCodexImagegenJob({
  config: { ...defaultConfig, prompt: 'add a hat', batchCount: 1 },
  workspaceId: 'ws-1',
  inputImage: { src: 'data:image/png;base64,...', prompt: 'add a hat to this cat' }
})
assert(result.length === 1)
assert(result[0].src)  // tiene imagen generada

// Edición con URL de library (debe fetchear)
mockFetch('/library/assets/img.png', pngBuffer)
const result = await runSingleCodexImagegenJob({
  config: { ...defaultConfig, prompt: 'remove background' },
  workspaceId: 'ws-1',
  inputImage: { src: 'http://localhost:4317/library/assets/img.png' }
})
// Verifica que se creó referencia con la imagen fetcheada
```

## Riesgos

- **Bajo**. El pipeline de generación ya existe y funciona. Es agregar un branch condicional al inicio (si hay `inputImage` → crear referencia extra).
- Depende de ADR 0003 (Reference Manager) para el manejo de la imagen de entrada como referencia.
- Se beneficia de ADR 0006 (SSE Job Watcher) para eliminar el polling de `waitForStudioJob`, pero no es blocker — la migración a SSE puede ser posterior.
