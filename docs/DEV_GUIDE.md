# Development guide

## Stack

- Bun package manager and backend runtime
- React + Vite UI (`vp`)
- Local Hono API on Bun
- SQLite via `bun:sqlite` in the Studio Library
- Optional Grok Imagine execution through the locally authenticated Grok Build CLI

## First run

```bash
bun install
bun run studio:init
bun run dev
```

The repository also tracks common VS Code tasks under `.vscode/tasks.json`.
Use `🧱 init` once for setup, `🚀 dev` for the complete local stack, and the
focused `🖥 ui` or `⚙ api` tasks only when you intentionally run one side.

## Quality gates

```bash
bun run validate:fast    # cheap loop
bun run validate         # main PR gate
bun run validate:full    # compatibility alias of validate:release
bun run validate:release # release gate (providers + recipes + styles + docs + hygiene)
```

`🏗 build` is the default VS Code build task and `🧪 test` is the default test
task. `⚡ quick`, `✅ gate`, and `🛡 release` map to the three validation levels.

## Dependency health

```bash
bun outdated
bun audit
bun install --frozen-lockfile
```

`bun outdated` must be empty after a dependency refresh. `bun audit` must have
no known advisories, and the frozen install proves that `package.json` and
`bun.lock` agree.

## Workspace model

`Workspace` is the durable organization entity. Persistent Jobs store `workspace_id`. Do not reintroduce Project APIs on the generate path.

## Safety

- Never mutate a real user Studio Library in automated tests.
- Do not commit `.env.local`, SQLite DBs, logs, or `.scratch` dumps.
