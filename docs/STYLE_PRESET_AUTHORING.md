# Style Preset authoring guide

Real presets live in `components/recipes/styles/manifests/presets/<pack_id>/<PRESET_ID>.yaml`.
Start from one of these templates:

- `components/recipes/styles/manifests/templates/style-preset.template.yaml` for image style presets.
- `components/recipes/styles/manifests/templates/sprite-sheet-preset.template.yaml` for sprite or animation-sheet presets.
- `components/recipes/styles/manifests/templates/texture-preset.template.yaml` for texture/material presets.

Do not add new presets to legacy YAML.
That monolithic format is retired.
`scripts/style-migration/legacy-packs/` must stay YAML-free.
`bun run styles:source:verify` fails if YAML reappears outside `manifests/`.

## Scaffold first, then edit

Use `styles:scaffold` to create the preset skeleton and update `presetRefs` at both pack and category level.

The command runs in dry-run mode by default and prints planned changes plus validation steps. Use `--write` to change files.

```bash
bun run styles:scaffold -- --preset=SP01-082 --pack=pack_01 --category=portrait-styles --name="Morning Window Portrait" --template=style
bun run styles:scaffold -- --preset=SP06-101 --pack=pack_06 --category="6. Video Game & Pixel Art Styles" --name="Arcade Action Sprite" --template=sprite --write
```

Optional flags:

- `--default-image=/assets/...` to prefill a real default image path.
- `--write` to actually create/update files.

If `--default-image` is omitted, the scaffold still points to `/assets/recipes/styles/defaults/<PRESET_ID>.webp`, but leaves `taxonomy.hasDefaultImage: false` to reflect the missing asset.

## Prompt specificity

The historical Codex batch path has pack- and category-specific scene anchors. For the
ChatGPT HTTP path, Atlas cards use authored representative briefs in
`scripts/style-curation/card-briefs.json`; legacy packs 01–17 use the deterministic
category briefs in `scripts/style-curation/legacy-card-briefs*.ts`. Both combine with
the preset's eight visual fields. A brief controls only the preview image; do not copy
its subject, setting or props into runtime DNA. The runtime style must remain usable
on a different subject. Review generated cards by category before publishing a batch;
jobs marked `needs_review` require inspection before another submission.

`generate-style-defaults.ts` checkpoints `manifest-<pack>.json` and `failures-<pack>.json` after each preset.
It polls job and asset completion from the Studio Library SQLite database
(`STUDIO_LIBRARY_DIR` or the configured default) instead of hammering HTTP list endpoints.
If a long batch is interrupted, trust the `.webp` files on disk and the latest checkpoint files.
Do not assume that the pack did not advance.

## Atlas imports and card review

The original Medieval and TCG research records are preserved in
`components/recipes/styles/atlas/medieval-research.source.json` and
`components/recipes/styles/atlas/tcg-catalog.source.json`. `pack_23` contains 58
Medieval visual presets. `pack_22` contains 120 TCG visual presets; its other
42 records are selectable in Component Studio as 18 digital finish previews,
12 card layouts, and 12 crossover recipes. Recipes generate artwork through the
selected provider; finishes and layouts are composed locally with editable card
fields. Required PNG masks and multipiece artwork must be supplied before export.
These components are not executable visual styles or print-certified effects.
Historical titles and references belong in `sourceMetadata`, not in
reusable visual DNA. Card subjects belong in `card-briefs.json`, not in the preset.

The card generator requires an explicit `--provider`; launching it without one
stops before any request. It is an execution script, not a syntax-check command.
Use `bun run check` for code checks, or `--dry-run` with an explicit provider to
inspect prompts. Generate new cards through ChatGPT HTTP for the intended workspace:

```bash
bun scripts/generate-style-defaults.ts --provider=chatgpt --workspace-id=<workspace-id> --pack=pack_22 --parallel=4
```

This path submits each card once and refuses a second run for a prior ChatGPT
card job. Visually review the saved image before setting its `assets.defaultImage`
and removing `previewStatus: pending`. A failed composition may be replaced only
after checking that its prior job completed. For one card, use
`--preset=<id> --replace-reviewed --reviewed-job-id=<completed-job-id>`; for a
reviewed batch, pass a JSON object mapping each preset ID to its latest completed
job ID with `--reviewed-replacements-file=<path> --parallel=4`. A job in
`needs_review` must be inspected before any new submission.

