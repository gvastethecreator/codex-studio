# Animation Sequence Workflow Plan

## Objective

Create a Codex Studio recipe for frame-by-frame animation. The workflow plans
still image frames, generates them with image generation, accepts or corrects
each frame, and exports at least an animated GIF. It must not depend on native
video generation.

## Product Shape

`animation-sequence` is a workflow workbench, not a single prompt box.

Supported first version:

- recursive frame generation for stronger continuity between adjacent frames;
- sequential frame generation for prompt-led shots;
- frame correction mode using `image_edit`;
- ordered GIF export from accepted frame images;
- run recovery from Studio Library state.

## User Path

1. Write a motion prompt and choose frame count, FPS, aspect ratio, continuity,
   loop, and style lock.
2. Prepare a run.
3. Review generated frame prompts.
4. Generate one frame at a time through existing image generation.
5. Sync generated Catalog images back into the run.
6. Correct any weak frames.
7. Export GIF.
8. Run QA and review missing-frame/export issues.

## UI Plan

Use a route-lazy recipe surface:

```text
components/recipes/AnimationSequenceRecipe.tsx
```

Primary layout:

- Left settings rail: motion prompt, frame count, FPS, ratio, method,
  continuity, matte color, loop/style toggles, and recent runs.
- Center workbench: GIF preview, frame grid, run status, sync/export/QA actions.
- Right inspector: selected frame prompt, generate/correct/attach actions,
  frame status, Catalog preview.

The UI must stay operational and compact. It should not assemble provider-ready
prompts in React; structured params come from tested helpers in `lib/`.

## Recipe Module Contract

Recipe id: `animation-sequence`.

Default task: `image_generate`.

Supported tasks:

- `image_generate`
- `image_edit`

Core params:

- `frameCount`
- `fps`
- `aspectRatio`
- `method`
- `cyclic`
- `pinEdges`
- `continuity`
- `styleLock`
- `background`
- `matteColor`
- `variantsPerFrame`
- `runId`
- `frameId`
- `frameIndex`
- `correctionMode`

The Recipe Module source spec metadata includes:

- normalized animation sequence contract;
- ordered frame plan;
- selected frame metadata when generating one frame;
- generation order.

## Backend Workflow Plan

Add `/api/animation-sequence` routes:

- `GET /api/animation-sequence/runs`
- `GET /api/animation-sequence/runs/:id`
- `GET /api/animation-sequence/runs/:id/frames/:frameId/prompt`
- `GET /api/animation-sequence/runs/:id/files/gif`
- `POST /api/animation-sequence/runs`
- `POST /api/animation-sequence/runs/:id/attach-frame`
- `POST /api/animation-sequence/runs/:id/export-gif`
- `POST /api/animation-sequence/runs/:id/qa`

Run folders live under the Studio Library:

```text
outputs/animation-sequence/<runId>/
  animation-request.json
  animation-sequence-run.json
  frame-plan.json
  prompts/frame-0001.txt
  references/
  raw/
  frames/frame-0001.png
  exports/animation.gif
  qa/report.json
```

Browser code never writes filesystem paths directly. Frame attachment must use a
managed Catalog image id or a backend-validated path inside the Studio Library.

## GIF Export Contract

GIF export is the minimum playable output for v1.

Rules:

- export frames in `framePlan.frames` order;
- require all frames unless `force` is explicitly passed;
- normalize every frame to the contract dimensions before encoding;
- write the GIF to `exports/animation.gif`;
- record the export in the run state with `format: "gif"`, path, public URL,
  frame count, FPS, and timestamp;
- serve the GIF through the local backend route.

## Quality Gates

- Frame count is clamped to a bounded range.
- FPS is clamped to a bounded range.
- Frame prompts carry continuity and no-video/no-grid constraints.
- Missing frames block normal GIF export.
- QA reports missing frames, missing GIF, dimension mismatches, and export state.
- Run state is durable across UI refreshes.
- Provider directives stay compact and provider-independent.

## Verification Plan

Focused checks:

```bash
bun run test -- packages/shared/src/animationSequenceContracts.test.ts lib/recipeModules.test.ts lib/recipeContextBuilders/index.test.ts lib/recipeDerivedParams.test.ts lib/recipePromptFragments.test.ts lib/recipeProviderDirectives.test.ts apps/local-server/src/animationGifEncoder.test.ts apps/local-server/src/animationSequenceRoutes.test.ts
bun run recipes:catalog -- --query=animation --limit=20
bun run recipes:verify
bun run recipes:source:verify
```

Broad closeout:

```bash
bun run test
bun run check
bun run build
```
