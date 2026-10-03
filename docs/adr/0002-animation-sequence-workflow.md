# ADR 0002: Animation Sequence Workflow Recipe

## Status

Accepted for implementation.

## Decision

Add a route-lazy `animation-sequence` Recipe Module and workbench.

The workflow is a local-first run folder:

- `animation-request.json` records the normalized contract
- `frame-plan.json` records ordered frame prompts and continuity strategy
- `prompts/frame-XXXX.txt` stores each frame handoff prompt
- `raw/` stores accepted source images copied from the Catalog or managed local paths
- `frames/` stores normalized PNG frames at the contract dimensions
- the captured output GIF path is the minimum export
- `qa/report.json` records frame and export readiness

Frame generation uses existing provider-independent tasks:

- `image_generate` for first-pass frame generation
- `image_edit` for correction passes when a generated frame already exists or references are attached

The backend owns run persistence, frame dispatch records, job reconciliation, frame attachment, normalization, GIF encoding, and QA.
The React recipe surface owns parameter collection, run selection, frame handoff submission, status display, manual Attach and Sync, and export commands. It is a view of the run: it refetches the run when the backend publishes `workflow-run.updated` or the event stream reconnects. It does not poll jobs or scan the Catalog.

### Shared workflow contracts

- One provider-independent Animation Frame Handoff owns frame selection, task choice, executable references, correction input, variants, and metadata. Its recipe params carry `runId`, `frameId`, `frameIndex`, and `correctionMode`.
- The Animation Sequence Run Coordinator is the backend `animation-sequence` participant of the workflow run reconciler. Persistent Job Intake rejects a frame job for an unknown run or frame with a 400. When intake accepts the jobs, the coordinator records them on the frame before a worker can start them.
- A frame keeps one dispatch set: `dispatch.jobIds` holds every variant job of one handoff, and `jobId` is the first. A new dispatch replaces the set. A retry of a recorded job reopens a blocked frame without a new set. A correction dispatch sets the frame to `correcting` and keeps the current image as its preview.
- The coordinator settles frames on job events, under the run lock. It ignores jobs outside the current set. The first completed job with a Catalog Entry attaches with the usual geometry rules; later variants stay in the Catalog for manual Attach. A geometry-blocked frame accepts a later variant. A failed, cancelled, needs-review, or imageless job blocks the frame only when no other job in the set can still land.
- At startup the coordinator records recoverable jobs that a run missed and settles the jobs of frames that still await a result. `POST /api/animation-sequence/runs/:id/reconcile` does the same for one run; the Sync button and runs saved before dispatch sets use it.
- Backend run-folder records remain private persistence data. Browser routes return an Animation Sequence Run View without filesystem paths.
- Recipe identity and shared display facts derive from the Recipe Module Catalog. The route adapter retains explicit lazy imports.

New run internals live in `.studio/state/animation-sequence/<runId>`. Final GIF exports use the registered output directory and layout captured at run creation. Older runs retain their stored paths. `preserve` keeps source alpha, `transparent` requests native alpha, and `solid` applies the chosen matte. PNG frames preserve partial alpha. GIF transparency uses a threshold of 128 and disposal to background for each full frame, preventing trails. An opaque result requested as transparent stays available with a warning.

## Consequences

Positive:

- Animation becomes a recoverable production workflow instead of a single prompt.
- GIF export is deterministic and local once frame images exist.
- Existing image providers can participate without provider-specific animation task names.
- Frame prompts and references are inspectable for correction loops.

Tradeoffs:

- Smooth motion quality depends on frame prompt discipline and the image model consistency.
- GIF encoding is intentionally simple in v1: ordered frames, global palette, fixed dimensions, and loop control.
- Native video formats remain out of scope until Cozy Studio has explicit provider-independent video task contracts.

## Non-goals

- Do not add `video_generate` or provider-specific video execution.
- Do not shell out from the browser or write arbitrary user paths.
- Do not store Provider Secrets, generated images, GIFs, logs, or Studio Library data in the repository.
- Do not replace a video editor or timeline compositor in v1.
