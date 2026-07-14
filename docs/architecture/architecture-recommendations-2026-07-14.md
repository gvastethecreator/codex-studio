# Architecture recommendations closure

Status: Active

Started: 2026-07-14

## Objective

Close every accepted recommendation from the 2026-07-14 architecture audit without mutating real Studio Library data, weakening provider isolation, or changing behavior outside the affected paths. This document is the tracked implementation ledger; detailed execution notes remain in the ignored durable plan under `.scratch/planning/`.

## Quality contract

- Use evidence-backed vertical slices and keep the application runnable between slices.
- Run focused checks while iterating; reserve full repository gates for major checkpoints and final closeout.
- Preserve provider secrets, local databases, generated media, transcripts, and existing Studio Library contents.
- Require at least ten valid quality loops, a final adversarial autopsy, and no unresolved in-scope blocker or P1 before declaring completion.
- Commit each verified logical slice separately.

## Accepted recommendations

| ID      | Recommendation                                                                                                        | State                            |
| ------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| SEC-01  | Resolve provider assets through managed Library/Catalog authority; reject arbitrary or escaped local paths.           | Implemented; focused proof green |
| DATA-01 | Keep selected Library id and physical write root coherent across routes, workers, Catalog, and public URLs.           | Implemented and migrated         |
| DATA-02 | Make file, Asset, Catalog, and Job finalization idempotent and recoverable across crashes.                            | Implemented; focused proof green |
| CONC-01 | Cancel persistent jobs that link after their browser run was already cancelled.                                       | Implemented; focused proof green |
| CONC-02 | Make provider session creation single-flight per session key.                                                         | Implemented; focused proof green |
| CONC-03 | Prevent stale Catalog replace/append/detail responses from crossing filter generations.                               | Implemented; focused proof green |
| ARCH-01 | Make backend intake authoritative for provider execution defaults and nullable resets.                                | Implemented; focused proof green |
| UI-01   | Track active generation metadata per run instead of using one global mutable record.                                  | Implemented; focused proof green |
| TEST-01 | Exercise migrations against real legacy SQLite fixtures, including idempotence and sentinel data.                     | Implemented; focused proof green |
| CI-01   | Enforce source architecture audits in CI and fix current Library-layout violations.                                   | Implemented; focused proof green |
| PERF-01 | Give Style Pack loading one cached, single-flight runtime owner and remove duplicate load policy from `StylesRecipe`. | Implemented; focused proof green |

## Architecture decisions

1. A persistent job captures an immutable Library Context containing the selected Library id and canonical root. A default change cannot redirect an in-flight job.
2. Provider compilation consumes resolved managed assets. Caller-controlled filesystem paths are not a provider input contract.
3. Effective execution policy is resolved at backend intake in this order: explicit request, provider default, bootstrap fallback.
4. Concurrency is controlled with small local primitives: per-key promises for sessions and Style Packs, request generations for Catalog reads, run tokens for active UI metadata, and late-link cancellation for jobs.
5. Migration and recovery tests operate only on temporary SQLite databases and temporary Library fixtures.

## Verification baseline

Recorded before implementation:

- `bun run check`: passed.
- `bun run test`: 198 files / 728 tests passed when run without competing full gates.
- `bun run ui:source:verify`: passed.
- `bun run catalog:source:verify`: passed.
- `bun run library:layout:verify`: failed on direct `outputs` path construction in Animation Sequence and Sprite Atlas services. This is accepted CI-01 work, not a green baseline.

## Implementation log

### Loop 1 — Audit to executable mission

- Pressure: the broad audit had findings but no durable route to completion.
- Change: created a persistent goal, Quality Obsessed gate manifest, Wayfinder decision map, six implementation phases, and this tracked ledger.
- Evidence: current source was rechecked; focused audit tests, the isolated full test suite, check, and source audits established the baseline above.
- Verdict: better. Continue with the managed Library/asset boundary.

### Loop 2 — Managed asset and Library authority

