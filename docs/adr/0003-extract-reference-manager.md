# ADR 0003: Extract Reference Manager

## Estado

Propuesto.

## Contexto

El handler `POST /api/jobs` en `apps/local-server/src/index.ts` (líneas 155-193) define tres funciones inline:

- `safeReferenceName(name, existing)`: sanitiza nombres de archivo, evita path traversal, genera nombres únicos con sufijo numérico.
- `persistJobReferences(jobId, references, libraryDir)`: decodifica dataUrls base64, escribe archivos en `references/{jobId}/`, mapea nombres a paths en disco.
- `buildPromptWithReferences(prompt, refs)`: inyecta referencias en el prompt final con paths de archivo.

Estas funciones manejan filesystem I/O, decodificación base64, sanitización de nombres, y construcción de prompts — todo dentro del contexto de un handler HTTP. Si la lógica de referencias cambia (formato de prompt, estrategia de almacenamiento, reglas de naming), el maintainer debe editar el archivo de rutas HTTP junto con lógica de filesystem y prompts.

**Deletion test**: si borramos estas tres funciones del handler, la complejidad de manejo de referencias desaparece... pero el handler aún necesita manejar referencias. La complejidad debe vivir en otro lado con locality propia.

## Decisión

Crear un módulo `referenceManager.ts` con una única interfaz:

```ts
interface ProcessedReference {
  name: string
  path: string       // ruta absoluta en disco
  strength: number   // 0-1
}

interface ReferenceResult {
  persistedRefs: ProcessedReference[]
  augmentedPrompt: string  // prompt original + inyección de paths de referencia
}

function processReferences(
  jobId: string,
  prompt: string,
  references: { name: string; dataUrl: string; strength: number }[],
  libraryDir: string
): Promise<ReferenceResult>
```

### Comportamiento interno (implementation)

1. Sanitiza cada `name` (sin `..`, sin caracteres inválidos de FS, nombres únicos con sufijo `_n`).
2. Decodifica `dataUrl` base64 → buffer.
3. Escribe a `{libraryDir}/references/{jobId}/{safeName}`.
4. Construye texto de prompt aumentado con los paths de archivo (formato: `Reference image: {path}`).
5. Retorna `{ persistedRefs, augmentedPrompt }`.

### Invariantes

- Ningún `name` contiene `..` ni path separators.
- Los archivos se escriben sincrónicamente o con `Bun.write` antes de retornar.
- Si un `dataUrl` tiene base64 inválido, se rechaza con `ReferenceError { name, reason }`.

### Error modes

- `ReferenceError` por dataUrl inválido → el handler HTTP retorna 400 con detalle de cuál referencia falló.
- Error de filesystem (disco lleno, permisos) → se propaga como error 500.

## Cambios archivo por archivo

### Crear

- **`apps/local-server/src/referenceManager.ts`** (~80 líneas) — Contiene `processReferences()` y las funciones internas `safeReferenceName()`, `decodeDataUrl()`, `buildPromptWithReferences()`. Stateless, recibe `libraryDir` como parámetro.

### Editar

- **`apps/local-server/src/index.ts`** — Líneas 155-193: se reemplazan con una llamada a `processReferences()`. El handler `POST /api/jobs` pasa de ~90 líneas a ~30 líneas.

## Consecuencias

### Positivas

- **Locality**: Todo el conocimiento sobre manejo de referencias (naming, almacenamiento, formato de prompt) vive en un solo archivo. Cambiar el naming scheme no toca rutas HTTP.
- **Leverage**: `processReferences` puede ser llamado por cualquier futuro flujo que necesite adjuntar referencias (recipes que inyectan imágenes de referencia, re-runs con mismas referencias, editor de imágenes).
- **Tests**: Se puede testear con un directorio temporal y dataUrls sintéticos, sin HTTP server, sin SQLite, sin worker. Cuatro escenarios cubren todo: referencia válida única, múltiples referencias, base64 inválido, nombre con path traversal.

### Negativas

- Un archivo más en `apps/local-server/src/`. La ganancia en locality lo justifica.

## Tests

```ts
// Escenario 1: referencia única válida
const result = await processReferences('job-1', 'Generate a cat', [
  { name: 'ref.png', dataUrl: 'data:image/png;base64,iVBOR...', strength: 0.8 }
], tmpDir)
assert(result.persistedRefs.length === 1)
assert(result.augmentedPrompt.includes('Reference image:'))
assert(await Bun.file(result.persistedRefs[0].path).exists())

// Escenario 2: base64 inválido → ReferenceError
await assert.rejects(
  processReferences('job-1', 'prompt', [{ name: 'x.png', dataUrl: 'data:image/png;base64,!!!', strength: 0.5 }], tmpDir),
  { name: 'ReferenceError' }
)

// Escenario 3: nombre con path traversal → sanitizado
const result = await processReferences('job-1', 'p', [
  { name: '../../../etc/passwd', dataUrl: validPng, strength: 1 }
], tmpDir)
assert(!result.persistedRefs[0].path.includes('..'))
```

## Riesgos

- Bajo. Es una extracción pura sin cambio de comportamiento. Las funciones son las mismas, solo se mueven de lugar.
