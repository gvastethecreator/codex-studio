# Style Preset Router Audit

This audit resets the preset-quality work around one rule:

> A style card/default image is an example. A style preset is a reusable router.

When the user generates with `prompt X + preset`, the preset must transfer visual language onto
`prompt X`. It must not smuggle the card thumbnail's subject, props, pose, or scene into every
future generation.

## Preset Contract

Allowed in `visualDna`:

- Medium/process vocabulary: lens, paint, ink, texture, lighting, palette, line weight, contrast,
  material logic, rendering finish.
- Subject transformation rules: how any prompt subject changes under the style.
- Framing grammar: reusable crop, depth, hierarchy, rhythm, negative space, not one fixed card
  staging.
- Mood/world vocabulary only when it stays transferable.

Not allowed in `visualDna`:

- Required character/object bundles copied from the default card.
- Mandatory props, side characters, or scale markers.
- Fixed locations such as one chapel, shrine, alley, dungeon room, or market stall unless the
  preset itself is explicitly a location style.
- "One creature", "foreground shield", "behind the arch", "card crop" instructions that force a
  thumbnail composition into unrelated prompts.
- Creative briefs that ask the model to recreate the preset card instead of routing style.

## New Audit Tool

Added `styles:scene-lock:audit`:

```bash
bun run styles:scene-lock:audit -- --min-severity=medium --limit=80
bun run styles:scene-lock:audit -- --pack=pack_17 --min-severity=medium --limit=80
```

The tool reports:

- `fixed_subject`: concrete subject appears where a subject-agnostic transformation should be.
- `fixed_scene`: locale/set language appears as preset behavior.
- `card_composition`: card/thumbnail staging leaks into composition rules.
- `prop_bundle`: multi-prop card prompt copied into subject treatment.
- `router_weakness`: no explicit transferability contract.

Medium findings are review candidates, not automatic failures. Critical/high findings should be
treated as correction candidates unless manual review proves the term is intrinsic to the style.

## Initial Full Scan

Command:

```bash
bun run styles:scene-lock:audit -- --min-severity=medium --limit=80
```

Result:

| Severity | Count |
| -------- | ----: |
| Critical |     9 |
| High     |    31 |
| Medium   |   518 |
| Low      |    49 |
| Clean    |  1042 |

Highest-risk packs:

| Pack    | Presets | Critical | High | Medium | Clean | Avg score | Read                                                      |
| ------- | ------: | -------: | ---: | -----: | ----: | --------: | --------------------------------------------------------- |
| pack_17 |      44 |        7 |   12 |     18 |     4 |      6.32 | Hard scene-lock regression.                               |
| pack_15 |      80 |        0 |    1 |     79 |     0 |      4.24 | Broad card-prompt/brief pattern.                          |
| pack_09 |      80 |        0 |    0 |     66 |    14 |      3.33 | Mostly router-language weakness/material framing.         |
| pack_11 |      80 |        0 |    1 |     60 |    19 |      3.14 | Mixed toy/craft scene prompts and weak transfer language. |
| pack_03 |      80 |        0 |    3 |     43 |    33 |      2.51 | Environment/render styles need review.                    |
| pack_02 |     128 |        0 |    3 |     69 |    55 |      2.38 | Media/cinema wording needs sharper separation.            |
| pack_13 |     132 |        0 |    5 |     41 |    81 |      1.61 | Anime anchor prompts need router phrasing review.         |

Pack 14 and pack 16 currently look strongest by this scan.

## Pack 17 Detail

Command:

```bash
bun run styles:scene-lock:audit -- --pack=pack_17 --min-severity=medium --limit=80
```

Result:

| Severity | Count |
| -------- | ----: |
| Critical |     7 |
| High     |    12 |
| Medium   |    18 |
| Low      |     3 |
| Clean    |     4 |

Critical examples:

| Preset                                     | Problem                                                                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `SP17-029 Iron Reliquary Apocalypse`       | Subject is a walking iron shrine construct with bell legs, reliquary chest, penitents, plus portrait-card staging. |
| `SP17-030 Hexenwood Witch-Knight Covenant` | Subject is an antlered witch-knight icon with banner, mask, chapel charm, forest relics.                           |
| `SP17-044 Moon Parchment Oracle Beasts`    | Subject enumerates owl-wyrm, omen bird, shrine fox, moon shrine; composition forces oracle-card crop/one creature. |
| `SP17-017 Punk Heraldry Dungeon Cards`     | Subject is a dungeon goblin/card figure with shield stack, banner, mask.                                           |
| `SP17-001 Ashen Soulslike Ruins`           | Subject is an ash-wolf guardian crawling from a chapel with bells/shields; composition reproduces the card.        |
| `SP17-004 Cathedral Chiaroscuro`           | Subject is a cathedral executioner-saint with exact props and pose.                                                |
| `SP17-027 Stress-Ink Dungeon Crawl`        | Subject is a lantern rogue cornered by a wall-mouth monster in a dungeon setup.                                    |

Interpretation: pack 17 should be the first correction pack. It has real contamination in
`subject_treatment`, `camera_and_composition`, and `creative_brief`, not just missing router copy.

## Correction Strategy

Each preset correction should preserve identity while deleting thumbnail dependency:

1. Rewrite `subject_treatment` as subject-agnostic transformation.
2. Rewrite `camera_and_composition` as reusable framing grammar.
3. Rewrite `creative_brief` to say how `prompt X` receives the style.
4. Keep `assets.defaultImage` unchanged unless the card itself is misleading.
5. Run targeted validation after each pack:

