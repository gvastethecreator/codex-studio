# Codex Studio — Hardening Plan (error-resistant)

**Status:** completed

**Plan version:** 2.2

**Date:** 2026-08-07 (baseline); implementation closed 2026-08-08
**Baseline commit inspected:** `169d96541663d0c87a18e2de29990f43421a4ad0` (`main`)  
**Supersedes:** the retired root hardening pointer draft. Use this file as the only public hardening record.
**Audience:** implementers and agents  
**Language rule:** short sentences, one name per concept, no optional “should” requirements

> **Note:** §1 “Current truth” is the **pre-implementation baseline** from the audit date. Live product state after expand-contract is Workspace authority; Project product APIs are absent and return 404. Do not treat §1 as the live system description.

## Implementation closure

All 14 Definition of Done criteria are implemented. The release contract is `bun run validate:release`; `bun run validate:full` remains its compatibility alias. Closure requires a frozen install, both gates from a clean integrated snapshot, and an independent adversarial review with no blocking finding.

---

## 0. Quality contract

### Artifact and outcome

| Field          | Value                                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Artifact       | This plan + later tickets that implement it                                                                                                 |
| User outcome   | One durable Workspace ownership model, safer refactors, measurable gates                                                                    |
| Mission mode   | Change the plan quality first; product code only after tickets exist                                                                        |
| In scope       | Domain convergence, gates, frontend state, modular seams, assets policy, CI portability, a11y/CSS safety                                    |
| Out of scope   | pnpm/Node rewrite, ORM, plugin framework, Browser Queue return, real Studio Library mutation, Git history rewrite before asset distribution |
| Baseline       | Current `main` at commit above + measured file facts in §1                                                                                  |
| Stop condition | Implementer can execute one ticket without re-deciding architecture                                                                         |

### Evidence grades used in this document

| Grade          | Meaning                                                                    |
| -------------- | -------------------------------------------------------------------------- |
| **Observed**   | Verified in this checkout on 2026-08-07                                    |
| **Historical** | Claim from prior repo reports; not re-measured here                        |
| **Assumed**    | Needed for planning; must be proven in the first ticket that depends on it |

Do not promote Historical or Assumed claims to “done” without fresh command output.

---

## 1. Current truth (Observed)

### 1.1 Runtime and package shape

| Fact                                                               | Evidence                                                                         |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Bun is package manager and runtime                                 | `package.json` scripts, `Bun.serve` backend                                      |
| Root declares Bun workspaces                                       | `"workspaces": ["apps/*", "packages/*"]`                                         |
| No real package manifests under apps/packages                      | `apps/local-server/package.json` missing; `packages/shared/package.json` missing |
| `doctor` uses `npx react-doctor`                                   | `package.json` script                                                            |
| Canonical local gates exist as `validate:fast` and `validate:full` | `scripts/tooling-task.ts`                                                        |
| `docs/DEV_GUIDE.md` and `docs/TOOLING.md` are missing              | Path check                                                                       |
| README still points at missing docs in places                      | Prior audit; re-check with `docs:check` ticket                                   |

### 1.2 Durable data model today

| Entity                      | Where it lives                                        | Role today                                              |
| --------------------------- | ----------------------------------------------------- | ------------------------------------------------------- |
| **Project**                 | SQLite `projects`                                     | Required FK on `jobs`, `assets`, `codex_threads`        |
| **Workspace (SQLite)**      | SQLite `workspaces`                                   | API at `/api/workspaces`; not frontend source of truth  |
| **Workspace (browser)**     | IndexedDB `app-workspaces`, `app-active-workspace-id` | Frontend create/rename/delete/active                    |
| **Catalog workspace field** | `catalog_images.workspace_id`                         | Already present; queries use `COALESCE(..., 'default')` |
| **Job workspace field**     | Missing as column                                     | Carried in `source_spec_json` metadata only             |
| **Persistent Job**          | SQLite `jobs`                                         | Durable execution truth                                 |
| **Catalog Entry**           | SQLite `catalog_images`                               | Durable image truth                                     |
| **Library Context**         | `jobs.library_id` + `jobs.library_root`               | Immutable per job (already migrated)                    |

