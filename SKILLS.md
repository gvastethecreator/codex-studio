# Skills de flujo de trabajo de Codex Studio

Este archivo describe flujos de trabajo locales del repo para personas y agentes. No es un glosario; para términos canónicos usa `CONTEXT.md`.

## Setup inicial de Codex Studio

1. Use la skill repo-local `skills/codex-studio-setup/SKILL.md` para preparar un checkout nuevo o reparar una welcome screen bloqueada.
2. El prompt copiable de onboarding debe apuntar a esa skill y pasar snapshot de runtime: repo, API local, Studio Library, `.env.local`, Bun, Codex CLI, app-server, Local Codex Session y readiness.
3. Setup automatico debe operar por comandos soportados del repo: `bun install` cuando haga falta, `bun run studio:init`, `bun run dev`, `/api/health`, `/api/codex/session` y `/api/app-server/start`.
4. Si falta ChatGPT login, detenerse con accion exacta `codex login`; no marcar readiness completa sin sesion real.
5. Mantener Provider Secrets fuera de SQLite, catalogo, logs, capturas, docs y archivos committeados.
6. Cierre: `bun run test`, `bun run check`, `bun run build`. Para cambios de onboarding/frontend, agregar verificacion visual.

## Actualizar dependencias y CI basico

1. Tratar `package.json`, `bun.lock`, `.github/workflows/ci.yml` y `docs/TOOLING.md` como el baseline auditable.
2. Resolver versiones actuales antes de editar: `npm view <package> version` para paquetes npm y tags oficiales de GitHub para actions.
3. Mantener `packageManager`, CI y runtime local en el mismo baseline de Bun.
4. Si cambian `vite`, `oxlint` u `oxfmt`, sincronizar dependencias directas y `overrides`.
5. Usar Bun para mutar dependencias y lockfile; no editar `bun.lock` a mano.
6. Cerrar con `bun install --frozen-lockfile`, `bun run check`, `bun run test` y `bun run build`. El CI basico debe seguir ese mismo contrato.

## Agregar o cambiar un Generation Provider

1. Keep Codex-first product semantics.
2. Add provider capability/config behind Provider Boundary.
3. Keep Provider Secrets outside Studio Settings and SQLite.
4. Add a provider-specific compiler fixture before enabling execution.
5. Compile Generation Task Specs into compact provider-specific Compiled Provider Inputs.
6. Keep inline image data, API keys, provider endpoints, and secret-like metadata out of compiled payloads.
7. Return same local contract as Codex jobs: job state, Local Asset, Catalog Entry, metadata, logs, diagnostics.
8. Add tests for provider selection, input compilation, and failure reporting.
9. Keep provider capability `hasAdapter` false until a concrete executor can produce or import Local Assets.
10. Register concrete external executors in `apps/local-server/src/providers/externalProviderExecutors.ts` only after tests prove they return the same Local Asset contract as Codex jobs.
11. For Google image API, use `apps/local-server/src/providers/googleExecutor.ts`. It accepts `GOOGLE_API_KEY`, `GEMINI_API_KEY`, or `NANO_BANANA_API_KEY`, uses backend env only, calls Gemini `generateContent`, stores inline image output as Local Assets, and must not serialize secrets or input image bytes into transcripts.
12. For Google `image_edit`, require an `input` or `external_output` asset with `localPath`. Import hosted `sourceUrl` assets into local managed storage before execution.
13. For fal.ai, use `apps/local-server/src/providers/falExecutor.ts`. It accepts `FAL_KEY` or `FAL_API_KEY`, uses backend env only, retries transient request/download failures, writes assets/transcripts into the Studio Library, records no-secret transcript diagnostics, and must not serialize secrets into Provider Inputs, logs, transcripts, or API responses.
14. For fal.ai task assets, use `apps/local-server/src/providers/falAssetInputs.ts`. Hosted `sourceUrl` refs can map to `image_url`, `mask_url`, `control_image_url`, and `reference_image_urls`; local `localPath` refs upload through `apps/local-server/src/providers/falStorageUpload.ts`; inline asset bytes are intentionally omitted from compact Provider Inputs and must be imported as `localPath` or `sourceUrl` before execution.
15. For fal.ai `image_edit`, require an `input` or `external_output` asset before network execution. Do not let edit jobs run as text-only generation by accident.

