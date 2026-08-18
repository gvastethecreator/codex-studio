---
name: sprite-atlas-builder
description: 'Sprite atlas pipeline. Use for sprites, tilesets, textures, asset sheets, extraction, curation, and QA.'
---

# Sprite Atlas Builder

## Overview

Build sprites and game asset sheets with the component-row pipeline:

```text
preset/custom contract -> sprite-request.json -> layout guides + row prompts
-> imagegen row strips -> chroma/rembg background removal + component extraction
-> curated frames -> atlas PNG + manifest.json.frame_layout
```

Use `$imagegen` for visual generation. Use local scripts for deterministic request prep, background removal, extraction, atlas composition, previews, curation, unpacking, and exports.

## Mandatory Imagegen Rule

`$imagegen` is the internal visual-generation sub-skill and the primary art engine for this skill.
`sprite-atlas-builder` owns contracts, prompts, layout guides, extraction, registration, atlas composition, previews, curation, and QA.
`$imagegen` owns bitmap creation.

For any user-facing sprite, character, tileset, texture, prop, icon, VFX, or atlas art generation, use `$imagegen` whenever it is available.
Load and follow the `$imagegen` skill rules for generation or editing, save-path handling, chroma-key transparency, and output honesty.

Local scripted or PIL drawing is allowed only for deterministic smoke tests, regression fixtures, geometry debugging, or when `$imagegen` is unavailable.
If local drawing is used for anything beyond a fixture, say so explicitly.
Do not present it as an imagegen-backed art validation.

Pipeline validation for generated art must include at least one `$imagegen`-produced source image or row strip before calling the result visually representative.
The local scripts can prepare prompts, guides, extraction, atlas composition, previews, and QA.
They do not replace `$imagegen` for final visual content.

When `$imagegen` outputs are meant for the project, copy or move the selected generated image into the run folder before extraction.
Do not leave project-referenced row art only under `$CODEX_HOME`.

Requires Python with Pillow available. `rembg` is optional for local model-backed background removal.

## Local Handoff Runner Contract

When this skill is driven by a local app such as Sprite Bench, keep the skill as the atlas engine.
Use a separate handoff layer for providers:

```text
codex-handoff/
  inbox/   # structured generation/regeneration jobs
  outbox/  # real returned images or blocked sidecars
  status/  # runner status per job
  logs/    # stdout/stderr tails from codex exec or adapters
```

The app or runner can write a job JSON that points to `sprite-request.json`, `prompts/<state>.txt`, `references/layout-guides/<state>.png`, optional `references/identity-anchor.png`, and the expected output row.
Codex, a manual operator, or a future provider must return a real image file to `outbox/` using the job id prefix.
The runner then copies the accepted result into `raw/<state>.png` before extraction.

Returned final row files use names like `<jobId>-<state>.png|webp|jpg`.
Do not place contact sheets, comparison sheets, preview grids, temp candidates, QA JSON, debug images, staging files, or work-in-progress files in the outbox root.

If generation is blocked by safety, policy, missing imagegen capability, provider failure, no returned image, or user cancellation, write a small `<jobId>-blocked.json` sidecar.
Include `status=blocked`, `reasonKind`, `userMessage`, and `suggestion`.
Allowed `reasonKind` values are `policy_or_safety`, `imagegen_unavailable`, `runner_failed`, `no_image_returned`, and `unknown`.
Do not create a placeholder image, deterministic drawing, SVG, or text preview to keep the pipeline moving.

Provider adapters must not mutate browser-only state.
They emit bounded events, update status or log files, and write artifacts back into the run folder or handoff outbox.
The existing skill scripts remain the only supported path for extraction, curation, atlas composition, previews, and QA.

## Reference Gates

Read `references/atlas-reference.md` when choosing background removal, style presets, core scripts, asset modes, production standards, or frame budgets.

