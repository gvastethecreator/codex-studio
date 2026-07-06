# Pack 09 Texture Task Audit

Date: 2026-07-04

Scope: `pack_09` / Texture & Materiality.

## Rubric

Add `texture_generate` only when the preset can act as a reusable material or
surface generation target.

High-confidence add:

- Material/surface is inspectable without requiring a character, prop, scene,
  or temporal event.
- Prompt can plausibly become a straight-on or tile-friendly material study.
- Texture task improves workflow clarity beyond generic image generation.

Keep image-only:

- Preset is mainly an atmosphere, VFX moment, linear object, device, or scene
  element.
- Texture task would imply tileability or material generation that the preset
  cannot reliably satisfy.

Needs preview review:

- Preset could work as a pattern/material, but default cards or wording may
  push toward object/scene framing.
- Do not change tasks until image preview and prompt behavior are reviewed.

## Decision Summary

| Decision               | Count | Action                                    |
| ---------------------- | ----: | ----------------------------------------- |
| `add_texture_generate` |    57 | Updated manifest root and taxonomy tasks. |
| `needs_preview_review` |    13 | No task change yet.                       |
| `keep_image_only`      |    10 | No task change.                           |

## Updated Presets

These presets now support `texture_generate`, `image_generate`, `image_edit`,
and `style_preset_card`.

| Preset   | Name                       | Reason                              |
| -------- | -------------------------- | ----------------------------------- |
| SP09-001 | Oak Wood (Raw)             | Natural surface material.           |
| SP09-002 | Mahogany (Polished)        | Natural surface material.           |
| SP09-003 | Birch Bark                 | Natural surface material.           |
| SP09-004 | Granite (Polished)         | Natural surface material.           |
| SP09-005 | Sandstone (Rough)          | Natural surface material.           |
| SP09-006 | Marble (Carrara)           | Natural surface material.           |
| SP09-007 | Slate (Split)              | Natural surface material.           |
| SP09-008 | Mossy Rock                 | Natural surface material.           |
| SP09-009 | River Stones               | Natural surface material.           |
| SP09-010 | Obsidian                   | Natural surface material.           |
| SP09-011 | Wolf Fur                   | Natural surface material.           |
| SP09-012 | Snake Scales               | Natural surface material.           |
| SP09-013 | Bird Feathers              | Natural surface material.           |
| SP09-015 | Honeycomb Wax              | Natural surface material.           |
| SP09-016 | Glacier Ice                | Natural surface material.           |
| SP09-017 | Brushed Aluminum           | Man-made surface material.          |
| SP09-018 | Rusty Iron                 | Weathered surface material.         |
| SP09-019 | Gold Leaf                  | Man-made surface material.          |
| SP09-020 | Copper Patina              | Man-made surface material.          |
| SP09-021 | Carbon Fiber (Forged)      | Man-made surface material.          |
| SP09-022 | Concrete (Raw)             | Man-made surface material.          |
| SP09-023 | Brick Wall (Aged)          | Man-made surface material.          |
| SP09-024 | Asphalt (Wet)              | Man-made surface material.          |
| SP09-025 | Porcelain (Cracked)        | Weathered surface material.         |
| SP09-026 | Plastic (Injection Molded) | Man-made surface material.          |
| SP09-027 | Rubber (Tire)              | Man-made surface material.          |
| SP09-029 | Velvet Fabric              | Tactile surface material.           |
| SP09-030 | Burlap Sack                | Weathered textile surface.          |
| SP09-031 | Latex (Shiny)              | Man-made surface material.          |
| SP09-032 | Cardboard                  | Man-made surface material.          |
| SP09-033 | Peeling Paint              | Weathered surface material.         |
| SP09-034 | Mold & Mildew              | Weathered surface material.         |
| SP09-035 | Burnt Wood (Shou Sugi Ban) | Weathered surface material.         |
| SP09-036 | Water Damage               | Weathered surface material.         |
| SP09-037 | Scratched Metal            | Weathered surface material.         |
| SP09-038 | Dusty Surface              | Weathered surface material.         |
| SP09-039 | Frozen/Frosted             | Tactile surface material.           |
| SP09-040 | Oil Stains                 | Weathered surface material.         |
| SP09-041 | Sandpaper                  | Weathered/tactile surface material. |
| SP09-042 | Bubble Wrap                | Man-made surface pattern.           |
| SP09-044 | Sponge (Sea)               | Natural surface material.           |
| SP09-045 | Felt Fabric                | Tactile surface material.           |
| SP09-046 | Sequins                    | Man-made surface pattern.           |
| SP09-047 | Fur (Synthetic)            | Tactile surface material.           |
| SP09-048 | Cork Board                 | Man-made surface material.          |
| SP09-049 | Velcro                     | Man-made tactile surface.           |
| SP09-050 | Chalk (Dry)                | Tactile surface material.           |
| SP09-055 | Crystal/Gemstone           | Natural surface material.           |
| SP09-060 | Mercury (Liquid Metal)     | Man-made/liquid material surface.   |
| SP09-064 | Mud (Cracked)              | Weathered natural surface.          |
| SP09-065 | Tar                        | Weathered surface material.         |
| SP09-066 | Sand (Beach)               | Natural surface material.           |
| SP09-068 | Lava Rock (Cooled)         | Natural surface material.           |
| SP09-069 | Fiberglass Insulation      | Tactile surface material.           |
| SP09-074 | Carpet (Shag)              | Tactile surface material.           |
| SP09-075 | Astroturf                  | Tactile surface material.           |
| SP09-079 | Mother of Pearl            | Natural surface material.           |