No agregues nombres de task específicos de proveedor como `fal_spritesheet` o `comfy_texture`. Usa Generation Tasks agnósticos de proveedor + configuración del provider.

## Agregar o cambiar un Recipe Module

1. Update `lib/recipeModules.ts` metadata: title, description, parameter descriptors, default task, supported tasks, supported providers.
2. Define parameter schema details there too: group, control, default, options, min/max/step, and required flags.
3. Build provider-independent Generation Task Spec.
4. Put provider-independent derived params in tested helpers instead of React surfaces.
5. Put provider-independent prompt fragments in tested helpers before changing the shared Recipe Context envelope.
6. Put Recipe Context builders in `lib/recipeContextBuilders/<recipe>.ts` and register them in `lib/recipeContextBuilders/index.ts`.
7. Add Recipe Provider Directives only when the Recipe Module has enough structured data or tested derived params to compile safely without the legacy Recipe Context.
8. Avoid putting provider-ready prompt text inside React components.
9. Keep UI as parameter collection and preview.
10. Let providers compile task specs into their own payloads.
11. Store rich task spec for traceability; send compact provider input for execution.

Un Recipe Module no es una página React. La página puede alojar la UI, pero el contrato de workflow debe ser puro y testeable.

Run `bun run recipes:catalog -- --query=<text> --limit=20` to inspect Recipe Modules by text. Add `--task=<task>`, `--provider=<provider_id>`, `--parameter=<param_id>`, `--examples`, or `--json` for agent-ready output.
Run `bun run recipes:verify` before closing broad recipe work. It checks Recipe Module catalog coverage, default task support, provider coverage, duplicate parameter ids, enum options, slider types, required/default conflicts, provider-independent examples, React surface boundaries, and prompt evaluation.
Run `bun run recipes:examples:verify` when changing future asset-task blueprints. Examples must stay `example_only`, provider-independent, and Codex-first (`codex`, `dry_run`) until UI/builders/adapters are explicit.
Run `bun run recipes:source:verify` when changing recipe UI or module plumbing. It blocks React recipe surfaces from importing task-spec builders, Recipe Context builders, Recipe Provider Directives, or provider compilers.
Run `bun run recipes:evaluate:live -- --recipe=<id> --out=logs/recipe-prompt-quality` to plan a live Codex quality comparison without creating jobs. Add `--execute` to queue real legacy-vs-directives jobs through the local backend, record JSON + Markdown review templates, and keep only job/catalog refs plus transcript paths in the repo-local report.

## Agregar o cambiar un Style Preset

1. Prefer `bun run styles:scaffold -- --preset=<ID> --pack=<pack_id> --category=<category id or exact name> --name=<Name> --template=style|sprite|texture` when creating a new preset.
   It is dry-run by default; pass `--write` to mutate files and optionally `--default-image=/assets/...` to prefill a real default image path.
2. Edit `components/recipes/styles/manifests/presets/<pack>/<preset>.yaml` first.
   `styles:scaffold` uses `components/recipes/styles/manifests/templates/style-preset.template.yaml`, `sprite-sheet-preset.template.yaml`, or `texture-preset.template.yaml` under the hood for new presets.
3. Preserve stable `id`, `packId`, `name`, `category`, visual DNA, avoid rules, asset refs, supported tasks, tags, version.
4. Keep taxonomy source language in English for durable ids/tags/labels, and keep `category.id` in `kebab-case` (no `snake_case`, no `videojuegos` legacy slugs).
5. Maintain editorial taxonomy (`packId`, `packName`, `categoryId`, `categoryName`, domain, tags, supported tasks, default image state) so agents can query presets without scanning compatibility packs.
6. Register the preset in both the matching category `presetRefs` and the pack-level `presetRefs`; refs must stay inside the same pack namespace.
7. Keep each preset visually distinct from neighboring presets.
8. Do not collapse motif/avoid constraints into generic prompt text.
9. Validate the edited preset file and any catalog index generated from it.
10. Import manifest-authoring contracts from `components/recipes/styles/manifestTypes.ts` and runtime/UI contracts from `components/recipes/styles/runtimeTypes.ts`. Do not use the retired `components/recipes/styles/types` path.

