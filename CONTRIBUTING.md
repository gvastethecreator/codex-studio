# Contributing to Codex Studio

Use the existing Bun toolchain and keep changes small enough to review and verify.

## Quick path

1. Read `README.md`.
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
bun run validate
```

This gate runs architecture checks, format/lint/type checks, environment typechecks, tests, and builds. Do not repeat its individual commands. For release validation, use `bun run validate:release`.

For focused work, use `bun run test -- path/to/test.ts`. See the [development guide](docs/DEV_GUIDE.md) for editor tasks and [tooling guide](docs/TOOLING.md) for command details. The [architecture overview](docs/ARCHITECTURE.md) describes the boundaries contributors must preserve.

## Conventions

- Do not commit generated assets, logs, SQLite DBs, Studio Library data, Playwright MCP dumps, or scratch images.
- Do not commit `.env.local` or real secrets.
- Keep the local-first path working without `OPENAI_API_KEY`.
- Document new environment variables and public scripts in `README.md`.
- If you change behavior that users or contributors rely on, explain why in the pull request.

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

Prefer small changes that a reader can understand.

## Code of conduct

This project follows [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).
