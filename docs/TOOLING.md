# Tooling And Quality Flow

This document summarizes the repo's development stack and operational commands.

## Fast Path

1. Use `bun run check` during normal implementation.
2. Validate behavior with `bun run test`.
3. Close larger work with `bun run build` or `bun run validate:full`.

## Current Stack

- Package manager: **Bun 1.3.14**
- UI toolchain: **Vite+ 0.2.1**
- UI bundler: **Vite 8.1.0 + Rolldown**
- Lint/format: **Oxlint 1.71.0 + Oxfmt 0.56.0** through Vite+
- Unit tests: **Vitest** through Vite+
- Styles: **Tailwind CSS 4.3.2**
- React: **React 19.2.7**
- React animation: **GSAP 3.15.0**
- Desktop runtime: **Electron 42.5.1**

## Source Of Truth

Tooling configuration lives in `vite.config.ts`.

`package.json` declares `vite`, `oxlint`, and `oxfmt` as direct workspace dependencies so local binaries stay auditable. `overrides` keep the same baseline when `vite-plus` or internal runners declare older transitive ranges or pins.

Do not duplicate ESLint, Prettier, or Vitest configuration outside that file unless an exception is explicitly documented.

## Dependency And CI Refresh

Use the registry as the source of truth before changing versions:

```bash
npm view <package> version
git ls-remote --tags https://github.com/<owner>/<action>.git refs/tags/v*
```

`packageManager`, `.github/workflows/ci.yml`, and the local Bun runtime should stay on the same Bun baseline. If `vite`, `oxlint`, or `oxfmt` move, update both their direct dependency entries and `overrides`.

Current audited CI action tags:

- `actions/checkout@v7`
- `oven-sh/setup-bun@v2.2.0`
- `gitleaks/gitleaks-action@v3`
- `millionco/react-doctor@v2.2.2`

After dependency updates, prove the lockfile and basic CI locally:

```bash
bun install --frozen-lockfile
bun run check
bun run test
bun run build
```

## Main Commands

```bash
bun run fmt
bun run fmt:check
bun run lint
bun run check
bun run test
bun run test:unit
bun run test:coverage
bun run build
bun run validate:fast
bun run validate:full
```

## Maintenance Commands

```bash
bun run storage:audit
bun run storage:compact
bun run storage:thumbnails:backfill
bun run tooling:logs
bun run tooling:logs:prune
```

`storage:compact` and `storage:thumbnails:backfill` are dry-run by default. Write modes require `--write` and an explicit confirmation flag.

For large thumbnail batches, add `--limit=<n>` after the command name and review how many rows have source files before writing.

The same maintenance surface exists inside the app under Studio Settings -> Storage Maintenance. The UI calls local endpoints under `/api/maintenance`, keeps audit and plan actions direct, and reserves explicit confirmation for write modes.

## Persistent Logs

Quality and build tasks run through `scripts/tooling-task.ts` and write logs under `logs/tooling/`:

- `<task>-YYYY-MM-DDTHH-MM-SS.log`
- `<task>.latest.log`

Timestamped logs are pruned automatically per task. Use `bun run tooling:logs` to open the log folder on Windows, macOS, or Linux. Use `bun run tooling:logs:prune` or Studio Settings -> Storage Maintenance to force cleanup.

## Checklist

- [ ] Use `validate:fast` during iteration.
- [ ] Use `validate:full` before closing broad work.
- [ ] Attach exact logs when reporting failures.

## Windows Performance Note

You can reduce terminal or IDE load by adjusting:

- `OXFMT_THREADS`
- `OXLINT_THREADS`

When you need full detail, read `logs/tooling/` instead of repeating commands only to recover truncated output.
