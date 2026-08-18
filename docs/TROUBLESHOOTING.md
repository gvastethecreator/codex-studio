# Troubleshooting

## Fast diagnostics

1. Run `bun run studio:init`.
2. Start the backend with `bun run dev:server`.
3. Run `bun run runtime:doctor`.
4. Open `http://localhost:17223/api/health`.
5. If a quality gate failed, run `bun run tooling:logs` and inspect `*.latest.log`.

## Common startup problems

### `codex` is missing or does not respond

Symptoms: `codexCli.available: false`. Real jobs do not start.

Make sure that the selected CLI path and `PATH` are correct. Restart the terminal after you install Codex. Then run `bun run runtime:doctor`.

CLI metadata helps diagnosis. Block setup for missing app-server support or missing auth. Do not block setup for a hardcoded tool release.

```bash
bun run runtime:doctor
```

The doctor reports the selected executable, CLI metadata, app-server support, and the recommended action. It does not print secrets.

### Codex Studio stopped working after a Codex update

Symptoms: a checkout that worked before the update no longer starts jobs. `app-server` fails to bind. Runtime Doctor reports a path inside `node_modules/.../vendor`.

1. Stop the old `bun run dev` process and start it again. Managed shutdown closes the UI, the backend, and the owned `codex app-server` process tree.
2. Run `bun run runtime:doctor`. Make sure that it selects a supported desktop, npm, Bun, or PATH launcher with `app-server` capability.
3. Open `http://localhost:17223/api/health`. `checks.onboardingReady` is true only after the Library, runtime, app-server, and Local Codex Session are all ready.
4. If a custom `STUDIO_CODEX_CLI_PATH` or `CODEX_CLI_PATH` is set, point it at a stable launcher. Never pin a release-specific vendor path.

The normal readiness path probes the selected launcher first. It scans fallback candidates only when that launcher fails. A changed version string alone is not a setup failure.

### An old `codex` install is selected

Symptoms: jobs fail with WebSocket connection errors. `runtime:doctor` reports `codex_cli_legacy`. The selected CLI lacks `codex app-server`. Health shows `codexRuntime.status: blocked`.

Remove or update old npm shims under the user npm directory. Make sure that the OpenAI Codex desktop CLI binary is selected. Then restart `bun run dev:server`.

A common Windows case: `C:\Users\<you>\AppData\Roaming\npm\codex.cmd` points to an unrelated legacy npm package named `codex`. OpenAI Codex is missing or lower in `PATH`. The setup UI shows the selected executable, the failing command, top candidates, and copyable repair commands.

Repair:

```bash
npm uninstall -g codex
codex login
bun run runtime:doctor
```

If Codex is still missing after you remove the old shim, install or update the current OpenAI Codex CLI through the supported channel. Then run `bun run runtime:doctor` again.

### `codex app-server` is not available

Symptoms: the backend starts but generations do not progress. `appServer.running: false`.

Make sure that app-server support is present, the Codex session is signed in, and the WebSocket port is free.

### Codex session expired

Symptoms: Codex CLI exists but jobs fail with permission or authorization errors.

Sign in to Codex again. Then restart `bun run dev:server`.

### Grok Imagine is missing or blocked

Symptoms: the Grok Settings card shows `not_configured`, or Grok Jobs fail before execution.

```bash
grok version
grok models
bun run providers:preflight -- --provider=grok
```

The preflight must report the local agent runtime as configured and `canAttempt=true`. If login is missing, run `grok login` and complete browser authentication.

If Studio selects the wrong binary, set `STUDIO_GROK_CLI_PATH` to the stable native Grok executable and restart the backend. Do not add `XAI_API_KEY`. Studio uses the CLI-owned login.

`grok models` on Grok Build 1.0.4 prints `Default model:` plus a `*` default and `-` other models. Studio uses that default when Settings and `GROK_IMAGE_MODEL` are empty. If a stored Settings model is missing from the list, intake rejects the job before enqueue.

Grok Jobs reject these cases before enqueue:

- unresolved remote references
- source files outside the Job captured Studio Library
- more than five source images
- unsupported explicit aspect ratios
- output counts other than one

Import the reference into the Library, or choose a supported ratio (`1:1`, `16:9`, `9:16`, `4:3`, or `3:4`) and retry.
The Generate dock names the same blocks.

Home and Styles work with Grok.
Other recipes stay Codex-first until they declare Grok and have a compiler fixture.
Grok treats a Styles run with one or more managed references as image editing.
A run without references is direct image generation.
Studio creates one Persistent Job per requested batch image.
Each Grok session still produces exactly one image.

### Only the UI is running

Symptoms: `dev:ui` opens but jobs and assets do not sync.

Use `bun run dev`, or run `dev:server` and `dev:ui` in parallel.

### Ports are busy

Symptoms: Vite or Bun reports `listen` errors.

Change `STUDIO_SERVER_PORT` or `STUDIO_CODEX_WS_PORT` in `.env.local`.
`bun run dev` returns the first failing child exit code.
On Windows it terminates wrapper process trees so Vite or Codex children do not keep the ports after a failed start.

### `studio:init` reports a foreign-key failure

Symptoms: SQLite reports `FOREIGN KEY constraint failed` while a migration rebuilds `jobs` or another parent table.

Current migrations preserve child rows and validate `foreign_key_check` before they commit. Stop the local server. Update the checkout and dependencies. Then run:

```bash
bun install --frozen-lockfile
bun run studio:init
```

Do not delete `.studio/studio.sqlite` to bypass the error. If it still fails, keep the database plus its `-wal` and `-shm` files together. Report the exact stack. Restore from a copy only after the server is stopped.

## When terminal output is too short

If `check`, `lint`, `test`, or `build` fails and the terminal output is truncated:

1. Run `bun run tooling:logs`.
2. Inspect the matching `*.latest.log`.
3. Include the exact log in issue or pull request notes.

The full test task caps Vitest at eight workers to avoid Windows filesystem and process contention. Set `VITEST_MAX_WORKERS` to a positive integer only when you need a different local limit.

## Studio Library problems

If the default path does not exist, set an absolute `STUDIO_LIBRARY_DIR` in `.env.local`. Then run:

```bash
bun run studio:init
```

## Storage and heavy logs

Run `bun run storage:audit` to review SQLite size, WAL/SHM files, logs, transcripts, references, historical inline payloads, missing thumbnails, duplicate references, and compactable payloads.
The command does not print private content.

From the app, open Studio Settings, then Storage Maintenance. You can run audit, compaction plans, thumbnail backfill plans, and tooling-log pruning through `/api/maintenance`.

`storage:compact` is dry-run by default. To write historical compaction, stop the local server and run:

```bash
bun run storage:compact -- --write --confirm=compact-inline-payloads
```

Backend logs rotate under `.studio/logs/history`. `/api/logs` and the activity panel show a recent window, not an infinite historical file.

Tooling logs keep one `.latest.log` per task and prune timestamped runs automatically. To clean them by hand:

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

## Useful commands

```bash
bun run studio:init
bun run dev:server
bun run dev:ui
bun run runtime:doctor
bun run providers:preflight
bun run validate:fast
bun run storage:audit
bun run storage:thumbnails:backfill
bun run check
bun run test
bun run build
```
