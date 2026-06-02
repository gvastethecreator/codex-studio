# Contributing to Codex Studio

Thanks for helping turn this repo into a more robust, clearer, and installable open-source project.

## Quick path to contribute

1. Read `README.md` and `ROADMAP.md`.
2. Bring up the local environment with `bun run studio:init` + `bun run dev`.
3. Make a small, verifiable change with context.
4. Run the minimum checks before opening a PR.

## Recommended setup

```bash
bun install
bun run studio:init
bun run dev
```

Optional, run servers separately:

```bash
bun run dev:server
bun run dev:ui
```

## Requirements

- Bun available on `PATH`.
- Codex CLI installed and authenticated locally.
- No dependency on API keys for the main flow.

## Checklist before opening a PR

```bash
bun run fmt:check
bun run lint
bun run check
bun run test
bun run build
```

## Important conventions

- Do not commit generated assets, logs, SQLite DBs, or local library content.
- Do not commit `.env.local` or real secrets.
- Keep the local-first experience working without `OPENAI_API_KEY`.
- Document new variables and public scripts in `README.md`.
- If you change structural decisions, leave a trace in `docs/adr/`.

## How to file useful bug reports

Include:

- operating system
- Bun version (`bun --version`)
- Codex version (`codex --version`)
- command executed
- expected vs actual result
- relevant logs (`logs/tooling/` or Studio Library logs)

## Contributions with the most impact today

- onboarding and error messages
- Windows/macOS/Linux compatibility
- job and asset traceability
- public documentation
- copy/UX clarity in the UI

## Contribution style

We prefer small, explainable changes that are easy to verify. Less heroics, more clarity.

## Code of conduct

This project follows [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).
