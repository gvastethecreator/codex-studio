# PRD: Local Codex Studio

## Purpose

Convert the existing visual image app into a local studio for generating, reviewing, and managing images with the user's authenticated Codex/ChatGPT session on the same machine, without requiring API keys for the main flow.

## Users

- Creators who want a local workflow with a persistent library.
- Technical artists who need prompts, recipes, references, batches, and exports.
- Codex/ChatGPT users who prefer automating generation from their local authenticated session.

## Functional requirements

- Generate images from the UI through persistent Generation Task jobs.
- Keep Codex as the primary product runtime through `codex app-server`.
- Store assets, logs, transcripts, and metadata in a configurable external Studio Library.
- Persist jobs, assets, catalog entries, libraries, and logs in SQLite.
- Show both transient UI queue items and persistent backend jobs.
- Show local logs in the app console.
- Import selected files from registered External Output Sources into the Studio Library.
- Preserve workspaces, favorites, multi-select, archive/trash, vault export, and recipes.
- Provide dry-run or smoke-check paths to validate setup without consuming real generation.

## Non-functional requirements

- Do not require `OPENAI_API_KEY` for the main Codex flow.
- Keep Provider Secrets out of SQLite-backed Studio Settings, catalog metadata, logs, transcripts, screenshots, and docs.
- Keep the local backend runnable with Bun.
- Keep VS Code tasks for starting, validating, and inspecting logs.
- Avoid committing sensitive or heavy local files: SQLite databases, logs, generated assets, `.env.local`, and temporary artifacts.
- Keep the UI useful when generation continues outside the browser.

## Out of current scope

- Remote multi-user operation.
- Cloud synchronization.
- Making API keys mandatory for the default flow.
- Final supported Electron packaging.
- Perfect semantic mask editing. The editor routes image edits through local jobs with textual context and reference attachments; precision depends on the available provider capability.