### 1.3 Generation path today (Observed)

1. UI has an active workspace id (browser state).
2. `localGenerationRun` calls `listProjects()` and takes `projects[0]`.
3. Job create sends `projectId` and puts real workspace into `sourceSpec.metadata.workspaceId`.
4. Catalog entries can store `workspace_id`.
5. Job rows do not store `workspace_id` as a first-class column.

### 1.4 Frontend hotspots (Observed line counts, approx)

| Surface                          | Lines | Problem class                      |
| -------------------------------- | ----: | ---------------------------------- |
| `hooks/useStudioShell.ts`        |  ~787 | Multi-domain orchestration         |
| `apps/local-server/src/db.ts`    |  ~792 | Connection + schema + stores mixed |
| `services/localStudioService.ts` |  ~635 | All API domains in one client      |
| `contexts/GlobalContext.tsx`     |  ~165 | Workspaces + logs + toasts + debug |
| `contexts/GenerationContext.tsx` |  ~183 | Draft + run + chrome mixed         |

### 1.5 Workspace type mismatch (Observed)

Frontend `Workspace`:

```ts
// conceptual shape today
{ id: string; name?: string; createdAt: number; lastImage?: string }
```

Backend route model (`CatalogWorkspace`):

```ts
// conceptual shape today
{
  id: string;
  name: string;
  libraryId: string | null;
  filterJson: unknown;
  sortOrder: string;
  createdAt: string; // ISO string, not epoch ms
}
```

Default id already exists in product code: `DEFAULT_WORKSPACE_ID = 'default'`.

### 1.6 Assets and repo weight (Observed)

- `assets/` tree size in this checkout is about **1.12 GB**.
- Large visual corpus lives in-repo; distribution policy is required before history rewrite.

### 1.7 Existing invariants to preserve (Observed)

- Persistent Job is queue truth (ADR 0005).
- Catalog Entry is image truth.
- Legacy Workspace Snapshot is export-only.
- Workspace switch lands on Studio view (`runWorkspaceSwitchLifecycle`).
- Workspace delete clears catalog-scoped data before delete (`runWorkspaceDeleteLifecycle`).
- Default workspace id is the string `default`.
- Managed Library path security and Provider Secrets stay outside SQLite settings.

---

## 2. Destination

### Product truth after hardening

```text
Library     = physical root of assets and SQLite state
Workspace   = user-visible durable organization unit
Persistent Job = durable work unit, always has workspace_id
Catalog Entry  = durable image unit, already has workspace_id
```

### Operator truth after hardening

```text
validate:fast     = cheap loop while coding
validate          = main PR gate (architecture + check + test + build)
validate:release  = full release gate (domain verifies + docs + hygiene + portability)
```

Note: today the full local gate is named `validate:full`. Rename carefully; keep a temporary alias so docs and muscle memory do not break.

### UI truth after hardening

- Workspace Strip reads and writes SQLite through `/api/workspaces`.
- Active workspace is durable server-side or recoverable from server list + local preference only.
- IndexedDB may keep **transient drafts** (prompt config), not domain entities (workspace list).
- Prompt typing does not re-render catalog, runtime, or workspace strip as a whole tree.

---

## 3. Decision locks

Do not re-open these during implementation unless new evidence invalidates them.

