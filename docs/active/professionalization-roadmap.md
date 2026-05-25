# Codex Studio Professionalization Roadmap

## Goal

Turn Codex Studio into a more professional local-first image studio while preserving its Codex-first product center. The work should reduce token waste, clarify provider boundaries, improve UI command flow, make configuration editable, and make recipes and style presets easier for people and agents to maintain.

## Execution Order

1. **Agent and project guidance**
   - Add or update `AGENTS.md`, `SKILLS.md`, and architecture docs.
   - Keep `CONTEXT.md` as glossary-only.
   - Document validation commands, safe file operations, Codex official-doc alignment, provider work, recipe work, style-preset work, and token audits.

2. **Core task/provider contracts**
   - Introduce shared types for **Generation Task**, **Generation Provider**, **Generation Task Spec**, **Compiled Provider Input**, and **Provider Session Contract**.
   - Preserve Codex-first behavior while making provider selection explicit.
   - Keep task names provider-independent.
   - Done: provider capabilities are modeled as shared data so UI, API, and tests can distinguish active adapters from planned or unconfigured providers.

3. **Codex-only Provider Boundary**
   - Move existing Codex image generation behind the provider interface first.
   - Do not add external providers until the Codex provider proves the contract with current jobs, assets, catalog entries, metadata, logs, and diagnostics.
   - Audit repeated prompt boilerplate and move stable instructions into the provider/session contract.
   - Done: Local Generation Run now resolves provider selection from explicit input or Studio Settings before creating Generation Task Specs and Jobs.
   - Done: Settings now exposes provider capability status from `/api/providers` without leaking secret values.
   - Done: job creation now rejects providers that are planned, unconfigured, or unknown instead of silently routing them into Codex.
   - Done: added a dry-run Provider Boundary compiler fixture so future adapters can prove Compiled Provider Input shape before calling hosted SDKs or local runtimes.
   - Done: added external compiler conformance fixtures for Google, fal.ai, and ComfyUI. They compile Generation Task Specs into compact provider inputs without serializing inline image data, Provider Secrets, or runtime endpoints.
   - Done: added a Provider Input Compiler registry so diagnostics and future adapters can compile provider inputs through one seam instead of importing provider-specific modules directly.
   - Done: Codex imagegen stable instructions now live in one Provider Session Contract reused by the compiler, persistent thread developer instructions, and fallback prompt.
   - Done: added `providers:audit` / `providers:verify` so Recipe Module specs and external conformance fixtures can prove Compiled Provider Input size, compactness, Recipe Provider Directives coverage, stable-instruction omission, and inline-data/secret leak safety.
   - Done: added external provider runtime preflight for Google, fal.ai, and ComfyUI so Provider Secret sources and local endpoints are validated without exposing secret values.
   - Done: `/api/providers/preflight` and Settings expose non-secret preflight diagnostics so users can see missing Provider Secret sources or invalid local endpoints before execution adapters exist.
   - Done: added an external provider adapter shell behind the worker Provider Boundary. It compiles provider inputs, applies runtime preflight, reports missing runtime requirements clearly, and delegates real execution through a provider executor.
   - Done: fal.ai now has the first concrete hosted executor. It reads `FAL_KEY` or `FAL_API_KEY` from backend env only, posts compact inputs to `fal.run`, downloads the first image result into the Studio Library, writes a non-secret transcript, and marks fal capability executable only when preflight passes.
   - Done: external provider executors now live behind a registry. The shell no longer hardcodes fal.ai, and Google/ComfyUI can be added without changing execution flow or enabling planned providers early.
   - Done: fal.ai executor now retries transient request/download failures, records request/image attempts in the non-secret transcript, and redacts configured secret values from provider error snippets.
   - Done: hosted provider result handling now has a shared normalizer for retry, image URL extraction, asset download, mime/ext inference, local asset pathing, non-secret transcripts, and response snippets. fal.ai consumes it; Google/fal-compatible hosted executors can reuse it.
   - Done: fal.ai executor maps hosted task asset `sourceUrl` refs into common request fields (`image_url`, `mask_url`, `control_image_url`, `reference_image_urls`).
   - Done: fal.ai executor uploads `localPath` task assets to fal CDN via `@fal-ai/client` before request body creation, without putting Provider Secrets in compiled inputs, logs, transcripts, or API responses.
   - Done: fal.ai `image_edit` now fails before network when no `input` or `external_output` asset can map to `image_url`, and inline assets produce an actionable compact-input policy error instead of pretending upload can happen from omitted bytes.
   - Done: hosted transcripts can include no-secret provider diagnostics. fal.ai records asset counts, asset roles, request field names, and image/mask/reference usage without storing hosted input URLs or secret values.
   - Done: Google Gemini image API now has a concrete hosted executor. It calls `generateContent`, stores inline image data as Local Assets, supports text-to-image plus localPath-backed `image_edit`, and marks Google executable only when backend preflight finds a configured Provider Secret.
   - Done: Google `image_edit` sends image assets before the prompt text to match edit-mode conventions.
   - Done: ComfyUI now has a concrete executor that reads `COMFY_WORKFLOW_TEMPLATE_PATH` to load and merge user prompt/negative-prompt into a JSON workflow template for local runtimes. It submits the workflow via `/prompt`, polls `/history`, finds the first image output, and streams the result into the Studio Library via the shared `storeHostedImageResult` normalizer. Comfy remains blocked from execution until both `COMFY_API_URL`/`COMFYUI_API_URL` and `COMFY_WORKFLOW_TEMPLATE_PATH` are configured.
   - Done: ComfyUI capability is executable only when a concrete executor exists and preflight passes both local endpoint and workflow template config.

