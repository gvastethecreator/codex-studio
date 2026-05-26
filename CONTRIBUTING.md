# Contributing to Codex Studio

Thank you for helping turn this repo into a more solid, easier-to-install open-source product.

## Before opening a PR

- Review the product context in `README.md` and `ROADMAP.md`.
- If your change touches architecture or local sync, also check `docs/ARCHITECTURE.md` and `docs/SERVICES.md`.
- If you are adding or modifying a recipe, read `docs/DEV_GUIDE.md`.

## Recommended local setup

```bash
bun install
bun run studio:init
bun run dev
```

To run processes separately:

```bash
bun run dev:server
bun run dev:ui
```

## Requirements for contributing

- **Bun** available in PATH.
- **Codex CLI** installed and locally authenticated.
- Do not depend on API keys for the main product flow.

## Minimum checklist for code changes

Before opening a PR, try to get these green:

```bash
bun run fmt:check
bun run lint
bun run check
bun run test
bun run build
```

If your change touches onboarding, setup, or DX, update the corresponding documentation in the same PR.

## Important repo conventions

- Do not commit generated assets, logs, SQLite databases, or local library content.
- Do not commit `.env.local`, `.env` with real data, or machine-specific paths.
- Keep the UI local-first: the main experience must continue to work without `OPENAI_API_KEY`.
- If you add a new environment variable or public script, document it in `README.md`.
- If you change a relevant structural decision, leave evidence in `docs/adr/` or at least in the affected technical documentation.
- Main quality tasks must continue writing logs to `logs/tooling/`.
- New unit tests must be written using `vite-plus/test`.

## How to file useful bug reports

When opening an issue or describing a problem, include:

- operating system;
- Bun version (`bun --version`);
- Codex version (`codex --version`);
- command used (`bun run dev`, `bun run dev:server`, etc.);
- what you expected to happen;
- what actually happened;
- relevant logs or screenshots from the `logs/` folder inside your Studio Library (e.g. `%USERPROFILE%\AI-Studio-Library\logs` on Windows), `logs/tooling/`, or your equivalent directory.

## Especially valuable changes right now

During this open-source preparation stage, PRs that improve the following are most welcome:

- onboarding and error messages;
- Windows/macOS/Linux compatibility;
- job and asset traceability;
- public documentation;
- UI copy, naming, and affordance cleanup.

## Contribution style

Prefer small, well-explained, easy-to-validate changes. If you plan a large cleanup or major reorganization, open an issue or leave a focus note first to align direction. Less heroics, more clarity.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold it.