```bash
bun run styles:scene-lock:audit -- --pack=<pack_id> --min-severity=medium --limit=120
bun run styles:validate -- --pack=<pack_id> --coverage
bun run styles:runtime
bun run styles:runtime:check
```

For broad batches, finish with:

```bash
bun run styles:verify
bun run test -- scripts/audit-style-preset-scene-lock.test.ts
```

## Proposed Work Order

1. `pack_17` hard rewrite.
   Goal: reduce critical/high to 0; medium only allowed for intentional card/tarot/bestiary framing
   after manual review.

2. `pack_15` structural rewrite.
   Many presets appear to be written as mini scene briefs. These need a pattern-level conversion, not
   one-off edits.

3. `pack_09`, `pack_11`, `pack_03`, `pack_02`.
   Separate true scene-lock from missing transferability language.

4. `pack_13`, `pack_06`, `pack_05`, remaining packs.
   Review style-anchor wording and old category-specific card prompts.

5. Add an optional verify gate only after false positives are tuned.
   Current auditor should stay diagnostic until we finish one manual correction cycle.

## Open Review Questions

- Should card-like media styles such as tarot, trading card, poster, cover, or product shot be allowed
  to keep card/crop language if they still preserve arbitrary subject transfer?
- Do we want a separate `assets.cardPrompt` or `thumbnailPrompt` field so future default images can
  have rich scene prompts without polluting `visualDna`?
- Should `router_weakness` stay medium, or become low after we finish critical scene-lock rewrites?

## Quality-Obsessed Pilot Pass

Pilot scope:

- `SP17-001 Ashen Soulslike Ruins`
- `SP17-029 Iron Reliquary Apocalypse`
- `SP17-044 Moon Parchment Oracle Beasts`

Quality bar:

- Preserve preset identity, pack/category, tags, default image, and avoid rules.
- Remove card subject, prop bundle, pose, scale-marker, and fixed-scene dependency from
  `subject_treatment`.
- Keep `camera_and_composition` as reusable framing grammar rather than a thumbnail layout.
- Make `creative_brief` explicit: `prompt X + preset` should preserve `prompt X` and apply the
  style as a router.

Result:

| Metric              | Before | After pilot |
| ------------------- | -----: | ----------: |
| `pack_17` critical  |      7 |           4 |
| `pack_17` high      |     12 |          12 |
| `pack_17` medium    |     18 |          18 |
| `pack_17` clean     |      4 |           7 |
| `pack_17` avg score |   6.32 |        5.23 |

The three edited presets no longer appear in `styles:scene-lock:audit` with
`--pack=pack_17 --min-severity=medium`.

Second cleanup:

- `SP17-001` still carried location pressure through words like "ruined", "broken-stone",
  "eroded stone", and "ruin-like depth cues". Those were replaced with material, lighting,
  silhouette, and depth vocabulary so the preset routes style without adding mandatory buildings,
  props, or locations.

Verification:

```bash
bun run styles:scene-lock:audit -- --pack=pack_17 --min-severity=medium --limit=20
bun run styles:validate -- --pack=pack_17 --coverage
bun run styles:runtime
bun run styles:runtime:check
bun run styles:source:verify
bun run test -- scripts/audit-style-preset-scene-lock.test.ts
```

Learning:

- The correction pattern works when it replaces card nouns with style mechanics, not when it only adds
  "reusable" language.
- Card-like media can keep centered/plate hierarchy, but it must not force a single subject, prop set,
  or default-card scene.
- `router_weakness` remains useful as a review signal, but it should not be treated as a hard block
  until critical/high scene-lock is cleaned.

## Pack 17 Hard Rewrite

Scope:

- Completed `pack_17` router cleanup for all critical, high, and medium findings.
- Preserved preset IDs, pack/category membership, tags, default images, and avoid rules unless a
  prompt-specific negative needed to remain aligned with the rewritten router.
- Converted thumbnail-like `subject_treatment` fields into transferable style mechanics.
- Converted `creative_brief` fields into explicit `prompt X + preset` router language.

Result:

| Metric              | Before hard rewrite | After hard rewrite |
| ------------------- | ------------------: | -----------------: |
| `pack_17` critical  |                   4 |                  0 |
| `pack_17` high      |                  12 |                  0 |
| `pack_17` medium    |                  18 |                  0 |
| `pack_17` low       |                   3 |                  3 |
| `pack_17` clean     |                   7 |                 41 |
| `pack_17` avg score |                5.23 |               0.14 |

Visual card preview policy:

- The card prompt must be an independent creative `Prompt X`, not a restatement of the preset or its
  default card.
- The preset is added after `Prompt X` as a style-router layer.
- Each `Prompt X` needs its own visual hook: an impossible gesture, material contradiction, odd ritual,
  or memorable object relationship.
- Avoid objects that imply text by default, such as signs, weather vanes, labels, scrolls, coats of
  arms, manuscript pages, or diagrams unless the prompt explicitly bans readable marks.
- For object cards, state `object-only` when human hands or support figures would weaken the test.
- Evaluate previews for: prompt survival, preset identity, no fixed-scene leakage, no prop-bundle
  leakage, texture budget, ornament budget, and accidental text.

Preview notes:

- `SP17-021`, `SP17-039`, `SP17-040`, `SP17-041`, and `SP17-043` behaved well as routers in visual
  tests: the independent prompt survived while the preset controlled style.
- `SP17-035` kept the independent subject but pushed ornament high; review as an ornament-budget case.
- `SP17-036` needed `object-only` wording to avoid support figures around the object prompt.
- `SP17-028` showed that an independent prompt can still seed accidental letters when it uses objects
  that commonly include directional marks; card prompts should avoid those objects or explicitly ban
  letters.
