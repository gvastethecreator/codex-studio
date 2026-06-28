# Architecture, improve, and technical debt audit - 2026-06-28

Status: findings only.

Scope: new pass using `improve`, `improve-codebase-architecture`, and `technical-debt-audit`. This pass is read-only for source code. It consolidates architecture candidates, confirmed/likely debt, stale documentation, and suggested execution order after the 2026-06-28 provider/sync/operations batch.

## Sources read

- Required project context: `AGENTS.md`, `README.md`, `CONTEXT.md`, `docs/ARCHITECTURE.md`, latest ADRs including `docs/adr/0032-provider-registry-and-persistent-job-intake.md`, `docs/active/professionalization-roadmap.md`, and `docs/TECHNICAL_DEBT.md`.
- Active ledgers and plans: `docs/architecture/DEEPENING-ROADMAP.md`, `docs/active/runtime-storage-ux-plan-2026-06-21.md`, `docs/active/effect-ts-adoption-workplan-2026-05-31.md`, `docs/active/professionalization-next-agent-tasks.md`.
- Current implementation seams: `apps/local-server/src/libraryRoutes.ts`, `apps/local-server/src/library.ts`, `apps/local-server/src/persistentJobIntake.ts`, `apps/local-server/src/referenceManager.ts`, `apps/local-server/src/jobRoutes.ts`, `packages/shared/src/generationContracts.ts`, `packages/shared/src/providerCapabilities.ts`, `apps/local-server/src/providers/providerRegistry.ts`, `hooks/useSettingsSurface.ts`, `components/StudioSettingsModal.tsx`, `lib/settingsSurface.ts`, `lib/recipeModules.ts`, `hooks/useGenerationConfig.ts`, `components/recipes/CharacterLabRecipe.tsx`, `components/recipes/TimelineRecipe.tsx`, `components/recipes/StylePresetCatalogSearchSurface.tsx`, `lib/commandCenterProjection.ts`, `components/QueuePanel.tsx`, `components/HeaderToolbar.tsx`, `services/localGenerationRun.ts`.

## Subagent agreement

- Backend/runtime/security lens: prioritize Library serving allowlists, Persistent Job Intake validation order, reference budgets, provider fact duplication, storage repair truth, worker settings injection, and transcript endpoint redaction.
- Product/UX lens: prioritize Settings Surface open-transition hydration, Style Catalog failure visibility, task-filter truth, queue count/truncation honesty, HeaderToolbar recipe identity drift, and visual gate decision.
- Ledger/documentation lens: confirmed several old debt items are now false positives after ADR-0032, while `TECHNICAL_DEBT.md`, `CONTEXT.md`, and active handoff docs still describe some completed or overstated work as current.

## Confirmed P1 debt

### 1. `/library/*` is still too broad for a public asset Interface

- **Status:** confirmed debt.
- **Evidence:** `apps/local-server/src/libraryRoutes.ts:36` serves any `/library/*` path after rejecting only `..`; `apps/local-server/src/library.ts:118` resolves the normalized path under the Studio Library; `apps/local-server/src/libraryRoutes.test.ts:15` covers traversal and missing files, but not a public allowlist or denial for `.studio` internals.
- **Impact:** a local HTTP client can plausibly request non-public Studio Library internals if the path exists. That weakens the Local Asset serving Seam and puts SQLite, transcripts, logs, or other implementation files closer to the browser-facing Interface than intended.
- **Effort:** small/medium.
- **Risk:** medium, because this is user-data boundary work.
- **Confidence:** high.
- **Fix sketch:** introduce a `PublicLibraryAssetPolicy` Module that allowlists intended public roots and content classes, then keep `/library/*` as an Adapter. Add deny tests for `.studio/studio.sqlite`, `.studio/transcripts/*`, and logs; keep allow tests for generated outputs, thumbnails, and intended reference assets.

### 2. Persistent Job Intake touches `sourceSpec.assets` before validating the spec shape

- **Status:** confirmed debt.
- **Evidence:** `apps/local-server/src/jobRoutes.ts:33` accepts `sourceSpec` as `Schema.Unknown`; `apps/local-server/src/persistentJobIntake.ts:127` clones `request.sourceSpec.assets.map(...)`; `packages/shared/src/generationContracts.ts:491` already knows how to report `assets` missing as a validation issue.
- **Impact:** malformed job input can escape the HTTP boundary as an exception instead of a controlled 400, so the new Persistent Job Intake Module is not yet deep enough at its input seam.
- **Effort:** small.
- **Risk:** low.
- **Confidence:** high.
- **Fix sketch:** normalize unknown source specs through a safe draft/parser before dereferencing fields. Add a route/intake test for `{ sourceSpec: {} }` returning structured 400 and proving no enqueue/write side effects.