| ID  | Lock                                                                                         |
| --- | -------------------------------------------------------------------------------------------- |
| L1  | Keep Bun as package manager and backend runtime                                              |
| L2  | Keep Hono on `Bun.serve`                                                                     |
| L3  | Keep `bun:sqlite` without an ORM                                                             |
| L4  | Keep Persistent Job + Catalog Entry as durable truths                                        |
| L5  | Make Workspace the only user-visible organization entity                                     |
| L6  | Fully remove Project from product paths (API, contracts, required FKs) after expand-contract |
| L7  | Keep single Bun package until a real second package manifest exists                          |
| L8  | Do not introduce Redux/Zustand unless measured native isolation fails                        |
| L9  | Do not build a generic provider plugin framework                                             |
| L10 | Do not mutate the user’s real Studio Library in tests or maintenance tickets                 |
| L11 | Do not rewrite Git history before optional asset packs are shippable                         |
| L12 | Do not mix domain logic changes with massive folder moves                                    |
| L13 | Default workspace id remains the literal string `default`                                    |
| L14 | Browser storage may keep drafts; it must not own durable workspaces                          |
| L15 | All implementation tickets are AFK-capable once this plan is accepted                        |

### User decisions already locked (2026-08-07 session)

| Topic              | Decision                                             |
| ------------------ | ---------------------------------------------------- |
| Test seams         | All public seams in §9                               |
| Project retirement | Full removal in program scope (not forever-deferred) |
| Ticket grain       | Fine vertical slices                                 |
| Human gates        | None required for implementation tickets             |

---

## 4. Vocabulary (one name)

| Use this             | Do not use for the same thing                            |
| -------------------- | -------------------------------------------------------- |
| Workspace            | project (user-facing), board, folder (unless filesystem) |
| Studio Library       | output folder, data dir                                  |
| Persistent Job       | visual job, queue row                                    |
| Catalog Entry        | asset row (UI), gallery item (as truth)                  |
| Generation Task Spec | final prompt, recipeContext as truth                     |
| Provider Secret      | setting, catalog metadata                                |
| Active workspace     | selected tab without durability meaning                  |
| Dual-read            | fallback forever (dual-read is temporary)                |
| Dual-write           | write only metadata (must write column too)              |

### Contract name

Use **StudioWorkspace** in shared contracts.

Map UI `Workspace` and backend `CatalogWorkspace` onto StudioWorkspace during Phase 1. Do not keep three public names after contract work lands.

---

## 5. Risk register (errors this plan exists to prevent)

| ID  | Failure mode                            | Why it happens                                        | Guard                                                                   |
| --- | --------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| R1  | Data loss on workspace delete           | Delete entity before clearing catalog links           | Keep clear-before-delete lifecycle; tests for reappearance              |
| R2  | Orphan jobs after Project drop          | Drop `project_id` before dual-write complete          | Expand columns first; drop FK only after backfill + audit               |
| R3  | Split-brain workspaces                  | IDB and SQLite both write                             | Single writer: SQLite; IDB import once with marker                      |
| R4  | ID collision                            | Client UUID vs server UUID for same logical workspace | Import preserves id when safe; server create is authority after cutover |
| R5  | Default workspace deleted               | UI treats default like normal row                     | Forbid delete of `default`; tests                                       |
| R6  | Timestamp skew                          | UI uses epoch ms, API uses ISO strings                | Normalize in contract + mappers                                         |
| R7  | Catalog/job workspace diverge           | Only catalog has column                               | Backfill jobs; write both on create                                     |
| R8  | Generate still hits projects            | Forgotten call sites / scripts                        | Source audit + tests for `listProjects` in generate path                |
| R9  | assets/codex_threads still need Project | Plan only migrates jobs                               | Inventory every `project_id` FK before contract phase                   |
| R10 | IndexedDB wipe of drafts                | Over-broad “remove IDB” ticket                        | Scope IDB removal to workspace keys only                                |
| R11 | Gate rename breaks CI                   | `validate:full` vs `validate:release`                 | Alias both until all callers migrate                                    |
| R12 | Perf claims without numbers             | “Feels faster”                                        | Baseline ticket before render isolation “success”                       |
| R13 | Security regression during splits       | Route/db moves drop checks                            | Security tests are non-negotiable closeout for modularization           |
| R14 | Fake monorepo assumptions               | Keep root workspaces without package.json             | Remove declaration or add real manifests; never half-state              |
| R15 | Asset pack breaks first run             | Optional pack treated as required                     | Core Asset Set boots without optional packs                             |
| R16 | Mega-PR mixes schema + UI + CSS         | Schedule pressure                                     | One primary intention per PR                                            |
| R17 | Memoization hides bad state ownership   | `React.memo` spam                                     | Measure ownership first                                                 |
| R18 | History rewrite traps clones            | filter-repo too early                                 | Only after pack install path proven                                     |

