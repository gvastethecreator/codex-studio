# Deepening Roadmap

Roadmap de refactors arquitectónicos para convertir módulos shallow en módulos deep. Cada refactor está documentado como ADR en `docs/adr/`.

## Principios (ver LANGUAGE.md)

- **Depth**: leverage en la interfaz — mucho comportamiento detrás de una interfaz pequeña.
- **Locality**: cambios, bugs y conocimiento concentrados en un solo lugar.
- **Seam**: lugar donde vive una interfaz; punto donde se puede alterar comportamiento sin editar in place.
- **Deletion test**: si borrás el módulo y la complejidad desaparece, era un pass-through. Si la complejidad reaparece en N callers, ganaba su lugar.

## Planes

| # | ADR | Nombre | Riesgo | Depende de |
|---|-----|--------|--------|------------|
| 1 | 0002 | Callable App Factory | Medio | — |
| 2 | 0003 | Extract Reference Manager | Bajo | — (se beneficia de 0002 para tests) |
| 3 | 0004 | Platform Paths Seam | Bajo | — |
| 4 | 0005 | Split Codex Client Module | Alto | 0004 |
| 5 | 0006 | SSE Job Watcher | Medio | — |
| 6 | 0007 | Consolidate Generation Flows | Bajo | 0003, se beneficia de 0006 |
| 7 | 0008 | Multi-Library Image Catalog | Alto | 0002, 0006 |
| 8 | 0009 | Embedded Image Metadata | Bajo | 0002 |

## Orden de ejecución recomendado

```
0002 (App Factory)
 │
 ├─► 0003 (Reference Manager)   ─── independiente, bajo riesgo
 ├─► 0004 (Platform Paths)      ─── independiente, bajo riesgo
 │
 ├─► 0005 (Split Codex Client)  ─── depende de 0004, alto riesgo
 │
 └─► 0006 (SSE Job Watcher)     ─── independiente, bajo riesgo
      │
      ├─► 0007 (Consolidate Flows) ─── usa SSE de 0006, reference manager de 0003
      │
      └─► 0008 (Multi-Library Catalog) ─── usa SSE de 0006, app factory de 0002
           │
           └─► Fase 1: backend (tablas + endpoints + indexación automática)
           └─► Fase 2: script de migración IndexedDB → SQLite
           └─► Fase 3: frontend híbrido (IndexedDB + catálogo)
           └─► Fase 4: eliminar IndexedDB de imágenes

0009 (Embedded Metadata) ─── independiente, puede ejecutarse en paralelo con cualquier plan post-0002
```

Los planes 0003, 0004, 0006 y 0009 pueden ejecutarse en paralelo una vez que 0002 esté completo (porque 0002 habilita testear todo lo demás).

0008 es el cambio más profundo y se recomienda atacarlo en 4 fases incrementales. La fase 1 (backend) puede empezar apenas 0002 esté listo. Las fases 3-4 (frontend) se benefician de 0006 (SSE) y 0007 (pipeline unificado).

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

## Métricas de éxito

- **Testabilidad**: Cada módulo puede testearse contra su interfaz sin mockear dependencias no relacionadas.
- **Modularidad**: Borrar un módulo no rompe otros concerns.
- **AI-navegabilidad**: Entender "cómo se genera una imagen" no requiere leer 7+ archivos.
- **Portabilidad**: Agregar soporte para macOS/Linux requiere tocar solo el adapter de platform paths.