### 3. References can be persisted before task-spec validation rejects the job

- **Status:** confirmed debt.
- **Evidence:** `apps/local-server/src/persistentJobIntake.ts:143` calls `processReferences(...)`; validation happens later at `apps/local-server/src/persistentJobIntake.ts:174`; `apps/local-server/src/referenceManager.ts:97` creates `.studio/references/<jobId>` and writes files immediately.
- **Impact:** an invalid job can leave orphan reference files, increasing Storage Repair Plan burden and making cleanup semantics depend on later maintenance work.
- **Effort:** small/medium.
- **Risk:** medium.
- **Confidence:** high.
- **Fix sketch:** validate provider/task/spec shape before writing references, or make reference persistence transactional with explicit cleanup on later validation failure. Prove with a test that invalid provider/spec plus valid references leaves no persisted reference directory or records a cleanup.

### 4. Recipe Task Spec assembly still owns recipe-specific asset roles and quality facts

- **Status:** confirmed architecture debt.
- **Evidence:** `lib/recipeModules.ts:1088` builds the Generation Task Spec centrally; `lib/recipeModules.ts:1141` hardcodes Styles `stylePresetId`; `lib/recipeModules.ts:1145` gives Character Lab the first-attachment `input` role; `lib/recipeModules.ts:1154` branches recipe-specific quality/style/color/reference instructions.
- **Impact:** Recipe Modules are deeper than before, but one central assembler still knows too many product rules. Adding new Recipe Modules increases the chance of editing the shared task-spec builder instead of extending recipe-owned behavior.
- **Effort:** medium.
- **Risk:** medium.
- **Confidence:** high.
- **Fix sketch:** add a `RecipeTaskSpecProjection` or per-Recipe Module task-spec contribution hook that owns asset role projection, quality facts, and reference-role instructions. Keep provider compilers downstream of the normalized Generation Task Spec.

### 5. Attachment intake is duplicated across composer and recipe surfaces

- **Status:** confirmed debt.
- **Evidence:** `hooks/useGenerationConfig.ts:211` reads files, creates attachment ids, applies default strength, and performs reference handoff; `components/recipes/CharacterLabRecipe.tsx:245` has its own FileReader/id/default-strength logic; `components/recipes/TimelineRecipe.tsx:475` has another FileReader helper; Character Lab then enforces source/reference placement at `components/recipes/CharacterLabRecipe.tsx:1066`.
- **Impact:** browser File ingestion, handoff behavior, attachment ids, default strength, max counts, and role intent can drift between Composer, Character Lab, Timeline, and future recipe surfaces.
- **Effort:** medium.
- **Risk:** medium.
- **Confidence:** high.
- **Fix sketch:** extract `AttachmentIntake` as a browser Module with small role Adapters per surface. The Module should own FileReader, id creation, handoff, error formatting, and budget checks; recipe surfaces should only state intent such as `primary-source`, `reference`, or `sequence-frame`.

## Confirmed P2 debt

### 6. Settings Surface hydration is a shallow wrapper and can refetch on domain identity churn

- **Status:** confirmed debt.
- **Evidence:** `lib/settingsSurface.ts:17` returns `isOpen`; `lib/settingsSurface.ts:21` mostly repackages domains. `hooks/useSettingsSurface.ts:26` calls `settingsDomain.refresh()` whenever `isOpen` and `settingsDomain` change. `hooks/useStudioSettings.ts:503` rebuilds the settings data object from many changing dependencies.
- **Impact:** the Settings Surface Module owns the name of the seam, but not enough open-transition policy. Opening Settings can become noisy as loading/error/saving changes rebuild the domain object.
- **Effort:** small.
- **Risk:** low.
- **Confidence:** high.
- **Fix sketch:** make hydration transition-aware (`closed -> open`) and test that refresh runs once per open even when the settings domain identity changes while open.

### 7. Settings operation panels still keep deep workflow policy inside `StudioSettingsModal`

- **Status:** confirmed architecture debt.
- **Evidence:** `components/StudioSettingsModal.tsx:45` exposes a wide modal Interface; `components/StudioSettingsModal.tsx:438` owns External Output Source list/import UI state; `components/StudioSettingsModal.tsx:651` owns Storage Maintenance result projection and guarded destructive confirmations, including `createStorageRepairPlanFromAudit` at `components/StudioSettingsModal.tsx:672`.
- **Impact:** Settings is demand-mounted, but the Modal still owns output-source operations and maintenance repair policy. That makes the UI component deeper than the Settings Surface Module and harder to test without rendering the modal.
- **Effort:** medium.
- **Risk:** medium.
- **Confidence:** high.
- **Fix sketch:** deepen `SettingsOutputSourceSurface` and `SettingsMaintenanceSurface` Modules that project button state, result summaries, repair-plan copy, and confirmation requirements. Keep JSX as an Adapter.

