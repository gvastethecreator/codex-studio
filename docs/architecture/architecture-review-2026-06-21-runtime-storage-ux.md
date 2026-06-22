# Architecture review - Codex Studio runtime storage and UX

Date: 2026-06-21

## Summary

- The app feels heavy mostly because hot UI reads still cross large durable records. The Image Catalog and job list interfaces can parse full `source_spec_json`, `generation_config`, prompts, logs, and job detail where the user only needs summaries.
- The active Studio Library snapshot shows storage pressure in four places: SQLite payloads, Codex transcripts, reference files, and process logs. This review measured counts and sizes only; prompt and transcript contents were not read.
- Current code already fixed the worst inline-image persistence path for recent jobs, but historical rows still keep large payloads and the DB has not been compacted.
- Local Studio Sync improved with a shared SSE adapter, but job waiting and catalog invalidation still do broad catch-up work that makes generation completion feel less seamless.
- The next improvements should be small and boring: summary read interfaces, a dry-run storage audit, retention/rotation, and scoped refresh.

## Second review agreement

A second read-only architecture pass challenged the implementation risk and reached this agreement:

- This review is a refinement of the accepted 2026-06-19 front-performance batch, not a separate roadmap.
- Summary interfaces must cross the real `dbStore` and `catalogStore` seams in `appFactory`, not only the concrete `db.ts` and `catalog.ts` helpers.
- Compaction must preserve ADR-0021/ADR-0022 semantics: the Generation Task Spec remains durable, and omitted historical inline bytes must be marked honestly. Do not pretend old inline assets are retryable if no local path can be reconstructed.
- `storage:compact --write` must be guarded by dry-run, explicit confirmation, backup, and guidance to stop the local server first.
- Sync should consume typed `catalog.*` events directly. Enriching only `asset.created` would miss the existing backend event shape.
- The hot path also needs cheap indexes for `jobs.created_at`, `job_events(job_id, id)`, and `codex_turns(job_id, updated_at)`.
- `needs_review` is currently terminal for `watchJob()` but active for sync counts; any future `waitForJob()` work must resolve that semantic explicitly.

## Evidence Snapshot

- SQLite file: 415.22 MB, 5,284 jobs, 4,746 Catalog Entries, 19,515 system log rows, 20,599 job event rows, 5,319 Codex turn rows.
- `jobs.source_spec_json`: 147 non-null rows sum to 133.57 MB; 55 historical rows contain `data:image` and sum to 133.08 MB. Max row is about 10.09 MB.
- `catalog_images.generation_config`: rows sum to 132.61 MB; 41 historical rows contain `data:image` and sum to 103.27 MB. Max row is about 10.09 MB.
- Recent rows are better: 2026-06-18 through 2026-06-21 have zero `data:image` rows in job specs and catalog configs.
- Transcripts: 575 files, 706.64 MB. Largest single transcript is about 5.07 MB.
- Logs: 44.95 MB. `app-server.log` is 41.4 MB.
- References: 140 files, 221.75 MB.
- Outputs: 4,247 files, 645.72 MB including 4,045 thumbnails at 127.21 MB.

## Recommendations

### 1. Add hot-list summary interfaces for jobs and Catalog Pages

**Recommendation strength**: Strong

**Files**

- `apps/local-server/src/db.ts`
- `apps/local-server/src/catalog.ts`
- `apps/local-server/src/jobRoutes.ts`
- `apps/local-server/src/catalogRoutes.ts`
- `services/localStudioService.ts`
- `hooks/useCatalog.ts`
- `hooks/useLocalStudioSync.ts`
- `components/StudioChatPanel.tsx`
- `packages/shared/src`

**Problem**

The hot list modules are shallow. `listJobs()` returns full `Job` records and parses `source_spec_json`; `queryCatalog()` maps `generation_config` for every Catalog Entry in a page. Some historical rows are 10 MB. The interface forces callers to pay detail cost even when the implementation only needs id, status, created time, provider, thumbnail URL, and a prompt preview.

Deletion test: deleting the list modules would not remove the complexity. Every caller would still need to avoid full payload reads in hot paths.

**Solution**

Deepen hot-list read modules:

- `listJobSummaries()` for `/api/jobs` by default.
- `queryCatalogSummaries()` for `/api/catalog` by default.
- detail endpoints keep full payload access on demand.
- summaries expose prompt preview, counts, status, URLs, and timestamps, not full `sourceSpec` or full `generationConfig`.

**Benefits**

- locality: full payload parsing moves to job/catalog detail modules.
- leverage: Command Center, Chat, Queue, Grid, and Sync share one cheaper read interface.
- tests: seed one 10 MB historical row and prove list endpoints do not parse or return it.

