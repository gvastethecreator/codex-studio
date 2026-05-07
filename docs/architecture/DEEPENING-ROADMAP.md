# Deepening Roadmap

Roadmap de refactors arquitectónicos para convertir módulos shallow en módulos deep. Cada refactor está documentado como ADR en `docs/adr/`.

## Principios (ver LANGUAGE.md)

- **Depth**: leverage en la interfaz — mucho comportamiento detrás de una interfaz pequeña.
- **Locality**: cambios, bugs y conocimiento concentrados en un solo lugar.
- **Seam**: lugar donde vive una interfaz; punto donde se puede alterar comportamiento sin editar in place.
- **Deletion test**: si borrás el módulo y la complejidad desaparece, era un pass-through. Si la complejidad reaparece en N callers, ganaba su lugar.

## Planes — Fase 1 (Backend)

| #   | ADR  | Nombre                             | Riesgo | Depende de                          |
| --- | ---- | ---------------------------------- | ------ | ----------------------------------- |
| 1   | 0002 | Callable App Factory               | Medio  | —                                   |
| 2   | 0003 | Extract Reference Manager          | Bajo   | — (se beneficia de 0002 para tests) |
| 3   | 0004 | Platform Paths Seam                | Bajo   | —                                   |
| 4   | 0005 | Split Codex Client Module          | Alto   | 0004                                |
| 5   | 0014 | Backend Dependency Injection Seams | Medio  | 0002, 0017                          |
| 6   | 0016 | Deduplicate Image Extraction       | Medio  | 0005                                |
| 7   | 0017 | Centralize Configuration           | Bajo   | —                                   |

## Planes — Fase 2 (Frontend State & Components)

| #   | ADR  | Nombre                             | Riesgo | Depende de                 |
| --- | ---- | ---------------------------------- | ------ | -------------------------- |
| 8   | 0006 | SSE Job Watcher                    | Medio  | —                          |
| 9   | 0010 | Decompose God-Object Contexts      | Medio  | —                          |
| 10  | 0011 | Decompose AppContent God Component | Medio  | 0010, 0006, 0007           |
| 11  | 0007 | Consolidate Generation Flows       | Bajo   | 0003, se beneficia de 0006 |

## Planes — Fase 3 (Recipes & UI Modules)

| #   | ADR  | Nombre                                      | Riesgo | Depende de |
| --- | ---- | ------------------------------------------- | ------ | ---------- |
| 12  | 0012 | RecipeContextBuilder Seam                   | Bajo   | 0010, 0007 |
| 13  | 0015 | Extract 3D Viewport from CameraAnglesRecipe | Bajo   | 0011       |
| 14  | 0009 | Embedded Image Metadata                     | Bajo   | 0002       |

## Planes — Fase 4 (Data Model Migration)

| #   | ADR  | Nombre                           | Riesgo | Depende de       |
| --- | ---- | -------------------------------- | ------ | ---------------- |
| 15  | 0008 | Multi-Library Image Catalog      | Alto   | 0002, 0006       |
| 16  | 0013 | Resolve Catalog-Batch Dual Model | Alto   | 0008, 0010, 0011 |

## Orden de ejecución recomendado

```
Fase 1: Backend Foundation
─────────────────────────
0017 (Centralize Config)   ─── sin dependencias, habilita 0014
  │
0002 (App Factory)         ─── sin dependencias, habilita tests
  │
  ├─► 0003 (Reference Manager)   ─── bajo riesgo, extracción mecánica
  ├─► 0004 (Platform Paths)      ─── bajo riesgo, extracción mecánica
  │
  ├─► 0005 (Split Codex Client)  ─── ya implementado, queda 0016
  │     │
  │     └─► 0016 (Deduplicate Extraction) ─── completa 0005
  │
  └─► 0014 (Backend DI Seams)   ─── usa 0002 + 0017, habilita tests en todo el backend

Fase 2: Frontend State
──────────────────────
0010 (Decompose Contexts)   ─── sin dependencias, habilita 0011
  │
  └─► 0011 (Decompose AppContent)  ─── usa 0010, limpia el god component
       │
       └─► 0007 (Consolidate Generation) ─── complementa 0011 en la parte de pipeline

0006 (SSE Job Watcher)      ─── ya implementado, consumido por 0011 y 0013

Fase 3: Recipes & UI
────────────────────
0012 (RecipeContextBuilder) ─── puede correr en paralelo con Fase 2
0015 (Extract 3D Viewport)  ─── puede correr en paralelo con Fase 2
0009 (Embedded Metadata)    ─── ya implementado

Fase 4: Data Model
──────────────────
0008 (Multi-Library Catalog) ─── backend ya implementado, pendiente frontend
  │
  └─► 0013 (Resolve Dual Model)  ─── completa 0008, elimina GenerationBatch de IndexedDB
```

