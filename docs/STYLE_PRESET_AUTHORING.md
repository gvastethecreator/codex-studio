# Style Preset Authoring Guide

Real presets live in `components/recipes/styles/manifests/presets/<pack_id>/<PRESET_ID>.yaml`.

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

## Then register in the pack manifest

Edit `manifests/packs/pack_01.yaml`:

1. Add to the relevant category `presetRefs`:
   ```yaml
   - id: portrait-styles
     presetRefs:
       - pack_01/MY-CUSTOM.yaml  # <-- add here
   ```
2. Add to the top-level `presetRefs` list in the same file.

## Finally generate runtime data + validate

```bash
bun run styles:runtime:check   # verify runtime data is current
bun run styles:verify          # full validation: taxonomy, coverage, source audit
```

## Taxonomy Contract

Every preset manifest must include a `taxonomy` block:

| Field | Required | Example |
|---|---|---|
| `packId` | yes | `pack_01` |
| `packName` | yes | `Photography & Realism` |
| `categoryId` | yes | `portrait-styles` |
| `categoryName` | yes | `1. Portrait Styles` |
| `tags` | yes | `[photography-and-realism, portrait-styles]` |
| `supportedTasks` | yes | `[image_generate, image_edit]` |
| `hasDefaultImage` | yes | `true` |

The `styles:validate` check enforces taxonomy drift:
- `packId`/`packName` must match the parent pack
- `categoryId`/`categoryName` must match the registered category
- `tags` and `supportedTasks` must match the manifest fields

## Visual DNA Fields

All 8 fields are required and checked for emptiness by `validateStyleManifestGraph`:

| Field | Purpose |
|---|---|
| `aesthetic` | Overall visual style direction |
| `subject_treatment` | How subjects/humans are rendered |
| `color_and_tone` | Color palette and tonal range |
| `lighting_and_shadow` | Light sources, quality, direction |
| `texture_and_material` | Surface detail and material feel |
| `camera_and_composition` | Lens, framing, perspective |
| `atmosphere_and_mood` | Emotional quality, ambient feel |
| `rendering_and_quality` | Resolution, polish level |

## Avoid Rules

Negative prompt snippets applied per-preset. Use simple lowercase keywords:
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
