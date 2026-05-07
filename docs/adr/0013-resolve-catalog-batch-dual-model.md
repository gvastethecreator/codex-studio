# ADR 0013: Resolve Catalog-Batch Dual Model — El Grid de Imágenes Consulta el Image Catalog Directamente

## Estado

Propuesto.

## Contexto

ADR 0008 y CONTEXT.md establecen que `GenerationBatch` está _planned for deprecation — will be replaced by Catalog Entries grouped by batch_id._ Sin embargo, el código actual opera con un **modelo dual**: el Image Catalog existe en SQLite (`catalog_images`), pero el frontend lo importa y convierte a `GenerationBatch[]` como modelo primario de renderizado:

```
SQLite catalog_images ──import──► IndexedDB GenerationBatch[] ──render──► ImageGrid
```

La transformación ocurre en tres lugares:

1. **`useLocalStudioSync.mapAssetToBatch`**: convierte `CatalogImage` → `GeneratedImage` (la UI cache entry).
2. **`localGenerationRun.runSingleCodexImagegenJob`**: consulta el catálogo por jobId (filtrando client-side los últimos 50 entries) y reconstruye un `GenerationBatch`.
3. **`GlobalContext`**: almacena `batches` y `trash` como `GenerationBatch[]` en IndexedDB bajo keys `catalog-cache` y `catalog-trash`.

Esto crea fricción constante:

- Agregar un campo a `CatalogImage` requiere actualizar `mapAssetToBatch`, `localGenerationRun`, y `types.ts` (tres lugares).
- `runSingleCodexImagegenJob` hace `queryCatalog({ limit: 50 })` y filtra client-side con `.filter(asset => asset.jobId === ...)`. Si más de 50 entradas existen antes de que los assets del job estén indexados, los assets se pierden.
- El backend no expone un parámetro de filtro `jobId` en `/api/catalog`, forzando al frontend a hacer filtrado client-side.
- El catálogo existe como fuente de verdad, pero el frontend lo trata como fuente transitoria — importa, convierte, y luego ignora.

### Deletion test

Si borramos la capa de `GenerationBatch` en IndexedDB y el grid renderiza desde el catálogo:
- La complejidad de `mapAssetToBatch` desaparece.
- La complejidad de paginación, filtrado, y ordenamiento reaparece en SQLite (donde pertenece) y en un hook `useCatalog`.
- La complejidad de "qué imágenes mostrar" se resuelve con queries SQL parametrizadas en lugar de `Array.filter()` en el frontend.

## Decisión

### Fase 1: Backend — Agregar filtro `jobId` al endpoint `/api/catalog`

Extender `queryCatalog` en `catalog.ts` para aceptar `jobId` como parámetro de filtro:

```ts
// catalog.ts
export function queryCatalog(params: {
  limit?: number
  offset?: number
  workspaceId?: string
  jobId?: string          // NUEVO
  batchId?: string        // NUEVO
  isFavorite?: boolean
  includeDeleted?: boolean
  sortBy?: 'created_at' | 'prompt' | 'aspect_ratio'
  sortOrder?: 'asc' | 'desc'
}): CatalogPage
```

El SQL se construye dinámicamente con `WHERE` clauses parametrizadas. Esto elimina el filtrado client-side frágil en `localGenerationRun`.

### Fase 2: Frontend — Hook `useCatalog`

Crear un hook que reemplaza el acceso directo a `batches` del contexto:

```ts
function useCatalog(filters?: CatalogFilters): {
  images: CatalogImage[]
  page: CatalogPage
  isLoading: boolean
  error: Error | null
  loadMore: () => void
  refresh: () => void
  hasMore: boolean
}
```

El hook maneja:
- **Paginación**: carga inicial + `loadMore` para scroll infinito.
- **Caché**: almacena páginas en IndexedDB bajo `catalog-cache` (ya existe) como caché de lectura, no como fuente de verdad.
- **Invalidación**: después de generar imágenes, `refresh()` re-consulta el catálogo.
- **Filtros**: `workspaceId`, `isFavorite`, `isDeleted` (para trash), `batchId`.

El grid renderiza desde `useCatalog`:

```tsx
function StudioPage() {
  const { images, loadMore, hasMore, refresh } = useCatalog({
    workspaceId: activeWorkspaceId,
    isDeleted: false,
  })
  
  return <ImageGrid images={images} onScrollEnd={loadMore} />
}
```

### Fase 3: Simplificar `localGenerationRun`

