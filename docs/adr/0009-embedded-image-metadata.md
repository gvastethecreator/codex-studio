# ADR 0009: Embedded Image Metadata

## Estado

Propuesto.

## Contexto

Las imágenes generadas son archivos planos en disco (`assets/{jobId}-{index}.{ext}`). Toda la metadata de generación (prompt original, prompt expandido, aspect ratio, config, fecha, modelo, recipe) vive exclusivamente en SQLite (`catalog_images`, `jobs`). Si una imagen sale de la biblioteca — se comparte, se mueve a otra carpeta, se sube a redes sociales — toda esa metadata se pierde. La imagen se vuelve opaca: no hay forma de saber con qué prompt se generó, qué config se usó, o cuándo.

El estándar de la industria (Stable Diffusion WebUI, ComfyUI, Midjourney via PNG chunks) ya embebe el prompt y parámetros en los metadatos de la imagen. Hacer lo mismo cierra la brecha y hace las imágenes auto-documentadas.

## Decisión

Crear un módulo `metadataEmbedder.ts` que escriba metadata en las imágenes generadas en el momento de guardarlas a disco. La metadata se incrusta usando los mecanismos nativos de cada formato:

### Formatos y mecanismos

| Formato | Mecanismo | Estándar |
|---------|-----------|----------|
| PNG | chunk `tEXt` / `iTXt` | PNG spec, compatible con SD WebUI |
| JPEG | EXIF `UserComment` + XMP | EXIF 2.3, ISO 16684-1 (XMP) |
| WebP | EXIF + XMP | WebP spec (hereda de RIFF) |

### Schema de metadata

La metadata se guarda en dos representaciones paralelas dentro del mismo archivo:

**1. `tEXt` chunk / EXIF `UserComment` — string plano (legible por humanos)**

```
codex_imagegen_params: {
  "prompt": "a cat wearing a wizard hat, digital art",
  "negative_prompt": "blurry, low quality",
  "aspect_ratio": "1:1",
  "image_size": "1024x1024",
  "model": "codex-imagegen",
  "recipe": null,
  "batch_id": "1712345678-abc123",
  "generated_at": "2026-05-06T14:30:00.000Z",
  "studio_version": "1.0.0"
}
```

- Clave: `codex_imagegen_params` (namespaced, no colisiona con otros tools).
- Valor: JSON string en una sola línea.
- Compatible con lectores que parsean SD WebUI / ComfyUI metadata (muchos viewers ya lo hacen).

**2. XMP packet — structured (machine-readable, namespaced)**

```xml
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
           xmlns:codex="http://codex.studio/ns/imagegen/1.0/">
    <rdf:Description>
      <codex:prompt>a cat wearing a wizard hat, digital art</codex:prompt>
      <codex:negativePrompt>blurry, low quality</codex:negativePrompt>
      <codex:aspectRatio>1:1</codex:aspectRatio>
      <codex:imageSize>1024x1024</codex:imageSize>
      <codex:model>codex-imagegen</codex:model>
      <codex:recipe/>
      <codex:batchId>1712345678-abc123</codex:batchId>
      <codex:generatedAt>2026-05-06T14:30:00.000Z</codex:generatedAt>
      <codex:studioVersion>1.0.0</codex:studioVersion>
      <codex:libraryId>lib-default</codex:libraryId>
      <codex:catalogId>cat-img-001</codex:catalogId>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
```

XMP es el estándar ISO para metadata en imágenes. Namespace `http://codex.studio/ns/imagegen/1.0/` es único y versionado.

### Módulo: Metadata Embedder

```ts
// apps/local-server/src/metadataEmbedder.ts

interface ImageGenMetadata {
  prompt: string
  negativePrompt?: string
  aspectRatio: string
  imageSize?: string
  model: string
  recipe?: string | null
  batchId: string
  generatedAt: string       // ISO 8601
  studioVersion: string
  libraryId?: string
  catalogId?: string
}

interface EmbedResult {
  filePath: string
  bytesWritten: number
  format: 'png' | 'jpeg' | 'webp'
}

// Interfaz principal
function embedMetadata(
  filePath: string,         // ruta absoluta al archivo de imagen
  metadata: ImageGenMetadata
): Promise<EmbedResult>

// Lectura (para importar/restaurar metadata de vuelta al catálogo)
function extractMetadata(
  filePath: string
): Promise<ImageGenMetadata | null>

// Bulk: embeber en todos los assets de un job
function embedJobAssets(
  jobId: string,
  metadata: ImageGenMetadata,
  libraryDir: string
): Promise<EmbedResult[]>
```

### Implementación interna

- **PNG**: Lee el archivo existente, parsea chunks PNG, inserta chunk `tEXt` con key `codex_imagegen_params` + chunk `iTXt` con XMP packet. Re-escribe el archivo. No re-comprime la imagen (solo manipula chunks).
- **JPEG**: Inserta EXIF IFD `UserComment` con el JSON string. Inserta XMP en APP1 marker. Usa `piexifjs` o manipulación binaria directa de marcadores JPEG.
- **WebP**: Inserta EXIF + XMP en chunks RIFF. WebP soporta los mismos metadatos que JPEG.

### Cuándo se embebe

1. **En generación** (worker.ts, después de `addAsset()`): El worker tiene todos los datos necesarios (prompt, config, aspect ratio). Llama a `embedMetadata(assetPath, metadata)` inmediatamente después de guardar el asset.
2. **En export** (si el usuario hace "exportar imagen" con metadata): El exportador puede regenerar la metadata desde el catálogo y re-embeberla.
3. **En migración retroactiva** (script): Para imágenes existentes que no tienen metadata, un script lee `catalog_images` y re-escribe los archivos con metadata.