A card set is three cards per preset, each from a different brief: the primary
card uses `card-briefs.json`, and `variants/<id>-01` and `-02` use the two entries
in `scripts/style-curation/card-brief-variants.json`. Generate a set with
`--card-set` (ChatGPT only; not combinable with replacement, refresh, uncertain-job
or variant-slot flags). Each slot keeps its own job history and lock. A slot is
submitted again only when its composed prompt differs from the latest job for that
slot, so rewriting a brief is the review step that allows a new card. The card it
replaces is archived under `.tmp/style-default-card-archive/`.

After a human reviews an uncertain ChatGPT result, a single re-request is allowed
only when the latest ChatGPT card job is still `needs_review` and has no associated
asset. Pass a JSON object mapping each reviewed preset ID to that exact job ID with
`--reviewed-uncertain-jobs-file=<path>`, plus an explicit `--workspace-id`. This
mode rejects force, refresh, replacement, retry, variant, preset and limit flags;
it moves each prior per-preset lock to
`.locks/<preset>.<job-id>.reviewed.chatgpt.lock` before submitting once. A dry run
prints the prompts without creating, moving or removing locks. Existing primary
cards from another provider are also copied to
`defaults/providers/previous-gpt-image/` before replacement; ChatGPT cards keep
their prior file in the normal card archive. This is a reviewed recovery path,
never an automatic retry.

After the new packs are complete, `--refresh-legacy --parallel=4` generates new
primary cards for presets whose current manifest names the previous provider.
The prior primary file is preserved under `defaults/providers/previous-gpt-image/`
and appears after the other alternates in Studio. Keep both the current primary
and the previous alternate in the repository; do not rewrite historical Studio
Library images or job metadata. Rebuild card thumbnails per affected pack with
`bun scripts/build-style-pack-card-thumbnails.ts --pack=<pack_id>`, then run
`bun run styles:thumbnails` to refresh the UI projection.

Frontend style previews must trust existing `.webp` files on disk, not only manifest intent.
If a preset points at a default image path that has not been generated yet, suppress the broken URL.
Fall back to a real category or pack preview instead.
An explicit `previewStatus: pending` keeps the catalog manifest unpublished even when an older
thumbnail still exists. After reviewing the replacement, update both preview-status fields and
the default-image metadata, then regenerate runtime data and thumbnail projections together.

Anime packs have a deliberately finer split:

- `pack_05` is `Anime Battle & Worlds`: modern shonen/action, mecha/cyberpunk, isekai/high fantasy, dark fantasy/seinen, and action.
- `pack_13` is `Anime Character & Lifestyle`: shojo/magical/visionary classics, slice-of-life/moe, anime style spectrum, core anime, and slice-of-life / school / music.
- `pack_16` is `Anime Classics & Prestige`: 2000s classics, 90s golden era, sports/performance, studio masterpieces, 70s/80s retro anime, samurai/medieval, and horror.
- Non-anime packs also use semantic buckets, especially `pack_01`, `pack_02`, `pack_03`, `pack_04`, `pack_06`, `pack_07`, `pack_08`, `pack_09`, `pack_10`, `pack_11`, and `pack_12`.
- Do not collapse them back into catch-all categories like `Pattern & Texture`, `Oddities`, or generic game buckets.
- When you author or regenerate those packs, keep prompt anchors and category labels aligned with that split.

## Naming and language policy

Use one durable convention in manifests:

- `category.id` MUST be `kebab-case`.
- `taxonomy.categoryId` MUST match the category id exactly.
- `tags` and `taxonomy.tags` MUST be English slugs.
- `packName`, `categoryName`, and editorial labels MUST be English in source manifests.

Do not introduce legacy non-English catch-all slugs. The normalized slug for pack 12 is `video-game-originals-vault`.

## Style-first contract

`Style Preset` means reusable visual language, not a fixed scene.

- `visualDna` MUST describe style mechanics first: linework, palette logic, lighting model, material response, composition behavior, render finish.
- `creative_brief` MUST explain visual intent as a transferable style system.
- Avoid scene-anchored identity phrases as the core definition, such as hard-coding one location or story beat like `wet city street`, `classroom confession`, or `battle in alley`.
- A preset can include mild context cues, but they cannot be the main identity of the style.

