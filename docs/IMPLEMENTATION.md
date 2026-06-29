# Implementation Details

## Summary

The current flow avoids coupling the browser UI to external providers and centralizes real execution in the local backend.

## Routing

The app keeps lightweight hash-based routing for studio, recipes, modals, and editor flows, preserving back/forward navigation without introducing `react-router`.

## Grid And Thumbnails

`ImageGrid` keeps the main visual layout. New images arrive as URLs served by `/library/*`.

## Generation Flow

1. The UI creates a transient visual job.
2. `runLocalGeneration` creates persistent jobs in the local backend.
3. `watchJob()` waits for terminal states over SSE.
4. `worker` executes through the Provider Boundary, with Codex as the primary path.
5. Assets, transcripts, and metadata are written to the Studio Library.
6. The UI queries `/api/catalog` by `jobId` and renders from Catalog Entries.

## Persistent Queue

The visible queue blends Browser Queue and persistent SQLite-backed jobs. Browser Queue persists jobs in IndexedDB so they survive refreshes. If a job already reached the backend before refresh, the UI does not execute it again: durable tracking stays in Backend Session Jobs.

## Live Sync

`useLocalStudioSync` performs HTTP catch-up and then listens to `GET /api/events`. If SSE disconnects, it refreshes state before reconnecting.

## Logs

The visual console combines UI and backend logs. The backend also persists logs to disk inside the Studio Library.

## Legacy Compatibility

`GenerationBatch[]` and Vault JSON remain compatibility/recovery surfaces, not the main durable model.