Las fases son secuenciales (cada una construye sobre la anterior), pero dentro de cada fase los ADRs pueden ejecutarse en paralelo.

0017, 0010, y 0012 son los de menor riesgo y mayor impacto inmediato — pueden empezar sin esperar nada.

0008 + 0013 son el cambio más profundo y se recomienda atacarlos en 4 fases incrementales como propone ADR 0008. La fase 1 (backend) ya está completa. Las fases 3-4 (frontend) se benefician de 0006 (SSE), 0010 (contextos limpios), y 0011 (page components).

## Resumen de cada plan

### 0002 — Callable App Factory

**Problema**: El backend ejecuta side effects a nivel top-level en tiempo de import (`initStudio()`, `new Hono()`, `loadDotEnvLocal()`). No hay `main()` llamable. Imposible testear.

**Solución**: `createStudioApp(config)` como factory que devuelve `{ app, db, worker, shutdown }`. `index.ts` se reduce a 20 líneas que llaman la factory y arrancan el servidor.

### 0003 — Extract Reference Manager

**Problema**: Tres funciones (`safeReferenceName`, `persistJobReferences`, `buildPromptWithReferences`) definidas inline dentro del handler HTTP `POST /api/jobs`. Sin locality.

**Solución**: Módulo `referenceManager.ts` con interfaz única: `processReferences(jobId, references) → { persistedRefs, augmentedPrompt }`.

### 0004 — Platform Paths Seam

**Problema**: Paths hardcodeados a Windows y al usuario `user` en 4 archivos. Sin seam para otras plataformas.

**Solución**: Módulo `platformPaths.ts` con interfaz `resolvePlatformPath(key)`. Un adapter Windows (actual) y uno Unix (futuro).

### 0005 — Split Codex Client Module

**Problema**: `codexClient.ts` es un god module de 552 líneas con 5 concerns: process supervision, JSON-RPC transport, session pooling, image extraction, y turn orchestration.

**Solución**: Cinco módulos separados bajo `apps/local-server/src/codex/`, cada uno con su propia interfaz y seam.

### 0006 — SSE Job Watcher

**Problema**: El frontend usa polling (3s para sync, 1.2s para esperar jobs) a pesar de que el backend ya expone SSE en `/api/events`.

**Solución**: Módulo `services/studioEventSource.ts` que expone `watchJob(id)` (Promise-based) y `onJobUpdate`/`onAssetAdded` (subscription-based). Reemplaza ambos polling loops.

### 0007 — Consolidate Generation Flows

**Problema**: `AppContent.tsx` implementa un pipeline de generación inline para el editor de imágenes (líneas 417-476), duplicando la lógica de `localGenerationRun.ts` y violando la decisión arquitectónica documentada.

**Solución**: Extender `runSingleCodexImagegenJob` con un parámetro opcional `inputImage`. `AppContent` llama al mismo pipeline que el resto de la app.

### 0008 — Multi-Library Image Catalog with Disk Storage

**Problema**: Los Visual Batches enteros (con data URLs y thumbnails base64) se serializan como JSON en IndexedDB bajo una sola key. Con 100+ batches esto es megabytes — lento, frágil, y se pierde si IndexedDB se limpia. Solo existe una carpeta de biblioteca; el usuario no puede tener múltiples directorios de salida.

**Solución**: Tres capas nuevas — Library Registry (múltiples carpetas de salida), Image Catalog en SQLite (índice durable con metadata, búsqueda FTS, paginación), y Workspaces como filtros guardados (no contenedores de copias). El frontent carga metadata paginada y thumbnails como URLs HTTP desde disco. IndexedDB se reduce a cache de UI y logs de sesión.

### 0009 — Embedded Image Metadata

**Problema**: Las imágenes generadas son archivos planos sin metadata. Si una imagen sale de la biblioteca (se comparte, se mueve), se pierde el prompt, la config, la fecha y todo el contexto de generación.

**Solución**: Módulo `metadataEmbedder.ts` que incrusta metadata en el archivo de imagen al guardarlo — PNG chunks `tEXt`/`iTXt`, EXIF `UserComment` + XMP en JPEG/WebP. Schema compatible con SD WebUI/ComfyUI. Round-trip: `embedMetadata()` escribe, `extractMetadata()` lee para restaurar al catálogo.

