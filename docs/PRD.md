# PRD: Codex Studio Local-First

## Objective

Turn the current visual app into a local studio for generating, reviewing, and managing images through the user's authenticated Codex/ChatGPT session, without requiring API keys in the main flow.

## Target Users

- Creators who want a local workflow with a persistent library.
- Technical artists who work with prompts, recipes, references, and exports.
- Codex/ChatGPT users who prefer to automate generation from their local environment.

## Functional Requirements

- Generate from the UI with persistent jobs (`Generation Task`).
- Use Codex as the primary runtime through `codex app-server`.
- Keep assets, logs, and transcripts in a configurable Studio Library.
- Persist jobs, catalog entries, libraries, and logs in SQLite.
- Support both a transient UI queue and a persistent backend queue.
- Import files from registered External Output Sources.

## Non-Functional Requirements

- Do not require `OPENAI_API_KEY` in the main flow.
- Keep Provider Secrets outside SQLite-backed Studio Settings.
- Run the local backend with Bun.
- Provide VS Code tasks for running, validating, and inspecting logs.

## Out Of Scope For Now

- Remote multi-user operation.
- Cloud sync.
- Final supported Electron packaging.
- Perfect semantic mask editing.