### Flujo en el worker

```
worker processJob()
  │
  ├─► runCodexImagegenJob() → image saved to assets/{jobId}-0.png
  ├─► addAsset(jobId, filePath, dimensions, ...)
  ├─► catalog.registerImage(...)
  │
  └─► embedMetadata(filePath, {
        prompt: job.originalPrompt,
        negativePrompt: config.negativePrompt,
        aspectRatio: config.aspectRatio,
        imageSize: config.imageSize,
        model: config.model,
        recipe: config.recipeContext,
        batchId: batchId,
        generatedAt: new Date().toISOString(),
        studioVersion: APP_VERSION,
        libraryId: libraryId,
        catalogId: catalogImage.id
      })
```

## Cambios archivo por archivo

### Crear

- **`apps/local-server/src/metadataEmbedder.ts`** (~150 líneas) — `embedMetadata()`, `extractMetadata()`, `embedJobAssets()`. Manipulación binaria de chunks PNG, marcadores JPEG/WebP.

### Editar

- **`apps/local-server/src/worker.ts`** — Después de `addAsset()` + `catalog.registerImage()`, llamar a `embedMetadata()`.
- **`apps/local-server/src/index.ts`** — Endpoint `POST /api/catalog/:id/embed` para re-embeber metadata a demanda.
- **`apps/local-server/src/init.ts`** o `constants.ts` — Agregar `APP_VERSION` constante para `studioVersion`.

### Crear script de migración

- **`scripts/embed-metadata-bulk.ts`** — Lee `catalog_images`, para cada imagen sin metadata embebida (verifica existencia de chunk/key), extrae metadata del catálogo, re-escribe archivo con metadata.

## Consecuencias

### Positivas

- **Portabilidad**: Las imágenes llevan su propia "partida de nacimiento". Compartir una imagen es compartir el prompt, la config, y la fecha. El receptor puede ver cómo se generó.
- **Compatibilidad**: PNG chunks `tEXt` con JSON es el mismo formato que SD WebUI y ComfyUI. Herramientas como PNG Info de Automatic1111 pueden leerlo.
- **Import reverso**: Si una imagen con metadata vuelve a la biblioteca, `extractMetadata()` puede restaurarla al catálogo sin intervención del usuario.
- **Auto-documentación**: Las imágenes en el explorador de archivos muestran metadata en Properties → Details (EXIF UserComment).
- **Locality**: Toda la lógica de embed/extract vive en `metadataEmbedder.ts`. Cambiar el schema de metadata no toca el worker ni el catálogo.

### Negativas

- Re-escribir el archivo de imagen para embeber metadata agrega ~300-500 bytes por archivo más un paso de I/O adicional por generación.
- La manipulación binaria de chunks PNG/marcadores JPEG es delicada — requiere tests con fixtures de imágenes reales.
- Si el archivo se edita con software que no preserva metadatos (ej. algunos resizers online), la metadata se pierde.

## Tests

```ts
// PNG: embed y extract round-trip
const tmpFile = path.join(tmpDir, 'test.png')
await Bun.write(tmpFile, pngFixture)  // PNG de 1x1 pixel
await embedMetadata(tmpFile, {
  prompt: 'a test cat',
  aspectRatio: '1:1',
  model: 'codex-imagegen',
  batchId: 'b1',
  generatedAt: '2026-05-06T14:30:00.000Z',
  studioVersion: '1.0.0'
})
const extracted = await extractMetadata(tmpFile)
assert(extracted.prompt === 'a test cat')
assert(extracted.aspectRatio === '1:1')
assert(extracted.studioVersion === '1.0.0')

// PNG: no rompe la imagen al embeber
const original = await Bun.file(pngFixture).arrayBuffer()
await embedMetadata(tmpFile, sampleMetadata)
const modified = await Bun.file(tmpFile).arrayBuffer()
// Los pixels deben ser idénticos (solo se agregaron chunks de metadata)
assert(pixelDataEqual(original, modified))

// JPEG: embed y extract
await embedMetadata(jpegFile, sampleMetadata)
const meta = await extractMetadata(jpegFile)
assert(meta.model === 'codex-imagegen')

// extractMetadata en imagen sin metadata → null
const plain = await extractMetadata(pngWithoutMetadata)
assert(plain === null)

// extractMetadata en archivo corrupto → null (no lanza)
const corrupt = await extractMetadata(path.join(tmpDir, 'not-an-image.bin'))
assert(corrupt === null)
```

## Orden de ejecución

Este plan es independiente y puede ejecutarse en cualquier momento. Dependencias:
- **ADR 0002** (Callable App Factory) — facilita testear porque se puede inyectar un `libraryDir` temporal.
- **ADR 0005** (Split Codex Client) — el Asset Extractor es donde se guardan las imágenes; si ya está extraído, el embed ocurre en el módulo correcto.
- **ADR 0008** (Image Catalog) — el catálogo provee la metadata para la migración retroactiva. Pero no es blocker: el worker ya tiene los datos necesarios en el momento de generación.

Se recomienda ejecutar después de 0002 y 0005, y en paralelo con 0008.

## Riesgos

- **Bajo**. Es un módulo autocontenido que no altera comportamiento existente — solo agrega un paso de post-procesamiento a los archivos de imagen.
- El riesgo principal es la manipulación binaria de formatos de imagen. Se mitiga con tests de round-trip y fixtures de imágenes reales generadas por Codex.
- Si el embed falla, la imagen ya está guardada en disco y registrada en el catálogo — el worker no debe fallar la generación por un error de metadata. El embed debe ser fire-and-forget con log de warning en caso de error.