---

## 6. Target domain model

```text
Library 1—* Workspace 1—* Persistent Job 1—* Catalog Entry
Library 1—* Catalog Entry
Workspace 1—* Catalog Entry
```

### Rules

1. Every new Persistent Job has non-null `workspace_id`.
2. Empty or missing workspace id normalizes to `default`.
3. Every Catalog Entry keeps `workspace_id` (already).
4. Job create does not call Project APIs.
5. `source_spec.metadata.workspaceId` may remain as redundant trace; it is not the query authority after dual-write.
6. Library Context remains captured at intake and stays immutable for that job.
7. Default workspace always exists after migration.
8. User cannot delete default workspace.
9. Rename updates SQLite; UI optimistic update must reconcile on failure.

### Project removal inventory (must complete before FK drop)

| Table / surface       | `project_id` today      | Migration action                                                |
| --------------------- | ----------------------- | --------------------------------------------------------------- |
| `jobs`                | required FK             | add `workspace_id`; stop writing project; drop column/FK last   |
| `assets`              | required FK             | stop depending on Project; attach via `job_id` only if possible |
| `codex_threads`       | required FK             | re-key to library/workspace/job lineage                         |
| `/api/projects`       | live routes             | remove after callers gone                                       |
| `listProjects` client | generate path + scripts | remove generate use first; clean scripts                        |
| Shared contracts      | Project types           | remove after last caller                                        |
| Eval scripts          | synthetic project ids   | switch to workspace or internal fixture helper                  |

Do not drop `projects` table in the same migration that adds job columns.

---

## 7. Phased execution (error-resistant)

Each phase has: goal, preconditions, steps, forbidden moves, acceptance, verification, rollback.

### Phase 0 — Guardrails and baseline

**Goal:** measure and name quality without debating tools mid-refactor.

**Preconditions**

- Clean working tree for gate runs, or record dirty paths explicitly.
- No user Studio Library path in test output.

**Steps**

1. Write ADRs:
   - Workspace as canonical scope
   - Single package until real packages
   - Versioned optional asset packs
2. Run and record baseline:
   - `bun install --frozen-lockfile`
   - `bun run architecture:verify` (if present)
   - `bun run check`
   - `bun run test`
   - `bun run build`
   - domain verifies that exist (`providers:verify`, `styles:verify`, `recipes:verify`)
3. Canonicalize gates:
   - Keep `validate:fast`
   - Define `validate` as the main gate (or alias current full set)
   - Define `validate:release` and keep `validate:full` as alias
4. Fix entry-doc links; add `docs:check`.
5. Switch doctor to versioned Bun invocation; remove fake root workspaces declaration.
6. Remove react-scan residual CSS and stale Visual Batch comments.
7. Add `repo:hygiene:verify` for secrets, DBs, `.scratch` tracked files, env files.

**Forbidden moves**

- Schema changes in this phase.
- Dependency upgrades “while we are here”.
- Deleting user data paths.

**Acceptance**

- One command name documents the main gate.
- Entry docs have no broken local links.
- Baseline report exists under `.scratch/` (ignored) or CI artifacts, with no secrets.

**Verification**

- Run the named gate twice; second run is clean.
- `docs:check` fails on a deliberate broken link fixture.

**Rollback**

