# ADR 0008: Multi-Library Image Catalog with Disk Storage

## Estado

Propuesto.

## Contexto

El modelo de datos actual tiene dos problemas graves de escala:

### Problema 1: IndexedDB como contenedor de imágenes

Los Visual Batches (`GenerationBatch[]`) se serializan completos como JSON en IndexedDB bajo la key `generation-batches`. Cada `GenerationBatch` contiene `GeneratedImage[]` donde cada imagen tiene:

- `src`: URL o data URL de la imagen full-resolution
- `thumbnail`: base64 del thumbnail (generado con Canvas API)

Con 100+ batches de 4 imágenes cada uno, el blob JSON puede alcanzar megabytes. Cada cambio (agregar un batch, marcar favorito, mover a trash) reescribe el array entero. IndexedDB no está diseñado para esto — se degrada, se vuelve lento, y en casos extremos corrompe el estado visual.

### Problema 2: Sin índice de imágenes durable

- Las imágenes generadas ya existen en disco (`{libraryDir}/assets/`), con thumbnails en `{libraryDir}/thumbnails/`.
- El backend ya tiene una tabla `assets` en SQLite con metadata (path, dimensiones, prompt, mime type).
- Pero el frontend no usa ese índice — importa assets via polling (`useLocalStudioSync`) y los convierte en `GenerationBatch` en IndexedDB.
- Si IndexedDB se limpia (cambio de navegador, storage pressure, corrupción), todo el estado visual se pierde. Las imágenes en disco sobreviven pero la app no las ve hasta el próximo polling.

### Problema 3: Una sola biblioteca

Solo existe una carpeta de Studio Library (`D:\AI-Studio-Library` por defecto). El usuario no puede tener múltiples bibliotecas para distintos proyectos o separar outputs por categoría. Esto fuerza a mezclar todas las generaciones en una misma carpeta y un mismo índice.

### Deletion test

Si borramos IndexedDB como store de imágenes:
- La complejidad de serializar/deserializar batches enormes desaparece.
- Pero reaparece en: el grid necesita saber qué imágenes mostrar, el carousel necesita cargar full-res, los workspaces necesitan filtrar, el trash necesita mover/restaurar.
- La complejidad debe reaparecer en SQLite (catálogo indexado) y en el sistema de archivos (disk storage), no en IndexedDB.

## Decisión

Rediseñar el storage de imágenes en tres capas:

### Capa 1: Multi-Library Registry (SQLite)

```sql
CREATE TABLE libraries (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  path        TEXT NOT NULL UNIQUE,   -- ruta absoluta en disco
  is_default  INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now'))
);
```

El usuario puede registrar múltiples directorios de salida. Cada biblioteca tiene su propia estructura interna (`assets/`, `thumbnails/`, `references/`, `exports/`, `.trash/`). Una biblioteca es default para nuevas generaciones.

**API REST**:
- `GET /api/libraries` — lista bibliotecas
- `POST /api/libraries` — registra nueva biblioteca (crea estructura en disco)
- `DELETE /api/libraries/:id` — desregistra (no borra archivos)
- `PUT /api/libraries/:id/default` — marca como default

### Capa 2: Image Catalog (SQLite)

