# ADR 0003: Studio Readiness snapshot lifecycle

Status: Accepted

Studio Readiness is one backend-owned, non-secret snapshot. Health, onboarding, diagnostics summaries, and job intake consume it. Reads return immediately from the latest snapshot. Slow Codex Runtime Doctor work refreshes asynchronously through one single-flight lifecycle. `/api/runtime/doctor` remains the explicit deep diagnostic command.

## Consequences

- `/api/health` remains compatible but must not launch a synchronous subprocess probe.
- Snapshot age and refresh state stay observable. Stale data is never shown as freshly verified.
- The frontend consumes one readiness projection instead of separate onboarding and diagnostics health copies.
- Provider Secrets and endpoint values remain outside the snapshot.