## Needs Preview Review

| Preset   | Name                    | Reason                                                       |
| -------- | ----------------------- | ------------------------------------------------------------ |
| SP09-014 | Coral Reef              | May become scene/object ecology instead of material surface. |
| SP09-028 | Glass (Shattered)       | Could become object shards or dangerous scene framing.       |
| SP09-043 | Slime/Goo               | Material-like, but often becomes drips/subject spectacle.    |
| SP09-051 | Fire & Magma            | Could work as lava texture, but often becomes active FX.     |
| SP09-057 | Oil on Water            | Strong surface candidate, but needs card/prompt review.      |
| SP09-059 | Soap Bubbles            | Pattern candidate, but may become floating subjects.         |
| SP09-063 | Cobweb                  | Pattern candidate, but may become object/scene element.      |
| SP09-067 | Snow (Powder)           | Surface candidate, but needs scale/framing review.           |
| SP09-070 | Polystyrene (Styrofoam) | Surface candidate, but may require wording polish.           |
| SP09-071 | Plywood                 | Surface candidate, but may require wording polish.           |
| SP09-072 | OSB Board               | Surface candidate, but may require wording polish.           |
| SP09-073 | Linoleum Floor          | Surface candidate, but may require wording polish.           |
| SP09-080 | Dragon Scale            | Pattern candidate, but fantasy subject risk is high.         |

## Kept Image-Only

| Preset   | Name                  | Reason                                         |
| -------- | --------------------- | ---------------------------------------------- |
| SP09-052 | Electricity/Lightning | Temporal/linear FX, not material texture.      |
| SP09-053 | Smoke/Fog             | Atmospheric volume, not material texture.      |
| SP09-054 | Water Splash          | Momentary FX, not material texture.            |
| SP09-056 | Plasma/Energy         | Energy effect, not material texture.           |
| SP09-058 | Sparks                | Momentary FX, not material texture.            |
| SP09-061 | Dry Ice Fog           | Atmospheric volume, not material texture.      |
| SP09-062 | Confetti              | Object field, not material texture.            |
| SP09-076 | Chain Link Fence      | Linear object structure, not material texture. |
| SP09-077 | Barbed Wire           | Linear object structure, not material texture. |
| SP09-078 | Solar Panel           | Device/panel object, not material texture.     |

## Validation

```bash
bun run styles:validate -- --pack=pack_09
bun run styles:runtime
```

Result:

- Pack validation passed after root/taxonomy task lists were synchronized.
- Runtime data regenerated.
