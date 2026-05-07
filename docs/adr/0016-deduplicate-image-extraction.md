# ADR 0016: Deduplicate Image Extraction Logic — Consolidar Estrategias en assetExtractor.ts

## Estado

Propuesto.

## Contexto

Después de ADR 0005 (Split Codex Client Module), la lógica de extracción de imágenes desde notificaciones de Codex existe en **dos lugares** con implementaciones diferentes:

### `codex/turn.ts` — versión sofisticada (~70 líneas de extracción)

Tiene 5 estrategias de extracción dentro de `runImagegenJob`:

1. **Inline base64 PNG**: regex sobre `data:image/png;base64,...` en el texto de la notificación (con ANSI stripping).
2. **Inline base64 JPEG**: regex sobre `data:image/jpeg;base64,...`.
3. **Inline base64 WebP**: regex sobre `data:image/webp;base64,...`.
4. **Generated image items**: busca `generated_images` en el JSON de la notificación y filtra por timestamp > inicio del turno.
5. **Saved paths from text**: regex para encontrar paths de archivos guardados en el texto de la notificación, excluyendo paths que contengan `_image_id_`.

Features avanzadas que solo existen en `turn.ts`:

- **ANSI stripping**: limpia secuencias de escape antes de aplicar regex.
- **Timestamp filtering**: solo acepta imágenes generadas después de que el turno empezó.
- **_image_id_ exclusion**: ignora imágenes intermedias de Codex.
- **Multi-extraction**: puede extraer múltiples imágenes de una sola notificación (hasta 4 por lote).

### `codex/assetExtractor.ts` — versión simple (~50 líneas)

Tiene 3 estrategias con el factory `createAssetExtractor(jobId)`:

1. **Inline base64**: regex genérico `data:image/...;base64,...` (sin ANSI stripping).
2. **Generated image items**: misma lógica pero sin timestamp filtering.
3. **Saved paths from text**: regex más simple, sin `_image_id_` exclusion.

### Consecuencias de la duplicación

- Si el formato de notificaciones de Codex cambia, hay que actualizar dos archivos.
- `turn.ts` tiene la lógica más robusta pero `assetExtractor.ts` es el módulo designado para extracción (por su propio nombre y segregación de ADR 0005).
- Tests de extracción escritos contra `assetExtractor.ts` no cubren los casos que `turn.ts` maneja (ANSI stripping, timestamps, exclusiones).
- Si `assetExtractor.ts` es el seam oficial para extracción, debería ser el canonical implementation. Hoy no lo es.

### Deletion test

Si eliminamos la lógica de extracción de `turn.ts` y delegamos completamente a `assetExtractor.ts`:

- La complejidad de extracción se concentra en `assetExtractor.ts` (locality).
- `turn.ts` se reduce a orquestación pura (session → RPC → extract → transcript).
- Agregar una nueva estrategia de extracción se hace en un solo lugar.

## Decisión

### Mover todas las estrategias a `assetExtractor.ts`

`assetExtractor.ts` se convierte en el canonical image extractor con 5 estrategias (en orden de prioridad):

```ts
interface ExtractionStrategy {
  name: string;
  extract(notification: unknown, context: ExtractionContext): ExtractedImage[];
}

interface ExtractionContext {
  jobId: string;
  turnStartedAt: Date;
  libraryDir: string;
}

interface ExtractedImage {
  source: 'inline' | 'generated_items' | 'saved_path';
  data?: Buffer; // para inline base64
  filePath?: string; // para generated_items y saved_path
  mimeType?: string;
}

function createAssetExtractor(
  jobId: string,
  deps?: {
    strategies?: ExtractionStrategy[]; // inyectable para tests
  },
): AssetExtractor;
```

Estrategias (en prioridad):

| #   | Estrategia                | Fuente                                           | Features                                 |
| --- | ------------------------- | ------------------------------------------------ | ---------------------------------------- |
| 1   | `InlineBase64Strategy`    | `data:image/...;base64,...` en texto             | ANSI stripping, regex para PNG/JPEG/WebP |
| 2   | `GeneratedItemsStrategy`  | `generated_images` en JSON notificación          | Timestamp filtering (> turn start)       |
| 3   | `SavedPathsStrategy`      | Paths de archivo en texto                        | `_image_id_` exclusion, multi-path regex |
| 4   | `MultiLineBase64Strategy` | Base64 multilinea (fallback)                     | ANSI stripping + re-join lines           |
| 5   | `FilenamePatternStrategy` | Nombres de archivo tipo `image_001.png` en texto | Regex de nombres comunes                 |