```sql
CREATE TABLE catalog_images (
  id                TEXT PRIMARY KEY,
  library_id        TEXT NOT NULL REFERENCES libraries(id),
  file_path         TEXT NOT NULL,      -- assets/{jobId}-{index}.{ext}
  thumbnail_path    TEXT,               -- thumbnails/{jobId}-{index}.{ext}
  public_url        TEXT NOT NULL,      -- /library/{libraryId}/{relativePath}
  thumbnail_url     TEXT,               -- /library/{libraryId}/{thumbRelativePath}
  prompt            TEXT,
  negative_prompt   TEXT,
  aspect_ratio      TEXT,
  image_size        TEXT,
  width             INTEGER,
  height            INTEGER,
  mime_type         TEXT,
  file_size_bytes   INTEGER,
  job_id            TEXT REFERENCES jobs(id),
  workspace_id      TEXT,               -- FK a workspaces (abajo)
  batch_id          TEXT,               -- agrupación lógica (antiguo GenerationBatch.id)
  recipe_id         TEXT,               -- si fue generado con recipe
  is_favorite       INTEGER DEFAULT 0,
  is_deleted        INTEGER DEFAULT 0,  -- soft delete
  deleted_at        TEXT,
  tags              TEXT DEFAULT '[]',  -- JSON array de strings
  generation_config TEXT,               -- JSON snapshot de ImageGenerationConfig
  created_at        TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_catalog_library ON catalog_images(library_id);
CREATE INDEX idx_catalog_workspace ON catalog_images(workspace_id);
CREATE INDEX idx_catalog_job ON catalog_images(job_id);
CREATE INDEX idx_catalog_favorite ON catalog_images(is_favorite);
CREATE INDEX idx_catalog_deleted ON catalog_images(is_deleted);
CREATE INDEX idx_catalog_created ON catalog_images(created_at);
CREATE INDEX idx_catalog_tags ON catalog_images(tags);  -- JSON index o FTS
```

Esta tabla es el índice durable de todas las imágenes generadas. Sobrevive a limpiezas de IndexedDB. Contiene metadata completa para filtrar, ordenar y buscar sin cargar las imágenes.

**API REST**:
- `GET /api/catalog?library_id=X&workspace_id=Y&favorite=true&sort=newest&offset=0&limit=50` — catálogo paginado
- `GET /api/catalog/:id` — metadata de una imagen
- `PATCH /api/catalog/:id` — actualiza `is_favorite`, `tags`, `workspace_id`
- `DELETE /api/catalog/:id` — soft delete (mueve archivo a `.trash/`)
- `POST /api/catalog/:id/restore` — restaura de trash
- `GET /api/catalog/search?q=cat+sunset` — búsqueda FTS sobre prompt, tags

### Capa 3: Workspaces as Named Filters (SQLite + IndexedDB)

```sql
CREATE TABLE workspaces (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  library_id  TEXT REFERENCES libraries(id),
  filter_json TEXT,              -- filtro guardado: { favorite, aspectRatio, tags, dateRange, recipe }
  sort_order  TEXT DEFAULT 'newest',
  created_at  TEXT DEFAULT (datetime('now'))
);
```

Un workspace no contiene imágenes. Es un filtro guardado sobre el catálogo. Cuando el usuario cambia de workspace, la UI consulta `/api/catalog?workspace_id=X` y obtiene las imágenes que matchean.

Esto reemplaza el modelo actual donde cada `Workspace` tiene una copia del array de batches y el filtrado se hace en memoria (`workspaceBatches` en AppContent).

**Ventaja**: Mover una imagen entre workspaces es cambiar `workspace_id` en SQLite — no se copia la imagen ni se reescribe IndexedDB.

### Transición desde IndexedDB

IndexedDB se reduce a:

| Key | Tipo | Propósito |
|-----|------|-----------|
| `catalog-cache` | `CatalogImage[]` (últimos N) | Cache de la última página consultada |
| `app-workspaces` | `{ id, name }[]` | Solo nombres de workspaces (sin imágenes) |
| `ui-state` | `{ activeWorkspaceId, currentView, ... }` | Estado de UI no crítico |
| `session-logs` | `LogEntry[]` | Logs de sesión (efímeros) |
| `bg-config` | `BackgroundConfig` | Config de fondo animado |
| ~~`generation-batches`~~ | — | **Eliminado**. Reemplazado por SQLite catalog. |
| ~~`generation-trash`~~ | — | **Eliminado**. Soft delete en SQLite. |

La migración debe:
1. Leer todos los `GenerationBatch` existentes de IndexedDB.
2. Para cada imagen con `src` que sea un data URL o URL de library, registrarla en `catalog_images`.
3. Si la imagen no existe en disco, copiarla del data URL a `assets/`.
4. Migrar workspaces a la tabla `workspaces`.
5. Marcar migración como completa (`settings.migration_catalog_v1 = 'done'`).

### Frontend: lazy loading y streaming

