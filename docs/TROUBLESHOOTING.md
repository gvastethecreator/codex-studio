# Troubleshooting

## Fast Diagnostics

1. Run `bun run studio:init`.
2. Start the backend with `bun run dev:server`.
3. Run `bun run runtime:doctor`.
4. Check `http://localhost:17223/api/health`.
5. If a quality gate failed, run `bun run tooling:logs` and inspect `*.latest.log`.

## Common Startup Problems

### `codex` is missing or does not respond

Symptoms: `codexCli.available: false`, real jobs do not start.

Check: selected CLI path, PATH setup, terminal restart after installing Codex,
and `bun run runtime:doctor`. CLI metadata is useful for diagnosis, but setup
should be blocked by missing app-server support or auth, not by a hardcoded
tool release.

Run:

```bash
bun run runtime:doctor
```

The doctor reports the selected executable, CLI metadata, app-server
support, and the recommended action without printing secrets.

### An old `codex` install is selected

Symptoms: jobs fail with WebSocket connection errors, `runtime:doctor` reports
`codex_cli_legacy`, the selected CLI lacks `codex app-server`, or health shows
`codexRuntime.status: blocked`.

Check: remove or update old npm shims under the user npm directory, make sure the OpenAI Codex desktop CLI binary is selected, then restart `bun run dev:server`.

Common Windows repro: `C:\Users\<you>\AppData\Roaming\npm\codex.cmd` points to
an unrelated legacy npm package named `codex`, while OpenAI Codex is either
missing or lower in PATH. The setup UI now shows the selected executable, the
failing command, top candidates, and copyable repair commands.

Repair:

```bash
npm uninstall -g codex
codex login
bun run runtime:doctor
```

If Codex is still missing after removing the old shim, install or update the
current OpenAI Codex CLI through the supported channel for your environment,
then rerun `bun run runtime:doctor`.

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
bun run runtime:doctor
bun run validate:fast
bun run storage:audit
bun run storage:thumbnails:backfill
bun run check
bun run test
bun run build
```
