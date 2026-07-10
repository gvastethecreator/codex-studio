# Codex Studio architecture workplan

Status: Complete

Accepted: 2026-07-10

Completed: 2026-07-10

## Sources

- [General performance and architecture review](./architecture-review-2026-07-10-app-performance.md)
- [Animation Sequence architecture review](./architecture-review-2026-07-10-animation-sequence.md)
- [Technical-debt audit](./technical-debt-audit-2026-07-10.md)
- [Maintenance report](./maintenance-report-2026-07-10.md)
- [ADR 0002](../adr/0002-animation-sequence-workflow.md)
- [ADR 0003](../adr/0003-studio-readiness-snapshot-lifecycle.md)
- [ADR 0004](../adr/0004-durable-studio-event-revisions.md)
- [ADR 0005](../adr/0005-persistent-jobs-as-queue-truth.md)

## Completed slices

### A. Studio Readiness lifecycle

- [x] Async Runtime Doctor subprocess adapter and single-flight snapshot lifecycle.
- [x] Cheap compatibility health read plus explicit snapshot/refresh endpoints.
- [x] One frontend readiness owner for onboarding, diagnostics, and session verification.
- [x] Provider-aware Persistent Job admission before side effects.

### B. Catalog Read Model

- [x] Compact summary/detail projections and on-demand detail hydration.
- [x] No per-row filesystem probes or full prompt/config payloads on hot pages.
- [x] Demand-mounted Trash reads and scoped invalidation.
- [x] Workspace summary aggregation reduced from seconds to single-digit milliseconds warm.

### C. Demand-Mounted shell details

- [x] Generation Dock, local generation execution, overlays, Settings detail, and Trash are demand-mounted.
- [x] Startup no longer performs the redundant all-workspace Catalog Page read.
- [x] Shared/ref-counted event ownership replaces repeated shell subscriptions.

### D. Revisioned Studio event synchronization

- [x] Monotonic revisions and SSE ids.
- [x] Bounded serialized client writes.
- [x] Gap detection and scoped snapshot reconciliation after reconnect.
- [x] Backend revision reset establishes a new client epoch after process restart.

### E. Persistent Jobs as queue truth

- [x] Browser IndexedDB queue persistence removed.
- [x] Every pending browser presentation item dispatches immediately to Persistent Job Intake; backend worker concurrency owns waiting.
- [x] Batch Persistent Jobs are created concurrently before results are awaited.
- [x] Browser queue state is session presentation only; refresh recovery uses backend jobs and Catalog Entries.

### F. Style Thumbnail Projection

- [x] Replaced 2,278 per-asset modules with eight paired pack-projection chunks behind a pack API.
- [x] Preserved manifest `assets.defaultImage` through projection-first loading.
- [x] Added generated-projection freshness checks and packaging budgets.
- [x] Final build: 246 JS chunks, 58 sub-1 KiB chunks, Styles route 77.27 KiB.

### G-I. Animation Sequence

- [x] Provider-independent Frame Handoff with correction assets and ordered recursive references.
- [x] Run Coordinator with dispatch linkage and Catalog reconciliation.
- [x] Browser-safe Run/Export views with filesystem paths kept backend-only.
- [x] Persistent generating/correcting states and refresh recovery.

### J. Recipe Module Catalog depth

- [x] Canonical title/indicator facts derive from the Recipe Module catalog.
- [x] Lazy route imports live in explicit adapters outside component modules.
- [x] Route preload behavior remains covered by tests.

### K. Technical debt closure

- [x] React Doctor errors and accessibility findings reduced to zero.
- [x] Missing dependencies, stale derived state, layout animation, unstable keys/defaults, unused exports, barrel imports, and safe async serialization findings resolved.
- [x] TODO/FIXME/HACK and deprecated compatibility markers reconciled.
- [x] Remaining analyzer heuristics classified in the technical-debt audit instead of forcing risk-only rewrites.

### L. Maintenance and cleanup

- [x] Dead queue/readiness/default-image modules removed.
- [x] Generated style projections consolidated and freshness-checked.
- [x] Supported tooling pruned old logs during final gates.
- [x] Studio Library, SQLite data, secrets, output folders, and active planning evidence preserved.
- [x] Full check, test, build, runtime, and browser gates passed.

## Final verification

| Gate         | Evidence                                                                                | Result                            |
| ------------ | --------------------------------------------------------------------------------------- | --------------------------------- |
| Tests        | 198 files / 728 tests                                                                   | Passed                            |
| Check        | 2,577 formatted files; 786 files with zero lint/type warnings                           | Passed                            |
| Build        | 246 JS chunks; main 453.62 KiB; Styles 77.27 KiB                                        | Passed                            |
| Runtime      | Health ~22 ms; Readiness revision 3, fresh; Codex 0.144.0 ready                         | Passed                            |
| Browser      | 1440x900 Recipes and Styles; no overflow, console/page/network errors, or broken images | Passed                            |
| React Doctor | 85/100; 0 errors; 0 accessibility warnings                                              | Passed with classified heuristics |
