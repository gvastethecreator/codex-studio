# Codex Studio Context

Canonical language for the local-first image studio. This file defines the project vocabulary only; current system shape lives in `docs/ARCHITECTURE.md`, and hard-to-reverse trade-offs live in `docs/adr/`.

## Language

### Storage and catalog

**Studio Library**:
External local folder that stores assets, thumbnails, references, transcripts, logs, and SQLite state for the studio.
_Avoid_: output folder, data dir, library path

**Library Registry**:
SQLite-backed registry of Studio Library directories, with one default library for new generations.
_Avoid_: libraries list, path registry

**Image Catalog**:
SQLite-backed index of generated images and their searchable metadata across one or more Studio Libraries.
_Avoid_: asset table, gallery cache

**Catalog Entry**:
One image record inside the Image Catalog.
_Avoid_: asset row, generated image record

**Catalog Page**:
Paginated metadata payload returned by `/api/catalog`.
_Avoid_: gallery response, asset dump

**Embedded Metadata**:
Generation metadata written into an image file so the asset stays self-describing outside the studio.
_Avoid_: sidecar metadata, prompt note

**Local Asset**:
Image file stored in a Studio Library and served to the UI through `/library/...`.
_Avoid_: blob, attachment

### Jobs and execution

**Persistent Job**:
SQLite-backed backend job that survives UI reloads and tracks local execution state.
_Avoid_: visual job, queue row

**Codex Turn**:
One `codex app-server` turn executed by the backend for a local image task.
_Avoid_: generation step, rpc call

**Local Codex Session**:
Capability snapshot that says whether the user's local Codex CLI ChatGPT login can run Codex Studio jobs right now.
_Avoid_: account status, API key session, remote auth

**App-Server Lifecycle**:
Backend supervision of `codex app-server`, including ensure reasons and the latest diagnostics.
_Avoid_: just process supervisor, websocket status

### Frontend seams

**Visual Batch**:
UI-facing `GenerationBatch` cache materialized from Catalog Entries and persisted in IndexedDB for the current grid.
_Avoid_: durable catalog record, source of truth

**Local Studio Sync**:
Frontend seam that mirrors backend jobs, logs, and live events while importing Catalog Entries into the Visual Batch cache.
_Avoid_: polling loop, ad-hoc refresh code

**Local Generation Run**:
Frontend seam that creates Persistent Jobs, waits for completion, queries catalog results, and returns one Visual Batch.
_Avoid_: inline job choreography, direct editor pipeline

**Studio Runtime**:
Frontend runtime adapter that resolves how the renderer reaches the local backend in web or desktop contexts.
_Avoid_: readiness state, onboarding snapshot

**Studio Shell**:
Frontend seam that materializes navigation, overlays, Studio Runtime state, and Visual Batch presentation into one renderable layout for the app shell.
_Avoid_: AppContent glue, root orchestrator

**Studio Readiness**:
Frontend ready-or-blocked snapshot built from Studio Runtime, backend health, Studio Library, App-Server Lifecycle, and Local Codex Session.
_Avoid_: simple health boolean, account check

## Relationships

- A **Library Registry** tracks one or more **Studio Libraries** and exactly one default library at a time.
- One **Studio Library** contains many **Local Assets** and contributes many **Catalog Entries** to the **Image Catalog**.
- A **Catalog Page** contains many **Catalog Entries**.
- A generation-flavored **Persistent Job** executes one or more **Codex Turns**.
- A **Local Generation Run** creates one or more **Persistent Jobs** and materializes one **Visual Batch** for the UI.
- **Local Studio Sync** imports **Catalog Entries** into **Visual Batches** for the current grid.
- **Studio Shell** materializes **Studio Runtime**, navigation state, overlays, and **Visual Batches** into the renderable app layout.
- **Studio Readiness** depends on **Studio Runtime**, **Studio Library**, **App-Server Lifecycle**, and the **Local Codex Session**.

## Example dialogue

> **Dev:** "When a generation finishes, do we render the **Catalog Entry** directly?"
> **Domain expert:** "Not yet — the backend persists the **Catalog Entry**, then **Local Studio Sync** imports it into a **Visual Batch** so the current grid keeps working."
>
> **Dev:** "So what actually blocks the user from generating?"
> **Domain expert:** "**Studio Readiness** does; it combines backend health, the **Studio Library**, the **App-Server Lifecycle**, and the **Local Codex Session** into one answer."

## Flagged ambiguities

- `CONTEXT.md` is glossary-only; system shape belongs in `docs/ARCHITECTURE.md`, and hard-to-reverse trade-offs belong in `docs/adr/`.
- **Visual Batch** is a UI compatibility cache, not the durable source of truth; the durable record is the **Catalog Entry** in the **Image Catalog**.
- **Studio Runtime** names the backend-resolution adapter; readiness and onboarding status belong to **Studio Readiness**.
- **Local Codex Session** is the local ChatGPT-login capability snapshot; avoid calling it "account status" except when referring to the compatibility endpoint `/api/codex/account`.