- Gate aliases keep old names working for one transition window.

---

### Phase 1 — Workspace authority (P0)

**Goal:** one durable owner for “where does this generation belong?”

#### 1A — Contract

**Steps**

1. Define shared `StudioWorkspace`:
   - `id: string`
   - `name: string`
   - `libraryId: string`
   - `filter: Record<string, unknown>` (or stricter schema)
   - `sortOrder: 'newest' | 'oldest' | 'favorite'` (match real server values)
   - `createdAt: string` (ISO)
   - `updatedAt: string` (ISO)
2. Map frontend view models from StudioWorkspace; do not invent a fourth type.
3. Keep `DEFAULT_WORKSPACE_ID = 'default'`.

**Acceptance**

- Shared package exports one workspace type used by API client and server mappers.

#### 1B — Schema expand (no removals)

**Steps**

1. Migration ensures default workspace row.
2. Add nullable-then-backfilled columns on `jobs`:
   - `workspace_id`
   - `recipe_id`
   - `batch_id`
   - `aspect_ratio`
3. Add `workspaces.updated_at` if missing.
4. Dual-read Job Summary:
   - column → metadata → `default`
5. TypeScript transactional backfill (not SQL JSON functions as sole path).
6. Add indexes only after backfill, with `EXPLAIN QUERY PLAN` tests for real queries.

**Forbidden moves**

- Drop `project_id` here.
- Rewrite all `source_spec_json` unless needed for repair.
- Touch real Studio Library DB outside temp fixtures.

**Acceptance**

- All jobs in migrated fixture DBs have non-null `workspace_id`.
- Legacy rows without metadata become `default`.
- Migration is idempotent.

**Rollback**

- New columns remain; old app versions that ignore unknown columns keep working where SQLite allows.
- Do not delete columns in the same release that adds them.

#### 1C — Intake and generate path

**Steps**

1. Intake accepts `workspaceId`.
2. New jobs dual-write column + metadata.
3. Temporary Project compatibility:
   - server may still fill a legacy default project row while FK exists
   - frontend generate path stops calling `listProjects`
4. Source audit forbids generate → projects dependency.

**Acceptance**

- Creating a job from UI sends workspace id and never lists projects.
- Job Summary no longer needs JSON parse for workspace/recipe/aspect.

#### 1D — Frontend Workspace durability

**Steps**

1. Client methods: list/create/update/delete workspaces.
2. Workspace Strip loads from API.
3. Optimistic UI allowed; server confirms.
4. One-shot IndexedDB import:
   - read `app-workspaces` + active id
   - create missing server rows preserving ids when valid
   - write migration marker
   - re-run is no-op
5. After marker + stable release behavior, stop persisting workspace list in IndexedDB.
6. Keep generation draft keys in IndexedDB.

**UI / copy constraints (studio surface)**

| State                       | Required behavior                               | Copy direction                                                     |
| --------------------------- | ----------------------------------------------- | ------------------------------------------------------------------ |
| Empty non-default workspace | Show purpose + create/generate action           | “No images in this workspace yet” + primary generate/import action |
| Delete workspace            | Confirm with consequence verb                   | “Delete workspace” not “OK”                                        |
| Cannot delete default       | Control disabled or error explains why          | “The default workspace cannot be deleted”                          |
| Rename failure              | Revert optimistic name; toast/inline error      | “Unable to rename workspace. Try again.”                           |
| Offline/backend down        | Strip does not invent permanent local-only rows | “Studio backend is unavailable”                                    |

**Hierarchy note (ruthless/improve-ui)**

- Command Center remains global status + workspace switch.
- Workspace Strip is organization chrome, not a second app.
- Do not redesign the whole shell in Phase 1. Only make ownership correct and states honest.

#### 1E — Project contract removal

Order is mandatory:

