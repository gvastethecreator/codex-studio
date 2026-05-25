# Codex Studio Workflow Skills

This file describes repo-local workflows for humans and agents. It is not the glossary; use `CONTEXT.md` for terms.

## Add Or Change A Generation Provider

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

Do not add provider-specific task names such as `fal_spritesheet` or `comfy_texture`. Use provider-independent Generation Tasks plus provider config.

## Add Or Change A Recipe Module

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

Recipe Module is not a React page. React page can host recipe UI, but the workflow contract must be pure and testable.

Run `bun run recipes:catalog -- --query=<text> --limit=20` to inspect Recipe Modules by text. Add `--task=<task>`, `--provider=<provider_id>`, `--parameter=<param_id>`, or `--json` for agent-ready output.
Run `bun run recipes:verify` before closing broad recipe work. It checks Recipe Module catalog coverage, default task support, provider coverage, duplicate parameter ids, enum options, slider types, and required/default conflicts.
Run `bun run recipes:source:verify` when changing recipe UI or module plumbing. It blocks React recipe surfaces from importing task-spec builders, Recipe Context builders, Recipe Provider Directives, or provider compilers.

## Add Or Change A Style Preset

1. Edit `components/recipes/styles/manifests/presets/<pack>/<preset>.yaml` first.
2. Preserve stable `id`, `packId`, `name`, `category`, visual DNA, avoid rules, asset refs, supported tasks, tags, version.
3. Maintain editorial taxonomy (`packId`, `packName`, `categoryId`, `categoryName`, domain, tags, supported tasks, default image state) so agents can query presets without scanning compatibility packs.
4. Keep each preset visually distinct from neighboring presets.
5. Do not collapse motif/avoid constraints into generic prompt text.
6. Validate the edited preset file and any catalog index generated from it.

Run `bun run styles:validate -- --preset=<id>` after editing one granular preset, or `bun run styles:validate -- --pack=<pack_id>` after editing a pack. Use `--coverage` to see taxonomy and default-image coverage by pack, and `--strict-taxonomy` when intentionally requiring persisted taxonomy in the edited scope.
Run `bun run styles:taxonomy -- --preset=<id>` to backfill editorial taxonomy for one manifest, `--pack=<pack_id>` for one pack, or `--all` only when intentionally regenerating taxonomy across the catalog.
Run `bun run styles:catalog -- --query=<text> --limit=20` to search the Style Preset Catalog without scanning compatibility packs. Add `--pack=<pack_id>`, `--category=<name>`, `--tag=<tag>`, `--task=<task>`, or `--json` for agent-ready output.
Run `bun run styles:runtime` after manifest edits that affect the Styles UI. It regenerates the compact runtime data used by `stylesData.ts` and formats the generated file.
Run `bun run styles:runtime:check` to verify the generated runtime file is current without rewriting it. Run `bun run styles:verify` before closing broad preset work.
Run `bun run styles:source:verify` when changing Styles runtime/scripts. It blocks accidental runtime imports from legacy pack YAML; only migration and compatibility-test seams should touch `LEGACY_STYLE_PACKS` or `components/recipes/styles/packs`.

Legacy pack YAML is migration input only. `bun run styles:split` intentionally refuses to overwrite granular manifests. Use `bun run styles:split:legacy` only for an explicit one-time migration from `components/recipes/styles/packs`, then run `bun run styles:verify`. `STYLE_PACKS` is compatibility output, not the authoring surface.

## Audit Token Usage

1. Compare Generation Task Spec size vs Compiled Provider Input size.
2. Move stable boilerplate into Provider Session Contract.
3. Remove repeated prompt instructions before reducing creative detail.
4. Keep source spec complete for traceability.
5. Log or expose compact input only when safe and useful for debugging.
6. Keep Codex imagegen stable instructions in `apps/local-server/src/codex/imagegenContract.ts`; provider compilers and Codex threads should reuse that contract instead of copying boilerplate.
7. Prefer Recipe Provider Directives over legacy Recipe Context only after a focused test proves the compact payload still carries required task detail.
8. Prefer filtered tooling commands (`bun run test -- <file>`, `bun run check -- <file>`) while iterating so broad gates run only at closeout.

Token savings should come from better compilation, not weaker recipes.

Run `bun run providers:audit` to inspect Recipe Module and provider conformance rows, including source spec size, compiled payload size, prompt estimates, Recipe Provider Directives coverage, and inline-data/secret leak checks. Run `bun run providers:verify` before changing provider compilers or removing legacy Recipe Context metadata.
Run `bun run providers:preflight` before external adapter work. It reports Provider Secret source names and local runtime endpoint state without exposing secret values. Settings reads the same non-secret contract through `/api/providers/preflight`.
Use `apps/local-server/src/providers/externalProvider.ts` as the adapter shell for hosted/local providers. It may compile inputs and fail with preflight diagnostics, but only a concrete executor should make a provider executable. Register concrete executors in `apps/local-server/src/providers/externalProviderExecutors.ts`; Google and fal.ai currently have default executors, while ComfyUI remains planned.
Use `apps/local-server/src/providers/externalProviderResults.ts` for hosted image result handling before adding provider-specific download/transcript code. Keep retry policy, image URL extraction, mime/ext inference, asset writes, transcript writes, and secret redaction shared unless a provider truly needs a different contract.

## Add Settings UI Or Config

1. Ask: is this Bootstrap Configuration, Studio Settings, or Provider Secret?
2. Bootstrap Configuration: `.env.local`, ports, initial library path, dev flags.
3. Studio Settings: editable non-secret preferences stored with Studio Library.
4. Provider Secret: backend-only secret source, never SQLite/catalog.
5. Expose secret state as configured/missing/invalid only.
6. Expose runtime preflight source names only, never actual secret values or endpoint values.
7. Open settings from Command Center.

## Work With Output Folders

1. Detect likely External Output Sources.
2. Let user register source.
3. Registration only records path intent; it must not import, delete, move, tag, or catalog files by itself.
4. Import selected image files by copying them into Studio Library before catalog/delete/move/tag.
5. Run catalog operations only on managed Local Assets.
6. Preserve original external folder unless user explicitly asks for cleanup.

## UI Cleanup

1. Global status and entry points go to Command Center.
2. Heavy detail panels become Demand-Mounted Surfaces.
3. Do not keep hidden diagnostics, activity, provider internals, or animated effects mounted.
4. Keep toolbar scannable: summaries and commands, not full settings.
5. Verify rendered UI after substantial visual changes.