- Pressure: `sourceSpec.assets[].localPath` could reach hosted-provider file reads without proving that the path belonged to Studio; default Library selection did not redirect job references, output pathing, Catalog identity, or public URLs together.
- Change: persistent jobs now capture an immutable Library Context. Intake accepts only paths under `outputs`, managed references, or masks and resolves existing symlinks before containment checks. Reference hydration, worker pathing, Catalog registration, alternate-Library URLs, and handoff URLs consume the same context. Legacy jobs retain the prior configured-root fallback.
- Evidence: 25 focused security/data tests plus 30 route/app integration tests passed; server type build, focused format/check, and `git diff --check` passed. Hostile outside-root and junction escapes are covered.
- Verdict: better. The boundary is closed; continue with explicit schema migrations and crash-safe finalization.

### Loop 3 — Versioned migration and recoverable finalization

- Pressure: Library Context columns were initially added through ad hoc `ALTER TABLE` checks, and the file → Asset → Catalog → completed sequence had no durable crash boundary. Startup also excluded active jobs once an Asset row existed.
- Change: SQLite now records ordered schema migrations and applies every pending version in one transaction. A real Bun/SQLite fixture covers legacy columns, sentinel preservation, indexes, foreign keys, two-pass idempotence, and forced rollback. Jobs persist finalization source/target plus Asset/Catalog checkpoints before and after filesystem and database boundaries. Recovery includes active jobs with existing rows and synthesizes a legacy checkpoint when needed; the finalizer reuses existing rows and suppresses duplicate events.
- Evidence: migration/store/finalizer/pathing/worker suite passed 14 tests; the server type build and focused 10-file check passed. The finalizer test proves the five checkpoint states and exact no-duplicate recovery from an Asset checkpoint.
- Verdict: better. Data integrity gates are closed; continue with browser/backend concurrency races.

### Loop 4 — Race-safe generation, session, and Catalog lifecycles

- Pressure: two callers could create distinct provider sessions for the same key; an aborted browser run could create its backend job after cancellation and leave it running; Catalog A responses could overwrite newer B filters or pagination; completing either concurrent generation cleared the singleton overlay metadata for both.
- Change: session creation is single-flight per key, closes failed clients, clears rejected promises, and permits retry. A newly linked backend job installs an abort listener and immediately requests durable cancellation when the signal was already aborted. Catalog reads use generation/request tokens: replacement supersedes older work, append is single-flight, filter changes invalidate page and detail responses, and only the current token owns loading/error state. Generation overlays project the newest active run from a tokenized run list and fall back to the remaining run when completion order reverses.
- Evidence: four focused files passed 14 tests, including deferred late-link cancellation, concurrent session creation, rejected-session retry, Catalog A→B/append invalidation, and both active-run completion orders. Focused format/type/lint check and `git diff --check` passed.
- Verdict: better. Lifecycle races are closed; continue with execution settings authority and Style Pack runtime ownership.

### Loop 5 — One execution-policy authority

- Pressure: browser jobs always carried composer execution values, scripts could omit them, provider defaults were persisted but unused, bootstrap fallbacks lived inside separate executors, and null settings could not clear an existing model/effort/tier.
- Change: Persistent Job Intake now resolves and persists effective execution per field in the order explicit override → selected provider default → provider/bootstrap fallback. Google, fal, and Comfy share their non-secret fallback model constants with this policy; Codex consumes bootstrap configuration. Settings sanitization distinguishes missing fields from explicit null, and the Settings modal edits the selected provider's model, reasoning, and service tier with clear-to-bootstrap behavior.
- Evidence: 44 tests across 10 route/store/intake/policy/executor/UI files passed. Focused checks covered 13 changed files with zero format, type, or lint findings. The policy tests prove mixed per-field precedence and nullable fallback.
- Verdict: better. Settings now have one backend authority; continue with Style Pack registry ownership and single-flight loading.

### Loop 6 — Style runtime registry and focused loading hook