Run `bun run styles:validate -- --preset=<id>` after editing one granular preset, or `bun run styles:validate -- --pack=<pack_id>` after editing a pack. Use `--coverage` to see taxonomy and default-image coverage by pack, and `--strict-taxonomy` when intentionally requiring persisted taxonomy in the edited scope.
Run `bun run styles:scaffold -- --preset=<id> --pack=<pack_id> --category=<category id or exact name> --name=<Name> --template=style|sprite|texture` to preview the new preset file plus pack/category ref changes before writing them. Add `--write` to apply the scaffold. If `--default-image` is omitted, the scaffold uses `/assets/recipes/styles/defaults/<id>.webp` and leaves `taxonomy.hasDefaultImage: false` until the asset exists.
Run `bun run styles:taxonomy -- --preset=<id>` to backfill editorial taxonomy for one manifest, `--pack=<pack_id>` for one pack, or `--all` only when intentionally regenerating taxonomy across the catalog.
Run `bun run styles:catalog -- --query=<text> --limit=20` to search the Style Preset Catalog without scanning compatibility packs. Add `--pack=<pack_id>`, `--category=<name>`, `--tag=<tag>`, `--task=<task>`, or `--json` for agent-ready output.
Run `bun run styles:runtime` after manifest edits that affect the Styles UI. It regenerates the compact runtime index, pack indexes, and per-category runtime chunks used by `stylesData.ts`, then formats generated files in Windows-safe batches.
Run `bun run styles:runtime:check` to verify the generated runtime file is current without rewriting it. Run `bun run styles:verify` before closing broad preset work.
Run `bun run styles:templates:verify` after changing files in `components/recipes/styles/manifests/templates/`. It checks required image, sprite sheet, and texture templates plus their task coverage.
Run `bun run styles:source:verify` when changing Styles runtime/scripts. It blocks accidental runtime imports from legacy pack YAML, generated runtime check temp files, presets that exist only in legacy pack YAML, YAML files recreated in the retired `components/recipes/styles/packs` directory, retired runtime pack aliases/exports, and imports from the retired `styles/types` path; only source-audit and compatibility-test seams should mention old legacy pack internals.
Run `bun run styles:render:verify` after changing Styles UI grouping, pack runtime data, or virtualized rendering. It reports mounted/eager/placeholder sections plus eager/planned card budgets per pack from `styleBrowserRenderPlan`, keeping large packs from mounting every preset at once. For major Styles UI changes, verify `pack_05` in browser and compare collapsed/expanded DOM counts against this report.
Run `bun run styles:browser:verify -- --url=http://localhost:17222/#recipe-styles` (or the active dev URL) after major Styles UI changes when you want the reusable browser gate instead of a manual pass. If the gate should validate a clean dev console on Windows, start the UI with `VITE_ENABLE_REACT_SCAN=false bun run dev:ui` first.

El pack YAML legacy está retirado. `bun run styles:split`, `scripts/expand-pack-02-pack-05.ts` y `scripts/reorder-style-packs.ts` rechazan mutar manifiestos granulares desde flujos antiguos. Usa `StyleRuntimePack`, `StyleRuntimePreset`, `composeStyleRuntimePacksFromManifests()`, `STYLE_RUNTIME_PACK_SUMMARIES`, `loadStyleRuntimePack()`, `loadStyleRuntimePacks()` y tipos de manifest/catalog para código nuevo. `styles:source:verify` bloquea aliases/export legacy fuera del guard de source-audit.

## Auditar uso de tokens

1. Compare Generation Task Spec size vs Compiled Provider Input size.
2. Move stable boilerplate into Provider Session Contract.
3. Remove repeated prompt instructions before reducing creative detail.
4. Keep source spec complete for traceability.
5. Log or expose compact input only when safe and useful for debugging.
6. Keep Codex imagegen stable instructions in `apps/local-server/src/codex/imagegenContract.ts`; provider compilers and Codex threads should reuse that contract instead of copying boilerplate.
7. Prefer Recipe Provider Directives over legacy Recipe Context only after a focused test proves the compact payload still carries required task detail.
8. Prefer filtered tooling commands (`bun run test -- <file>`, `bun run check -- <file>`) while iterating so broad gates run only at closeout.
9. Use `createProviderInputMetrics()` when adding token/size diagnostics so source spec size, compiled input size, compiled payload size, asset count, inline-asset state, and Provider Session Contract id stay consistent.
10. Treat inline asset bytes as a preflight signal, not debug data; never serialize inline image bytes into Compiled Provider Input logs.