```ts
// Antes: todo en memoria
const batches: GenerationBatch[] = useIDB('generation-batches')
const allImages = batches.flatMap(b => b.images) // 400+ imágenes en RAM

// Después: catálogo paginado
interface CatalogPage {
  images: CatalogImage[]    // metadata (sin pixels)
  total: number
  hasMore: boolean
}

function useCatalog(filters: CatalogFilters): {
  pages: CatalogImage[][]
  total: number
  loadMore(): Promise<void>  // siguiente página
  isLoading: boolean
}
```

El grid renderiza thumbnails como `<img src={img.thumbnail_url}>` — URLs HTTP servidas por el backend desde disco. Sin blobs en memoria. Sin data URLs.

El carousel carga full-resolution bajo demanda: `<img src={img.public_url}>`.

## Cambios archivo por archivo

### Crear

- **`apps/local-server/src/catalog.ts`** (~200 líneas) — `registerImage()`, `queryCatalog()`, `updateImage()`, `softDeleteImage()`, `restoreImage()`, `searchCatalog()`. CRUD sobre `catalog_images`.
- **`apps/local-server/src/libraries.ts`** (~80 líneas) — `registerLibrary()`, `listLibraries()`, `setDefaultLibrary()`, `removeLibrary()`.
- **`apps/local-server/src/workspaceRoutes.ts`** (~60 líneas) — CRUD de workspaces en SQLite (no en IndexedDB).
- **`apps/local-server/src/migrationCatalogV1.ts`** (~100 líneas) — Migración única de IndexedDB a SQLite catalog.

### Editar

- **`apps/local-server/src/db.ts`** — Agregar tablas `libraries`, `catalog_images`, `workspaces` en `migrateDb()`. Agregar índices.
- **`apps/local-server/src/index.ts`** — Nuevas rutas: `/api/libraries`, `/api/catalog`, `/api/workspaces`. Actualizar `/library/*` para soportar `libraryId`.
- **`apps/local-server/src/worker.ts`** — Al completar un job y guardar assets, llamar a `catalog.registerImage()` para indexar automáticamente.
- **`apps/local-server/src/init.ts`** — `initStudio()` ahora inicializa la biblioteca default y la registra en SQLite.
- **`services/localStudioService.ts`** — Nuevas funciones: `queryCatalog()`, `updateCatalogImage()`, `searchCatalog()`, `listLibraries()`, etc.
- **`services/localGenerationRun.ts`** — Después de generar, llamar a `queryCatalog()` para obtener las imágenes indexadas en lugar de `listStudioAssets()`.
- **`hooks/useLocalStudioSync.ts`** — Reemplazar polling de assets con suscripción SSE a `catalog.updated`. Las imágenes ya no se "importan" a IndexedDB.
- **`components/AppContent.tsx`** — Reemplazar `batches`/`workspaceBatches`/`imagesWithConfig` con `useCatalog`. Eliminar lógica de filtrado en memoria.
- **`components/ImageGrid.tsx`** — Recibir `CatalogImage[]` en lugar de `GeneratedImageWithConfig[]`. Thumbnails como URLs, no blobs.
- **`components/ImageCarousel.tsx`** — Cargar full-res desde `public_url`.
- **`contexts/GlobalContext.tsx`** — Simplificar drásticamente (sin batches, sin trash de imágenes, sin deduplicación).
- **`utils/idb.ts`** — Sigue existiendo pero con keys reducidas.

### Eliminar

- **Concepto `GenerationBatch`** — Reemplazado por `batch_id` en `catalog_images`.
- **Concepto `GeneratedImage`** — Reemplazado por `CatalogImage`.
- **IndexedDB keys**: `generation-batches`, `generation-trash`.

## Consecuencias

### Positivas