### 8. Style Catalog search has no load-failure state

- **Status:** confirmed debt.
- **Evidence:** `components/recipes/StylePresetCatalogSearchSurface.tsx:82` starts async catalog loading and only handles `.then(...)`; there is no rejection path or retry/error projection. `docs/DESIGN.md` requires demand-mounted surfaces to expose loading/error states.
- **Impact:** a lazy chunk or catalog-load failure can leave the surface stuck in loading state, which undermines the demand-mounted surface contract.
- **Effort:** small.
- **Risk:** low.
- **Confidence:** high.
- **Fix sketch:** add `StyleCatalogLoadSurface` state for loading/error/retry and a focused test with a rejected loader.

### 9. Queue and Command Center status can overstate or hide active work

- **Status:** likely debt.
- **Evidence:** `lib/commandCenterProjection.ts:140` sums browser queue and active backend counts. `components/QueuePanel.tsx:196` says “visible jobs” while `components/QueuePanel.tsx:311` shows total backend jobs and `components/QueuePanel.tsx:332` renders only the first 20.
- **Impact:** if a local queued item is linked to a backend Persistent Job, users can see inflated counts. If there are more than 20 backend jobs, older jobs disappear from the panel without explicit truncation or load-more copy.
- **Effort:** small/medium.
- **Risk:** medium.
- **Confidence:** medium.
- **Fix sketch:** move queue-count and truncation messaging behind a `QueueVisibilityProjection` that dedupes linked local/server jobs and exposes `shown/total/hasMore`.

### 10. Provider Registry is not the only provider fact source yet

- **Status:** confirmed debt.
- **Evidence:** ADR-0032 chooses one Provider Registry. `apps/local-server/src/providers/providerRegistry.ts:28` has the backend registry, while `packages/shared/src/providerCapabilities.ts:58` keeps a separate default provider list. Both lists still include `fal` “executor is still planned” wording despite executor flags being true in the registry.
- **Impact:** capability copy and provider facts can drift between backend registry and shared defaults. This is exactly the kind of duplication ADR-0032 tried to remove.
- **Effort:** small/medium.
- **Risk:** medium.
- **Confidence:** high.
- **Fix sketch:** either generate shared defaults from the registry projection or make provider definitions required at capability construction time. Add a registry consistency test that every provider fact used by capabilities, compiler lookup, executor lookup, and worker routing comes from the same source.

### 11. HeaderToolbar still owns recipe identity labels outside Recipe Discovery Projection

- **Status:** confirmed architecture debt.
- **Evidence:** `components/HeaderToolbar.tsx:54` hardcodes recipe names; `components/HeaderToolbar.tsx:96` resolves aliases locally; `components/RecipesView.tsx` already consumes Recipe Discovery Projection.
- **Impact:** recipe label and alias truth can drift between the Command Center and Recipe Discovery surfaces.
- **Effort:** small/medium.
- **Risk:** low.
- **Confidence:** high.
- **Fix sketch:** expose active recipe identity through `RecipeDiscoveryProjection` or a tiny `ActiveRecipeIdentityProjection`, then let HeaderToolbar consume that Interface.

### 12. Worker settings still cross a global settings Adapter

- **Status:** confirmed debt.
- **Evidence:** backend routes/providers use injected settings storage through app composition, but worker pathing still reads settings through global helpers; subagent evidence points at `apps/local-server/src/appFactory.ts:114`, `apps/local-server/src/worker.ts:162`, and `apps/local-server/src/workerAssetPathing.ts:51`.
- **Impact:** Worker behavior is harder to test in isolation and can diverge from route/provider settings injection.
- **Effort:** small/medium.
- **Risk:** low/medium.
- **Confidence:** high.
- **Fix sketch:** pass a Worker Settings Port into worker pathing and add an appFactory/worker test proving injected output organization affects generated target paths.

## Likely debt and manual decisions

### 13. Local Studio Sync job-waiting ownership is ambiguous

- **Status:** likely debt.
- **Evidence:** `docs/ARCHITECTURE.md:44` says Local Studio Sync owns bounded backend job waiting. `services/localGenerationRun.ts:23` imports `watchJob()` directly and `services/localGenerationRun.ts:322` waits through that Adapter.
- **Impact:** the code may be fine, but the architectural term is ambiguous: either Local Studio Sync owns job waiting, or `watchJob()` is the shared SSE Adapter.
- **Effort:** small.
- **Risk:** low.
- **Confidence:** high.
- **Fix sketch:** choose one vocabulary and align docs/tests. If Sync owns waiting, route local generation through that Interface; if `watchJob()` is the intended Interface, downgrade the Sync ownership wording.