El ahorro de tokens debe venir de mejor compilación, no de debilitar recetas.

Run `bun run providers:audit` to inspect Recipe Module and provider conformance rows, including source spec size, compiled payload size, prompt estimates, Recipe Provider Directives coverage, and inline-data/secret leak checks. Run `bun run providers:verify` before changing provider compilers or removing legacy Recipe Context metadata.
Run `bun run providers:source:verify` after backend route/worker/provider-boundary changes. It blocks route handlers and non-provider backend modules from importing provider compilers, shared hosted result internals, or concrete hosted/local executors.
Run `bun run providers:preflight` before external adapter work. It reports Provider Secret source names and local runtime endpoint state without exposing secret values. Settings reads the same non-secret contract through `/api/providers/preflight`.
Use `apps/local-server/src/providers/externalProvider.ts` as the adapter shell for hosted/local providers. It may compile inputs and fail with preflight diagnostics, but only a concrete executor should make a provider executable. Register concrete executors in `apps/local-server/src/providers/externalProviderExecutors.ts`; Google, fal.ai, and ComfyUI currently have default executors.
Use `apps/local-server/src/providers/externalProviderResults.ts` for hosted image result handling before adding provider-specific download/transcript code. Keep retry policy, image URL extraction, mime/ext inference, asset writes, transcript writes, and secret redaction shared unless a provider truly needs a different contract.
For ComfyUI, use `apps/local-server/src/providers/comfyExecutor.ts`. It requires `COMFY_API_URL` or `COMFYUI_API_URL` plus `COMFY_WORKFLOW_TEMPLATE_PATH`. The template must be a Comfy workflow JSON with `{{prompt}}` and optional `{{negativePrompt}}` placeholders. The executor submits `/prompt`, polls `/history/{prompt_id}`, imports the first `/view` image into the Studio Library, and records only compact no-secret diagnostics.

## Auditar y compactar storage local

1. Start with Studio Settings -> Storage Maintenance for interactive work, or `bun run storage:audit` for automation. It reports database size, WAL/SHM size, row counts, oversized JSON fields, inline `data:image` markers, missing thumbnails, reference dedupe stats, tooling-log size, and Studio Library directory sizes without printing prompts, transcript text, secrets, or inline image data.
2. Use `bun run storage:compact` for dry-run planning only. It reports how many historical inline image payloads would be omitted and whether adjacent `localPath` files make them recoverable.
3. Write compaction is intentionally guarded: stop the local server, review the dry-run output, then run `bun run storage:compact -- --write --confirm=compact-inline-payloads`. Add `--vacuum` only after a successful write plan if you want SQLite file-size reclamation.
4. Use `bun run storage:thumbnails:backfill` to dry-run missing historical catalog thumbnail rows in bounded batches. Write mode requires `--write --confirm=backfill-thumbnails`; review source-missing counts before writing because those rows need orphan cleanup instead of thumbnail generation.
5. Compaction may make old inline-only assets non-retryable when no local reference can be reconstructed. The command marks omitted payloads explicitly instead of pretending the bytes still exist.
6. Do not run write compaction as a release gate or automatic migration.
7. Do not delete duplicate reference files until a content-addressed Reference Store exists.
8. Use Storage Maintenance or `bun run tooling:logs:prune` when repo-local `logs/tooling` history needs manual cleanup; normal tooling runs prune timestamped logs automatically.

## Endurecer cola de generación

1. Validate `Generation Task Spec` before enqueue when a job carries `sourceSpec`.
2. Local queued jobs with `metadata.workspaceId` or `metadata.batchId` must use `batch-*` batch ids and `spec-batch-*` spec ids.
3. After backend reference persistence, provider execution must not receive inline `data:image/*;base64` task assets; assets should be hydrated to `localPath` or accepted `sourceUrl`.
4. Return normalized validation fields (`code`, `field`, `reason`, `issues`) so UI and agents can diagnose without backend stack traces.
5. Keep reference persistence in `apps/local-server/src/referenceManager.ts`; do not let route handlers or providers write ad-hoc reference files.

Run focused coverage first:

```bash
bun run test -- packages/shared/src/generationContracts.test.ts apps/local-server/src/jobRoutes.test.ts
bun run check -- packages/shared/src/generationContracts.ts packages/shared/src/generationContracts.test.ts apps/local-server/src/jobRoutes.ts apps/local-server/src/jobRoutes.test.ts
```