1. No generate/API callers need Project.
2. Scripts/evals updated or isolated.
3. Remove `/api/projects`.
4. Remove shared Project types from product contracts.
5. Remove or null-out `project_id` requirements from `jobs`, `assets`, `codex_threads` with backups and fixtures.
6. Drop `projects` table only if nothing references it.

**Acceptance**

- Grep/source audit: no product generate path references Project.
- Fresh init works without Project bootstrap for user flows.
- Recovery/cancel/finalization still green.

---

### Phase 2 — Frontend state isolation (P1)

**Goal:** reduce invalidation blast radius without a visual redesign.

**Preconditions**

- Phase 1D done enough that Workspace state is API-backed.
- Render baseline harness exists with recorded numbers.

**Steps**

1. Profiling harness for:
   - type 30 prompt chars
   - add/remove attachment
   - 20 job events
   - route Studio → Recipes → Styles
   - open Settings
2. Extract toast store.
3. Extract runtime log store (subscribe only when panel mounted).
4. Extract workspace provider (API-backed).
5. Split generation draft vs run vs chrome.
6. Replace fat `useStudioShell` policy with feature controllers; shell only composes.
7. Re-measure; require measurable reduction on prompt typing commits to unrelated trees.

**Forbidden moves**

- Global `React.memo` campaign.
- New state library by default.
- Visual redesign of Command Center.

**Acceptance**

- Prompt keystrokes do not re-render workspace strip / runtime chrome (measured).
- Closed log panel does not subscribe expensive log projections.
- Navigation, generate, overlays tests stay green.

---

### Phase 3 — API and DB modularization (P1)

**Goal:** domain ownership without infrastructure fashion.

**Steps**

1. Shared HTTP client + typed error (`status`, `code`, `reason`).
2. Split client by domain behind temporary facade re-exports.
3. Shared Effect schemas for Workspace and Jobs.
4. Split DB connection and migrations from stores.
5. Split stores: workspaces, jobs, catalog, settings/events/assets.
6. Keep `appFactory` as composition root only.

**Forbidden moves**

- ORM.
- Generic repository base class.
- DI container.
- Dropping path/origin/secret tests.

**Acceptance**

- Facade keeps old imports working during migration.
- Security and recovery suites green.
- Migrations remain transactional and versioned.

---

### Phase 4 — Performance, assets, CI, CSS/a11y (P1/P2)

#### Performance

- Seed only temp libraries.
- Bench DB/API without remote providers.
- Convert relative budgets to absolute only after stable baselines.

#### Assets

1. `repo:assets:audit` (bytes, extensions, dupes, unreferenced).
2. Define Core Asset Set for first run.
3. Versioned optional packs with sha256.
4. Install: download/staging/atomic rename/offline import.
5. Missing pack → fallback, not broken image spam.
6. Corrupt hash → reject activation.
7. History rewrite only after packs work and release notes exist.

#### CI

- Ubuntu full validate.
- Windows portability smoke on PR (install, typecheck server, temp DB migrate, init, health).
- macOS on schedule/release if PR cost is high.

#### CSS / a11y

- Remove global `border/outline/box-shadow: none !important` reset pattern.
- Keep focus-visible by default.
- `prefers-reduced-motion` base.
- Axe + keyboard smoke on main surfaces (audit, not certification claim).

---

### Phase 5 — Optional physical reorg

Only after Phases 1–3 are green.

- Prefer stay single-package.
- Real monorepo only if packaging need is proven.

---

## 8. Public test seams (approved)

Test external behavior. Do not assert private module names as product truth.

| Seam               | Behavior to prove                                      |
| ------------------ | ------------------------------------------------------ |
| Workspace contract | Shared shape; default exists                           |
| Workspace API      | CRUD survives process restart                          |
| Job intake         | Accepts workspaceId; no projects list on generate      |
| Job Summary        | Hot fields from columns                                |
| Dual-read          | Legacy jobs list correctly                             |
| IDB migration      | One-shot, idempotent, marker                           |
| Default safety     | Default not deletable                                  |
| Gates              | Named validate scripts are CI truth                    |
| Docs check         | Broken links fail                                      |
| Render isolation   | Prompt typing does not invalidate unrelated surfaces   |
| Security           | Path/origin/secret/recovery remain green               |
| Asset audit        | Report reproducible; core boots without optional packs |

