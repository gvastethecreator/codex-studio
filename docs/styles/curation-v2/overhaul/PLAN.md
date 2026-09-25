# Style library overhaul — working record

Started 2026-09-24. Branch `codex/styles-consolidated`.

## Objective

Make every category and preset more creative, specific and less generic.

- Audit every preset: text DNA plus its current card(s), recording concrete defects.
- Rewrite weak DNA fields so each preset has a distinctive, transferable mechanism.
- Give every preset a card set: 3 cards, 3 different briefs, each fitted to the preset and its category.
- Fill every category below 20 presets up to 20 with new, distinct presets (all 130 short categories).
- Old cards are cleaned only after the audit and generation are finished (user decision).

## Decisions (user, 2026-09-24)

- Regenerate everything. ChatGPT HTTP quota, usage treated as unlimited; queue of 4 (`--parallel=4`).
- 3 cards per preset, each a different prompt.
- Fill all 130 categories to 20, including profile and modifier categories.
- Skip pack_12 and pack_17 while another agent works on them; do them last.
- Go slowly, category by category.

## Tooling

- `bun scripts/generate-style-defaults.ts --provider=chatgpt --workspace-id=styles-portability-review-20260923 --pack=<pack> --category=<category> --card-set --parallel=4`
  - primary brief: `scripts/style-curation/card-briefs.json`
  - variant briefs: `scripts/style-curation/card-brief-variants.json` (`{ id: [v01, v02] }`)
  - a slot resubmits only when its composed prompt changed.
- Contact sheet: `bun .local/style-curation/overhaul/tools/sheet.ts "<pack>::<category>" <out.jpg>`
- Per category closeout: flip `previewStatus`, `styles:runtime`, `styles:thumbs -- --pack=<pack>`, `styles:thumbnails`,
  `styles:validate -- --pack=<pack> --strict-taxonomy`, update `category-reviews.json` count + hash + notes,
  `styles:curation:verify`, bump preset count in `components/recipes/stylePresetManifests.test.ts`, commit.

## Per-category loop

1. Contact sheet of current cards + read every manifest in the category.
2. Defect notes per preset (card and text) in `audits/<pack>__<slug>.md`.
3. Rewrite weak DNA fields; keep the preset's identity.
4. Write 3 briefs per preset (primary + 2 variants), tuned to preset and category.
5. Add new presets up to 20 (pending preview until reviewed).
6. Generate card sets, review contact sheet, rewrite briefs of failed cards and regenerate.
7. Closeout checks, commit.

## Order

Pack order, skipping pack_12 and pack_17: pack_01 → pack_24, then pack_12, pack_17.

## Progress

| Category                                     | Audit | DNA  | Briefs | New presets       | Cards               | Commit             |
| -------------------------------------------- | ----- | ---- | ------ | ----------------- | ------------------- | ------------------ |
| pack_01::1. Portrait And Studio              | done  | done | done   | 2 (SP01-088, 089) | generated, reviewed | 58808ede, b12dd6f5 |
| pack_01::2. Lighting Techniques              | done  | done | done   | 5 (SP01-090…094)  | pending (local)     | 3adb6717 + fix     |
| pack_01::3. Film And Analog Process          | done  | done | done   | 7 (SP01-095…101)  | pending (local)     | see git log        |
| pack_01::4. Documentary And Street           | done  | done | done   | 11 (SP01-102…112) | pending (local)     | see git log        |
| pack_01::5. Commercial And Product           | done  | done | done   | 6 (SP01-113…118)  | pending (local)     | see git log        |
| pack_01::6. Nature And Wildlife              | done  | done | done   | 14 (SP01-119…132) | pending (local)     | see git log        |
| pack_01::7. Technical And Specialist Imaging | done  | done | done   | 8 (SP01-133…140)  | pending (local)     | see git log        |
| pack_02::1. Film Genres                      | done  | done | done   | 4 (SP02-130…133)  | pending (local)     | see git log        |
| pack_02::2. TV And Broadcast                 | done  | done | done   | 0 (already 23)    | pending (local)     | see git log        |

## Open risks

- Another agent edits shared files (`card-briefs.json`, `category-reviews.json`, generated runtime). Commit with partial staging; never overwrite their work.
- Category review hashes change with every DNA edit; update them in the same commit.
