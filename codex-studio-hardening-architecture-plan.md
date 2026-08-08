# Codex Studio Hardening Plan — pointer

**Canonical plan (v2, error-resistant):**  
[`docs/architecture/CODEX_STUDIO_HARDENING_PLAN.md`](docs/architecture/CODEX_STUDIO_HARDENING_PLAN.md)

The local Wayfinder map and command evidence live under ignored `.scratch/` paths. They are not public documentation and are not required in a clean checkout.

---

## Why this file changed

The original long audit draft mixed findings, recommendations, and aspirational structure. At the pre-hardening baseline that created implementation risk:

- Catalog had `workspace_id`, but jobs did not — easy to “migrate” the wrong table.
- Project FKs existed on `jobs`, `assets`, and `codex_threads` — removing Project was wider than job intake.
- Frontend `Workspace` and backend `CatalogWorkspace` shapes differed (epoch ms vs ISO, optional name vs required).
- IndexedDB held drafts and workspaces — “remove IndexedDB” was unsafe as a blanket rule.
- The local full gate was named `validate:full`, not `validate:release`.
- Root Bun `workspaces` were declared without real package manifests.

**v2** locks decisions, names failure modes, orders expand-contract steps, and separates Observed vs Historical evidence.

The detailed audit narrative of v1 is superseded. Use v2 as the completed implementation record and verification contract.