### Prior art in repo

- Catalog-first source audits
- Architecture verify scripts
- Migration-style DB tests
- Job intake / appFactory tests
- Workspace lifecycle unit tests
- Catalog workspace filter tests (`COALESCE` default)

---

## 9. Implementation sequence (fine tickets)

Publish under `.scratch/codex-studio-hardening/issues/` when `/to-tickets` runs.

Summary order:

1. **Guardrails** — ADRs, baseline, gates, docs, bun-only, residue, hygiene
2. **Expand Workspace** — contract, columns, dual-read, backfill, indexes
3. **Intake + generate** — workspace dual-write, remove listProjects, audits
4. **Frontend Workspace** — API client, strip, CRUD, IDB import, drop IDB ownership
5. **Remove Project** — inventory FKs, remove API/types, schema contract
6. **React isolation** — baseline, stores, controllers, thin shell, re-measure
7. **Modularize** — HTTP client, API split, DB split, schemas
8. **Hardening** — tsconfig, CSS/a11y, assets, CI, perf, docs IA

Frontier starters (no blockers): ADR tickets, baseline, docs links, bun-only, residue cleanup, toast extract, HTTP client, DB connection extract, tsconfig base.

---

## 10. UI quality constraints for this program

This program is **ownership and reliability first**, not a brand redesign.

### Preserve

- Command Center as top toolbar authority
- Demand-mounted heavy surfaces
- Catalog-first gallery truth
- Existing recipe/style routes and labels unless a ticket renames Project→Workspace copy

### Fix when Workspace work lands

| Issue                                     | User damage                          | Required fix                                                    |
| ----------------------------------------- | ------------------------------------ | --------------------------------------------------------------- |
| Workspace exists only in browser          | Refresh loses organization trust     | SQLite authority                                                |
| Rename does not survive                   | User thinks save worked              | Persist + reconcile                                             |
| Delete recreates from catalog heuristics  | Ghost workspaces                     | clear-before-delete + no silent reimport except explicit repair |
| Default looks deletable                   | Accidental destruction of home scope | Disable + plain error                                           |
| Backend down still “creates” durable rows | False confidence                     | Fail clearly; optional offline draft only if marked temporary   |

### Do not do in UI tickets

- New color system
- New layout shell
- Animation showcases unrelated to workspace feedback
- Clever empty-state jokes
- “OK” / “Yes” on destructive confirms

---

## 11. Copy contracts (product-facing)

Voice: calm, direct, technical product. Sentence case for body; verb-first buttons.

| Situation                    | Use                                                                                     |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| Create                       | “New workspace” / “Create workspace”                                                    |
| Rename                       | “Rename workspace”                                                                      |
| Delete confirm title         | “Delete workspace?”                                                                     |
| Delete confirm action        | “Delete workspace”                                                                      |
| Cancel                       | “Cancel”                                                                                |
| Default protected            | “The default workspace cannot be deleted.”                                              |
| Save/rename fail             | “Unable to rename workspace. Check that the studio backend is running and try again.”   |
| Backend down                 | “Studio backend is unavailable.”                                                        |
| Empty workspace              | “No images in this workspace yet.” + action “Generate image” or existing primary action |
| Migration success (if shown) | “Workspaces were moved to studio storage.”                                              |

Do not say “project” in new UI copy.

---

## 12. Definition of Done (program)

All must be true with fresh evidence:

