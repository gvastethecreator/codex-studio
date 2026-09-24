# Execution report contract

Create a starting report with `agent-kit.mjs template`. Do not reuse a fingerprint from another category or preset selection. The JSON records editorial work; it is not a runtime contract or migration authorization.

## Structure

`schemaVersion`, `taskId`, `inputFingerprint`, and `selectedPresetIds` must match the packet. `status` is `blocked`, `text-ready`, `visual-review-needed`, or `accepted`.

Each selected preset needs a `classifications` entry with `presetId`, `kind`, and `reason`. `kind` is `style`, `modifier`, `profile`, or `theme`, never `mixed`.

Each `decisions` entry needs `presetId`, `action`, `reason`, and a nonempty `invariants` array. Actions are `keep`, `derive`, `propose-variant`, `propose-archive`, and `escalate`. Add an editorial ledger for each changed field: before, after, reason, preserved invariant, and risk. `propose-archive` does not hide a preset.

For each command, record the exact command, `status` (`passed`, `failed`, or `not-run`), and the actual integer `exitCode` (`null` if not run). Keep logs outside Git. A failed command cannot be `passed`, and a pending test cannot have exit code zero. The helper checks consistency, not whether a command was actually run.

Use `blockers` for unresolved decisions or prerequisites and `remaining` for unfinished work. A packet covers a subset; it does not approve the whole category.

## Visual evidence

`visual` has `status` (`not-run`, `pending`, `failed`, or `passed`), `runs`, and `humanReview` (`null` until a review exists).

Each comparison in `runs` needs the selected original `presetId`, `caseId`, `provider`, `model`, `settings`, actual `seed` or `null`, and `beforePath`, `beforeSha256`, `afterPath`, and `afterSha256`. Paths must point to existing images under `.local/style-curation/evidence/`. Do not commit credentials or generated images.

Also record the derived preset ID and version, effective prompt, reference role and hash, supported parameters, date, observations for each check, and differences between repetitions A and B. The helper verifies basic file existence and hashes; a reviewer must inspect the images and these additional details. The helper cannot prove model identity, experimental comparability, or absence of content duplication.

For `passed`, `humanReview` needs a `reviewer` and `recordPath` to an existing review. File existence does not authenticate a human reviewer. Never invent a signature or approval. The helper requires two recorded comparisons for each selected case. Interpret the five common subjects according to the preset type; do not strip the defining mechanisms of a specialized profile to make it look universal.

For `accepted`, all presets must be covered, no blockers or remaining work may exist, and `bun run styles:verify`, `bun run test`, `bun run check`, and `bun run build` must be recorded as passed. An incompatible case or unavailable provider keeps the packet pending or blocked. Do not fabricate an image to satisfy this requirement.

## Interpret validation

`structurallyValid: true` means the report satisfies checked structural rules, not that the work is accepted. Read `reportedStatus` too. The result always includes `automaticVisualApproval: false`. The helper does not inspect pixels, assess artistic quality, or authenticate a human signature.

The helper is read-only. It cannot archive, rename, merge, or edit sources. Hash checks detect changed inputs; the existing source audit must still establish that generated indexes match the current YAML.