Read `references/professional-sprite-animation.md` before generating, repairing, curating, or reviewing animated character rows.

Completion criterion: atlas contract names asset kind, extraction mode, background removal, frame budget if any, QA path, and output manifest before final packaging.

## Process

1. Choose preset or custom contract.
   - Read `references/atlas-reference.md` for presets, asset modes, background removal, and frame budgets.

2. Prepare run folder and generation prompts.
   - Use `scripts/preset_to_request.py` and `scripts/prepare_sprite_run.py` for deterministic request/layout setup.

3. Generate or import real row art.
   - Use `$imagegen` for user-facing art when available.
     Never substitute placeholder drawings for representative art.

4. Extract, curate, compose, preview, and QA.
   - Follow `references/workflows.md` for exact commands for new sheets, imported sheets, atlas unpacking, curation, GIFs, and exports.

Done when transparent frames, atlas PNG, manifest, previews, QA reports, and any curation/export artifacts match the requested asset kind.

## Identity And Motion Rules

- Base image creates identity source.
- If no base image exists, the first accepted idle/neutral frame becomes the identity source. Promote it to `references/identity-anchor.png` before generating action rows.
- Direction-sensitive work creates accepted idle anchors before action rows.
- Later rows solve motion. They do not rediscover identity.
- Jump, fall, land, crouch, duck, and squat rows must preserve idle/direction scale. Show height changes through body compression or vertical placement, not zoom-to-fill.
- Crouch, duck, and squat transition rows use per-frame height curves plus scale-lock checks.
  The first frame can remain near standing height.
  Later frames compress toward a final pose around 65-75% idle height while feet stay on the shared baseline.
  Preserve head, hands, feet, line weight, outfit scale, and body thickness.
  The final crouch must not become a uniformly smaller whole character.
- Jump rows use per-frame vertical placement checks at the idle reference scale.
  Do not compute one global jump-peak scale for the whole row.
  Compare each frame against its own expected height, width, head or upper-body proxy, and bottom position.
- Pose corrections require visual comparison, not only numeric checks.
  Open `qa/pose-scale-review.png`, `qa/<state>-contact.png`, GIFs, or the prototype viewer.
  Compare idle or reference, transition, and final frames for readable body pose and locked character scale.
  Also compare baseline, silhouette, head, hand, and foot size, outfit texture, and the absence of a miniature final pose.
- For humanoid or mascot sprites, use stable-part proxy metrics as a guardrail.
  `head_width_vs_reference` and `upper_width_vs_reference` stay near idle scale for jump, fall, land, and crouch even when full-body bbox height changes.
  If these proxies shrink, the row likely scaled the whole character down instead of changing pose.
- Grounded pose rows keep feet on the shared baseline. Airborne rows keep the same body size and move through the slot using the jump/fall arc.
- Side-view and mascot locomotion rows also keep feet on the shared baseline so body bob, stride, and support-side changes survive extraction.
- Generate paired basis row first for directional locomotion, then paired row with basis as rhythm reference.
- 8-frame `walk/run` rows get motion-phase layout guides by default so legs alternate contact/passing poses instead of drifting in one direction.
- Run `check_motion_variation.py` for walk, run, and move rows.
  It reports lower-body silhouette change, support-side balance, and body-center drift.
  Frozen joints or same-leg poses get caught before done.
- Treat the motion report as a heuristic.
  If it flags a row, inspect the GIF or contact sheet and regenerate or curate the row.
  Use `--warn-only` only when a deliberate hover, float, or no-leg design makes the heuristic irrelevant.
- Mirror only when user approves and asymmetric details stay correct.
- Locomotion is experimental until preview GIF passes motion QA.
- If a row partially works, use `compose_selected_cycle.py`.
  Do not pretend the full row passed.

## QA And Outputs

Read `references/qa-and-outputs.md` before final packaging. Completion criterion: QA reports, previews, atlas, manifest, and exports match the requested asset kind.
