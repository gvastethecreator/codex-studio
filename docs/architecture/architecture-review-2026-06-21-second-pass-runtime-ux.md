# Architecture review - Codex Studio second-pass runtime UX

Date: 2026-06-21

## Scope

This is a second-pass audit after the runtime-storage-UX batch. It intentionally avoids re-opening the same summary-first jobs, catalog payload, SQL log rotation, and guarded storage-compaction work from `architecture-review-2026-06-21-runtime-storage-ux.md`.

The question here is: what else can make Codex Studio feel heavy during image-heavy work, and what maintenance work reduces storage churn without turning the architecture into a bigger machine?

## Evidence snapshot

- Repo-local tooling logs: 2,513 files, 68.93 MB under `logs/tooling`.
- Studio references: 140 files, 232.52 MB under `.studio/references`.
- Reference dedupe check: 140 files collapse to 27 unique SHA-256 hashes; about 182.50 MB is duplicate reference payload.
- Catalog images: 4,746 rows; review snapshot found 921 rows with no `thumbnail_path` / `thumbnail_url`. First maintenance backfill warmed 137 recoverable rows, leaving 784 source-missing rows.
- Thumbnail files: 4,045 files, 133.39 MB under `outputs/thumbnails`.
- Catalog prompt text: about 28.98 MB total, max prompt length 19,913 chars.
- `job_events` metadata and `system_logs` message payloads are not the main storage pressure in this snapshot.

## Recommendations

### 1. Add a content-addressed Reference Store

**Recommendation strength:** Strong

**Files**

- `apps/local-server/src/referenceManager.ts`
- `apps/local-server/src/jobRoutes.ts`
- `apps/local-server/src/codex/turnInput.ts`
- `apps/local-server/src/jobDetails.ts`
- `scripts/studio-storage-maintenance.ts`

**Problem**

Reference files are persisted per job under `.studio/references/<jobId>/`. That is simple and debuggable, but repeated style-card and edit workflows reuse the same image many times. The current snapshot has 140 reference files but only 27 unique content hashes, so most reference bytes are duplicates.

Deletion test: deleting old references would recover space but would also break retry, traceability, and job detail previews. The missing module is not a cleanup script; it is a deeper reference identity module.

**Solution**

Introduce a content-addressed store for reference payloads:

- store unique reference bytes by hash under a managed `.studio/reference-blobs/<sha256>.<ext>` path;
- keep per-job reference manifests under `.studio/references/<jobId>/manifest.json`;
- record original name, role, strength, mime, byte size, hash, and blob path;
- keep existing per-job paths readable during migration;
- add a dry-run dedupe command before any write path.

New jobs should hydrate references to local blob paths and job manifests instead of copying duplicate bytes per job.

**Benefits**

- locality: reference identity, dedupe, and retention live in one module.
- leverage: retries, Job Inspector, provider input building, and storage audit share the same reference facts.
- storage: current snapshot suggests about 182.50 MB of avoidable duplicate reference bytes.

**Sequencing**

Do this before aggressive reference retention. Retention without identity risks deleting useful artifacts; identity makes later retention safer.

### 2. Move thumbnail fallback out of the hot HTTP path

**Recommendation strength:** Strong

**Files**

- `apps/local-server/src/libraryRoutes.ts`
- `apps/local-server/src/libraryAssetVariants.ts`
- `apps/local-server/src/workerAssetFinalizer.ts`
- `apps/local-server/src/outputSources.ts`
- `lib/studioCatalogImageAdapter.ts`
- `scripts/studio-storage-maintenance.ts`

**Problem**

The gallery adapter asks for `?variant=thumb` when a Catalog Entry has no stored thumbnail URL. The library route then calls `ensureThumbnailVariant()` inside the HTTP request. The review snapshot had 921 historical entries with no thumbnail path; the first maintenance backfill warmed 137 recoverable rows, while 784 remaining rows point at missing source files and need orphan cleanup instead of route-time generation.

Recent generated images are healthier because worker finalization already creates thumbnails. The remaining risk is the cold historical path and any future import/source path that misses thumbnail materialization.

Deletion test: deleting the HTTP fallback would make old images show originals or broken thumbnails. The missing module is a thumbnail manifest/warmup path, not more route logic.

**Solution**

- Keep the HTTP fallback as a safety net only.
- Add `storage:audit` coverage for missing catalog thumbnails.
- Add a dry-run/write thumbnail backfill command that warms missing `thumbnail_path` rows in bounded batches.
- Ensure image imports and worker finalization remain the primary thumbnail writers.
- Consider a small in-memory semaphore for `ensureThumbnailVariant()` so many cold thumbnail requests cannot saturate CPU at once.

**Benefits**

- gallery cold-start feels more like file serving, less like background image processing.
- maintenance can fix historical rows without needing users to scroll every old image.
- the UI can keep using thumbnail URLs without knowing whether the row is old or new.

**Sequencing**

Do after the reference-store audit or in parallel. It is lower data-risk than reference dedupe because thumbnail variants are derivable.

### 3. Add retention for repo-local tooling logs

**Recommendation strength:** Strong

**Files**

- `scripts/tooling-task.ts`
- `package.json`
- `.gitignore`

**Problem**

