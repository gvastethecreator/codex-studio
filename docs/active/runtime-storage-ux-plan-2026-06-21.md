# Runtime, storage, and seamless UX plan - 2026-06-21

## Goal

Make Codex Studio feel lighter and more seamless under heavy image-generation work while preserving local-first traceability. The plan is a refinement of the accepted front-performance batch, not a separate roadmap.

Primary review: `docs/architecture/architecture-review-2026-06-21-runtime-storage-ux.md`.

Decision anchor: `docs/adr/0031-summary-first-hot-reads-and-storage-budgets.md`.

## Consensus

Main review and second-agent critique agreed on the order:

1. Summary-first hot reads before data migration.
2. Cheap SQLite indexes for existing hot plans.
3. Read-only storage audit before any write compaction.
4. Conservative log rotation and SQL log retention.
5. Full-scope backend catalog commands with dry-run/counts and path safety.
6. Local Studio Sync ownership over typed catalog events and bounded job waiting.
7. Provider-neutral Job Trace Summary before transcript retention.
8. Defer Style Browser and Studio Readiness work unless new measurements put them back above storage/sync.

## Round 1 implementation

- Done: `JobSummary` contract added in shared types.
- Done: backend job listing can use `listJobSummaries()` without selecting `source_spec_json`.
- Done: catalog page listing no longer selects/parses `generation_config` by default.
- Done: job detail uses catalog detail reads when full config is needed.
- Done: hot-plan indexes added for jobs, job events, and Codex turns.
- Done: `storage:audit` command reports DB/WAL/SHM, row counts, oversized payload fields, and directory sizes without content.
- Done: `storage:compact` is dry-run by default; write mode requires `--write --confirm=compact-inline-payloads`, checkpoints WAL, creates a backup, and only then rewrites inline image payloads.
- Done: one rotating log writer is shared by studio/worker/error logs and `app-server.log`.
- Done: SQL `system_logs` retention prunes to a bounded recent set after insert.
- Done: backend Catalog batch commands can archive, restore, and purge by explicit filter, returning counts and failures.
- Done: clear-workspace, restore-all-trash, and empty-trash UI hooks call backend full-scope commands instead of iterating only loaded Catalog Page entries.
- Done: shared Studio Event Stream exposes `onCatalogChanged()` and Local Studio Sync consumes `catalog.created` / `catalog.updated` / `catalog.deleted` events.
- Done: `StudioEvent` is now a discriminated union for known job, asset, catalog, log, and connection events.
- Done: Job Detail exposes a provider-neutral `traceSummary` built from durable job, event, turn, and catalog facts.
- Done: storage compaction reports recoverable vs non-recoverable omitted inline payloads using adjacent `localPath` existence checks.
- Done: `storage:audit` reports missing catalog thumbnails, reference dedupe stats, and repo-local tooling log size.
- Done: `storage:thumbnails:backfill` provides dry-run/write bounded batches for missing historical catalog thumbnails; first write batch warmed 137 recoverable rows and left 784 source-missing rows for orphan-metadata cleanup.
- Done: tooling task logs prune timestamped history after each run and expose `tooling:logs:prune`.
- Done: Studio Settings exposes Storage Maintenance via `/api/maintenance`, so audit, compact plan/write, thumbnail backfill plan/write, and tooling-log pruning can run from the app with guarded write confirmations.

## Next implementation tasks

### 1. Backend full-scope Catalog commands

Status: implemented for archive/restore/purge by filter; partial-failure UX copy can still improve.

Files: `apps/local-server/src/catalogCommands.ts`, `apps/local-server/src/catalogRoutes.ts`, `apps/local-server/src/catalog.ts`, `hooks/useCatalog.ts`, `hooks/useStudioActionConfirmations.ts`.

Tasks:

- Done: add commands that operate by explicit filter, not loaded page entries.
- Done: return count summaries for clear workspace, restore trash by filter, and empty trash by filter.
- Keep destructive filesystem operations inside managed Local Asset paths.
- Done: handle partial failures with explicit result fields.
- Done: test command behavior with multiple matching entries.

Exit criteria: UI bulk actions tell the truth about full-scope impact and do not depend on what the client happened to load.

### 2. Local Studio Sync scoped invalidation

Status: partial.

Files: `services/studioEventSource.ts`, `hooks/useLocalStudioSync.ts`, `hooks/localStudioSyncProjection.ts`, `apps/local-server/src/events.ts`, `apps/local-server/src/workerAssetFinalizer.ts`.

Tasks:

- Done: consume `catalog.*` events directly instead of treating only `asset.created` as catalog change.
- Done: type `StudioEvent` as a discriminated union for job, asset, catalog, log, and connection events.
- Add `waitForJob(jobId)` ownership to Local Studio Sync with one shared catch-up read.
- Resolve `needs_review` semantics consistently across wait and active-count projections.
- Scope catalog refresh/insertion to affected job/catalog/workspace when event payload allows it.

Exit criteria: batch generation uses one event truth, one bounded catch-up, and avoids broad catalog refreshes after every asset event.

### 3. Job Trace Summary and transcript retention

Status: partial.

Files: `apps/local-server/src/codex/turn.ts`, `apps/local-server/src/jobDetails.ts`, `apps/local-server/src/worker.ts`, `apps/local-server/src/providers/externalProviderResults.ts`, `docs/TROUBLESHOOTING.md`.

Tasks:

- Done: expose provider-neutral summary data in Job Detail: provider, model, task, duration, asset count, token usage when available, transcript path, and final status.
- Persist the summary as a dedicated row only after transcript retention needs it.
- Load Job Inspector summary first; load transcript tail only on demand.
- Add transcript audit/retention planning to storage commands after summaries are verified.
- Preserve recent, failed, `needs_review`, and pinned transcripts.

Exit criteria: full JSONL transcripts are no longer the only durable trace.

### 4. Storage compaction hardening

Status: partial follow-up.

Files: `scripts/studio-storage-maintenance.ts`, `apps/local-server/src/referenceManager.ts`.

Tasks:

- Done: add localPath existence checks and report recoverable vs non-recoverable inline payloads.
- Done: add focused compaction tests for inline omission, recoverability, and reference dedupe stats.
- Add optional post-write `VACUUM` guidance to troubleshooting.
- Keep write mode off release gates; it is a user-invoked maintenance action.

Exit criteria: compaction reports exact recoverability and never surprises users with destructive behavior.

## Validation plan

Run focused checks for this round first:

```bash
bun run test -- apps/local-server/src/dbStore.test.ts apps/local-server/src/catalog.test.ts apps/local-server/src/rotatingLog.test.ts scripts/studio-storage-maintenance.test.ts
bun run check -- packages/shared/src/types.ts apps/local-server/src/db.ts apps/local-server/src/dbStore.ts apps/local-server/src/catalog.ts apps/local-server/src/jobDetails.ts apps/local-server/src/logger.ts apps/local-server/src/rotatingLog.ts apps/local-server/src/codex/processSupervisor.ts scripts/studio-storage-maintenance.ts
bun run storage:audit
```

Then close the broad round with:

```bash
bun run test
bun run check
bun run build
```