Quick self-check before saving:

1. Can this style apply to at least 5 different subjects without rewriting the DNA?
2. If I remove location or story nouns, does the preset still have a clear visual identity?
3. Is this preset materially distinct from neighboring presets in the same category?

## Template flow

`styles:scaffold` uses the template files below automatically. If you need a manual flow, use the same files directly:

1. Copy `components/recipes/styles/manifests/templates/style-preset.template.yaml`.
2. Paste it as `components/recipes/styles/manifests/presets/<pack_id>/<PRESET_ID>.yaml`.
3. Replace every placeholder in `id`, `packId`, `name`, `category`, `tags`, `visualDna`, `avoidRules`, `assets`, `attributes`, and `taxonomy`.
4. Register `<pack_id>/<PRESET_ID>.yaml` in the matching category and top-level `presetRefs` in `components/recipes/styles/manifests/packs/<pack_id>.yaml`.
5. Run focused validation for the new preset before regenerating runtime data.

```bash
bun run styles:validate -- --preset=<PRESET_ID>
bun run styles:runtime
bun run styles:templates:verify
bun run styles:verify
```

## Quick example

Create `presets/pack_01/MY-CUSTOM.yaml`:

```yaml
schemaVersion: 1
id: MY-CUSTOM
packId: pack_01
name: My Custom Portrait
category: 1. Portrait Styles
version: 1
supportedTasks:
  - image_generate
  - image_edit
  - style_preset_card
tags:
  - photography-and-realism
  - portrait-styles
visualDna:
  aesthetic: Warm natural-light editorial portrait, soft golden-hour tones
  subject_treatment: Gentle focus roll-off at edges, sharp eyes, natural skin unretouched
  color_and_tone: Warm amber cast, crushed blacks, gentle color harmony
  lighting_and_shadow: Natural window light from 45 degrees, soft falloff, subtle rim light
  texture_and_material: Real skin texture, fabric weave visible, subtle film grain
  camera_and_composition: 50mm prime lens, f/2.8, subject at eye level, rule-of-thirds placement
  atmosphere_and_mood: Intimate, warm, quiet confidence, editorial magazine feel
  rendering_and_quality: Photorealistic, 4k, natural retouch only
avoidRules:
  - illustration
  - painting
  - drawing
  - 3d render
  - cartoon
  - anime
  - blurry
  - watermark
  - text
  - signature
assets:
  defaultImage: /assets/recipes/styles/defaults/MY-CUSTOM.webp
attributes:
  negativePrompt: illustration, painting, 3d render, cartoon, watermark, text
taxonomy:
  packId: pack_01
  packName: Photography & Realism
  categoryId: portrait-styles
  categoryName: 1. Portrait Styles
  tags:
    - photography-and-realism
    - portrait-styles
  supportedTasks:
    - image_generate
    - image_edit
    - style_preset_card
  hasDefaultImage: true
```

## Register in the pack manifest

Edit `manifests/packs/pack_01.yaml`:

1. Add to the relevant category `presetRefs`:
   ```yaml
   - id: portrait-styles
     presetRefs:
       - pack_01/MY-CUSTOM.yaml # <-- add here
   ```
2. Add to the top-level `presetRefs` list in the same file.

Both references are required. `styles:validate` rejects duplicate pack refs, category refs missing from the pack-level list, and refs that point outside the pack namespace.

## Generate runtime and validate

```bash
bun run styles:runtime:check   # verify runtime data is current
bun run styles:verify          # full validation: taxonomy, coverage, source audit
```

## Taxonomy contract

Every preset manifest must include a `taxonomy` block:

| Field             | Required | Example                                      |
| ----------------- | -------- | -------------------------------------------- |
| `packId`          | yes      | `pack_01`                                    |
| `packName`        | yes      | `Photography & Realism`                      |
| `categoryId`      | yes      | `portrait-styles`                            |
| `categoryName`    | yes      | `1. Portrait Styles`                         |
| `tags`            | yes      | `[photography-and-realism, portrait-styles]` |
| `supportedTasks`  | yes      | `[image_generate, image_edit]`               |
| `hasDefaultImage` | yes      | `true`                                       |

The `styles:validate` check enforces taxonomy drift:

- `packId`/`packName` must match the parent pack.
- `categoryId`/`categoryName` must match the registered category.
- `tags` and `supportedTasks` must match the manifest fields.

