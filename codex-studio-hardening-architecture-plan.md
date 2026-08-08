# Codex Studio Hardening Plan — pointer

**Canonical plan (v2, error-resistant):**  
[`docs/architecture/CODEX_STUDIO_HARDENING_PLAN.md`](docs/architecture/CODEX_STUDIO_HARDENING_PLAN.md)

**Wayfinder map:**  
[`.scratch/wayfinder/codex-studio-hardening/map.md`](.scratch/wayfinder/codex-studio-hardening/map.md)

**Evidence notes:**  
[`.scratch/codex-studio-hardening/evidence-2026-08-07.md`](.scratch/codex-studio-hardening/evidence-2026-08-07.md)

---

## Why this file changed

The original long audit draft mixed findings, recommendations, and aspirational structure. That created implementation risk:

- Catalog already has `workspace_id`, but jobs do not — easy to “migrate” the wrong table.
- Project FKs exist on `jobs`, `assets`, and `codex_threads` — removing Project is wider than job intake.
- Frontend `Workspace` and backend `CatalogWorkspace` shapes differ (epoch ms vs ISO, optional name vs required).
- IndexedDB holds drafts and workspaces — “remove IndexedDB” is unsafe as a blanket rule.
- Local full gate is named `validate:full`, not `validate:release`.
- Root Bun `workspaces` are declared without real package manifests.

**v2** locks decisions, names failure modes, orders expand-contract steps, and separates Observed vs Historical evidence.

The detailed audit narrative of v1 is superseded. Use v2 for execution.
