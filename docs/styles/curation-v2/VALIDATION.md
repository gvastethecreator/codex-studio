# Style curation v2 — validation record

## Executed gates

Validation ran on September 23, 2026 using Bun 1.3.14, the repository lockfile and an Ubuntu GitHub Actions runner. No image provider was invoked.

The validated application, scripts, manifests and generated projections were published as source commit `c2afc2cf5763ac6f596b9a66404b06491b888ab9`. The clean PR commit reuses that source tree, removes the temporary preparation workflow and adds this record plus a read-only review workflow. Standard PR checks remain independent of this historical record.

Execution: [GitHub Actions run 35820052236](https://github.com/gvastethecreator/codex-studio/actions/runs/35820052236). The artifact `style-curation-validation-35820052236` contains command logs, actual exit codes, source snapshot, category report and patch. That temporary artifact expires after seven days; this summary remains in the repository.

- `bun scripts/audit-style-curation.ts --verify`: exit 0; 20 packs, 121 categories, 1,689 presets, all categories covered, zero identical eight-field DNA groups, 121 categories still awaiting image acceptance.
- `bun scripts/generate-style-curation-review-doc.ts --check`: exit 0; generated documentation matches the decision register.
- `bun run styles:verify`: exit 0; includes runtime/policy/thumbnail projection checks, manifest graph, provider asset validation, source checks and render budgets.
- `bun run test`: exit 0; 299 test files and 1,426 tests passed.
- `bun run check`: exit 0; 2,974 files correctly formatted; no warnings, lint errors or type errors in 1,087 files.
- `bun run build`: exit 0; production build, entry chunk budgets and local-server type check passed.

## Failures found and corrected during validation

The first full execution had two failing tests and formatting failures. One integration assertion still expected catalogue names in the final recipe text. The other uncovered that the lazy YAML catalogue loader still enumerated only the original 17 packs. The assertions now verify metadata isolation, and all three new packs have lazy catalogue loaders. Generated search JSON, new manifests and documentation now follow repository formatting; the documentation generator also verifies its formatted output.

The initial source publication attempt failed because the CI token cannot modify workflow files. No permissions were widened. The source-only commit succeeded; workflow changes were prepared separately through the authorized repository connector. No temporary transport files or write-enabled preparation workflow are included in the clean PR tree.

## What these passes do not certify

No cross-subject generation, image comparison, preview generation or manual browser visual review was performed. New study previews remain explicitly pending. The original 1,677 preset manifests are unchanged, including scene-bearing wording inside their visual fields; the category report records proposed targeted editorial changes, not completed rewrites or approved mergers.

Archive controls, redirect migrations and final duplicate consolidation are not implemented here. Existing IDs and user data are not rewritten. Review the category-specific acceptance protocol in [README.md](./README.md) before promoting a study, changing an original preset's behavior or consolidating entries.