- Pressure: three independent `StylesRecipe` effects could request every runtime pack for browse, favorites, or global search, collection and current-pack effects repeated local merge policy, and the loader had neither a promise cache nor a value cache. Slow or failed loads produced an empty browser with no retry affordance.
- Change: `stylesData` now owns a per-pack registry with shared in-flight promises, normalized value caching, canonical all-pack order, and rejected-promise eviction. A focused hook converts current tab, collection, favorites, and search intent into one deduplicated request, owns the local projection, and exposes loading/error/retry state. `StylesRecipe` removed four load-policy effects and routes direct catalog selections through the same registry.
- Evidence: five Style runtime/collection/render files passed 30 tests. Deferred tests prove one physical pack/thumbnail load across focused and all-pack callers plus retry after rejection. Focused format/type/lint checks passed. `react-doctor --scope changed --base main` reported no issues.
- Verdict: better. Style loading has one runtime owner and user-visible recovery; continue with static architecture gates and full-system proof.

### Loop 7 — Enforced architecture source boundaries

- Pressure: the Library layout audit was red at baseline, and six source-boundary audits existed only as opt-in commands outside CI. The first aggregate run also caught a newly reused retired Style loader name before it could become a compatibility seam.
- Change: Animation Sequence and Sprite Atlas resolve their `outputs` roots through the canonical Library resolver. A single `architecture:verify` gate now runs Style, Recipe, Provider, Catalog, Library-layout, and demand-mounted UI source audits, and CI requires it before type/lint checks and tests. The Style hook contract uses the canonical runtime vocabulary instead of allowlisting the retired alias.
- Evidence: Animation Sequence and Sprite Atlas route suites passed 5 tests; the focused Style hook/recipe suite passed; all six architecture audits reported zero violations; `git diff --check` passed.
- Verdict: better. Static architecture boundaries are now executable and mandatory; continue with full repository and browser proof.

### Loop 8 — Full repository checkpoint

- Pressure: focused suites cannot expose cross-module imports, formatting drift, production bundling, or suite-wide timing interactions.
- Change: ran every required repository gate sequentially. The first `check` found one formatting-only drift in Animation Sequence; it was formatted focally and the gate was restarted. No functional timeout or threshold was relaxed.
- Evidence: `bun run test` passed 205 files / 753 tests; `bun run check`, `bun run build`, and `bun run validate:full` passed. Production chunk budgets remained green, including the 78.32 KB StylesRecipe chunk under its 80 KB limit.
- Verdict: better. Static and production proof are green; continue with real AppShell interaction.

### Loop 9 — Browser proof for Settings and Styles

- Pressure: unit tests did not prove responsive fit, real Style Pack demand loading, retry-compatible browser execution, or provider-default state across a provider switch.
- Change: repaired the Style Browser gate's Node/Vite boundary, updated the responsive queue interaction to the current accessible label, gave the provider selector a stable accessible name, and made the responsive gate edit/retain/restore model, reasoning, and tier without saving real Settings.
- Evidence: Styles Browser verified collection navigation, pack loading, demand-mounted catalog search, 70 rendered fade images, and zero console/page errors or warnings. The responsive gate passed 40/40 scenarios at 360, 390, 768, and 1440 px with zero overflow; all four Settings observations reported `settingsExecutionDefaultsVerified=true`. Final screenshots were inspected.
- Verdict: better. Real UI paths are proven; continue with the mandatory adversarial autopsy.

### Loop 10 — Adversarial completion audit

- Pressure: a green visible path can still leave automation consumers coupled to Vite-only `import.meta.glob`, miss a raw Library path, leak secrets, or leave a recommendation documented but unenforced.
- Change: audited `main...HEAD` by requirement, searched raw Library roots, Style loader consumers, execution/session/catalog ownership, secret-like diff content, and full diff hygiene. The audit found a second Node-side Style report importing the UI registry; it was migrated to generated runtime data and executed successfully. Architecture documentation was reconciled with the new contracts.
- Evidence: no unmanaged Library-root matches remain outside the canonical internals; provider/session/catalog owners are singular and covered; diff secret search found only the existing redacted `FAL_API_KEY` variable name in an error string; duplicate-family and render-budget report tests passed 7/7 and the duplicate report executed under Node/Bun.
- Verdict: **continue**. The audit improved the result but changed source after the broad checkpoint; run one final clean-tree gate and repeat the completion audit before stopping.

## Final gate

Pending. Completion requires focused suites, `bun run test`, `bun run check`, `bun run build`, `bun run validate:full`, all source audits, `git diff --check`, documentation reconciliation, logical commits, and a recorded adversarial autopsy.
