# Style Preset Authoring Guide

Real presets live in `components/recipes/styles/manifests/presets/<pack_id>/<PRESET_ID>.yaml`.
Start from one of these templates:

- `components/recipes/styles/manifests/templates/style-preset.template.yaml` for image style presets.
- `components/recipes/styles/manifests/templates/sprite-sheet-preset.template.yaml` for sprite or animation-sheet presets.
- `components/recipes/styles/manifests/templates/texture-preset.template.yaml` for texture/material presets.

Do not add new presets to legacy YAML. That monolithic format is retired; `scripts/style-migration/legacy-packs/` must stay YAML-free. `bun run styles:source:verify` fails if YAML reappears outside `manifests/`.

## Scaffold First, Then Edit

Use `styles:scaffold` to create the preset skeleton and update `presetRefs` at both pack and category level.

The command runs in dry-run mode by default and prints planned changes plus validation steps. Use `--write` to mutate files.

```bash
bun run styles:scaffold -- --preset=SP01-082 --pack=pack_01 --category=portrait-styles --name="Morning Window Portrait" --template=style
bun run styles:scaffold -- --preset=SP06-101 --pack=pack_06 --category="6. Video Game & Pixel Art Styles" --name="Arcade Action Sprite" --template=sprite --write
```

Optional flags:

- `--default-image=/assets/...` to prefill a real default image path.
- `--write` to actually create/update files.

If `--default-image` is omitted, the scaffold still points to `/assets/recipes/styles/defaults/<PRESET_ID>.webp`, but leaves `taxonomy.hasDefaultImage: false` to reflect the missing asset.

## Prompt Specificity

Batch generation prompts are deliberately pack- and category-specific. Before running a new pack, extend `scripts/generate-style-defaults.ts` with distinct scene anchors and motif rules for that pack instead of relying on the generic fallback. This keeps thumbnails from converging on the same generic props or staging.

`generate-style-defaults.ts` checkpoints `manifest-<pack>.json` and `failures-<pack>.json` after each preset and polls job/asset completion from local Studio SQLite (`.studio/studio.sqlite`) instead of hammering HTTP list endpoints. If a long batch is interrupted, trust the `.webp` files on disk and the latest checkpoint files before assuming the pack did not advance.

Frontend style previews should trust existing `.webp` files on disk, not only manifest intent. If a preset points at a default image path that has not been generated yet, suppress the broken URL and fall back to a real category or pack preview instead.

Anime packs have a deliberately finer split:

- `pack_05` is `Anime Battle & Worlds`: modern shonen/action, mecha/cyberpunk, isekai/high fantasy, dark fantasy/seinen, and action.
- `pack_13` is `Anime Character & Lifestyle`: shojo/magical/visionary classics, slice-of-life/moe, anime style spectrum, core anime, and slice-of-life / school / music.
- `pack_16` is `Anime Classics & Prestige`: 2000s classics, 90s golden era, sports/performance, studio masterpieces, 70s/80s retro anime, samurai/medieval, and horror.
- Non-anime packs also rely on semantic buckets now, especially `pack_01`, `pack_02`, `pack_03`, `pack_04`, `pack_06`, `pack_07`, `pack_08`, `pack_09`, `pack_10`, `pack_11`, and `pack_12`; do not collapse them back into catch-all categories like `Pattern & Texture`, `Oddities`, or generic game buckets.
- When authoring or regenerating those packs, keep prompt anchors and category labels aligned with that split instead of collapsing them back into generic anime staging.

## Naming And Language Policy

Use one durable convention in manifests:

- `category.id` MUST be `kebab-case`.
- `taxonomy.categoryId` MUST match the category id exactly.
- `tags` and `taxonomy.tags` MUST be English slugs.
- `packName`, `categoryName`, and editorial labels MUST be English in source manifests.

Do not introduce legacy non-English catch-all slugs. The normalized slug for pack 12 is `video-game-originals-vault`.

## Style-First Contract

`Style Preset` means reusable visual language, not a fixed scene.

- `visualDna` MUST describe style mechanics first: linework, palette logic, lighting model, material response, composition behavior, render finish.
- `creative_brief` MUST explain visual intent as a transferable style system.
- Avoid scene-anchored identity phrases as the core definition, such as hard-coding one location or story beat like `wet city street`, `classroom confession`, or `battle in alley`.
- A preset can include mild context cues, but they cannot be the main identity of the style.

Quick self-check before saving:

1. Could this style apply to at least 5 different subjects without rewriting the DNA?
2. If I remove location/story nouns, does the preset still have a clear visual identity?
3. Is this preset materially distinct from neighboring presets in the same category?

## Template Flow

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

## Quick Example

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

## Register In The Pack Manifest

Edit `manifests/packs/pack_01.yaml`:

1. Add to the relevant category `presetRefs`:
   ```yaml
   - id: portrait-styles
     presetRefs:
       - pack_01/MY-CUSTOM.yaml # <-- add here
   ```
2. Add to the top-level `presetRefs` list in the same file.

Both references are required. `styles:validate` rejects duplicate pack refs, category refs missing from the pack-level list, and refs that point outside the pack namespace.

## Generate Runtime And Validate

```bash
bun run styles:runtime:check   # verify runtime data is current
bun run styles:verify          # full validation: taxonomy, coverage, source audit
```

## Taxonomy Contract

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

## Visual DNA Fields

All 8 fields are required and checked for emptiness by `validateStyleManifestGraph`:

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

## Avoid Rules

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

## Default Card Regeneration

Default cards are prompt-derived artifacts. `scripts/generate-style-defaults.ts` builds the image prompt from the current pack, category, preset `name`, `visualDna`, `negativePrompt`, and deterministic variation helpers. Existing `.webp` files do not update when a manifest changes.

If a preset changes `name`, `visualDna`, `avoidRules`, or `attributes.negativePrompt`, regenerate `assets/recipes/styles/defaults/<PRESET_ID>.webp` before considering visual work complete. If you keep a local backlog for stale cards, put it in `.local/style-preset-card-regeneration-backlog.md`; `.local/` is ignored.
