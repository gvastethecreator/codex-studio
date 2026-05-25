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

3. **Codex-only Provider Boundary**
   - Move existing Codex image generation behind the provider interface first.
   - Do not add external providers until the Codex provider proves the contract with current jobs, assets, catalog entries, metadata, logs, and diagnostics.
   - Audit repeated prompt boilerplate and move stable instructions into the provider/session contract.

4. **Studio Settings**
   - Add backend/API support for editable Studio Settings stored with the Studio Library.
   - Keep `.env.local` for Bootstrap Configuration, ports, development flags, and secrets.
   - Done: support output-source discovery and registration without unmanaged destructive file operations.
   - Done: backend can list registered source image files and import selected files by copying them into the Studio Library as Catalog Entries.
   - Next: expose file selection/import in the settings UI or a dedicated Demand-Mounted Surface.

5. **Command Center and demand-mounted UI**
   - Move global status, usage, active provider, queue summary, library/workspace switching, and settings entry points into the top toolbar.
   - Convert heavy diagnostics, settings, activity, and provider internals into Demand-Mounted Surfaces.
   - Avoid permanent floating global panels.

6. **Recipe Modules**
   - Done: `lib/recipeModules.ts` now exposes declarative module metadata, parameter descriptors, supported tasks, and Codex-first provider compatibility.
   - Done: module compatibility is checked before provider compilation.
   - Done: recipe metadata is preserved in Generation Task Spec metadata for traceability.
   - Next: move recipe-specific param schemas closer to each recipe surface, and expose module metadata to UI/options instead of duplicating control knowledge in React.

7. **Style Preset Manifests**
   - Done: generated lightweight Style Pack Manifests plus granular Style Preset Manifests under `components/recipes/styles/manifests/`.
   - Done: compatibility `STYLE_PACKS` is now composed from manifests so current UI keeps working.
   - Done: validation covers graph refs, duplicate/orphan manifests, and legacy preset count parity.
   - Next: author new presets directly in granular files, add editorial taxonomy fields where needed, and retire monolithic pack YAML as source once scripts are updated.

## Guardrails

- Treat Codex as the primary product integration, not just one provider among many.
- Keep provider-specific SDKs, credentials, retries, and output discovery behind backend adapters.
- Do not weaken recipe data to save tokens; optimize provider compilers and repeated session instructions instead.
- Import external outputs into a Studio Library before catalog, delete, move, tag, or metadata operations.
- Keep UI labels and workflows consistent with the existing professional tool direction.
- Do not mark this roadmap complete until style generation scripts, recipe modules, provider adapters, settings/output-source UX, and UI performance follow-ups are audited against current files.
- Registration is not import: External Output Source registry proves safe path intent only. Import must be an explicit copy into the Studio Library.
