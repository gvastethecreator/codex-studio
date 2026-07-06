# Sprite Atlas Workflow Plan

## Objective

Create a Codex Studio recipe for runtime-ready sprite atlases. The recipe must cover contract design, run preparation, row generation handoff, import, extraction, composition, QA, and export without weakening the current Generation Task / Generation Provider split.

## Product Shape

`sprite-atlas` is a workflow workbench. It is not a single prompt form.

The existing `spritesheet` recipe remains the quick concept/grid recipe. `sprite-atlas` owns production-grade atlas runs.

Supported first-class modes:

- `sprite`: animated character, creature, avatar, pet, or combat rows;
- `tileset`: terrain and platformer tile rows;
- `texture`: flat material samples;
- `asset`: props, icons, pickups, VFX, decals, and still asset packs;
- `custom`: explicit user-defined rows.

## User Path

1. Choose preset and style.
2. Review generated row contract.
3. Prepare run.
4. Generate or import row art.
5. Import accepted rows into the run.
6. Extract frames.
7. Compose atlas.
8. Review QA.
9. Export or catalog the final atlas assets.

The first version must make steps 1-4 real and auditable, and include deterministic fixture-backed extraction/composition/QA so the full workflow can be verified without requiring live image generation.

## UI Plan

Use a route-lazy recipe surface: `components/recipes/SpriteAtlasRecipe.tsx`.

Primary layout:

- Left contract rail: preset browser, asset-kind filter, style, QA mode, background removal, contract metrics, and recent runs.
- Center workbench: active run header, pipeline rail, batch actions, row search, row status filters, row progress cards.
- Right inspector: selected row tabs for layout guide, prompt, artifacts, blocked reason, import controls, atlas preview, and QA details.
- Main action set: `Prepare Run`, `Create Missing Jobs`, `Create Row Job`, `Import Row`, `Block Row`, `Compose Fixture`, `Run QA`.

State vocabulary:

- `draft`
- `prepared`
- `waiting_for_rows`
- `ready_to_extract`
- `composed`
- `qa_passed`
- `blocked`

UX rules:

- Every visible command must execute real behavior or show an actionable blocker.
- Heavy details such as manifests, QA JSON, and logs mount only when opened.
- Blocked image generation writes sidecars; the UI must not create placeholder art.
- Empty states show the next useful action, not marketing copy.
- The recipe should feel like a production workbench: runs are recoverable, prompts are inspectable, and partial progress is visible without opening the filesystem.

## Recipe Module Contract

Recipe id: `sprite-atlas`.

Default task: `sprite_sheet`.

Supported providers: `codex`, `dry_run`.

Core params:

- `presetId`
- `assetKind`
- `stylePreset`
- `customStyle`
- `frameBudget`
- `backgroundRemoval`
- `chromaKey`
- `cellWidth`
- `cellHeight`
- `columns`
- `rows`
- `formats`
- `qaMode`

The Recipe Module must produce a Generation Task Spec whose metadata includes a normalized `spriteAtlas` contract. React components must not build provider prompts directly.

## Backend Workflow Plan

Add `/api/sprite-atlas` routes:

- `GET /api/sprite-atlas/presets`
- `GET /api/sprite-atlas/runs`
- `GET /api/sprite-atlas/runs/:id`
- `GET /api/sprite-atlas/runs/:id/rows/:rowId/prompt`
- `POST /api/sprite-atlas/runs`
- `POST /api/sprite-atlas/runs/:id/row-jobs`
- `POST /api/sprite-atlas/runs/:id/row-jobs/batch`
- `POST /api/sprite-atlas/runs/:id/import-row`
- `POST /api/sprite-atlas/runs/:id/compose-fixture`
- `POST /api/sprite-atlas/runs/:id/qa`

Run folders live under the Studio Library:

```text
outputs/sprite-atlas/<runId>/
  sprite-request.json
  status.json
  prompts/<row>.txt
  references/layout-guides/<row>.png
  raw/
  frames/
  codex-handoff/inbox/
  codex-handoff/outbox/
  codex-handoff/status/
  codex-handoff/logs/
  manifest.json
  atlas.png
  qa/report.json
```

Use backend filesystem code only. Browser code never shells out or writes arbitrary paths.

## Repo-Local Skill Plan

Add:

```text
skills/sprite-atlas-builder/SKILL.md
skills/sprite-atlas-builder/references/
skills/sprite-atlas-builder/scripts/
```

The repo-local skill should preserve the upstream contract while documenting Codex Studio specifics:

- run folders are Studio Library outputs;
- visual generation is delegated to Codex/imagegen jobs;
- blocked jobs write sidecars;
- deterministic fixtures are allowed only for smoke checks;
- final user-facing art still requires imagegen-backed row sources.

## Quality Gates

- Contract visible and serialized.
- Run folder created in Studio Library.
- Prompt and layout guide generated for every row.
- Handoff job JSON references request, prompt, guide, optional identity anchor, and expected output.
- Batch job creation skips rows that already have a job, imported raw art, or extracted frames.
- Selected row prompts are readable from the UI through a backend route.
- Blocked generation has a structured reason.
- QA report distinguishes fixture smoke from representative generated art.
- Final atlas uses `manifest.json.frame_layout`, not inferred runtime slicing.

## Verification Plan

Focused checks:

- Recipe module tests.
- Sprite atlas shared contract tests.
- Backend route tests with a temp Studio Library.
- UI source audit and component-level static checks where practical.

Repo gates:

```bash
bun run recipes:verify
bun run test -- <focused test files>
bun run check -- <changed source files when supported>
```

Broad closeout when practical:

```bash
bun run test
bun run check
bun run build
```
