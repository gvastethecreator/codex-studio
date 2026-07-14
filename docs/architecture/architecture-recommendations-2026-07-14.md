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

| ID      | Recommendation                                                                                                        | State                                    |
| ------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| SEC-01  | Resolve provider assets through managed Library/Catalog authority; reject arbitrary or escaped local paths.           | Implemented; focused proof green         |
| DATA-01 | Keep selected Library id and physical write root coherent across routes, workers, Catalog, and public URLs.           | Implemented; migration hardening pending |
| DATA-02 | Make file, Asset, Catalog, and Job finalization idempotent and recoverable across crashes.                            | Planned                                  |
| CONC-01 | Cancel persistent jobs that link after their browser run was already cancelled.                                       | Planned                                  |
| CONC-02 | Make provider session creation single-flight per session key.                                                         | Planned                                  |
| CONC-03 | Prevent stale Catalog replace/append/detail responses from crossing filter generations.                               | Planned                                  |
| ARCH-01 | Make backend intake authoritative for provider execution defaults and nullable resets.                                | Planned                                  |
| UI-01   | Track active generation metadata per run instead of using one global mutable record.                                  | Planned                                  |
| TEST-01 | Exercise migrations against real legacy SQLite fixtures, including idempotence and sentinel data.                     | Planned                                  |
| CI-01   | Enforce source architecture audits in CI and fix current Library-layout violations.                                   | Planned                                  |
| PERF-01 | Give Style Pack loading one cached, single-flight runtime owner and remove duplicate load policy from `StylesRecipe`. | Planned                                  |

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

## Final gate

Pending. Completion requires focused suites, `bun run test`, `bun run check`, `bun run build`, `bun run validate:full`, all source audits, `git diff --check`, documentation reconciliation, logical commits, and a recorded adversarial autopsy.