4. **Studio Settings**
   - Add backend/API support for editable Studio Settings stored with the Studio Library.
   - Keep `.env.local` for Bootstrap Configuration, ports, development flags, and secrets.
   - Done: support output-source discovery and registration without unmanaged destructive file operations.
   - Done: backend can list registered source image files and import selected files by copying them into the Studio Library as Catalog Entries.
   - Done: Settings exposes registered source scanning, file selection, explicit selected-file import, and provider runtime preflight state.

5. **Command Center and demand-mounted UI**
   - Move global status, usage, active provider, queue summary, library/workspace switching, and settings entry points into the top toolbar.
   - Convert heavy diagnostics, settings, activity, and provider internals into Demand-Mounted Surfaces.
   - Avoid permanent floating global panels.
   - Done: recipe surfaces are demand-loaded; the initial UI bundle dropped from about 4.87 MB to about 1.10 MB, with the heavy Styles surface isolated in its own chunk.
   - Done: Styles grid now renders categories and large categories progressively with explicit expansion controls.
   - Done: Styles runtime data no longer imports the full editorial catalog, dropping the built Styles Recipe chunk from about 2.20 MB to about 1.18 MB.
   - Done: Styles category groups now use viewport-aware mounting with estimated placeholders, so offscreen preset cards do not mount until their group is near the Style Browser viewport.
   - Done: Style Preset Catalog search is now a lazy Demand-Mounted Surface opened from Styles, so the editorial YAML graph loads only when needed.
   - Done: all heavy modals (`ImageEditorModal`, `TrashModal`, `LimitReachedModal`, `StudioSettingsModal`, `DashboardModal`, `DebugPanel`, `OnboardingModal`) are now lazy-demand-mounted with conditional render + `Suspense`. Each modal in its own chunk outside the main bundle.
   - Done: `AppOverlays` itself is `React.lazy` from `AppContent` with a `Suspense` boundary, deferring all overlay chunks until after initial paint.
   - Done: added UI integration tests for QueuePanel stats (3 tests), StudioViewport routing (2 tests), and HeaderToolbar status/labels (existing test preserved). Suite now at 66 files, 204 tests.
   - Next: add rendered UI measurements for large expanded packs.

