# ADR 0009: Grok Imagine provider

## Status

Accepted

## Decision

Grok Imagine is an optional Generation Provider. Codex stays the default provider and the main Product Runtime.

Use authenticated xAI HTTP when that path is ready. The signed-in Grok Build CLI remains available when HTTP is unavailable or the explicit HTTP fallback policy allows it. `XAI_API_KEY` in the backend environment is an HTTP credential. The CLI login path does not require it.

Studio does not:

- create a Grok-specific Generation Task kind
- import an external agent skill at runtime
- delete or rewrite Grok-owned session data under `GROK_HOME`

Limits that callers must follow:

- One Persistent Job produces one image.
- CLI jobs use one fresh bounded headless session and an exact `image_gen` or `image_edit` allowlist. That session cannot use repository, shell, web, memory, planning, or subagent capabilities.
- CLI jobs accept at most 5 managed local source images. HTTP image edits accept at most 3.
- Supported aspect ratios are `auto`, `1:1`, `16:9`, `9:16`, `4:3`, and `3:4`.
- The minimum supported Grok Build release is 0.2.114.
- Native video stays out of scope until a separate decision defines that lifecycle.
- Provider model and reasoning defaults stay in per-provider Studio Settings and contain no credentials.

## Consequences

- Provider id is `grok`.
- Tasks stay the existing image generation and image-edit kinds.
- Home and Styles can select this provider. Styles uses the same provider-independent recipe directives as the other image providers.
- Both paths import verified images into the captured Studio Library.
- Deterministic tests use fixture sessions. A real image smoke needs explicit consent for that run.
