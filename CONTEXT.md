# Codex Studio Context

## Domain Terms

- **Studio Library**: External local folder that stores assets, transcripts, logs and SQLite state for the studio. Default: `~/AI-Studio-Library` (for example `%USERPROFILE%\AI-Studio-Library` on Windows). Multiple libraries can be registered; each has its own `assets/`, `thumbnails/`, `references/`, `.trash/` structure.
- **Library Registry**: SQLite table that tracks multiple Studio Library directories. One is default for new generations.
- **Image Catalog**: SQLite table `catalog_images` that indexes every generated image with full metadata — prompt, dimensions, aspect ratio, tags, favorite status, workspace, generation config snapshot. Replaces IndexedDB as the durable image index.
- **Catalog Entry**: One row in the Image Catalog. The frontend renders grids from catalog query results rather than from in-memory `GenerationBatch` arrays.
- **Catalog Page**: Paginated result from `/api/catalog` — metadata only (no pixel data). Thumbnails and full-res images are served as HTTP URLs from disk.
- **Embedded Metadata**: Generation parameters (prompts, aspect ratio, model, date, recipe, batch) written directly into the image file as PNG tEXt chunks or EXIF/XMP. Makes images self-documenting outside the studio. Compatible with SD WebUI / ComfyUI metadata readers.
- **Persistent Job**: A SQLite-backed backend job that survives UI reloads. Current implemented kinds are `dry_run` and `codex_imagegen`.
- **Visual Batch**: UI-facing `GenerationBatch` stored in IndexedDB and rendered by the original image grid. **Planned deprecation** — will be replaced by Catalog Entries grouped by `batch_id`.
- **Local Asset**: A generated image file stored in a Studio Library and served to the UI through `/library/...`.
- **Codex Turn**: One app-server turn started by the backend to execute image generation through the local Codex session.
- **Local Studio Sync**: Frontend module that imports Local Assets into Visual Batches and mirrors Persistent Jobs and backend logs into the UI. **Planned evolution** — will subscribe to SSE events instead of polling, and will query the Image Catalog instead of importing assets into IndexedDB.
- **Local Generation Run**: Frontend module that hides the Persistent Job choreography needed to produce a Visual Batch from one image generation request.
- **Studio Runtime**: Frontend runtime adapter that resolves how the UI reaches the local backend. In the current web flow it defaults to `http://localhost:4317`; future desktop adapters can inject a different API base without rewriting the renderer.

## Architectural Decisions

- SQLite is the source of truth for Persistent Jobs, Local Assets, backend logs, Library Registry, Image Catalog, and workspaces.
- IndexedDB is the visual cache for UI state, session logs, and catalog page cache. **No longer stores image data or generation batches**.
- The React app should not know backend polling or Local Asset import mechanics outside the Local Studio Sync module.
- The generation pipeline should not know Persistent Job creation, polling, Local Asset filtering or thumbnail creation outside the Local Generation Run module.
- Images are stored on disk in configurable Studio Library directories, indexed in the Image Catalog (SQLite), and served as HTTP URLs. The frontend never holds full-resolution images or thumbnails as data URLs in memory.
- Workspaces are named filters over the Image Catalog, not containers that copy image data.
