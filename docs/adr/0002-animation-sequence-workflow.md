# ADR 0002: Animation Sequence Workflow Recipe

## Status

Accepted for implementation.

## Context

The requested animation workflow adapts the planning and handoff shape of `D:\DEV\animoto`.
Codex Studio must stay image-generation first.
This recipe does not introduce native video generation.
It plans an ordered sequence of still image frames.
It sends each frame through existing image generation tasks.
It stores run state in the Studio Library.
It exports an animated GIF as the minimum playable artifact.

Codex Studio architecture separates Generation Task Specs from Generation Providers.
Recipe Modules produce provider-independent specs.
Providers compile compact inputs.
UI surfaces collect parameters, preview state, and call backend workflow routes.
Generated assets belong in the Studio Library, not the repo.

## Decision

Add a route-lazy `animation-sequence` Recipe Module and workbench.

The workflow is a local-first run folder:

- `animation-request.json` records the normalized contract
- `frame-plan.json` records ordered frame prompts and continuity strategy
- `prompts/frame-XXXX.txt` stores each frame handoff prompt
- `raw/` stores accepted source images copied from the Catalog or managed local paths
- `frames/` stores normalized PNG frames at the contract dimensions
- `exports/animation.gif` is the minimum export
- `qa/report.json` records frame and export readiness

Frame generation uses existing provider-independent tasks:

- `image_generate` for first-pass frame generation
- `image_edit` for correction passes when a generated frame already exists or references are attached

The backend owns run persistence, frame attachment, normalization, GIF encoding, and QA.
The React recipe surface owns parameter collection, run selection, status display, frame job dispatch, and export commands.

### Accepted architecture amendment — 2026-07-10

- One provider-independent Animation Frame Handoff owns frame selection, task choice, executable references, correction input, variants, and metadata.
- An Animation Sequence Run Coordinator outside React dispatches Persistent Jobs, records transitions, and reconciles Catalog Entries after refresh.
- Backend run-folder records remain private persistence data. Browser routes return an Animation Sequence Run View without filesystem paths.
- Recipe identity and shared display facts derive from the Recipe Module Catalog. The route adapter retains explicit lazy imports.

## Consequences

Positive:

- Animation becomes a recoverable production workflow instead of a single prompt.
- GIF export is deterministic and local once frame images exist.
- Existing image providers can participate without provider-specific animation task names.
- Frame prompts and references are inspectable for correction loops.

Tradeoffs:

- Smooth motion quality depends on frame prompt discipline and the image model consistency.
- GIF encoding is intentionally simple in v1: ordered frames, global palette, fixed dimensions, and loop control.
- Native video formats remain out of scope until Codex Studio has explicit provider-independent video task contracts.

## Non-goals

- Do not add `video_generate` or provider-specific video execution.
- Do not shell out from the browser or write arbitrary user paths.
- Do not store Provider Secrets, generated images, GIFs, logs, or Studio Library data in the repository.
- Do not replace a video editor or timeline compositor in v1.

## Verification

The implementation is accepted only when:

- `animation-sequence` appears in the recipe catalog and route-lazy UI
- the Recipe Module builds provider-independent specs with animation metadata
- a user can prepare a run, inspect frame prompts, queue frames, attach generated Catalog images, export a GIF, and run QA.
- backend tests cover run creation, frame attachment, GIF export, and a blocked missing-frame path
- focused recipe and shared contract tests pass
- `bun run recipes:verify`, `bun run recipes:source:verify`, `bun run check`, and broad closeout gates pass, or blockers are reported with exact output