6. **Recipe Modules**
   - Done: `lib/recipeModules.ts` now exposes declarative module metadata, parameter descriptors, supported tasks, and Codex-first provider compatibility.
   - Done: module compatibility is checked before provider compilation.
   - Done: recipe metadata is preserved in Generation Task Spec metadata for traceability.
   - Done: added a Recipe Module Catalog and `recipes:catalog`/`recipes:verify` scripts so humans and agents can inspect recipe identity, tasks, providers, and parameters without reading React pages.
   - Done: `RecipesView` now uses Recipe Module Catalog metadata for card text instead of duplicating titles and descriptions in the React page.
   - Done: Recipe Module parameter descriptors now include groups, controls, defaults, enum options, numeric ranges, required flags, and validation before Generation Task Spec creation.
   - Done: Recipe Module Catalog exposes `defaultParams`, `parameterGroups`, and `requiredParameterIds`, and `recipes:verify` checks enum options, slider types, and required/default conflicts.
   - Done: recipe surfaces now consume central Recipe Module options/defaults/ranges through a small UI projection helper for Spritesheet, Remaster, Cinematic, Character, Camera, and Timeline controls.
   - Done: camera translation and Timeline temporal mapping now live in tested provider-independent derived-param helpers instead of React surfaces.
   - Done: Character, Cinematic, and Spritesheet prompt fragments now live in tested provider-independent helpers instead of being embedded directly in the shared Recipe Context builder.
   - Done: full Recipe Context builders now live in per-Recipe Module files behind a single registry, leaving `lib/recipeContext.ts` as the small envelope resolver.
   - Done: all current Recipe Modules now include compact Recipe Provider Directives in Generation Task Specs, and Codex plus external provider compilers prefer them over legacy Recipe Context when present.
   - Done: added `recipes:source:verify` and wired it into `recipes:verify` so React recipe surfaces stay UI-only and cannot pull task-spec builders, Recipe Context builders, Recipe Provider Directives, or provider compilers back into components.
   - Done: added `recipes:evaluate` script and test harness that generates bare/legacy/directives prompt variants per recipe module, measures token savings (41–56% directives vs legacy), and writes JSON evaluation reports. Supports `--dry-run`, `--out=<dir>`, and `--recipe=<id>` filters.
   - Next: run live Codex output quality comparison using the evaluation harness before removing legacy Recipe Context from job metadata.

7. **Style Preset Manifests**
   - Done: generated lightweight Style Pack Manifests plus granular Style Preset Manifests under `components/recipes/styles/manifests/`.
   - Done: compatibility `STYLE_PACKS` is now composed from manifests so current UI keeps working.
   - Done: validation covers graph refs, duplicate/orphan manifests, and legacy preset count parity.
   - Done: runtime Styles data no longer imports monolithic legacy pack YAML when granular manifests are present.
   - Done: style default scripts now load and validate granular manifests before falling back to legacy packs.
   - Done: added a manifest-first Style Preset Catalog interface for direct preset, pack, and category lookups.
   - Done: Styles favorites and pack resolution now use the Style Preset Catalog instead of scanning compatibility packs.
   - Done: Style Preset Manifests now have an editorial taxonomy contract, and the split script emits it for future manifest generation.
   - Done: added `styles:validate` so individual granular preset edits can be verified without touching legacy pack YAML.
   - Done: added `styles:taxonomy` and backfilled persisted taxonomy for `SP01-001` as the first direct-authoring proof.
   - Done: `pack_01` now has persisted taxonomy across all 80 Style Preset Manifests and passes strict pack validation.
   - Done: `styles:validate -- --coverage` reports taxonomy and default-image coverage by pack so backfills can be audited incrementally.
   - Done: `pack_02` now has persisted taxonomy across all 120 Style Preset Manifests and passes strict pack validation.
   - Done: `pack_03` now has persisted taxonomy across all 80 Style Preset Manifests and passes strict pack validation.
   - Done: `pack_04` now has persisted taxonomy across all 100 Style Preset Manifests and passes strict pack validation.
   - Done: `pack_05` now has persisted taxonomy across all 372 Style Preset Manifests and passes strict pack validation.
   - Done: `pack_06` through `pack_11` now have persisted taxonomy across their remaining 500 Style Preset Manifests and pass strict pack validation.
   - Done: `styles:validate -- --coverage --strict-taxonomy` now proves all 1,252 Style Preset Manifests have persisted taxonomy and default images.
   - Done: added `styles:catalog` so humans and agents can query the Style Preset Catalog by text, pack, category, tag, task, and JSON output without scanning compatibility packs.
   - Done: split the heavy Style Preset Catalog graph into `stylePresetCatalogData.ts` and generated a compact `styleRuntimeData.generated.ts` path for `stylesData.ts`, so the visual Styles Recipe no longer constructs catalog/taxonomy indexes at mount time.
   - Done: added `styles:runtime:check` and `styles:verify` so generated Styles runtime data can be proven current without rewriting files.
   - Done: Style Preset Manifest validation now checks authoring-contract drift beyond graph references, including duplicate packs/categories, empty identities, unknown packs, empty visual DNA, taxonomy pack/category drift, and taxonomy tag/task drift.
   - Done: added `styles:source:verify` and wired it into `styles:verify` so runtime code cannot accidentally reintroduce legacy pack YAML as the authoring source. Legacy usage is now limited to the compatibility loader, migration split script, and compatibility tests.
   - Done: `styles:split` now refuses to overwrite granular manifests from legacy pack YAML unless the migration-only `styles:split:legacy` path is used explicitly.
   - Next: author new presets directly in granular files, keep `styles:runtime` in sync with manifest edits, and retire monolithic pack YAML files after compatibility parity no longer needs them.
   - Done: authored `SP01-081` (Soft Editorial Window) as first direct-granular preset proof. Full authoring cycle verified: create YAML → register in pack manifest → validate → regenerate runtime data. Added `docs/STYLE_PRESET_AUTHORING.md` with YAML template, taxonomy contract, and workflow commands.
   - Done: Style Preset Catalog search data is now split into lazy per-pack YAML chunks. `stylePresetCatalogData.ts` uses `eager: false` globs with async `loadStylePresetCatalog()`. The `StylePresetCatalogSearchSurface` is demand-mounted via `React.lazy` in `StylesRecipe` and loads catalog data asynchronously with a loading state. The search surface chunk dropped from about 2,113 KB to about 189 KB.

