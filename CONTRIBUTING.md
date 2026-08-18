# Contributing to Codex Studio

Thank you for helping make this repo clearer and easier to install.

## Quick path

1. Read `README.md` and `ROADMAP.md`.
2. Start the local environment with `bun run studio:init` and `bun run dev`.
3. Make a small change that you can prove.
4. Run the minimum gates before you open a pull request.

## Setup

```bash
bun install
bun run studio:init
bun run dev
```

To run the servers apart:

```bash
bun run dev:server
bun run dev:ui
```

## Requirements

- Bun is on `PATH`.
- Codex CLI is installed and signed in on this machine.
- The main flow does not need API keys.

## Checklist before a pull request

```bash
bun run fmt:check
bun run lint
bun run check
bun run test
bun run build
```

## Conventions

- Do not commit generated assets, logs, SQLite DBs, Studio Library data, Playwright MCP dumps, or scratch images.
- Do not commit `.env.local` or real secrets.
- Keep the local-first path working without `OPENAI_API_KEY`.
- Document new environment variables and public scripts in `README.md`.
- If you change structural behavior, explain why in the pull request. Update public or agent docs when contributors need the new fact.

## Bug reports

Include:

- operating system
- Bun version (`bun --version`)
- Codex version (`codex --version`)
- the command that you ran
- expected result and actual result
- relevant logs from `logs/tooling/` or the Studio Library

## High-value work

- onboarding and error messages
- Windows, macOS, and Linux compatibility
- job and asset traceability
- public documentation
- clear UI copy

## Style

Prefer small changes that a reader can understand. Clarity is better than heroics.

## Code of conduct

This project follows [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).