- **Escala**: El catálogo puede tener 10,000+ imágenes sin degradar la UI. Las imágenes viven en disco; el frontend solo carga metadata y thumbnails HTTP.
- **Durabilidad**: El catálogo en SQLite sobrevive a cambios de navegador, limpiezas de storage, y reinstalaciones. Las imágenes en disco son la fuente de verdad.
- **Multi-biblioteca**: El usuario puede tener `D:\Proyectos\Personajes\`, `D:\Proyectos\Escenarios\`, etc. Cada una con su propio catálogo.
- **Búsqueda**: FTS sobre prompts y tags. Encontrar "esa imagen del gato con sombrero" es una query SQL, no un filter en memoria.
- **Workspaces livianos**: Cambiar de workspace es una query SQL. Mover una imagen entre workspaces es un UPDATE. Sin copias de arrays.
- **Memoria**: El frontend ya no mantiene 400+ objetos `GeneratedImage` con data URLs en RAM.

### Negativas

- El frontend ahora depende del backend para renderizar el grid (antes podía funcionar offline con IndexedDB). Si el backend no está corriendo, el grid está vacío.
- La migración de IndexedDB a SQLite es un paso crítico que debe ser robusto (sin pérdida de imágenes).
- Agrega ~8 endpoints REST nuevos. La API crece.

## Migración

### Paso 1: Agregar tablas y endpoints (backend)

Ejecutar migración de schema (nuevas tablas). Endpoints de catálogo devuelven datos. El worker indexa imágenes nuevas automáticamente. Nada cambia en el frontend todavía.

### Paso 2: Construir índice desde assets existentes

Script `scripts/migrate-catalog-v1.ts` que lee todos los assets de la tabla `assets`, copia sus metadatos a `catalog_images`, y genera thumbnails faltantes.

### Paso 3: Frontend híbrido

El frontend consulta tanto IndexedDB (datos viejos) como el catálogo SQLite (datos nuevos). Muestra ambos. Los batches nuevos se escriben solo en SQLite.

### Paso 4: Eliminar IndexedDB de imágenes

Una vez que todos los batches históricos están en el catálogo, se eliminan las keys `generation-batches` y `generation-trash` de IndexedDB. El frontend solo consulta el catálogo.

## Tests

```ts
// Catalog: registrar y consultar
await catalog.registerImage({
  libraryId: 'lib-1',
  filePath: '/assets/job-1-0.png',
  thumbnailPath: '/thumbnails/job-1-0.png',
  prompt: 'a cat wearing a hat',
  aspectRatio: '1:1',
  width: 1024, height: 1024,
  mimeType: 'image/png',
  jobId: 'job-1',
  workspaceId: 'ws-1'
})
const page = await catalog.queryCatalog({ workspaceId: 'ws-1', limit: 10 })
assert(page.images.length === 1)
assert(page.images[0].prompt === 'a cat wearing a hat')

// Catalog: paginación
const page1 = await catalog.queryCatalog({ limit: 50, offset: 0 })
const page2 = await catalog.queryCatalog({ limit: 50, offset: 50 })
assert(page1.images.length <= 50)
assert(page1.images[0].id !== page2.images[0]?.id) // sin solapamiento

// Catalog: soft delete y restore
await catalog.softDeleteImage('img-1')
const deleted = await catalog.queryCatalog({ isDeleted: true })
assert(deleted.images.some(i => i.id === 'img-1'))
await catalog.restoreImage('img-1')
const active = await catalog.queryCatalog({ isDeleted: false })
assert(active.images.some(i => i.id === 'img-1'))

// Libraries: registrar múltiples
await libraries.registerLibrary({ name: 'Personajes', path: '/tmp/lib-personajes' })
await libraries.registerLibrary({ name: 'Escenarios', path: '/tmp/lib-escenarios' })
const all = await libraries.listLibraries()
assert(all.length === 3) // default + 2 nuevas

// Workspaces: filtros guardados
await workspaces.create({ name: 'Favoritos', libraryId: 'lib-1', filterJson: { favorite: true } })
const ws = await workspaces.get('ws-fav')
assert(ws.filterJson.favorite === true)
```

## Riesgos

- **Alto**. Este es el cambio arquitectónico más profundo. Toca el modelo de datos, el frontend, el backend, y la migración de datos existentes.
- La dependencia del frontend en el backend para renderizar el grid introduce un punto único de fallo. Mitigación: mantener un cache local en IndexedDB de la última página consultada.
- La migración de datos existentes debe ser flawless — si falla, el usuario pierde su historial visual.