**Before / After**

- Before: a list read can parse and ship detail payloads.
- After: list reads are compact; details are explicit and demand-loaded.

**Dependencies / sequencing**

- Do this first. It improves perceived speed before any data migration.
- It also lowers risk while compacting historical data.

**Documentation follow-ups**

- Update `docs/ARCHITECTURE.md` for Job Summary and Catalog Page summary behavior.
- Update `docs/TECHNICAL_DEBT.md` catalog-first notes.

### 2. Add a Storage Budget module and historical compaction command

**Recommendation strength**: Strong

**Files**

- `apps/local-server/src/db.ts`
- `apps/local-server/src/catalog.ts`
- `apps/local-server/src/jobRoutes.ts`
- `apps/local-server/src/referenceManager.ts`
- `lib/browserPersistenceBudget.ts`
- `scripts/`
- `package.json`

**Problem**

Browser persistence has a 512 KB inline attachment budget, but SQLite does not have the same durable budget. Older jobs and Catalog Entries stored inline image payloads in `source_spec_json` and `generation_config`. The current code appears to prevent new rows from repeating the worst issue, but historical payloads keep the database large.

Deletion test: deleting old rows would remove data, not complexity. The real missing module is a retention-safe storage budget interface.

**Solution**

Add the minimum maintenance path:

- `storage:audit`: report oversized DB fields, inline `data:image` markers, DB/WAL size, transcript/log/reference sizes.
- `storage:compact --dry-run`: plan replacements without mutating.
- `storage:compact --write`: replace inline image data in historical JSON with local reference facts: path when available, hash, byte count, mime, and `omittedInlinePayload: true`.
- Run `VACUUM` only as an explicit final step after a successful write plan.

Keep new writes under the same rule: references are Local Asset or Reference paths, not inline DB payloads.

**Benefits**

- locality: storage ceilings live in one module instead of route-specific conventions.
- leverage: jobs, catalog, queue recovery, and future providers share one budget rule.
- tests: fixture DB with inline payload proves dry-run counts, write compaction, and no prompt loss.

**Before / After**

- Before: browser storage has a budget; SQLite relies on caller discipline.
- After: every durable payload crosses one budget interface.

**Dependencies / sequencing**

- Do after recommendation 1 so UI hot paths are cheaper before migration.
- The command must be dry-run by default.

**Documentation follow-ups**

- Update `SKILLS.md` under token/storage audits.
- Add a maintenance note to `docs/TECHNICAL_DEBT.md`.

### 3. Split full transcripts from durable job summaries

**Recommendation strength**: Strong

**Files**

- `apps/local-server/src/codex/turn.ts`
- `apps/local-server/src/jobDetails.ts`
- `apps/local-server/src/worker.ts`
- `apps/local-server/src/providers/externalProviderResults.ts`
- `apps/local-server/src/library.ts`
- `components/JobInspectorDetail.tsx`
- `scripts/`

**Problem**

Codex transcripts are useful, but the full transcript module is acting as the long-term durable trace. The active library has 575 transcript files at 706.64 MB. `getJobDetail()` already reads only the tail for UI, which proves the detail interface does not usually need full historical JSONL.

Deletion test: deleting transcripts would remove auditability. The missing module is a deeper job trace interface that separates summary from full transcript retention.

**Solution**

Create a compact job trace summary during or after execution:

- provider, model, task, duration, asset count, token usage when available, transcript path, and last relevant status.
- Keep full transcript files for recent jobs, failed jobs, and pinned jobs.
- Compress or archive older full transcripts with an explicit retention command.
- Job Inspector loads the summary first and offers full transcript only when present.

**Benefits**

- locality: transcript retention lives in one trace module.
- leverage: Job Inspector, metrics, diagnostics, and export reports share the same compact trace.
- tests: old transcript fixture still yields a useful job detail without loading full JSONL.

**Before / After**

- Before: full JSONL is the durable trace.
- After: compact summary is durable; full JSONL is retained by policy.

**Dependencies / sequencing**

- Do after recommendation 2 defines the storage budget.
- Preserve full transcripts until the summary path is proven.

**Documentation follow-ups**

- Update `docs/ARCHITECTURE.md` for Codex Turn and job trace behavior.
- Add a retention section to `docs/TROUBLESHOOTING.md`.

### 4. Add log rotation and SQL log retention

**Recommendation strength**: Strong

**Files**

- `apps/local-server/src/logger.ts`
- `apps/local-server/src/codex/processSupervisor.ts`
- `apps/local-server/src/db.ts`
- `apps/local-server/src/assetLogRoutes.ts`
- `hooks/localStudioSyncProjection.ts`