### 14. Storage Repair Plan wording is broader than current repair behavior

- **Status:** likely debt plus manual decision.
- **Evidence:** `docs/architecture/DEEPENING-ROADMAP.md:127` says Storage Repair Plan landed; `packages/shared/src/storageMaintenance.ts:100` and `packages/shared/src/storageMaintenance.ts:169` currently cover compaction, thumbnail backfill, reference dedupe review, and tooling-log prune. The larger review wording also names reference migration and orphan Catalog Entry cleanup.
- **Impact:** contributors may assume destructive or broad repair classes exist when the Module currently stays dry-run and narrower.
- **Effort:** medium for implementation, small for documentation correction.
- **Risk:** medium/high if implemented because it touches local data.
- **Confidence:** high.
- **Fix sketch:** split the term into current `StorageMaintenancePlan` and future `ReferenceStoreRepairPlan`, or implement missing dry-run repair items only after the Reference Store layout decision.

### 15. Import Operation documentation overstates current Depth

- **Status:** likely debt.
- **Evidence:** `CONTEXT.md` defines Import Operation as a workflow with progress/readiness semantics; current `lib/importOperation.ts` summarizes import outcomes, while backend External Output Source import remains a synchronous loop in `apps/local-server/src/outputSources.ts`.
- **Impact:** the name has more product depth than the implementation, which can mislead follow-up planning.
- **Effort:** small for doc correction, medium for progress-backed implementation.
- **Risk:** medium.
- **Confidence:** medium/high.
- **Fix sketch:** either narrow the term to `ImportSummaryProjection` or deepen import into an event/progress-backed Operation.

### 16. External provider endpoint bases need explicit redaction/rejection policy

- **Status:** likely debt.
- **Evidence:** runtime config and executor paths accept provider endpoint bases; transcripts are intended to be non-secret, but URLs with userinfo/query tokens could still be represented unless rejected or sanitized.
- **Impact:** Provider Secrets are not intentionally logged, but endpoint URLs can smuggle sensitive material if users configure them with credentials or tokens.
- **Effort:** small.
- **Risk:** low/medium.
- **Confidence:** medium.
- **Fix sketch:** reject endpoint URLs containing username/password/query tokens where inappropriate, or redact them at runtime-config normalization before executor/transcript usage.

## Stale or false-positive debt

- Provider Settings stale reads: not active as originally described. Current provider routes read settings through live app composition and ADR-0032 closed the older stale-provider snapshot issue.
- Missing Provider Registry and missing Persistent Job Intake: false positive after the 2026-06-28 batch. Both Modules exist; remaining debt is consistency and input-boundary depth.
- Missing Style Search Projection and demand mounting: false positive. Search projection and lazy demand mounting exist; remaining debt is load-failure handling and manifest-backed task filter truth.
- Missing Legacy Visual Batch DTO: false positive. The compatibility DTO exists; stale docs still make Visual Batch sound more product-primary than it is.
- Some active handoff docs repeat completed Style tooling/browser-gate work as next tasks. Treat these as documentation debt before assigning another agent.

## Suggested execution order

1. **Safety boundary pass:** `/library/*` public allowlist, Persistent Job Intake safe source-spec parsing, reference validation/write ordering, and reference count/byte budgets.
2. **Provider/runtime consistency pass:** Provider Registry single-source cleanup, worker settings injection, endpoint redaction policy.
3. **Recipe asset contract pass:** Recipe Task Spec projection plus Attachment Intake Module, then Character Lab/Timeline adapters.
4. **Settings and style UX pass:** open-transition Settings hydration, Settings operation surfaces, Style Catalog load error/retry, task filters backed by manifest truth.
5. **Queue and command center honesty pass:** deduped queue counts, explicit backend truncation, HeaderToolbar active-recipe identity from Recipe Discovery.
6. **Ledger reconciliation pass:** update `TECHNICAL_DEBT.md`, `CONTEXT.md`, active handoff docs, and `DEEPENING-ROADMAP.md` to retire false positives and mark manual decisions.

## Improve plan candidates

If this audit becomes an `improve` planning batch, use these as the first small plans:

- Public Library Asset Policy.
- Persistent Job Intake validation and reference transaction cleanup.
- Recipe Attachment Intake plus Recipe Task Spec projection.
- Settings Surface hydration and operation-surface split.
- Architecture/debt ledger reconciliation after ADR-0032.

## Validation for this pass

- Source code was not edited.
- No frontend/runtime behavior changed, so no visual verification was required for closure.
- Recommended next validation if fan-out starts:
  - backend safety changes: focused route/intake/reference tests plus `bun run check`;
  - frontend Settings/Style/Queue changes: focused component tests, `bun run check`, `bun run build`, and Playwright visual smoke.
