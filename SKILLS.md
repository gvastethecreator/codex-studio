# Codex Studio Workflow Skills

This file describes repo-local workflows for humans and agents. It is not the glossary; use `CONTEXT.md` for terms.

## Add Or Change A Generation Provider

1. Keep Codex-first product semantics.
2. Add provider capability/config behind Provider Boundary.
3. Keep Provider Secrets outside Studio Settings and SQLite.
4. Compile Generation Task Specs into provider-specific Compiled Provider Inputs.
5. Return same local contract as Codex jobs: job state, Local Asset, Catalog Entry, metadata, logs, diagnostics.
6. Add tests for provider selection, input compilation, and failure reporting.

Do not add provider-specific task names such as `fal_spritesheet` or `comfy_texture`. Use provider-independent Generation Tasks plus provider config.

## Add Or Change A Recipe Module

1. Update `lib/recipeModules.ts` metadata: title, description, parameter descriptors, default task, supported tasks, supported providers.
2. Build provider-independent Generation Task Spec.
3. Avoid putting provider-ready prompt text inside React components.
4. Keep UI as parameter collection and preview.
5. Let providers compile task specs into their own payloads.
6. Store rich task spec for traceability; send compact provider input for execution.

Recipe Module is not a React page. React page can host recipe UI, but the workflow contract must be pure and testable.

## Add Or Change A Style Preset

1. Edit `components/recipes/styles/manifests/presets/<pack>/<preset>.yaml` first.
2. Preserve stable `id`, `packId`, `name`, `category`, visual DNA, avoid rules, asset refs, supported tasks, tags, version.
3. Keep each preset visually distinct from neighboring presets.
4. Do not collapse motif/avoid constraints into generic prompt text.
5. Validate the edited preset file and any catalog index generated from it.

When changing legacy pack YAML, run `bun run styles:split` and verify graph tests. `STYLE_PACKS` is compatibility output, not the authoring surface.

## Audit Token Usage

1. Compare Generation Task Spec size vs Compiled Provider Input size.
2. Move stable boilerplate into Provider Session Contract.
3. Remove repeated prompt instructions before reducing creative detail.
4. Keep source spec complete for traceability.
5. Log or expose compact input only when safe and useful for debugging.

Token savings should come from better compilation, not weaker recipes.

## Add Settings UI Or Config

1. Ask: is this Bootstrap Configuration, Studio Settings, or Provider Secret?
2. Bootstrap Configuration: `.env.local`, ports, initial library path, dev flags.
3. Studio Settings: editable non-secret preferences stored with Studio Library.
4. Provider Secret: backend-only secret source, never SQLite/catalog.
5. Expose secret state as configured/missing/invalid only.
6. Open settings from Command Center.

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