Con el filtro `jobId` en el backend, `runSingleCodexImagegenJob` pasa de:

```ts
// ANTES: fetch 50 + filter client-side
const catalogPage = await queryCatalog({ limit: 50 })
const jobAssets = catalogPage.images.filter(a => a.jobId === completedJob.id)
```

A:

```ts
// DESPUÉS: filtro server-side
const { images: jobAssets } = await queryCatalog({ jobId: completedJob.id })
```

### Fase 4: Eliminar `GenerationBatch` de IndexedDB

Una vez que el grid, carousel, y trash usan `useCatalog`:
- Eliminar keys `catalog-cache` y `catalog-trash` de IndexedDB (o mantener solo como caché volátil).
- Eliminar `mapAssetToBatch` de `useLocalStudioSync`.
- `GlobalContext` deja de almacenar `batches` y `trash` como `GenerationBatch[]`.
- `types.ts` depreca `GenerationBatch`, `GeneratedImage`.

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `apps/local-server/src/catalog.ts` | Agregar filtros `jobId`, `batchId` a `queryCatalog` |
| `apps/local-server/src/appFactory.ts` | Pasar query params del endpoint `/api/catalog` a `queryCatalog` |
| `hooks/useCatalog.ts` | Nuevo — hook de consulta paginada al catálogo |
| `services/localGenerationRun.ts` | Usar `queryCatalog({ jobId })` en lugar de filter client-side |
| `hooks/useLocalStudioSync.ts` | Eliminar `mapAssetToBatch`, `importLocalAssets` |
| `contexts/GlobalContext.tsx` | Reemplazar `batches`/`trash` state con `useCatalog` |
| `components/ImageGrid.tsx` | Recibir `CatalogImage[]` en lugar de `GeneratedImage[]` |
| `components/ImageCarousel.tsx` | Cargar full-res desde `publicUrl` del catálogo |
| `components/TrashModal.tsx` | Usar `useCatalog({ isDeleted: true })` |
| `types.ts` | Deprecar `GenerationBatch`, `GeneratedImage`, `GeneratedImageWithConfig` |

## Consecuencias

### Positivas

- **Locality**: La fuente de verdad para imágenes es SQLite. No hay transformación `CatalogImage → GeneratedImage` que mantener sincronizada.
- **Leverage**: `useCatalog({ workspaceId, isFavorite: true })` reemplaza `batches.filter(b => b.workspaceId === id).flatMap(b => b.images).filter(i => i.isFavorite)` — una interfaz pequeña, mucho comportamiento (paginación, caché, filtrado server-side).
- **Testability**: `queryCatalog({ jobId })` es un query SQL parametrizado — testeable con una DB en memoria. `useCatalog` es testeable mockeando `queryCatalog`.
- **Corrección**: El filtro server-side elimina el bug donde assets de un job no aparecen porque el límite de 50 entries excluye los más recientes.
- **Rendimiento**: La paginación server-side con `LIMIT/OFFSET` escala a miles de imágenes. El modelo actual carga todas en memoria como `GenerationBatch[]`.

### Negativas

- **Migración grande**: Es el cambio más profundo al modelo de datos del frontend. Toca el grid, carousel, trash, workspaces, y el pipeline de generación.
- **Latencia de red**: Cada cambio de filtro requiere un request HTTP. Esto se mitiga con el caché de IndexedDB (que ya existe como `catalog-cache`).
- **Operaciones batch**: Funcionalidades como "seleccionar todas" o "descargar seleccionadas" ahora operan sobre `CatalogImage[]` en lugar de `GeneratedImage[]`. Los campos son similares pero no idénticos.

### Riesgo

**Alto**. Es la capa más profunda del modelo de datos del frontend. Se recomienda ejecutar en 4 fases incrementales (como propone ADR 0008), con cada fase completamente funcional antes de pasar a la siguiente. La Fase 1 (backend) es bajo riesgo y habilita las fases siguientes.

### Dependencias

- **ADR 0008** (Multi-Library Image Catalog): Este ADR ejecuta las Fases 3-4 de ADR 0008 que aún no se implementaron.
- **ADR 0006** (SSE Job Watcher): Los eventos SSE de `asset.created` pueden disparar `refresh()` en `useCatalog`.
- **ADR 0010** (Context decomposition): `GlobalContext` simplificado con action creators hace más limpia la transición de `batches[]` a `useCatalog`.
- **ADR 0011** (AppContent decomposition): `StudioPage` es el lugar natural para integrar `useCatalog`.
