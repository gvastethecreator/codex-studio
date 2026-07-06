# Sprite Atlas Implementation Tasks

## Phase 1: Documentation And Local Skill

- [x] Add ADR for the workflow decision.
- [x] Add workflow plan.
- [x] Add task checklist.
- [x] Add repo-local `skills/sprite-atlas-builder`.
- [x] Add skill references and scripts needed by the app workflow.
- [x] Document local skill routing in `SKILLS.md`.

## Phase 2: Shared Contract And Recipe Module

- [x] Add shared Sprite Atlas contracts.
- [x] Add `sprite-atlas` to `RecipeId`.
- [x] Add Recipe Module metadata and params.
- [x] Add `sprite-atlas` Recipe Context builder.
- [x] Add Recipe Provider Directives.
- [x] Add recipe module tests.
- [x] Add route preload/router registration.

## Phase 3: Backend Workflow

- [x] Add Sprite Atlas run service.
- [x] Add Studio Library output folder resolution.
- [x] Add preset listing.
- [x] Add run creation.
- [x] Add row handoff job creation.
- [x] Add row import and blocked sidecar support.
- [x] Add deterministic fixture compose.
- [x] Add QA report endpoint.
- [x] Add backend route tests.

## Phase 4: Frontend Workbench

- [x] Add `SpriteAtlasRecipe` surface.
- [x] Add local service calls.
- [x] Add preset browser with asset-kind filtering.
- [x] Add contract rail with metrics and run preparation.
- [x] Add active-run header with pipeline rail.
- [x] Add row search, row status filtering, and progress cards.
- [x] Add recent run recovery shelf.
- [x] Add run action bar.
- [x] Add batch missing-job creation.
- [x] Add selected row prompt tab backed by server data.
- [x] Add selected row guide/artifacts inspector tabs.
- [x] Add empty/loading/error/blocked states.
- [x] Add recipe card/catalog discovery.
- [x] Add accessible labels for icon or compact controls.

## Phase 4B: Quality Pass Against Character Lab / Styles Bar

- [x] Replace basic select-driven UI with a navigable workbench.
- [x] Make row-level prompts inspectable without opening the filesystem.
- [x] Make run history visible and selectable.
- [x] Make partial progress legible across prepare, handoff, import, compose, and QA.
- [x] Add backend batch handoff creation that avoids duplicate work.
- [x] Keep deterministic fixture compose/QA available for offline verification.
- [x] Keep visual density and hierarchy aligned with Codex Studio rather than a marketing page.

## Phase 5: Verification

- [x] Run focused recipe tests.
- [x] Run focused backend tests.
- [x] Run `bun run recipes:verify`.
- [x] Run `bun run recipes:source:verify`.
- [x] Run `bun run ui:source:verify`.
- [x] Run targeted `bun run check` for changed Sprite Atlas files.
- [x] Run `bun run test`.
- [x] Run `bun run build`.
- [ ] Run clean global `bun run check`.

Global `bun run check` is currently blocked by formatting issues in pre-existing files outside
this implementation scope: `.scratch/TODO.md` and `docs/STYLE_PRESET_ROUTER_AUDIT.md`.

## Deferred After First Complete Pass

- [ ] Full in-app curation editor.
- [ ] Automatic row watcher from Codex job completion into `raw/`.
- [ ] Catalog registration for multi-file atlas packages.
- [ ] Browser visual regression for the workbench.
- [ ] Live imagegen representative row generation in release gate.
- [ ] Real frame extraction from imported strips beyond fixture composition.
