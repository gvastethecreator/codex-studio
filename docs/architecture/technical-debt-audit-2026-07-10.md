# Technical-debt audit — 2026-07-10

Historical note: the [2026-07-18 simplification](./simplification-2026-07-18.md) supersedes the retained Browser Queue and legacy export-alias decisions recorded here.

Status: Closed for confirmed, reachable debt

## Scope

This audit covers the frontend shell, local server, provider-independent job lifecycle, Catalog read paths, Animation Sequence, generated style assets, architecture documentation, and repository-level validation.

## Resolved debt

| Area              | Resolved condition                                                                                                                                         | Proof                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Runtime readiness | Removed synchronous Runtime Doctor work from startup/health/provider reads; one async single-flight lifecycle owns refresh and failure state.              | Focused readiness tests and live revision-3 snapshot.      |
| Catalog           | Hot pages use summaries without filesystem I/O or full prompts/config; detail hydrates on demand.                                                          | Catalog tests and browser startup.                         |
| Events            | Added monotonic revisions, bounded writes, gap detection, snapshot reconciliation, and explicit process-restart epoch reset.                               | Event unit/route tests including 50 → 0 → 1 restart.       |
| Queue             | Removed IndexedDB persistence as a second truth and immediately dispatch every pending presentation item to backend intake.                                | Queue deletion, durable dispatch test, intake flow.        |
| Styles packaging  | Replaced thousands of micro-modules with eight paired projections behind a pack-scoped API.                                                                | 246 final JS chunks versus 2,524 baseline.                 |
| Animation         | Centralized handoff, run coordination, Catalog reconciliation, and browser-safe views.                                                                     | Focused contracts/routes/coordinator/UI tests.             |
| React correctness | Fixed missing dependencies, stale derived state, multi-set async prompt state, unstable defaults/keys, layout animation, and event subscription callbacks. | React Doctor errors 9 → 0; bug warnings 27 → 8.            |
| Accessibility     | Added accessible names to every reported control and preserved keyboard behavior.                                                                          | React Doctor accessibility warnings 16 → 0; browser smoke. |
| Public surface    | Removed dead hooks/modules and unnecessary exports; replaced shared barrel imports with direct contracts.                                                  | Full check and React Doctor public-surface scan.           |
| Generated assets  | Preserved all 1,677 manifest default-image contracts while keeping pack projections lazy.                                                                  | Style manifest and projection tests.                       |

## Reconciled findings

### Adversarial closeout

An independent final reviewer found three blockers after the first green gate: a lower SSE revision after backend restart was discarded, browser concurrency could leave undispatched React-only jobs, and provider routes still called the synchronous Doctor adapter. All three were reproduced and fixed. The reviewer rechecked the fixes and reported no residual blocker, with one documented limitation: there is an unavoidable short enqueue-to-request transport window, but no queue backlog waits on browser concurrency.

### Stale documentation

Older plans said full check was blocked by `.scratch/TODO.md` or that Styles exceeded its chunk budget. Those statements are historical; current check and build are green and the affected plans now say so.

### Analyzer heuristics, not confirmed defects

React Doctor finishes at 85/100 with 48 warnings. The remaining eight “bug” warnings are lifecycle synchronization that is intentional and covered:

- `GsapDropdown` retains a mounted copy during its exit animation.
- Style collection highlighting synchronizes an externally controlled highlight with a GSAP timeline.
- Animation Sequence registers provider-independent recipe identity/context with the parent configuration.

The remaining performance warnings are single-pass suggestions on bounded collections, not measured hot-path regressions. The remaining maintainability warnings identify large or co-located components, but no independent defect, change-frequency hotspot, or failing boundary justified splitting twelve mature surfaces in this already broad change. They remain refactor candidates, not accepted debt.

### Retained compatibility

- Visual Batch export aliases remain compatibility-only while Catalog Entry stays durable image truth.
- Legacy persisted Animation runs remain readable through backend projections.
- Deprecated vault export aliases are retained because compatibility tests intentionally exercise them.

## Manual decisions

- No Studio Library compaction, deletion, relocation, or SQLite rewrite was performed.
- No provider secrets, generated user images, logs containing local runtime state, or `.env.local` values were copied into reports.
- Large-component extraction should be scheduled only with a concrete product slice or change-frequency evidence, not as a score-only rewrite.

## Final frontier

Confirmed P1/P2/P3 debt in the accepted scope: none open.

Candidate heuristics: documented above; no release blocker and no proven reachable defect.