8. **Pipeline and token efficiency**
   - Done: `scripts/tooling-task.ts` forwards extra args for filtered `test`, `check`, `check:fix`, `fmt`, `fmt:check`, and `test:coverage` runs. Focused validation now executes only requested files during iteration.
   - Done: Codex imagegen stable instructions moved into one Provider Session Contract and Styles recipe payloads now compile from compact Recipe Provider Directives when available.
   - Done: `providers:audit` reports source spec size, compiled payload size, prompt character estimates, directive/context deltas, and unsafe inline-data/secret leakage for current provider compilers.
   - Done: added `recipes:evaluate` script and test harness. Generates bare/legacy/directives prompt variants per recipe, measures size savings (41–56% directives vs legacy), and writes JSON evaluation reports. Supports `--dry-run`, `--out=<dir>`, and `--recipe=<id>` filters.
   - Done: added backend DI seam for logger. `appFactory` now accepts `dependencies.logger` and injects it into the worker controller. `getDefaultWorkerController` accepts an optional `logger` override. `useStudioRuntime` hook and `services/studioRuntime.ts` now have clarifying JSDoc distinguishing the React orchestrator from the static config adapter.
   - Next: audit validation scripts for other broad scans that can accept changed-file scopes before the final closeout gate.

## Guardrails

- Treat Codex as the primary product integration, not just one provider among many.
- Keep provider-specific SDKs, credentials, retries, and output discovery behind backend adapters.
- Keep external provider capabilities blocked until a concrete executor is wired; the adapter shell is not enough to mark a provider executable.
- Do not weaken recipe data to save tokens; optimize provider compilers and repeated session instructions instead.
- Import external outputs into a Studio Library before catalog, delete, move, tag, or metadata operations.
- Keep UI labels and workflows consistent with the existing professional tool direction.
- Do not mark this roadmap complete until style generation scripts, recipe modules, provider adapters, settings/output-source UX, and UI performance follow-ups are audited against current files.
- Registration is not import: External Output Source registry proves safe path intent only. Import must be an explicit copy into the Studio Library.