### 0010 — Decompose God-Object Contexts

**Problema**: `GlobalContext` expone 7 raw dispatch setters (`setBatches`, `setTrash`, etc.) permitiendo que cualquier componente mute estado global sin guardrails. `GenerationContext` hace spread de 3 hooks en 25 miembros sin contrato explícito — re-renders masivos, silent overrides.

**Solución**: `useReducer` con action creators para `GlobalContext`. Named sub-objects (`config`, `pipeline`, `modal`, `recipe`) en lugar de spread para `GenerationContext`.

### 0011 — Decompose AppContent God Component

**Problema**: `AppContent.tsx` tiene 919 líneas, 14 concerns, 38 propiedades de contexto, y viola CONTEXT.md al llamar `runLocalGeneration` directamente y escanear IndexedDB/localStorage.

**Solución**: Extraer `useHashRouter`, crear page components (`StudioPage`, `RecipesPage`, `RecipePage`), migrar deep scan a `useLocalStudioSync`, delegar edición a `useGenerationPipeline`.

### 0012 — RecipeContextBuilder Seam

**Problema**: 7 recetas construyen `recipeContext` de forma independiente con formatos ad-hoc (~175 líneas de lógica duplicada conceptualmente). Cambiar el protocolo de prompts requiere tocar 7 archivos.

**Solución**: Interfaz `RecipeContextBuilder` con método `buildContext(params) → string`. Registry asocia `recipeId` con su builder. Cada receta implementa un adapter (~30 líneas).

### 0013 — Resolve Catalog-Batch Dual Model

**Problema**: El Image Catalog existe en SQLite pero el frontend lo importa y convierte a `GenerationBatch[]` en IndexedDB como modelo primario. Tres lugares hacen mapping manual `CatalogImage → GeneratedImage`. `runSingleCodexImagegenJob` filtra client-side con límite de 50 entries.

**Solución**: Agregar filtro `jobId` a `/api/catalog`. Hook `useCatalog` para consulta paginada directa. Eliminar `GenerationBatch` de IndexedDB.

### 0014 — Backend Dependency Injection Seams

**Problema**: 5+ interfaces existen (`CodexTurn`, `RpcClient`, `SessionPool`, ...) pero ninguna se usa como punto de inyección. `getDb()` es singleton global. `worker.ts` tiene module-level side effects. Ningún módulo del backend es testeable sin module mocking.

**Solución**: Parámetros opcionales en funciones de DB. Factories que reciben dependencias. Eliminar module-level side effects en `worker.ts` y `codex/turn.ts`. Usar interfaces como tipos de parámetro.

### 0015 — Extract 3D Viewport from CameraAnglesRecipe

**Problema**: `CameraAnglesRecipe.tsx` mezcla ~400 líneas de lógica de receta con ~500 líneas de THREE.js imperativo en un `useEffect`. Si otra receta necesita 3D, debe copiar 500 líneas.

**Solución**: Hook `useCameraViewport(containerRef, config)` que encapsula scene setup, orbit controls, animation loop, y cleanup. El recipe solo provee `customScene` y `onCameraChange`.

### 0016 — Deduplicate Image Extraction Logic

**Problema**: ADR 0005 creó `assetExtractor.ts` pero `turn.ts` retiene su propia lógica de extracción con 5 estrategias (más avanzadas que las 3 de `assetExtractor`). ANSI stripping, timestamp filtering, y `_image_id_` exclusion solo existen en `turn.ts`.

**Solución**: Mover las 5 estrategias a `assetExtractor.ts` como canonical extractor. `turn.ts` delega extracción al `AssetExtractor`.

### 0017 — Centralize Configuration

**Problema**: `process.env` reads dispersas en 5 archivos más allá de `config.ts`. `CODEX_IMAGEGEN_MODEL` duplicado en `turn.ts` y `sessionPool.ts` con defaults independientes. Sin validación de valores. Module-level evaluation causa lecturas antes de `loadDotEnvLocal()`.

**Solución**: Expandir `getSettings()` con todas las variables de entorno + validación. Consumir `getSettings()` en lugar de `process.env` directo. Eliminar defaults duplicados.

## Métricas de éxito

- **Testabilidad**: Cada módulo puede testearse contra su interfaz sin mockear dependencias no relacionadas.
- **Modularidad**: Borrar un módulo no rompe otros concerns.
- **AI-navegabilidad**: Entender "cómo se genera una imagen" no requiere leer 7+ archivos.
- **Portabilidad**: Agregar soporte para macOS/Linux requiere tocar solo el adapter de platform paths.
