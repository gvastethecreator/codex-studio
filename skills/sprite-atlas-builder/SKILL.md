---
name: sprite-atlas-builder
description: 'Pointer from Cozy Studio to spritesheet-expert and the in-app sprite workflows.'
---

# Sprite Atlas Builder

This file is a pointer. The checkout does not contain the specialist scripts or references.

Use `$spritesheet-expert` for irregular item atlases, video frame selection, onion-skin metrics, local model segmentation, and engine-loader proof.

Use the Cozy Studio recipes for the lanes the app implements:

- `sprite-atlas` for `animation`, `true-grid`, and `tileset` runs. Production compose accepts a strip only at the declared cell size. `static-items` stays blocked in the app.
- `animation-sequence` for separate frames and a GIF. Frames must already match the contract size.
- `spritesheet` and Character Lab `sprite_sheet` actions for one sheet image. They do not extract an atlas.

New atlas runs ask for native transparency. Chroma green remains an explicit one-shot background, labeled as a key color.
