# Applied design package audit

Source: `Codex_Studio_Fichas_Completas_2026-09-25/` (local only, not committed). It holds 320 Spanish research cards in 16 collections of 20 (ids `R-<CODE>-NN`), 960 briefs, fixtures and a browser explorer.

Target: pack `pack_25` "Applied Design", one category per collection. `pack_18` is taken by 60 intentional-v1 presets, so the new pack uses 25.

Re-run the audit with `bun docs/styles/curation-v2/applied-design/audit-fichas.ts`. It needs the package folder at the repo root.

## Structure

The package is complete and consistent:

- **Cards and collections:** 320 unique ids, 16 collections of 20, and no name collisions with the live catalog.
- **Briefs:** every card has 8 construction fields and 3 briefs, and every prompt file matches `catalog.json`.
- **Kinds:** 238 styles, 10 modifiers, 34 profiles and 38 recipes.

## Findings

| Finding                                                                        | Count          | Effect                                                            | Action                                                                   |
| ------------------------------------------------------------------------------ | -------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Source text is Spanish                                                         | 319/320        | Catalog manifests and briefs are English                          | Rewritten in English, not machine-copied                                 |
| `creative_brief` is a concatenation of other fields                            | 320            | Duplicate text in the prompt                                      | Replaced by the DNA-derived creative brief (`creativeBriefFromDna`)      |
| `key_features` copied word for word from DNA fields                            | 320            | No extra signal                                                   | Rewritten as 4 short distinct traits                                     |
| `aesthetic` equals `mechanism` and has no identity                             | 320            | Weak style name anchor                                            | Aesthetic now opens with the style name                                  |
| Negations inside positive DNA fields ("sin bisel", "no usar...")               | 1127           | Negative words in a positive field can prime the unwanted feature | Rewritten as positive construction rules; failures moved to `avoidRules` |
| DNA fields shorter than the repo minimum                                       | 19             | `styles:dna:audit` failure                                        | Expanded by the strict DNA builder                                       |
| Brief formula openings ("Icono para" 48/60 in APP, "Concepto de" 48/60 in PRD) | 12 collections | Low variety                                                       | New briefs; brief-lint caps shared openings at 15%                       |
| Briefs that need a fixture, JSON file or original artwork (BRUMA x55)          | 231/960        | A card cannot attach those inputs                                 | New self-contained briefs                                                |
| Briefs flat and functional, with 3+ negation clauses                           | 55             | Below the brief creativity standard                               | New briefs: one striking, relevant idea each; tones rotate               |
| Briefs with exact requested text                                               | 381            | Common negatives (`text`, `logo`, `UI overlay`) contradict them   | Scoped requested-text policy (below)                                     |
| Third-party brand terms                                                        | 0              | None; earlier hits were accent false positives ("añadidas")       | Audit now uses letter-aware boundaries                                   |

## Requested-text policy

A new category could not be created before: `apply.ts` needed an anchor preset in the category, and it always appended `text`, `readable labels`, `logo` and `UI overlay` to the negatives. Now:

- **New categories:** `Spec.newCategory` creates a category with no anchor preset. Its taxonomy comes from the pack.
- **Text policy:** `Create.textPolicy: 'requested'` leaves those four rules out and adds the tag `requested-text`. The negatives become "misspelled or altered requested text", "extra invented words or letters", "lorem ipsum placeholder text", "real brand or trademark" and "copying a specific famous design".
- **Scope:** the policy is per preset, not global. Photography and illustration presets keep the no-text negatives.
- **Brief lint:** presets tagged `requested-text` do not need the "no readable text or logo" clause. Lint reports that clause as a contradiction when it appears.
- **Which categories use it:** logo, UI, HUD, packaging, mockups, advertising, typography, editorial, information graphics, apparel, wayfinding and motion. Icons, app icons, product design and surface design keep the no-text rule.

## Kind decisions

- **Styles and modifiers:** become presets and are counted toward 20.
- **Profiles:** become presets tagged `profile`. They describe a presentation sheet or layout, not a universal look.
- **Recipes with a visual deliverable** (a comparison sheet, a size set, a sequence or a mockup pair) become profile presets.
- **Recipes that only describe verification** stay in `QA-PROTOCOLS.md` and are not presets. Each category is refilled to 20 with a new authored style. These recipes are ICO-19, HUD-20, PRD-19, MCK-19, TYP-19, DAT-19, DAT-20, ENV-19 and MOT-20.
- **Cards that overlap existing presets** are replaced by new styles:

  | Card                              | Existing preset                                      |
  | --------------------------------- | ---------------------------------------------------- |
  | MCK-03 Contact-Shadow Isolation   | pack_01 Seamless Packshot and E-Commerce White Sweep |
  | MCK-09 Hand-and-Scale Context     | pack_01 Lifestyle In-Hand Product                    |
  | MCK-14 Ghost-Form Apparel Study   | pack_01 Ghost Mannequin Apparel                      |
  | DAT-13 Topological Route Diagrams | pack_10 Transit Map Diagram                          |

- **Cards kept and made distinct:** PRD-18 (a design board, not a render) and UI-16 (an interface layer modifier, not a 3D glass render).

## Status

All 16 categories are integrated in `pack_25`, with 20 presets each (320 in total):

- **Imported cards:** 307, written in English with new briefs.
- **QA protocols:** 9 verification recipes moved to `QA-PROTOCOLS.md`.
- **Replaced cards:** 4 that overlapped existing presets.
- **New presets:** 13 styles, tagged `r-<code>-<nn>-new`, fill the gaps left by the 9 QA recipes and the 4 replaced cards:

  | Category             | New styles                                                                                                |
  | -------------------- | --------------------------------------------------------------------------------------------------------- |
  | Interface icons      | Isometric Wire Icons                                                                                      |
  | Game UI & HUDs       | Contour-Line Gauges                                                                                       |
  | Product design       | Stacked Ring Forms                                                                                        |
  | Mockups              | Brand-Shape Set Build, Giant Product Miniature World, Landscape Billboard Mockup, Shop-Window Display Set |
  | Typography           | Signwriter Brush Lettering                                                                                |
  | Information graphics | Sketchnote Visual Notes, Slope-Chart Editorials, Periodic Grid Systems                                    |
  | Wayfinding           | Tiled Mosaic Signage                                                                                      |
  | Motion               | Cutout Stop-Motion Frames                                                                                 |

Only text is authored so far. No cards are generated yet, and `visualValidation` stays `pending` for every category. `integration-map.json` records where each `R-*` id went: a preset id, the QA doc, or a replacement.
