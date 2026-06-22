# Style generation maintenance index

Use this file as the short active entry point for style-generation maintenance.

## Canonical active files

- `docs/active/style-category-bases-audit.md`: current category-base coverage report.
- `docs/active/style-preset-card-regeneration-backlog.md`: compatibility backlog consumed by style runtime tooling.
- `docs/active/style-presets-style-first-refactor.md`: historical work log for style-first preset/card runs.

## Maintenance rules

- Keep new status summaries here or in focused docs; avoid appending long run logs to the two large historical files unless a script still needs that exact file.
- Avoid absolute local backup paths in new notes. Prefer variables such as `STYLE_DEFAULT_CARD_ARCHIVE_DIR`.
- Do not commit generated QA sheets, prompt dumps, local logs, or Codex generated-image folders.
- Before public release, archive or split historical run logs only after updating scripts that still reference their current paths.

## Current cleanup status

- Historical docs remain in place because existing style tooling and generated comments still reference their active paths.
- Repo-local scratch/log outputs should stay ignored and disposable.
