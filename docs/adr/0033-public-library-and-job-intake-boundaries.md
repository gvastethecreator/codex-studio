# ADR-0033: Harden public Library assets and job intake boundaries

Status: accepted

Codex Studio exposes local-first assets through `/library/*` and accepts persistent generation jobs through `POST /api/jobs`. After ADR-0032 moved job creation behind Persistent Job Intake, a follow-up audit found that the public asset route and intake/reference boundary still needed stricter ownership.

Decision:

- Treat `/library/*` as a public asset Interface, not as a raw Studio Library file browser.
- Keep `.studio` state, SQLite, logs, transcripts, and internal metadata private by default.
- Allow only intended public asset roots such as generated outputs, reference assets, and masks.
- Validate unknown `sourceSpec` structure before dereferencing assets or writing references.
- Apply reference count and byte budgets before creating reference directories or files.

Consequences:

- `apps/local-server/src/publicLibraryAssetPolicy.ts` owns the public Library allowlist.
- `apps/local-server/src/libraryRoutes.ts` stays the HTTP Adapter.
- `apps/local-server/src/persistentJobIntake.ts` owns source-spec prevalidation before reference persistence.
- `apps/local-server/src/referenceManager.ts` owns reference payload budgets.
- Future storage repair work should not rely on orphan reference cleanup as the first line of defense.

Related:

- `docs/architecture/architecture-review-2026-06-28-improve-debt-audit.md`
- ADR-0032 Provider Registry and Persistent Job Intake