**Problem**

Backend logs are written twice: JSONL files and `system_logs`. The DB rows are small, but they keep accumulating and add UI noise. The process log file is larger: logs total 44.95 MB and `app-server.log` is 41.4 MB.

Deletion test: deleting log files removes evidence but not logging policy. The log module needs depth: write, rotate, retain, and summarize behind one interface.

**Solution**

Add one rotating log writer used by `logger.ts` and `processSupervisor.ts`:

- max file size, max history files, and line cap.
- move old logs to `.studio/logs/history`.
- prune `system_logs` by rows or days after insert.
- keep `/api/logs` as a recent UI feed, not a durable archive.

**Benefits**

- locality: retention and rotation change in one module.
- leverage: app-server, worker, studio, and UI log feeds share one policy.
- tests: write past threshold and prove rotation plus recent SQL row cap.

**Before / After**

- Before: append forever, show only latest 300.
- After: retain recent logs intentionally and archive bounded history.

**Dependencies / sequencing**

- Can run independently after recommendation 1.
- Keep defaults conservative.

**Documentation follow-ups**

- Update `docs/TROUBLESHOOTING.md` with latest log and history locations.
- Update `docs/TECHNICAL_DEBT.md` to replace "uniform frontend logging" with the accepted logging policy.

### 5. Give Local Studio Sync job waiting and scoped invalidation ownership

**Recommendation strength**: Strong

**Files**

- `services/studioEventSource.ts`
- `hooks/useLocalStudioSync.ts`
- `hooks/localStudioSyncRefreshPolicy.ts`
- `services/localGenerationRun.ts`
- `apps/local-server/src/events.ts`
- `apps/local-server/src/workerAssetFinalizer.ts`

**Problem**

The SSE adapter is shared, but the Local Studio Sync module still does broad work. `watchJob()` performs job-list catch-up per job, and asset events call `refreshBackendState()`, which fetches jobs and logs and then refreshes all three Catalog Pages.

Deletion test: deleting the EventSource adapter would scatter transport code. Deleting the sync hook would still leave job waiting and catalog invalidation elsewhere.

**Solution**

Deepen Local Studio Sync:

- expose `waitForJob(jobId)` from the sync module.
- keep one in-memory job map fed by SSE plus a single catch-up read.
- publish asset/catalog events with job id, catalog id, workspace id, and deleted state.
- refresh or insert only affected Catalog Page state when possible.

**Benefits**

- locality: reconnect, job waiting, and catalog invalidation live together.
- leverage: generation runs, queue, activity, and grid share one runtime event truth.
- tests: during a batch, prove one stream, one catch-up, and scoped catalog updates.

**Before / After**

- Before: generation completion waits through a stream plus list catch-up, then broad refresh.
- After: generation completion resolves from sync state and updates the visible catalog directly.

**Dependencies / sequencing**

- Do after recommendation 1, before more shell work.
- Scoped catalog updates depend on richer event payloads.

**Documentation follow-ups**

- Update `docs/ARCHITECTURE.md` Local Studio Sync section.
- Update the current findings index in `docs/architecture/DEEPENING-ROADMAP.md`.

### 6. Move bulk Catalog commands to full-scope backend operations

**Recommendation strength**: Strong

**Files**

- `apps/local-server/src/catalogCommands.ts`
- `apps/local-server/src/catalogRoutes.ts`
- `apps/local-server/src/catalog.ts`
- `hooks/useCatalog.ts`
- `hooks/useStudioActionConfirmations.ts`

**Problem**

The Catalog Page interface is paginated, but bulk actions still operate over loaded entries in the client. Clearing a workspace, restoring all trash, or emptying trash can silently mean "only what is loaded." That is both slow and not seamless.

Deletion test: deleting pagination would hide the bug by loading more, but it would make large libraries worse.

**Solution**

Add backend commands that operate by explicit filter:

- archive workspace by `workspaceId`.
- restore trash by filter.
- empty trash by filter.
- return counts and affected ids or a compact change summary.

Use transactions and keep destructive file operations inside managed Local Asset paths only.

**Benefits**

- locality: full-scope mutation rules live in Catalog command modules.
- leverage: grid, trash, workspace strip, and future batch tools share one command interface.
- tests: seed more than one page and prove full-scope commands affect the intended rows.

**Before / After**

- Before: client loops over loaded page entries.
- After: backend owns full-scope catalog intent.

**Dependencies / sequencing**

- Do after recommendation 5 if scoped invalidation will consume command summaries.
- Keep confirmations in the UI.

**Documentation follow-ups**

