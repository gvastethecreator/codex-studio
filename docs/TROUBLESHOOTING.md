# Troubleshooting

## Common startup issues

### `codex` does not exist or does not respond

Symptoms:

- `GET /api/health` shows `codexCli.available: false`.
- Real jobs do not start.

Check:

- confirm that `codex --version` works in your terminal;
- make sure Codex is installed and available in PATH;
- reopen your terminal if you just installed it.

### `codex app-server` is not available

Symptoms:

- the backend starts, but real generation fails or never progresses;
- the health check shows `appServer.running: false`.

Check:

- your Codex installation supports `app-server`;
- your local session is authenticated;
- no other process is using the configured WebSocket port.

### The Codex session expired

Symptoms:

- the CLI exists, but jobs fail because of permissions or authorization;
- the UI still loads, but no new results appear.

Check:

- reauthenticate Codex on the machine;
- restart `bun run dev:server` after reauthenticating.

### Only the UI is running

Symptoms:

- `bun run dev:ui` works, but the grid does not sync local jobs or assets;
- the UI shows errors when calling `localhost:4317`.

Check:

- use `bun run dev` for the full flow;
- or run `bun run dev:server` in parallel when running the UI separately.

### Ports are already occupied

Symptoms:

- the server does not start;
- Vite or Bun reports listen errors.

Check:

- change `STUDIO_SERVER_PORT` and/or `STUDIO_CODEX_WS_PORT` in `.env.local`;
- avoid conflicts with other local services.

### `bun run check`, `bun run lint`, or `bun run test` fails and the console is not enough

Symptoms:

- terminal output is truncated or does not show the first failure clearly;
- you want to share the exact failure without re-running the command.

Check:

- open `logs/tooling/`;
- use the task's `*.latest.log` file;
- if you need full history, find the most recent timestamped log.

Main quality tasks run through `scripts/tooling-task.ts`, so they leave persistent logs.

### The integrated terminal or IDE becomes heavy during `fmt` or `build`

Symptoms:

- VS Code becomes sluggish or appears frozen after starting several commands;
- `build` creates too much terminal noise;
- a long run appears stuck even though the process is still working.

Check:

- use repo wrappers (`bun run fmt`, `bun run lint`, `bun run build`, `bun run validate:*`) instead of invoking `vp` manually;
- reduce `OXFMT_THREADS` and/or `OXLINT_THREADS` if you need lower machine pressure;
- read `logs/tooling/*.latest.log` for the full build or quality-run detail.

`build` now prints only a short console summary to keep the terminal responsive; full details remain in the persistent log.

## Studio Library issues

### The default path does not exist on your OS

By default, Codex Studio uses a path under the user's home directory, for example `%USERPROFILE%\AI-Studio-Library` on Windows or `$HOME/AI-Studio-Library` on macOS/Linux. Inside that root, `.studio/` stores internal state and `outputs/` stores generated images and exports.

Solution:

1. create a local absolute path for your machine;
2. update `STUDIO_LIBRARY_DIR` in `.env.local`;
3. run `bun run studio:init` again.

Examples:

- Windows: `%USERPROFILE%\AI-Studio-Library`
- macOS: `/Users/<your-user>/AI-Studio-Library`
- Linux: `/home/<your-user>/AI-Studio-Library`

### Assets or logs are not where you expected

Check:

- the effective `STUDIO_LIBRARY_DIR` in `.env.local`;
- `GET /api/health` to confirm `libraryDir`;
- the `logs/` folder inside your Studio Library.

## Quick diagnostic commands

```bash
bun run studio:init
bun run dev:server
bun run dev:ui
bun run fmt:check
bun run lint
bun run test:unit
bun run validate:fast
bun run check
bun run test
bun run build
```

Performance note: `bun run check` now combines format, lint, and type-check in one step. For iterative debugging, prefer `bun run validate:fast` and reserve `bun run validate:full` for final verification.

You can also inspect:

- `http://localhost:4317/api/health`
- the logs folder inside your Studio Library
- `logs/tooling/` for repo quality/build logs
- `README.md` for the full setup flow
