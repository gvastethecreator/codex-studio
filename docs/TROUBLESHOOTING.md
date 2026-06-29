# Troubleshooting

## Fast Diagnostics

1. Run `bun run studio:init`.
2. Start the backend with `bun run dev:server`.
3. Check `http://localhost:17223/api/health`.
4. If a quality gate failed, run `bun run tooling:logs` and inspect `*.latest.log`.

## Common Startup Problems

### `codex` is missing or does not respond

Symptoms: `codexCli.available: false`, real jobs do not start.

Check: `codex --version`, PATH setup, and terminal restart after installing Codex.

### `codex app-server` is not available

Symptoms: backend starts but generations do not progress, `appServer.running: false`.

Check: app-server support, authenticated Codex session, and free WebSocket port.

### Codex session expired

Symptoms: Codex CLI exists but jobs fail with permission or authorization errors.

Check: reauthenticate Codex, then restart `bun run dev:server`.

### Only the UI is running

Symptoms: `dev:ui` opens but jobs and assets do not sync.

Check: use `bun run dev`, or run `dev:server` and `dev:ui` in parallel.

### Ports are busy

Symptoms: Vite or Bun reports `listen` errors.

Check: change `STUDIO_SERVER_PORT` or `STUDIO_CODEX_WS_PORT` in `.env.local`.

## When Terminal Output Is Too Short

If `check`, `lint`, `test`, or `build` fails and the terminal output is truncated:

- run `bun run tooling:logs`
- inspect the matching `*.latest.log`
- include the exact log in issue or PR notes

## Studio Library Problems

If the default path does not exist, set an absolute `STUDIO_LIBRARY_DIR` in `.env.local`, then run:

```bash
bun run studio:init
```

## Storage And Heavy Logs

Run `bun run storage:audit` to review SQLite size, WAL/SHM files, logs, transcripts, references, historical inline payloads, missing thumbnails, duplicate references, and compactable payloads without printing private content.

From the app, open Studio Settings -> Storage Maintenance to run audit, compaction plans, thumbnail backfill plans, and tooling-log pruning through `/api/maintenance`.

`storage:compact` is dry-run by default. To write historical compaction, stop the local server and run:

```bash
bun run storage:compact -- --write --confirm=compact-inline-payloads
```

Backend logs rotate under `.studio/logs/history`. `/api/logs` and the activity panel show a recent window, not an infinite historical file.

Tooling logs keep one `.latest.log` per task and prune timestamped runs automatically. To clean them manually:

```bash
bun run tooling:logs:prune
```

To warm missing historical thumbnails without writing first:

```bash
bun run storage:thumbnails:backfill
```

To write a planned thumbnail batch:

```bash
bun run storage:thumbnails:backfill -- --limit=1000 --write --confirm=backfill-thumbnails
```

## Useful Commands

```bash
bun run studio:init
bun run dev:server
bun run dev:ui
bun run validate:fast
bun run storage:audit
bun run storage:thumbnails:backfill
bun run check
bun run test
bun run build
```
