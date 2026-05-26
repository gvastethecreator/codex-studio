# Tooling and Quality Flow

This document summarizes the development stack and operational commands for the repo.

## Current stack

- **Package manager:** Bun
- **UI toolchain:** Vite+
- **UI bundler:** Vite 8 + Rolldown
- **Lint / format:** Oxlint + Oxfmt through Vite+
- **Unit tests:** Vitest through Vite+
- **Styles:** Tailwind CSS v4 with tokens in `index.css`
- **React animation:** GSAP

## Source of truth

UI tooling configuration lives in `vite.config.ts`.

It centralizes:

- app aliases;
- `fmt`;
- `lint`;
- `test`;
- `staged`;
- Vite and Tailwind plugins.

Do not reintroduce duplicate ESLint, Prettier, or Vitest configuration outside this file unless there is a documented exception.

## Main commands

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

## Persistent logs

These tasks run through `scripts/tooling-task.ts` and write logs to `logs/tooling/`.

Conventions:

- `<task>-YYYY-MM-DDTHH-MM-SS.log` — one specific run;
- `<task>.latest.log` — latest known state for that task.

This makes it possible to:

- attach a concrete failure to an issue;
- review long runs without losing context to terminal scrollback;
- debug intermittent failures without immediately re-running the command.

## Notes

- `bun run build` validates both the UI and the local backend.
- `bun run validate:fast` is the recommended short loop during refactors.
- `bun run validate:full` is the local release gate before closing larger work.
- VS Code tasks in `.vscode/tasks.json` mirror this flow with short emoji-labeled names.

## Integrated terminal stability

To avoid freezing the integrated terminal or overloading the IDE on Windows:

- `bun run fmt` and `bun run fmt:check` limit Oxfmt to a reasonable thread count. The default is `8` and can be overridden with `OXFMT_THREADS`.
- `bun run lint` and `bun run lint:fix` limit Oxlint to a reasonable thread count. The default is `8` and can be overridden with `OXLINT_THREADS`.
- `bun run build` and the build step inside `validate:full` no longer dump the full asset list to the console. The terminal shows a short summary and the full detail remains in `logs/tooling/`.

If you need full output from a heavy run, open the corresponding timestamped log in `logs/tooling/` instead of repeating the command just to read the console.