- Update `docs/ARCHITECTURE.md` Image Catalog command behavior.
- Update `docs/DESIGN.md` for honest bulk-action copy.

### 7. Split Style Browser session from style application behavior

**Recommendation strength**: Worth exploring

**Files**

- `components/recipes/StylesRecipe.tsx`
- `components/recipes/styleBrowserRenderPlan.ts`
- `components/recipes/styleGridVirtualization.ts`
- `components/recipes/stylesData.ts`
- `lib/recipeModules.ts`

**Problem**

The Style Browser is chunked and render-budgeted, but the React surface still mixes pack loading, favorites, search, viewport mounting, visual result lookup, and generation parameter assembly. This keeps UI browsing and generation semantics too close.

Deletion test: deleting `StylesRecipe.tsx` would scatter the behavior. The module has leverage, but the interface exposes too much implementation.

**Solution**

Deepen two modules:

- Style Browser Session: pack/search/favorites/loading/render-plan state.
- Style Application: selected Style Preset Manifest to generation params.

React should collect choices and render state, not own style application semantics.

**Benefits**

- locality: browser performance bugs do not require editing generation behavior.
- leverage: style application can be tested without mounting the Styles surface.
- tests: failed pack load, render budget, and generated params each have focused checks.

**Before / After**

- Before: one React surface owns browsing and application.
- After: browsing and application cross separate seams.

**Dependencies / sequencing**

- Do after storage and catalog work, unless Styles UI becomes the current bottleneck.

**Documentation follow-ups**

- Update `SKILLS.md` only if the style workflow commands change.
- Update `docs/ARCHITECTURE.md` Recipe Module / Style Preset sections.

### 8. Consolidate Studio Readiness refresh ownership

**Recommendation strength**: Worth exploring

**Files**

- `hooks/useStudioRuntime.ts`
- `hooks/useStudioDiagnostics.ts`
- `hooks/useStudioOnboarding.ts`
- `hooks/useStudioSessionVerifier.ts`
- `hooks/useGenerationConfig.ts`

**Problem**

Studio Readiness is derived in one place, but freshness still has several owners. Diagnostics polls health/session, onboarding reads health, session verification reads health/session, and refresh runtime runs several reads together. This is not the largest storage issue, but it contributes to the "heavy" feel.

Deletion test: deleting one hook does not remove readiness complexity; it moves the same fetch policy to another caller.

**Solution**

Add a small readiness data module that owns cached health/session/model freshness and exposes projections for onboarding, diagnostics, toolbar, and verification.

**Benefits**

- locality: refresh timing and fallback behavior live in one module.
- leverage: Command Center, onboarding, and toolbar use one readiness truth.
- tests: request counters prove mount and manual refresh do not overlap needlessly.

**Before / After**

- Before: several modules fetch overlapping runtime facts.
- After: one readiness data seam owns freshness.

**Dependencies / sequencing**

- Do after Local Studio Sync and log retention; measure duplicate requests first.

**Documentation follow-ups**

- Update `docs/ARCHITECTURE.md` Studio Readiness.
- ADR update only if the ownership decision changes product semantics.

## Suggested execution order

1. Add hot-list summary interfaces. Cheapest speed win and reduces risk for every later step.
2. Add cheap SQLite indexes for the current hot plans.
3. Add read-only storage audit and dry-run compact planning. Find exact recoverable SQLite savings before writing.
4. Add conservative log rotation and SQL log retention.
5. Move bulk Catalog commands to backend full-scope operations. Fixes partial actions and large-library UX.
6. Give Local Studio Sync job waiting and scoped invalidation ownership. Makes generation completion feel instant instead of refresh-heavy.
7. Add transcript summaries before any transcript retention.
8. Split Style Browser session from style application behavior only when Styles UI is the active bottleneck.
9. Consolidate Studio Readiness refresh ownership after measuring duplicated reads.

## Documentation fan-out if accepted

- `docs/ARCHITECTURE.md`: update Job Summary, Catalog Page, Local Studio Sync, Codex Turn, logs, and Studio Readiness sections.
- `docs/architecture/DEEPENING-ROADMAP.md`: set this file as an accepted review batch and add statuses.
- `docs/TECHNICAL_DEBT.md`: replace stale storage/log/readiness notes with this ordered queue.
- `SKILLS.md`: add `storage:audit` / `storage:compact` only after the commands exist.
- `docs/TROUBLESHOOTING.md`: document log history and transcript retention once implemented.
- `docs/adr/0031-summary-first-hot-reads-and-storage-budgets.md`: accepted decision for summaries, audits, compaction guards, and retention policy.
- `docs/active/runtime-storage-ux-plan-2026-06-21.md`: implementation plan and follow-up task list.
