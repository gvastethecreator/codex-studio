# Release manual checklist

Use this only for checks that are intentionally not part of `bun run validate:full`.

## Before release candidate

- Run `bun run validate:full`.
- Run `bun run storage:audit` and record DB/log/reference/thumbnail risk.
- Run `bun run storage:compact` dry-run; write compaction remains a manual maintenance operation.
- Run `bun run storage:thumbnails:backfill` dry-run; write backfill can run in bounded batches after reviewing the plan and separating source-missing rows from recoverable rows.
- Run `bun run styles:browser:verify` against a live dev UI when touching Styles runtime, search, or render budgets.
- Run representative `bun run recipes:evaluate:live -- --execute` only when a ready local Codex session is available and visual review time exists.
- Verify a fresh `bun run dev` opens UI and backend health locally.

## Keep manual

- Live Codex quality comparisons.
- Visual QA of generated style cards.
- Broad Studio Library rewrites or compaction write mode.
- Any cleanup that deletes or moves local user assets.
