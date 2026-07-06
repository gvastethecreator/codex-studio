# ADR 0001: Sprite Atlas Workflow Recipe

## Status

Accepted for implementation.

## Context

Codex Studio already has a `spritesheet` recipe for simple generated grids and Character Lab can request sprite-like actions. Neither surface owns the complete production workflow needed for runtime-ready sprite atlases: a contract, row prompts, layout guides, row-by-row image generation, extraction, curation, atlas composition, QA reports, and a durable `manifest.json.frame_layout`.

The local `sprite-atlas-builder` skill defines the intended pipeline:

```text
preset/custom contract -> sprite-request.json -> layout guides + row prompts
-> imagegen row strips -> background removal + frame extraction
-> curated frames -> atlas PNG + manifest.json.frame_layout
```

Codex Studio's architecture requires Recipe Modules to produce provider-independent Generation Task Specs. UI surfaces collect parameters and preview state; providers compile and execute specs behind the Provider Boundary. Generated user data belongs in the Studio Library, not the repository.

## Decision

Add a new `sprite-atlas` Recipe Module and route-lazy workbench UI. Keep the existing `spritesheet` recipe as the lightweight one-shot grid generator.

The `sprite-atlas` workflow will be a local-first run folder workflow:

- a Sprite Atlas Run stores `sprite-request.json`, prompts, layout guides, handoff jobs, raw row images, extracted frames, curation data, atlas outputs, manifest, and QA reports;
- the recipe uses provider-independent task kind `sprite_sheet`;
- row art is produced by existing Codex/image generation jobs, one row/state at a time;
- deterministic workflow actions prepare, import, extract, compose, and QA run folder artifacts;
- final atlas artifacts are catalog-compatible, with `manifest.json.frame_layout` as runtime source of truth.

The UI must expose the workflow as a recoverable production workbench:

- preset discovery is browsable and filterable;
- run history is visible inside the recipe;
- row progress is visible at a glance;
- prompts and layout guides are inspectable per row;
- batch handoff creation is supported without duplicating already handled rows;
- blocked rows remain explicit sidecars instead of fake art.

Bring a repo-local `skills/sprite-atlas-builder` skill into Codex Studio so agents can run the pipeline without depending on an external checkout.

## Consequences

Positive:

- Sprite Atlas becomes a real production workflow instead of a prompt-only recipe.
- The UI can explain blocked stages and partial progress.
- Existing provider separation remains intact; no provider-specific task names are introduced.
- The workflow can support sprites, tilesets, textures, asset packs, and custom atlas contracts.

Tradeoffs:

- This adds backend workflow state beyond the normal single-job image path.
- Full visual validation still depends on real row art from image generation.
- Local extraction/composition requires deterministic image tooling. The first implementation must expose dependency readiness clearly.

## Non-Goals

- Do not replace Character Lab.
- Do not turn Codex Studio into a generic provider router.
- Do not generate fake placeholder art when image generation is blocked.
- Do not store generated run folders in the repository.
- Do not make curation a fully featured external editor in the first pass.

## Verification

The implementation is accepted only when:

- `sprite-atlas` appears in the recipe catalog and route-lazy UI;
- a user can create a real Sprite Atlas Run folder from the UI;
- the run folder contains request, prompts, layout guides, handoff folders, and status;
- row jobs can be prepared and imported without fake assets;
- deterministic compose/QA smoke checks can run on fixture rows;
- Recipe Module, backend route, and UI tests cover the main path and at least one blocked path;
- `bun run recipes:verify`, focused tests, and relevant check/build gates pass or any failure is reported as unrelated with evidence.
