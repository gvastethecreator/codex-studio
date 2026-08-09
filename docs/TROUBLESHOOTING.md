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

### Codex Studio stopped working after a Codex update

Symptoms: a checkout that worked before the update no longer starts jobs,
`app-server` fails to bind, or Runtime Doctor reports a path inside
`node_modules/.../vendor`.

1. Stop the old `bun run dev` process and start it again. Managed shutdown
   closes the UI, backend, and the owned `codex app-server` process tree.
2. Run `bun run runtime:doctor` and confirm it selects a supported desktop,
   npm, Bun, or PATH launcher with `app-server` capability.
3. Check `http://localhost:17223/api/health`; `checks.onboardingReady` is only
   true after the Library, runtime, app-server, and Local Codex Session are all
   ready.
4. If a custom `STUDIO_CODEX_CLI_PATH` or `CODEX_CLI_PATH` is configured,
   point it at a stable launcher. Never pin a release-specific vendor path.

The normal readiness path probes the selected launcher first and scans
fallback candidates only when that launcher fails. A changed version string
alone is not a setup failure.

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

### Grok Imagine is missing or blocked

Symptoms: the Grok Settings card shows `not_configured`, or Grok Jobs fail
before execution.

Run:

```bash
grok version
grok models
bun run providers:preflight -- --provider=grok
```

The preflight must report the local agent runtime as configured and
`canAttempt=true`. If login is missing, run `grok login` and complete browser
authentication. If Studio selects the wrong binary, set
`STUDIO_GROK_CLI_PATH` to the stable native Grok executable and restart the
backend. Do not add `XAI_API_KEY`; Studio uses the CLI-owned login.

Grok Jobs reject unresolved remote references, source files outside the Job's
captured Studio Library, more than five source images, unsupported explicit
aspect ratios, and output counts other than one before invoking media. Import
the reference into the Library or choose a supported ratio (`1:1`, `16:9`,
`9:16`, `4:3`, or `3:4`) and retry.

The Styles recipe is available with both Codex and Grok. Grok treats a Styles
run with one or more managed references as image editing and a run without
references as direct image generation. Studio creates one Persistent Job per
requested batch image, so each Grok session still produces exactly one image.

### Only the UI is running

Symptoms: `dev:ui` opens but jobs and assets do not sync.

Check: use `bun run dev`, or run `dev:server` and `dev:ui` in parallel.

### Ports are busy

Symptoms: Vite or Bun reports `listen` errors.

Check: change `STUDIO_SERVER_PORT` or `STUDIO_CODEX_WS_PORT` in `.env.local`.
`bun run dev` returns the first failing child exit code and, on Windows,
terminates wrapper process trees so Vite or Codex children do not retain the
ports after a failed start.

### `studio:init` reports a foreign-key failure

Symptoms: SQLite reports `FOREIGN KEY constraint failed` while a migration
rebuilds `jobs` or another parent table.

Current migrations preserve child rows and validate `foreign_key_check` before
committing. Stop the local server, update the checkout and dependencies, then
rerun:

```bash
bun install --frozen-lockfile
bun run studio:init
```

Do not delete `.studio/studio.sqlite` to bypass the error. If it still fails,
keep the database plus its `-wal` and `-shm` files together, report the exact
stack, and restore from a copy only after the server is stopped.

## When Terminal Output Is Too Short

If `check`, `lint`, `test`, or `build` fails and the terminal output is truncated:

- run `bun run tooling:logs`
- inspect the matching `*.latest.log`

The full test task caps Vitest at eight workers to avoid Windows filesystem and process contention. Set `VITEST_MAX_WORKERS` to a positive integer only when a different local limit is needed.

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
bun run providers:preflight
bun run validate:fast
bun run storage:audit
bun run storage:thumbnails:backfill
bun run check
bun run test
bun run build
```
