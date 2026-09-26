# ADR 0010: Sprite workflow lanes

## Status

Accepted.

## Decision

Sprite Atlas production compose keeps source pixels only when each row strip matches the declared cell size. It does not resize strips to fit. `qa_passed` means a representative technical check passed. A fixture and a visual accept stay separate facts.

New atlas runs ask for native transparency. `static-items` is not packed in the app. That lane stays with `spritesheet-expert`.

Row generation uses the existing provider queue and the provider selected in Studio. The app does not spawn the specialist skill and does not copy its model runtime.

Animation Sequence attaches a frame only when the source already matches the contract size. It does not cover-crop the frame to pass QA.

## Consequences

- A mismatched strip blocks the row and leaves the previous atlas in place.
- An old run keeps its stored contract until the user composes or creates a new run.
- Irregular item packing, video ingest, and engine-loader proof stay outside this app.

## Non-goals

- Do not replace Character Lab.
- Do not add a shelf packer.
- Do not treat a one-shot sheet image as an extracted atlas.
