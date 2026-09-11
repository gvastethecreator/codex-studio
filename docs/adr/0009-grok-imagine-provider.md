# ADR 0009: Grok Imagine provider

## Status

Accepted

## Decision

Support Grok Imagine as an optional Generation Provider through the locally installed and authenticated Grok Build CLI.

Codex stays the default provider and the main Product Runtime.

Studio runs one bounded headless Grok process per Persistent Job. It does not:

- call the xAI REST API directly
- require `XAI_API_KEY`
- import an external agent skill at runtime
- create a Grok-specific Generation Task kind

Execution limits:

- a fresh session for each Job
- exactly one allowed media tool: `image_gen` or `image_edit`
- no shell, repository editing, memory, web search, planning, or subagents
- cancellation through the Job `AbortSignal`
- one complete image file before Catalog finalization
- no automatic retry after a possibly billable media call

Runtime contract:

1. Runtime Doctor resolves the native `grok` executable.
2. It reports the version, local login, available model, headless controls, and bundled Imagine capability without exposing authentication data.
3. Job intake keeps the provider-independent `GenerationTaskSpec`.
4. The provider compiler chooses `image_gen` when there is no source image. It chooses `image_edit` when managed local source images are present.
5. The executor writes the prompt to a private temporary file. Then it launches a fresh CLI session with a strict sandbox and an exact media-tool allowlist.
6. Success requires exit code zero, an `end_turn` stop reason, the requested session id, and exactly one supported image in that session `images` directory.
7. The executor copies the image into the Job Studio Library. It writes a compact transcript that contains paths, ids, model or runtime metadata, and result shape only. It does not copy prompt text, authentication data, or raw provider output into the transcript.
8. The existing worker finalization path moves the Local Asset to its configured output path and creates the Catalog Entry.

Grok-owned session data remains under `GROK_HOME`. Studio copies generated media. It does not delete or rewrite Grok session history.

## Consequences

- Provider id is `grok`. Runtime kind is local agent CLI.
- Current tasks are image generation and image-led editing through the existing image task kinds.
- Current recipe integration is Home and Styles. Styles supports direct generation, style-card generation, and managed-reference styling with the same provider-independent recipe directives used by Codex.
- Each Persistent Job produces one image. UI batches already create one Job per requested image.
- Source images are up to five hydrated, managed local image paths, matching the Styles reference slots. Remote-only URLs and unresolved inline bytes fail before enqueue.
- Aspect ratios sent to Grok are only `auto`, `1:1`, `16:9`, `9:16`, `4:3`, and `3:4`. Unsupported toolbar ratios fail in the Generate dock and at job intake.
- Model policy uses the Grok Runtime Doctor default from `grok models`. `GROK_IMAGE_MODEL` and a valid Settings override still win. Omit `--model` when no explicit model is compiled.
- Verified CLI is Grok Build 1.0.4. Minimum supported release remains 0.2.114.
- Provider model and reasoning defaults remain editable through existing per-provider Studio Settings. They contain no credentials.
- The Command Center offers a readiness-aware Codex/Grok quick switch for the next image generation. The selection persists through Studio Settings. Unavailable runtimes stay visible but cannot be selected until their preflight is ready.
- Native video remains out of scope. It needs an asynchronous media lifecycle, MP4-aware finalization and catalog behavior, cancellation and recovery rules, and a separate architecture decision. It must not be hidden inside an image Job.
- `image_gen` and `image_edit` can consume provider usage. Deterministic tests use fixture sessions and a simulated process result. A real image smoke requires explicit consent for that run.

Primary references:

- [Grok Build overview](https://docs.x.ai/build/overview)
- [Headless scripting](https://docs.x.ai/build/cli/headless-scripting)
- [CLI reference](https://docs.x.ai/build/cli/reference)
- [Permissions](https://docs.x.ai/build/features/permissions)
- [Settings and authentication](https://docs.x.ai/build/settings)