### Simplificar `turn.ts`

`runImagegenJob` delega extracción al `AssetExtractor`:

```ts
// ANTES: 70 líneas de lógica de extracción inline en turn.ts
const notifications = await rpcClient.waitForNotification(...)
const extractedImages = []
// ... 5 estrategias de regex y filtrado ...

// DESPUÉS: 3 líneas
const extractor = createAssetExtractor(jobId)
const extractedImages = extractor.extractFromNotifications(notifications, {
  turnStartedAt: turnStartTime,
})
```

### Archivos afectados

| Archivo                        | Cambio                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------- |
| `codex/assetExtractor.ts`      | Expandir de 3 a 5 estrategias; hacerlo el canonical extractor                   |
| `codex/turn.ts`                | Eliminar lógica de extracción inline; delegar a `AssetExtractor`                |
| `codex/assetExtractor.test.ts` | Nuevo — tests para las 5 estrategias (incluyendo ANSI, timestamps, exclusiones) |

### Estrategia de tests

Las estrategias de extracción son funciones puras (reciben texto/JSON, devuelven arrays de paths). Esto las hace ideales para tests table-driven:

```ts
describe('InlineBase64Strategy', () => {
  test('extrae PNG base64 de texto limpio', () => { ... })
  test('extrae PNG base64 con secuencias ANSI', () => { ... })
  test('extrae JPEG base64', () => { ... })
  test('extrae WebP base64', () => { ... })
  test('ignora texto sin base64', () => { ... })
  test('extrae múltiples imágenes de una notificación', () => { ... })
})

describe('GeneratedItemsStrategy', () => {
  test('filtra por timestamp > turn start', () => { ... })
  test('ignora items de turnos anteriores', () => { ... })
})

describe('SavedPathsStrategy', () => {
  test('excluye paths con _image_id_', () => { ... })
  test('extrae paths con espacios en nombre de archivo', () => { ... })
  test('extrae múltiples paths de una notificación', () => { ... })
})
```

## Consecuencias

### Positivas

- **Locality**: Toda la lógica de extracción de imágenes (5 estrategias, ANSI stripping, timestamp filtering, exclusiones) vive en `assetExtractor.ts`. Un bug en extracción se diagnostica y arregla en un solo archivo.
- **Leverage**: `AssetExtractor.extractFromNotifications` es una interfaz pequeña (recibe notificaciones, devuelve imágenes extraídas). Toda la complejidad de 5 estrategias con prioridades está detrás de esa interfaz.
- **Testability**: Las 5 estrategias son testeables individualmente con table-driven tests. La lógica de extracción hoy en `turn.ts` es intra-testable — está enterrada en una función de orquestación de 237 líneas.
- **ADR 0005 compliance**: ADR 0005 creó `assetExtractor.ts` como el módulo canónico de extracción. Esta decisión completa ese trabajo eliminando la lógica duplicada que quedó en `turn.ts`.
- **Extensibilidad**: Agregar una sexta estrategia (ej. extraer WebP de attachments) es implementar una clase y registrarla en el array de estrategias. No se toca `turn.ts`.

### Negativas

- **Riesgo de regresión**: La lógica de extracción en `turn.ts` es la que se usa en producción. Migrarla a `assetExtractor.ts` requiere preservar exactamente el mismo comportamiento, incluyendo edge cases sutiles (ANSI en medio de base64, timestamps con zona horaria, paths con caracteres Unicode).
- **Estrategias no usadas**: Las estrategias 4 y 5 (MultiLineBase64, FilenamePattern) no existen actualmente en `turn.ts` — se proponen como mejora. Si no se necesitan, se pueden omitir.

### Riesgo

**Medio**. El riesgo no está en la complejidad del código (es movimiento mecánico de funciones de extracción) sino en la fidelidad del comportamiento. Se recomienda:

1. Escribir tests para `assetExtractor.ts` con las 5 estrategias primero (contra fixtures de notificaciones reales).
2. Hacer que `turn.ts` delegue a `assetExtractor.ts` con un flag (`useCanonicalExtractor: true`).
3. Correr generaciones reales y comparar resultados entre el extractor viejo y el nuevo.
4. Eliminar la lógica vieja de `turn.ts`.

### Dependencias

- **ADR 0005** (Split Codex Client Module): Ya implementado. `assetExtractor.ts` existe como módulo separado. Este ADR completa la segregación eliminando la lógica residual en `turn.ts`.
- **ADR 0014** (Backend DI Seams): El `AssetExtractor` recibe estrategias inyectables, lo que permite tests con estrategias mock.
