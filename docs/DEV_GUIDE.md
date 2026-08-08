# Development guide

## Stack

- Bun package manager and backend runtime
- React + Vite UI (`vp`)
- Local Hono API on Bun
- SQLite via `bun:sqlite` in the Studio Library

## First run

```bash
bun install
bun run studio:init
bun run dev
```

## Quality gates

```bash
bun run validate:fast    # cheap loop
bun run validate         # main PR gate
bun run validate:full    # compatibility alias of validate:release
bun run validate:release # release gate (providers + recipes + styles + docs + hygiene)
```

## Workspace model

`Workspace` is the durable organization entity. Persistent Jobs store `workspace_id`. Do not reintroduce Project APIs on the generate path.

## Safety

- Never mutate a real user Studio Library in automated tests.
- Do not commit `.env.local`, SQLite DBs, logs, or `.scratch` dumps.