1. Workspace is the only user-visible organization entity.
2. Frontend does not own durable workspace lists in IndexedDB.
3. Generate path does not use Project APIs.
4. Project product surface is removed (routes/contracts/required FKs) or a named residual is documented as bug.
5. Job Summary hot fields do not require JSON parse.
6. `useStudioShell` is composition, not multi-domain policy owner.
7. Prompt/log updates do not invalidate unrelated surfaces (measured).
8. API client and DB are split by domain (facade allowed temporarily only during migration windows, then removed).
9. tsconfigs separate web/server/shared environments.
10. CI covers Ubuntu + Windows smoke; macOS at least scheduled/release.
11. Docs entrypoints have no broken links; history docs do not pose as current architecture.
12. Hygiene gate blocks secrets/DBs/logs from commits.
13. Asset policy exists; core first-run works without optional packs.
14. `validate:release` (and alias) is green on clean checkout.

---

## 13. Explicit non-goals

1. Replace Bun with pnpm/Node.
2. Introduce ORM or generic DI.
3. Provider plugin marketplace.
4. Bring back Browser Queue / Visual Batch as durable truth.
5. Mega folder move before domain convergence.
6. Git history rewrite before pack distribution works.
7. Mutate real user Studio Library in automated tickets.
8. Remote provider calls as deterministic CI gates.
9. Claim WCAG certification from axe smoke.
10. Keep Project “just in case” after removal criteria are met.

---

## 14. Working rules for agents

1. One ticket per session when implementing.
2. Prefer expand-contract over big-bang.
3. Never claim runtime proof from static reading.
4. Record commands run and commands skipped.
5. If a ticket needs a decision not locked here, stop and open a wayfinder decision ticket.
6. Preserve dirty tree changes you did not make.
7. Use glossary from `CONTEXT.md`; extend it when Workspace definition becomes durable.
8. Update `docs/ARCHITECTURE.md` when Phase 1 contract lands, not before evidence.

---

## 15. Wayfinder destination

Destination for decision fog:

> An implementer can run the Workspace convergence program without re-deciding product authority, Project retirement, or gate names.

The ignored Wayfinder map used during implementation was retired on 2026-08-09. This tracked plan and `docs/ARCHITECTURE.md` now hold the durable decisions.

---

## Appendix A — Evidence snapshot (2026-08-07)

| Area                     | Observation                                                 |
| ------------------------ | ----------------------------------------------------------- |
| Commit                   | `169d96541663d0c87a18e2de29990f43421a4ad0`                  |
| Fake workspaces          | declared, no child package.json                             |
| doctor                   | `npx react-doctor`                                          |
| validate names           | `validate:fast`, `validate:full`                            |
| jobs.project_id          | required                                                    |
| jobs.workspace_id        | not present as column                                       |
| catalog.workspace_id     | present                                                     |
| assets.project_id        | required                                                    |
| codex_threads.project_id | required                                                    |
| IDB workspace keys       | `app-workspaces`, `app-active-workspace-id`                 |
| generate projects call   | `services/localGenerationRun.ts` listProjects + projects[0] |
| workspace API            | `workspaceRoutes.ts` exists                                 |
| default id               | `default` in `lib/workspaceLifecycle.ts`                    |
| assets/ size             | ~1.12 GB in this checkout                                   |
| shell size               | ~787 lines                                                  |

## Appendix B — Gate naming migration

| Today                | Target                                | Transition                               |
| -------------------- | ------------------------------------- | ---------------------------------------- |
| `validate:fast`      | `validate:fast`                       | keep                                     |
| `validate:full`      | `validate` + `validate:release` split | keep `validate:full` as alias ≥1 release |
| ad-hoc CI step lists | call scripts                          | CI must not fork logic                   |

## Appendix C — Suggested first week order

1. Baseline report
2. ADRs + gate aliases
3. Docs links + docs:check
4. Workspace contract
5. Job columns + dual-read + backfill
6. Intake dual-write
7. Remove listProjects from generate
8. Frontend API-backed strip
9. IDB import

Do not start shell decomposition or monorepo moves in week one.