## Mejorar calidad de generación

1. Keep quality semantics in provider-independent `Generation Task Spec.quality`, not React surfaces.
2. Use compact quality presets (`image_general`, `image_edit`, `style_reference`, `sprite_sheet`, `texture`, `product_or_ui_asset`) to add intent without restoring huge Recipe Context prompts.
3. Providers should compile quality sections with `composeGenerationQualityPromptSections()` before recipe directives, then keep stable output rules in Provider Session Contract.
4. Do not duplicate the base prompt or `negativePrompt` inside quality fields; only add real structured hints such as style, color, constraints, and reference-role instructions.
5. For live evidence, run dry evaluation first and store only job/catalog/transcript refs plus reviewer notes.
6. The repo-local `skills/imagegen/SKILL.md` must understand recipe-generated jobs with or without UI: plain Codex prompts plus recipe id/preset/task/params are valid, `/imagine` is not required, and the skill should preserve each Recipe Module output shape instead of flattening everything into generic image generation.

Focused validation:

```bash
bun run test -- packages/shared/src/generationContracts.test.ts lib/recipeModules.test.ts apps/local-server/src/providers/codexProvider.test.ts apps/local-server/src/providers/externalProviderInputs.test.ts scripts/evaluate-recipe-prompts.test.ts
bun run providers:verify
bun run recipes:verify
```

## Agregar UI o configuración de Settings

1. Ask: is this Bootstrap Configuration, Studio Settings, or Provider Secret?
2. Bootstrap Configuration: `.env.local`, ports, initial library path, dev flags.
3. Studio Settings: editable non-secret preferences stored with Studio Library.
4. Provider Secret: backend-only secret source, never SQLite/catalog.
5. Expose secret state as configured/missing/invalid only.
6. Expose runtime preflight source names only, never actual secret values or endpoint values.
7. Open settings from Command Center.
8. Keep Studio Library roots clean: internal state belongs in `.studio/`, generated images and exports belong in `outputs/`.
9. Output organization preferences may control subfolders by date/provider/model/recipe and file-name templates; keep defaults readable and avoid exposing secret/provider endpoint values.

## Trabajar con carpetas de salida

1. Detect likely External Output Sources.
2. Let user register source.
3. Registration only records path intent; it must not import, delete, move, tag, or catalog files by itself.
4. Import selected image files by copying them into Studio Library before catalog/delete/move/tag.
5. Run catalog operations only on managed Local Assets.
6. Preserve original external folder unless user explicitly asks for cleanup.

## Avanzar hacia una UI catalog-first

1. Treat Image Catalog / Catalog Entries as durable read model.
2. Keep Visual Batch as a compatibility adapter only while legacy grid surfaces need it.
3. Put Catalog Entry grouping/filtering in `lib/studioCatalogView.ts`.
4. Put Catalog Entry UI image materialization in `lib/studioCatalogImageAdapter.ts`, and keep legacy `GenerationBatch[]` snapshots behind explicit compatibility helpers.
5. Do not read `catalog-cache`, `GlobalContext`, or `useIndexedDBStorage` from `useCatalog`.
6. Run `bun run catalog:source:verify` after changing catalog/grid read paths.

## Limpieza de UI

1. Global status and entry points go to Command Center.
2. Heavy detail panels become Demand-Mounted Surfaces.
3. Do not keep hidden diagnostics, activity, provider internals, or animated effects mounted.
4. Keep toolbar scannable: summaries and commands, not full settings.
5. Verify rendered UI after substantial visual changes.
6. Run `bun run ui:chunks:verify` after bundle-splitting work. `bun run build` already runs the same guard after the UI build.
7. Run `bun run ui:source:verify` after changing demand-mounted UI boundaries. It blocks known heavy imports from returning to startup/source shells; `bun run validate:full` runs it before build.

Current chunk budgets:

- `index-*`: max 500 KB
- `StylesRecipe-*`: max 80 KB
- `StylePresetCatalogSearchSurface-*`: max 20 KB
- `stylePresetCatalogData-*`: max 180 KB
- `CameraAnglesRecipe-*`: max 40 KB
- `three.module-*`: max 800 KB, demand-loaded Camera viewport only
- `jszip.min-*`: max 120 KB, demand-loaded ZIP export only
