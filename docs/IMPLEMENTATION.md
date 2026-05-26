# Implementation Details

## Routing

The app keeps lightweight hash-based routing for the studio, recipes, individual recipe pages, modal state, and editor state. This preserves the original back/forward behavior without introducing `react-router`.

## Grid and thumbnails

`ImageGrid` keeps the original visual layout. New images arrive from the local backend as URLs served by `/library/*`. When a Catalog Entry does not yet include a persisted thumbnail, `utils/imageUtils.ts` can generate one with canvas for UI compatibility.

## Generation

`useGenerationPipeline` no longer calls external provider services from the browser. The current flow is:

1. The UI creates a transient visual job through `useQueueManager`.
2. `runLocalGeneration` creates one or more persistent Generation Task jobs in the local backend.
3. `watchJob()` waits for terminal states through a shared SSE stream.
4. The backend worker executes through the Provider Boundary. Codex remains the primary adapter via `codex app-server`.
5. Local Assets, thumbnails, transcripts, and catalog metadata are written into the configured Studio Library.
6. The UI queries `/api/catalog` by `jobId`, materializes images from Catalog Entries, and only builds legacy `GenerationBatch` data at compatibility edges.

## Persistent queue

The visible queue contains transient UI jobs and persistent backend jobs. Persistent jobs survive reloads or UI closure because they live in SQLite.

## Live sync

`useLocalStudioSync` performs initial HTTP catch-up and then listens for jobs, logs, and assets through `GET /api/events`. If the SSE connection drops, the frontend refreshes backend state before reconnecting.

## Logs

The visual console mixes UI logs with local backend logs. The backend also writes logs to disk under the configured Studio Library `logs/` folder.

## Vault

Vault remains a legacy metadata snapshot export surface for inspection and compatibility. Visible JSON legacy import has been removed. Images should enter through Settings > External Output Sources so selected files are copied as Local Assets and Catalog Entries. The active visual cache is not persisted in IndexedDB; recovery may still read legacy keys for targeted reconstruction.
