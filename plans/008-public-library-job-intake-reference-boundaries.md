# Plan 008 - Public Library, Job Intake, And Reference Boundaries

Status: DONE - verified 2026-06-28

Priority: P1

Source: `docs/architecture/architecture-review-2026-06-28-improve-debt-audit.md`

## Goal

Make the browser-facing Library route and backend job-intake path safer without changing provider behavior or broad storage layout.

## Scope

- Add a public Library asset policy that denies private `.studio` internals.
- Validate malformed `sourceSpec` input before Persistent Job Intake dereferences assets.
- Validate source specs before reference files are persisted.
- Add count and byte budgets to reference handoff/job references.
- Cover the boundary with focused route/intake/reference tests.

## Out Of Scope

- Reference Store layout decision.
- Orphan Catalog Entry repair implementation.
- Provider Registry single-source cleanup.
- Settings/Style/Recipe UI refactors.

## Validation

- `bun run test:raw -- apps/local-server/src/publicLibraryAssetPolicy.test.ts apps/local-server/src/libraryRoutes.test.ts apps/local-server/src/referenceManager.test.ts apps/local-server/src/persistentJobIntake.test.ts apps/local-server/src/jobRoutes.test.ts packages/shared/src/generationContracts.test.ts`
- `bun run check`
- `bun run build`

## Closeout Notes

- Implemented `PublicLibraryAssetPolicy`, hardened `Persistent Job Intake` malformed `sourceSpec` handling, and added pre-write reference count/byte budgets.
- Focused boundary tests passed: `bun run test -- apps/local-server/src/publicLibraryAssetPolicy.test.ts apps/local-server/src/libraryRoutes.test.ts apps/local-server/src/referenceManager.test.ts apps/local-server/src/persistentJobIntake.test.ts apps/local-server/src/jobRoutes.test.ts packages/shared/src/generationContracts.test.ts` (6 files, 29 tests).
- Full suite passed: `bun run test` (159 files, 551 tests).
- `bun run check` passed.
- `bun run build` passed.
- No visual verification required; this plan changed backend contracts and docs only.