It also enforces pack-reference drift:

- top-level `presetRefs` cannot duplicate refs.
- category `presetRefs` must also exist in top-level `presetRefs`.
- pack and category refs must use the same `<pack_id>/<PRESET_ID>.yaml` namespace.

## Visual DNA fields

All 8 fields are required by exact canonical key name.
`validateStyleManifestGraph` reports missing or invalid keys.
Alias fields such as `form_and_line`, `color_palette`, `lighting_setup`, `material_texture`,
`spatial_distortion`, `atmosphere`, and `render_quality` are retired for authored manifests.
Do not use placeholder values such as `Standard`, `Default`, `None`, `N/A`, `TBD`, `TODO`, or
`placeholder`.
Write preset-specific language that represents the intended visual system.

| Field                    | Purpose                           |
| ------------------------ | --------------------------------- |
| `aesthetic`              | Overall visual style direction    |
| `subject_treatment`      | How subjects/humans are rendered  |
| `color_and_tone`         | Color palette and tonal range     |
| `lighting_and_shadow`    | Light sources, quality, direction |
| `texture_and_material`   | Surface detail and material feel  |
| `camera_and_composition` | Lens, framing, perspective        |
| `atmosphere_and_mood`    | Emotional quality, ambient feel   |
| `rendering_and_quality`  | Resolution, polish level          |

## Avoid rules

Negative prompt snippets applied per preset. Use simple lowercase keywords:

```yaml
avoidRules:
  - illustration
  - 3d render
  - watermark
```

## Assets

```yaml
assets:
  defaultImage: /assets/recipes/styles/defaults/SP01-001.webp
```

Default images live in `assets/recipes/styles/defaults/`. Use `.webp` format.

## Attributes

Every preset must include `attributes.negativePrompt`, usually mirroring `avoidRules` as a comma-separated string:

```yaml
attributes:
  negativePrompt: illustration, 3d render, watermark, text
```

## Default card regeneration

Default cards are prompt-derived artifacts. The ChatGPT HTTP path builds the prompt
from the preset's active visual fields, negative rules and its authored card brief;
the brief is for the card only, not part of the style definition. The historical
Codex path retains its pack/category-specific prompt builder.
Existing `.webp` files do not update when a manifest changes.

If a preset changes `name`, `visualDna`, `avoidRules`, or `attributes.negativePrompt`, regenerate `assets/recipes/styles/defaults/<PRESET_ID>.webp` before visual work is complete.
If you keep a local backlog for stale cards, put it in `.local/style-preset-card-regeneration-backlog.md`.
`.local/` is ignored.

For newly authored cards, identify the intended Studio workspace and inspect the
dry-run prompt before submitting through ChatGPT HTTP:

```bash
bun run styles:defaults -- --provider=chatgpt --workspace-id=<workspace-id> --preset=<PRESET_ID> --parallel=4 --dry-run
bun run styles:defaults -- --provider=chatgpt --workspace-id=<workspace-id> --preset=<PRESET_ID> --parallel=4
```

This path submits once per missing preset. It does not erase Studio Library job
artifacts or overwrite an existing card. A prior ChatGPT card job, ambiguous result
or retained lock requires inspection before any manual resubmission.
To replace a visually reviewed card, use `--replace-reviewed` with one preset and
`--reviewed-job-id=<completed-job-id>`, or pass a preset-to-job JSON object through
`--reviewed-replacements-file=<path>` for a reviewed batch. Each entry must match
the latest completed ChatGPT job and current card manifest. The previous WebP is
archived locally, and both Studio jobs remain in the Library.

### Grok provider variants

Grok variants are additional cards. They do not replace the default GPT Image card or numeric variants. The generator writes them to `assets/recipes/styles/defaults/providers/grok/` and records one manifest per pack.

```bash
bun run styles:defaults:grok -- --dry-run
bun run styles:defaults:grok -- --preset=SP01-001
bun run styles:provider-variants:verify -- --provider=grok
bun run styles:thumbnails
```

The Grok path creates one fresh CLI-backed Persistent Job per preset and makes one generation attempt.
Do not use `--force` or `--retry-failures`.
A timeout or ambiguous result can already have consumed credits.
Inspect the recorded Job and Grok session before you decide whether to regenerate a missing card.
