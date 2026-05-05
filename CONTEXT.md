# Codex Image Studio Context

## Domain Terms

- **Studio Library**: External local folder that stores assets, transcripts, logs and SQLite state for the studio. Default: `D:\AI-Studio-Library`.
- **Persistent Job**: A SQLite-backed backend job that survives UI reloads. Current implemented kinds are `dry_run` and `codex_imagegen`.
- **Visual Batch**: UI-facing `GenerationBatch` stored in IndexedDB and rendered by the original image grid.
- **Local Asset**: A generated image file stored in the Studio Library and served to the UI through `/library/...`.
- **Codex Turn**: One app-server turn started by the backend to execute image generation through the local Codex session.
- **Local Studio Sync**: Frontend module that imports Local Assets into Visual Batches and mirrors Persistent Jobs and backend logs into the UI.
- **Local Generation Run**: Frontend module that hides the Persistent Job choreography needed to produce a Visual Batch from one image generation request.

## Architectural Decisions

- SQLite is the source of truth for Persistent Jobs, Local Assets and backend logs.
- IndexedDB is the visual cache for Visual Batches, workspaces, trash and UI state.
- The React app should not know backend polling or Local Asset import mechanics outside the Local Studio Sync module.
- The generation pipeline should not know Persistent Job creation, polling, Local Asset filtering or thumbnail creation outside the Local Generation Run module.
