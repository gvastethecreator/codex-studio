# ADR 0010: Sprite workflow lanes

## Status

Accepted.

## Decision

Sprite Atlas import keeps a row strip untouched when it already matches the declared cell size. Any other provider image is normalized:

- The image is split into equal slots across its full width, one slot per frame. Empty background above and below the art is trimmed first.
- Each slot is resampled to one cell. Pixel art uses nearest-neighbor. Other styles use lanczos.
- A slot is never cropped. If the slot and cell aspect differ by 2% or less, the slot is scaled to the cell. Otherwise it is fit inside the cell with transparent padding, so it is not stretched.
- The import is blocked when a slot is under 8 px, or when the art would fill less than half of the cell on one side.
- The original provider image and its hash are kept. The row state and `manifest.json` record `normalized`, the source size, the kernel, and the fit.

Compose uses the stored strips as they are. `qa_passed` means a representative technical check passed. A fixture and a visual accept stay separate facts.

New atlas runs ask for native transparency. `static-items` is not packed in the app. That lane stays with `spritesheet-expert`.

Row generation uses the existing provider queue and the provider selected in Studio. The app does not spawn the specialist skill and does not copy its model runtime.

Animation Sequence attaches a frame only when the source already matches the contract size. It does not cover-crop the frame to pass QA.

## Consequences

- An image that cannot be split into sensible slots blocks the row and leaves the previous atlas in place.
- An old run keeps its stored contract until the user composes or creates a new run.
- Irregular item packing, video ingest, and engine-loader proof stay outside this app.

## Non-goals

- Do not replace Character Lab.
- Do not add a shelf packer.
- Do not treat a one-shot sheet image as an extracted atlas.