The tooling wrapper writes one timestamped log for each `bun run check`, `test`, `build`, and related task, then copies a `.latest.log`. The logs are ignored by git, but they still accumulate in the repo worktree. In this snapshot `build` accounts for most bytes: 323 files and about 57.10 MB.

Deletion test: deleting `logs/tooling` recovers space, but the next long session starts accumulating again. The missing module is a local retention policy at log-write time.

**Solution**

- Keep `.latest.log` for every task.
- After each tooling task, prune timestamped logs by per-task count and/or age.
- Add a manual `tooling:logs:prune` command for cleanup without running a validation task.
- Default to conservative retention, for example latest 20 timestamped logs per task or 14 days.

**Benefits**

- local validation remains debuggable;
- long image-generation sessions stop silently growing repo-local logs;
- the final validation loop stays lightweight to inspect.

**Sequencing**

Small, safe maintenance slice. It can land independently.

### 4. Keep readiness refresh consolidation, but measure it first

**Recommendation strength:** Worth doing, measurement first

**Files**

- `hooks/useStudioRuntime.ts`
- `hooks/useStudioDiagnostics.ts`
- `hooks/useStudioOnboarding.ts`
- `hooks/useStudioSessionVerifier.ts`
- `hooks/useGenerationConfig.ts`
- `services/localStudioService.ts`

**Problem**

Runtime freshness still has multiple owners: diagnostics polls health/session, onboarding owns separate health state, session verification fetches health/session again, and generation config owns Codex model catalog freshness. This was already noted in the prior review; this pass confirms the pattern is still visible in current files.

This is probably not the biggest storage issue, but it contributes to the "heavy" feel because startup and manual refresh can overlap requests and state updates.

**Solution**

Before refactoring, add a small request-counter test/harness for app mount and `refreshRuntime()`. If duplicated requests are measurable, introduce a cached readiness data module with:

- freshness timestamps;
- refresh reasons;
- shared health/session/model state;
- projections for onboarding, diagnostics, toolbar, and verification.

**Benefits**

- less duplicate startup work;
- one source of truth for "ready", "blocked", and "needs action";
- fewer state churn points in `useStudioShell`.

**Sequencing**

Do not start with a large cache abstraction. First prove the request count and overlap.

### 5. Gate Catalog Search FTS on latency, not instinct

**Recommendation strength:** Worth exploring

**Files**

- `apps/local-server/src/catalog.ts`
- `apps/local-server/src/db.ts`
- `services/localStudioService.ts`
- `hooks/useCatalog.ts`

**Problem**

Catalog search currently uses `(prompt LIKE ? OR tags LIKE ?)` while also filtering by `is_deleted`. SQLite uses the deleted/created index first, then applies the LIKE filter. With 4,746 images this is probably acceptable, but prompt text is already about 28.98 MB total and will grow with image-heavy work.

Deletion test: deleting search would remove the cost but also remove a core library workflow. The missing module is not search itself; it is a measured search backend decision.

**Solution**

- Add query timing to `storage:audit` or a new `catalog:audit` command.
- Set a threshold, for example p95 search over representative terms above 100 ms or catalog rows above 10k.
- Only then add an FTS5 table for prompt/tags or a compact searchable projection.

**Benefits**

- avoids premature database complexity;
- creates a clear trigger for when simple LIKE search stops being good enough;
- keeps catalog search behavior testable.

**Sequencing**

Measure first. Implement FTS only when the simple plan is proven to hurt.

### 6. Consider async External Output Source imports for larger batches

**Recommendation strength:** Worth exploring

**Files**

- `apps/local-server/src/outputSources.ts`
- `apps/local-server/src/outputSourceRoutes.ts`
- `components/StudioSettingsModal.tsx`
- `hooks/useStudioSettings.ts`

**Problem**

External Output Source import copies selected files and awaits thumbnail generation inside the request loop. The limit is bounded, but a 100-file import can still make Settings feel blocked because file copy, stats, thumbnail generation, and catalog inserts happen synchronously from the user's perspective.

Deletion test: deleting import removes a safe workflow. The missing module is progress-aware import execution, not less safety.

**Solution**

Keep explicit import registration, but consider routing large imports through a backend job-like command with progress events:

- small imports can stay synchronous;
- large imports return an import operation id;
- Settings listens to progress and lets the user continue working.

**Benefits**

- preserves the safe import boundary;
- avoids a heavy Settings modal during bulk imports;
- reuses the same event/maintenance thinking as generation jobs.

**Sequencing**

Only do this if real users import larger batches. The current storage and thumbnail fixes are higher leverage.

## Suggested execution order

1. Add tooling-log retention. Smallest safe win.
2. Add reference dedupe audit command and design the content-addressed Reference Store.
3. Backfill missing thumbnails in bounded batches and keep HTTP generation as fallback only.
4. Add readiness request counters; consolidate freshness only if counters show overlap.
5. Add catalog search timing to storage/catalog audit; defer FTS until threshold.
6. Revisit async import operations if Settings import feels blocked in real use.

## What not to do yet

- Do not delete references just because they are large. Most are tied to jobs, not orphaned.
- Do not replace SQLite search with FTS until there is a measured latency trigger.
- Do not add a broad background worker framework just for thumbnails; a bounded maintenance command plus fallback semaphore is enough for now.
- Do not move Job Inspector work first. Current detail loading already reads transcript tails and renders collapsed timeline items, so it is not the top second-pass bottleneck.
