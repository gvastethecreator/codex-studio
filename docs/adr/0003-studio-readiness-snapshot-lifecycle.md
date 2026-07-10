# ADR 0003: Studio Readiness snapshot lifecycle

Status: Accepted

Studio Readiness is one backend-owned, non-secret snapshot consumed by health, onboarding, diagnostics summaries, and job intake. Reads return immediately from the latest snapshot; slow Codex Runtime Doctor work refreshes asynchronously through one single-flight lifecycle, while `/api/runtime/doctor` remains the explicit deep diagnostic command.

## Consequences

- `/api/health` remains compatible but must not launch a synchronous subprocess probe.
- Snapshot age and refresh state stay observable so stale data is never presented as freshly verified.
- The frontend consumes one readiness projection instead of maintaining separate onboarding and diagnostics health copies.
- Provider Secrets and endpoint values remain outside the snapshot.
