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

## Card Prompt Contract

Card/default-image prompts are authored separately from preset router prompts:

- Start with the preset's own culture and visual purpose, not with a reusable attractive character,
  generic fighter, object still life, or stock scene.
- Choose a card concept preset by preset. A fashion preset can use sensual body language when that is
  the strongest representative cue; a Neo Geo or arcade-style preset should usually test action-game
  spectacle, sprite-scale boss energy, cabinet-era color, or playable combat rhythm instead.
- Keep the card subject independent from the final preset. The generation flow is `card prompt +
preset`, so the card prompt supplies the example scene while the preset supplies the style router.
- IP names and creator/title references can remain as style connectors when they help the model find
  the right grammar, but card prompts should use original subjects and translate references into line,
  color, motion, framing, material, and mood.
- Do not replace official card assets until a visual candidate is generated and reviewed as better
  than the current card. Contact sheets can justify keeping existing cards when they already represent
  the pack well.

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
- Official card prompts must be chosen preset by preset. The concept should come from the style's
  strongest domain: action gameplay for arcade hardware, interface tension for visual novels,
  material/process studies for craft media, environment studies for architecture, intimacy when the
  preset is genuinely romantic or erotic, and so on.
- Do not reuse a generic adult-glamour, pinup, hero, object-only, or monster formula across many
  cards. Adult/sensual content is allowed when it is the right concept for that preset, not as a
  shortcut for making every card feel "strong".
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

## Pack 15 Structural Rewrite

Scope:

- Completed `pack_15` router cleanup across all 80 presets in `Punk Spectrum Vault`.
- Converted card-scene briefs into reusable style routers across:
  - Classic Industrial Punks
  - Neon, Net & Signal Punks
  - Eco, Repair & Climate Punks
  - Bio, Myco & Body Punks
  - Ocean, Ice & Terrain Punks
  - Street, Riot & DIY Punks
  - Media, Vapor & Glitch Punks
  - Occult, Myth & Gothic Punks
  - Space, Atomic & Ray Punks
  - Primitive, Stone & Salvage Punks
- Renamed scene-heavy presets when the name itself could leak into runtime prompt composition.
- Preserved IDs, pack/category membership, default images, and supported task declarations.
- Updated tags only when a scene-heavy tag no longer matched the rewritten router.

Runtime finding:

- Preset names and `visualDna` fields are not just catalog labels. They enter the generation prompt
  through selected-style composition. Scene-heavy names such as diner, chapel, market, kiosk, shrine,
  outpost, or battery house can therefore contaminate `prompt X + preset`.
- Because of that, names should prefer style mechanics, material grammar, medium/process, framing
  language, or cultural signal. If a location word is retained, it must be intrinsic to the style,
  not only the old thumbnail subject.

Result:

| Metric              | Before structural rewrite | After structural rewrite |
| ------------------- | ------------------------: | -----------------------: |
| `pack_15` critical  |                         0 |                        0 |
| `pack_15` high      |                         1 |                        0 |
| `pack_15` medium    |                        79 |                        0 |
| `pack_15` low       |                         0 |                        0 |
| `pack_15` clean     |                         0 |                       80 |
| `pack_15` avg score |                      4.24 |                     0.00 |

Verification:

```bash
bun run styles:scene-lock:audit -- --pack=pack_15 --min-severity=low --limit=20
bun run styles:validate -- --pack=pack_15 --coverage
```

Both passed after cleanup. The audit reported `critical=0`, `high=0`, `medium=0`, `low=0`,
`clean=80`.

Adult preview policy:

- Adult tone is allowed and useful: desire, glamour, erotic tension, exploitation, betrayal,
  criminal intimacy, exhaustion, politics, ritual, danger, and decay can all be valid card prompts.
- The issue is not sexuality, sensuality, or sexualized posing. Those can be valid when they come
  from `Prompt X` or when the style legitimately calls for adult glamour. The issue is generic
  replacement behavior: compulsory pinup framing, glamour-only posters, RPG heroes, cute demo
  scenes, or any default figure pose that overrides the independent `Prompt X`.
- Named IP, author, studio, or series references are allowed when they act as direct style
  connectors. Do not remove a useful name just to look generic. The failure mode is when the
  reference injects cast, lore, props, fixed locations, or a thumbnail scene instead of routing
  style over `Prompt X`.
- If a prompt uses adult bodies, keep the finish aligned with the preset: stylized matte shape
  language, graphic-poster anatomy, and controlled surfaces. Do not drift into photoreal wet skin,
  pore detail, over-rendered muscle anatomy, or noisy grit unless that is explicitly the style.
- "Friendly" prompts are not a quality default. Preview prompts should stress the router with
  specific adult scenes and still prove that the preset preserves the user's subject.
- Adult/sensual stress tests are verification tools, not a default card-generation formula. Official
  cards should be conceived preset by preset: choose the subject, genre, action, object, UI, scene,
  or character type that best demonstrates that specific style. For `Neo Geo Sprite King`, an
  action-arcade concept is more relevant than generic sensual glamour; for a textile preset, material
  construction may matter more than a figure; for a romance preset, intimacy may be correct.

Pack 15 preview notes:

- `SP15-003 Pressure Lace Automata`: independent musician/creature-repair scene survived while
  automata language acted as style, not subject replacement.
- `SP15-008 Rivet Ritual Workshop`: ritual-industrial language transferred without forcing chapel
  or religious iconography.
- `SP15-014 Signal Coil Rite` and `SP15-016 Neon Care Circuit`: signal/care mechanics worked as
  transferable styling when the base prompt used unusual human actions.
- `SP15-024 Brackish Lift Cooperative`, `SP15-031 Organic Circuit Lattice`, and `SP15-038 Glacier
Data Refuge`: bio/climate/terrain cues transferred as material and atmosphere; texture must remain
  controlled.
- `SP15-052 Pirate TV Signal Stack`: adult clandestine confession survived; monitor/stack motifs
  should remain light/framing rather than dominating the composition.
- `SP15-063 Vampire Data Nocturne`: adult betrayal/glamour tension is acceptable, but the card must
  not collapse into generic glamour-only portrait or bite-scene cliche.
- `SP15-068 Rocket Fin Signal`: criminal motel scene survived; rocket fins worked better when
  stated as secondary framing, not a border takeover.
- `SP15-078 Mud Brick Energy Cells`: adult negotiation scene survived, but image previews showed
  that shirtless/oil-marked bodies can pull toward photoreal skin and microdetail. Prompt policy now
  calls for stylized bodies as broad planes and explicit pseudo-text blocking.

Pack 15 learning:

- Scene-heavy names are real prompt inputs, not harmless UI labels.
- A preset can be adult, sensual, ugly, political, or dangerous while still being a clean router.
- Preview prompts should be more inspired than neutral: the base scene can include characters,
  pressure, taboo, intimacy, violence implied by props, or moral conflict as long as the preset is
  added afterward as style.
- When a preview fails, classify the failure precisely: scene takeover, prop takeover, generic
  figure replacement, texture/noise overload, pseudo-text, or finish drift.

## Pack 13 High-Risk Pass

Scope:

- Corrected the five `high` findings in `pack_13 / Anime Character & Lifestyle`.
- Focused on high-risk router failures only, not the full pack medium backlog.
- Edited:
  - `SP05-086 Cold-Warm Restorative Comfort`
  - `SP05-101 Abstract Fluid Painterly Anime`
  - `SP05-112 Spray-Drip Wildstyle Anime`
  - `SP05-204 Reflective Breeze Healing Reverie`
  - `SP13-020 Final Episode Closure`

Corrections:

- Replaced card-composition language such as foreground/background dependency with reusable subject
  hierarchy, rhythm, spacing, material behavior, and light logic.
- Replaced scene-heavy names where the name itself could leak into runtime prompt composition:
  `Canal-Breeze Healing Reverie` became `Reflective Breeze Healing Reverie`; `Final Episode
Skyline` became `Final Episode Closure`.
- Removed positive-router references to fixed scenery such as skyline, rooftop, city panorama,
  literal wall, alley, mural, or travel scenery.
- Added explicit transferability language: `Route any subject...`, `Transferable...`, and
  subject-preservation clauses.
- Kept adult tone and sexualized posing allowed. The correction target was not sensuality,
  erotic charge, or emotional intensity; it was default composition takeover.

Result:

| Metric              | Before high pass | After high pass |
| ------------------- | ---------------: | --------------: |
| `pack_13` critical  |                0 |               0 |
| `pack_13` high      |                5 |               0 |
| `pack_13` medium    |               41 |              41 |
| `pack_13` low       |                5 |               5 |
| `pack_13` clean     |               81 |              86 |
| `pack_13` avg score |             1.61 |            1.35 |

Verification:

```bash
bun run styles:scene-lock:audit -- --pack=pack_13 --min-severity=high --limit=80
bun run styles:scene-lock:audit -- --pack=pack_13 --min-severity=medium --limit=80
bun run styles:validate -- --pack=pack_13 --coverage
```

High audit passed with `high=0`. Pack validation passed.

Preview notes:

- `SP13-020 Final Episode Closure`: adult laundromat grief scene survived. The preset delivered
  final-beat anime closure through rim light, spacious negative area, and restrained emotional tone
  without forcing skyline, rooftop, city lights, or hero-back staging.
- `SP05-112 Spray-Drip Wildstyle Anime`: motel-bathroom aftermath scene survived. The preset added
  aerosol marks, overspray, drips, and chroma aggression without forcing mural, wall, alley,
  readable tag, or street-art poster. Texture was high but acceptable for this preset; future cards
  should keep pseudo-text and tattoo microdetail under control.

Next pack 13 work:

- The remaining `medium` findings are mostly explicit transferability gaps and a few scene-word
  remnants in creative briefs.
- Good next batch options:
  - `SP05-087`, `SP05-108`, `SP05-205`, `SP05-325` because they score 6.
  - Then the broad `Anime Style Spectrum` router-weakness group.

### Pack 13 Medium Router Batch A

Scope:

- Corrected the four strongest remaining medium findings in `pack_13`.
- Edited:
  - `SP05-087 Pastoral Breathing-Room Stillness`
  - `SP05-108 Fairy-Tale Storybook Soft`
  - `SP05-205 Breezy Brush-Reinvention Summer`
  - `SP05-325 Scratchy Concrete-Poetry Drift`

Correction notes:

- Removed childlike/youth/default-location leakage from positive router language.
- Reframed named-anime anchors as transferable grammar rather than scene or age defaults.
- Removed `adult` from `SP05-108` avoid language. Adult bodies, desire, sensuality, and
  sexualized posing are valid if they come from `Prompt X`; the style should soften/ornament them,
  not censor them.
- Changed optional-scene clauses into explicit "only when requested" clauses so schools,
  countryside, castles, islands, calligraphy tools, bikes, rooftops, city streets, or youth
  characters do not appear by default.

Result:

| Metric              | After high pass | After batch A |
| ------------------- | --------------: | ------------: |
| `pack_13` critical  |               0 |             0 |
| `pack_13` high      |               0 |             0 |
| `pack_13` medium    |              41 |            37 |
| `pack_13` low       |               5 |             9 |
| `pack_13` clean     |              86 |            86 |
| `pack_13` avg score |            1.35 |          1.26 |

Verification:

```bash
bun run styles:validate -- --pack=pack_13 --coverage
bun run styles:scene-lock:audit -- --pack=pack_13 --min-severity=medium --limit=80
```

Both passed after the batch. The four edited presets no longer appear in the medium list.

Preview notes:

- `SP05-108 Fairy-Tale Storybook Soft`: adult burlesque/wedding-sabotage prompt survived. The
  image kept the banquet-table setup, sensual adult pose, broken heel/champagne/prenup cues, and
  ornamental watercolor storybook finish without turning the subject into a princess, magical girl,
  child, forest maiden, castle scene, or transformation scene. Minor watch item: papers can still
  attract pseudo-text.
- `SP05-325 Scratchy Concrete-Poetry Drift`: adult taxidermist/clinic break-room prompt survived.
  The image kept the clinic, specimen cooler, invoice, adult sensual defiance, and scratchy
  sacred-ugly linework without turning into a youth, rooftop, bike, alley, city street, or urban
  youth tableau. Minor watch item: document props can still imply text if Prompt X includes papers.
- Confirmed cards replaced:
  - `assets/recipes/styles/defaults/SP05-108.webp`
  - `assets/recipes/styles/style-card-thumbnails/SP05-108.webp`
  - `assets/recipes/styles/defaults/SP05-325.webp`
  - `assets/recipes/styles/style-card-thumbnails/SP05-325.webp`
    All four assets were regenerated as WebP at the existing dimensions: default `1024x1536`,
    thumbnail `384x512`.

Next pack 13 work:

- Continue the broad medium group where most fixes are router-language hardening:
  `SP05-013`, `SP05-019`, `SP05-042`, `SP05-046`, `SP05-082`, `SP05-084`, `SP05-085`,
  `SP05-089`, `SP05-090`, and the `SP05-102` through `SP05-120` style-spectrum run.
- Treat `SP05-172`, `SP13-002`, and similar camera findings separately because those may need
  composition rewrites rather than only creative-brief router language.

### Pack 13 Medium Router Batch B

Scope:

- Corrected the `SP05-102` through `SP05-120` style-spectrum router-weakness run, excluding
  presets already corrected in earlier passes.
- Edited:
  - `SP05-102 Gritty Realist Seinen`
  - `SP05-103 Neon Hyperpop Anime`
  - `SP05-104 Minimalist Indie Quiet`
  - `SP05-105 Textured Hand-Drawn Rough`
  - `SP05-106 Deco-Inspired Geometric Anime`
  - `SP05-107 Visceral Guro Horror`
  - `SP05-109 Kinetic Impact-Line Choreography`
  - `SP05-110 Surreal Dream Logic`
  - `SP05-111 Ukiyo-e Woodblock Anime`
  - `SP05-113 Leaded Jewel-Light Segmentation`
  - `SP05-114 Threadbare Textile Patchwork`
  - `SP05-115 Ice-Crystal Refractive`
  - `SP05-116 Sumi-e Impact Brushstroke`
  - `SP05-117 Phosphor Sensor-Vision Grain`
  - `SP05-118 Backlit Contour Longing`
  - `SP05-119 Chalk-Dust Slate Sketch`
  - `SP05-120 Thermal-Heat-Signature Vision`

Correction notes:

- Converted medium/process styles into explicit routers: preserve user subject, action, age,
  setting, and desire/stakes where relevant.
- Kept adult and transgressive energy intact. `SP05-107` remains body-horror/anatomical; the
  correction prevents generic monster, battlefield, hospital-diagram, or shock-poster takeover.
- Removed or softened hidden scene defaults: song-cover staging, fashion pose/stained glass,
  combat defaults, corridors/parades, historic landscapes, cathedral interiors, sewing rooms,
  ice monarchs, samurai/combat, tactical weapon POV, romance sunset staging, classrooms, and
  Predator/target/hunting language.

Result:

| Metric              | After batch A | After batch B |
| ------------------- | ------------: | ------------: |
| `pack_13` critical  |             0 |             0 |
| `pack_13` high      |             0 |             0 |
| `pack_13` medium    |            37 |            20 |
| `pack_13` low       |             9 |             9 |
| `pack_13` clean     |            86 |           103 |
| `pack_13` avg score |          1.26 |          0.74 |

Verification:

```bash
bun run styles:validate -- --pack=pack_13 --coverage
bun run styles:scene-lock:audit -- --pack=pack_13 --min-severity=medium --limit=120
```

Both passed after the batch. The `SP05-102` through `SP05-120` corrected run no longer appears in
the medium list.

Preview notes:

- `SP05-107 Visceral Guro Horror`: adult nightclub-surgeon/stage-curtain prompt survived. The
  image kept the surgeon, sequined dress, apron, mirror, invoices, and clinical dread while
  applying anatomical crimson-black horror. It did not collapse into a monster, battlefield,
  hospital diagram, or generic shock poster.
- `SP05-120 Thermal-Heat-Signature Vision`: adult lounge-singer/flower-shop aftermath prompt
  survived. The image kept the flower shop, body warmth, roses, ice bucket, papers, kicked heel,
  and erotic exhaustion while applying thermal false-color perception. It did not introduce
  weapons, targets, hunting, military POV, wall scans, or Predator-like framing.
- A first `SP05-120` preview failed the text gate because the shop sign became readable; the
  accepted card regenerated the sign and papers as unreadable heat/blank shapes.

Confirmed cards replaced:

- `assets/recipes/styles/defaults/SP05-107.webp`
- `assets/recipes/styles/style-card-thumbnails/SP05-107.webp`
- `assets/recipes/styles/defaults/SP05-120.webp`
- `assets/recipes/styles/style-card-thumbnails/SP05-120.webp`
- All four assets were regenerated as WebP at the existing dimensions: default `1024x1536`,
  thumbnail `384x512`.

Next pack 13 work:

- Remaining medium findings are now mostly named-anime anchors in shojo/slice/core anime plus two
  composition rewrites:
  `SP05-013`, `SP05-019`, `SP05-042`, `SP05-046`, `SP05-082`, `SP05-084`, `SP05-085`,
  `SP05-089`, `SP05-090`, `SP05-172`, `SP05-177`, `SP05-212`, `SP05-219`, `SP05-321`,
  `SP05-322`, `SP05-323`, `SP05-324`, `SP13-002`, `SP13-004`, `SP13-012`.

### Pack 13 Medium/Low Router Batch C

Scope:

- Corrected the remaining `pack_13` medium findings and low follow-ups.
- Preserved useful named connectors instead of flattening them:
  `Nichijou`, `Haruhi`, `Bocchi the Rock!`, `Azumanga Daioh`, `Clannad`,
  `The Vision of Escaflowne`, `Martian Successor Nadesico`, `Komi`,
  `Daily Lives of High School Boys`, `Yoshitaka Amano`, `CLAMP`, `Naoko Takeuchi`,
  `Rumiko Takahashi`, `Honey and Clover`, and `Hidamari Sketch`.

Correction notes:

- Replaced mechanical `anime/IP-title grammar over any input` wording with clearer style-anchor
  language.
- Kept names when they improve style routing, but removed cast/lore/scene/proplist dependency.
- Converted location/prop exclusion lists into `source-specific motifs` language so the text does
  not keep reintroducing the very props it is trying to avoid.
- Rewrote composition fields that still implied foreground prop staging, cockpit/hangar structure,
  street-vigil framing, festival/festival-date defaults, shrine/torii defaults, or sports-arena
  defaults.

Result:

| Metric              | After batch B | After batch C |
| ------------------- | ------------: | ------------: |
| `pack_13` critical  |             0 |             0 |
| `pack_13` high      |             0 |             0 |
| `pack_13` medium    |            20 |             0 |
| `pack_13` low       |             9 |             0 |
| `pack_13` clean     |           103 |           132 |
| `pack_13` avg score |          0.74 |          0.00 |

Verification:

```bash
bun run styles:validate -- --pack=pack_13 --coverage
bun run styles:scene-lock:audit -- --pack=pack_13 --min-severity=low --limit=120
```

Both passed. `pack_13` now reports `critical=0`, `high=0`, `medium=0`, `low=0`,
`clean=132`.

## Pack 06 Retro Game And Essential Styles Pass

Scope:

- Corrected the four high findings in `pack_06 / Essential Art Styles`, category
  `Retro Game Visual Systems`:
  - `SP06-085 Visual Novel Screen`
  - `SP06-096 Neo Geo Sprite King`
  - `SP06-097 Amiga DeluxePaint HAM`
  - `SP06-098 TurboGrafx PC Engine`

Correction notes:

- Preserved hardware/IP/style anchors because they are useful connectors in this pack:
  Neo Geo, SNK, Metal Slug, King of Fighters, Samurai Shodown, Commodore Amiga, DeluxePaint,
  HAM, TurboGrafx/PC Engine, HuCard, CD-ROM2, Hudson Soft, Bonk, and Rondo of Blood.
- Removed card-layout takeover language: fixed foreground/background staging, forced game-screen
  layout, Workbench UI, HUD, fighter-select screen, platformer layout, readable UI/text, and
  generic game-scene defaults.
- Added router language that preserves the user's subject, action, age, and setting while applying
  pixel/screen/hardware constraints.
- Completed the remaining medium/low cleanup across craft, material, text-mode, voxel, hardware,
  and game-art direction presets. The last four lows were phrasing issues around atmosphere,
  foreground priority, and icon presentation; the icon presets kept their actual
  `attributes.layout.transparentBackground` contract while `visualDna` was rewritten as reusable
  style grammar.

Card generation correction:

- An initial visual test overused sensual adult-character prompts. That was useful as a router
  stress test but wrong as a default official-card strategy.
- The official pack_06 cards were regenerated preset by preset with concepts that fit each style:
  - `SP06-096`: arcade-action boss battle with parallax harbor, hover-motorcycle, and giant crab
    war-machine.
  - `SP06-085`: mystery visual novel observatory scene with ADV interface pressure and no readable
    dialogue.
  - `SP06-097`: Amiga/DeluxePaint HAM computer-art fantasy with chrome swan, copper-list ocean,
    gradient bands, and demo-scene broadcast glow.
  - `SP06-098`: compact PC Engine vertical-scroll action scene with rocket sled, haunted
    clocktower, cartridge-era explosions, and CD-ROM boss-door energy.

Confirmed cards replaced:

- `assets/recipes/styles/defaults/SP06-085.webp`
- `assets/recipes/styles/style-card-thumbnails/SP06-085.webp`
- `assets/recipes/styles/defaults/SP06-096.webp`
- `assets/recipes/styles/style-card-thumbnails/SP06-096.webp`
- `assets/recipes/styles/defaults/SP06-097.webp`
- `assets/recipes/styles/style-card-thumbnails/SP06-097.webp`
- `assets/recipes/styles/defaults/SP06-098.webp`
- `assets/recipes/styles/style-card-thumbnails/SP06-098.webp`
- All eight assets were regenerated as WebP at the existing dimensions: default `1024x1536`,
  thumbnail `384x512`.

Verification:

```bash
bun run styles:validate -- --pack=pack_06 --coverage
bun run styles:scene-lock:audit -- --pack=pack_06 --min-severity=low --limit=120
```

Both passed. `pack_06` now reports `critical=0`, `high=0`, `medium=0`, `low=0`,
`clean=120`.

## Pack 09 Material Router Pass

Scope:

- Completed `pack_09 / Texture & Materiality` across all 80 presets.
- The pack was not primarily scene-locked. The common issue was missing explicit transferability
  language in rich material descriptions.
- Added a first-line router contract to every `creative_brief`: route any subject through the named
  material/FX system while preserving the prompt subject, action, and setting.
- Kept each material's existing texture vocabulary intact: grain, fracture, sheen, porosity,
  weathering, pile, plume, iridescence, heat, sparks, and other material-specific cues.

Card review:

- Generated a temporary contact sheet for the 80 existing thumbnails.
- Current cards mostly read as material samples or subjects made from the material itself. No official
  assets were replaced in this pass because the card set does not show the same scene-prompt takeover
  failure seen in earlier packs.
- Future card replacements for this pack should stay preset-specific: e.g. action/glamour can fit
  latex or sequins, pure material studies can fit wood/stone/metals, and elemental FX can use dynamic
  phenomena without becoming generic character posters.

Verification:

```bash
bun run styles:validate -- --pack=pack_09 --coverage
bun run styles:scene-lock:audit -- --pack=pack_09 --min-severity=low --limit=120
```

Both passed. `pack_09` now reports `critical=0`, `high=0`, `medium=0`, `low=0`,
`clean=80`.

## Pack 11 Toy, Craft, Food, And Macro Pass

Scope:

- Completed `pack_11 / Miscellaneous & Fun` across all 80 presets.
- Most findings were not hard scene-lock. They came from older wording such as `portable style
system over any input`, which was semantically correct but did not match the formal router
  contract used by the audit.
- Added preset-specific router contracts by family:
  - toy-and-craft construction systems;
  - artistic-medium visual systems;
  - aesthetic visual systems;
  - food-and-presentation systems;
  - micro/macro imaging systems;
  - sensor/technical imaging systems;
  - diagram/technical-drawing systems.
- Manually cleaned the real card-era remnants:
  - `SP11-026 Aerosol Velocity Layering`: removed mural/street-location framing from the positive
    creative brief while preserving aerosol process, overspray, drips, stencil offsets, and
    rebellious markmaking attitude.
  - `SP11-030 Sand Art`: removed souvenir/desert/beach scene pressure while preserving layered
    pour bands, granular edges, sediment compression, and optional vessel-like optical distortion.
  - `SP11-002 Funko Pop Vinyl Collectible Figure` and `SP11-046 Michelin Fine-Dining Editorial`:
    removed `Create a style-card...` language from `creative_brief`.

Card review:

- Generated a temporary contact sheet for the 80 existing thumbnails.
- Current cards are broadly aligned with their presets: toys look like toy constructions, food
  presets read as presentation systems, and macro/sensor presets use the relevant imaging logic.
- No official assets were replaced in this pass. The thumbnails were not the main failure mode, and
  replacing them without a stronger reason would risk churn.

Verification:

```bash
bun run styles:validate -- --pack=pack_11 --coverage
bun run styles:scene-lock:audit -- --pack=pack_11 --min-severity=low --limit=120
```

Both passed. `pack_11` now reports `critical=0`, `high=0`, `medium=0`, `low=0`,
`clean=80`.

## Pack 08 Fashion And Costume Pass

Scope:

- Completed `pack_08 / Fashion & Costume` across all 80 presets.
- Added formal router contracts by fashion family:
  - contemporary-fashion styling;
  - subculture styling;
  - historical/fantasy costume;
  - fantasy-sci-fi costume;
  - fabric-and-texture systems.
- Preserved adult, sensual, body-conscious, theatrical, and costume-forward possibilities where they
  fit the preset. The correction target was body/pose/scene lock, not fashion intensity.

Manual corrections:

- `SP08-043 Space Opera Royal`: reframed galactic-court language as costume grammar rather than
  throne/senate/binary-sun scene pressure.
- `SP08-061 Lace`: reframed bridal/chapel/wedding pressure as heirloom textile mood only.
- `SP08-062 Leather Armor`: reframed rogue/dungeon language as stealth leather material attitude.
- `SP08-013 Ethereal Fantasy` and `SP08-060 Velvet`: replaced old `Create a style-card...`
  placeholder briefs with concrete transferable style language.

Card review:

- Generated a temporary contact sheet for the 80 existing thumbnails.
- Most cards are figure/model based, which is appropriate for a fashion/costume pack. They remain
  visually varied across silhouettes, materials, historical references, fantasy costume logic, and
  textile behavior rather than collapsing into one generic glamour formula.
- No official assets were replaced in this pass.

Verification:

```bash
bun run styles:validate -- --pack=pack_08 --coverage
bun run styles:scene-lock:audit -- --pack=pack_08 --min-severity=low --limit=120
```

Both passed. `pack_08` now reports `critical=0`, `high=0`, `medium=0`, `low=0`,
`clean=80`.

## Pack 03 3D And CGI Rendering Pass

Scope:

- Completed `pack_03 / 3D & CGI Rendering` across all 80 presets.
- Added formal router contracts across render engines, materials, lighting, 3D styles, hard-surface CGI,
  organic/character CGI, environment/worldbuilding, and sensor/technical shaders.
- Removed `Create a style-card...` placeholder briefs from older generic presets.
- Removed `vertical style-card crop` and `production-preview foreground/midground/background` camera
  language where it could leak thumbnail composition into generation.

Manual corrections:

- `SP03-032 Volumetric Fog` and `SP03-041 God Rays (Volumetric)`: reframed cathedral/forest/window
  pressure as scale and light behavior.
- `SP03-039 Bioluminescent Forest`: replaced preview-camera staging with bioluminescent ecology
  framing and removed mandatory landscape pressure.
- `SP03-066 Abstract Background`: treated it as a legitimate background-only exception by routing
  subject/mood cues into nonrepresentational color fields, spatial rhythm, and atmosphere rather
  than preserving literal objects.
- `SP03-033 Neon City (Cyberpunk)`: removed concrete street/alley/city tokens from the brief while
  preserving cyberpunk neon-rain lookdev.

Card review:

- Generated a temporary contact sheet for the 80 existing thumbnails.
- Current cards are broadly aligned: render engines, materials, shaders, product/technical views,
  worldbuilding, and simulation presets each show distinct visual logic.
- No official assets were replaced in this pass.

Verification:

```bash
bun run styles:validate -- --pack=pack_03 --coverage
bun run styles:scene-lock:audit -- --pack=pack_03 --min-severity=low --limit=120
```

Both passed. `pack_03` now reports `critical=0`, `high=0`, `medium=0`, `low=0`,
`clean=80`.

## Pack 02 Cinematic And Media Pass

Scope:

- Completed `pack_02 / Cinematic & Media` across all 128 presets.
- Added formal router contracts by family:
  - film-genre camera systems;
  - TV/broadcast media systems;
  - animation style systems;
  - photography-era camera systems;
  - lighting-and-atmosphere camera systems;
  - caricature/cartoon style systems;
  - sensor/technical imaging systems;
  - hand-drawn/DIY media systems.
- Preserved useful IP/studio/show references as style connectors where they clarify animation grammar,
  broadcast feel, cartoon line behavior, or era-specific vocabulary. The cleanup target was scene/cast
  takeover, not removing all anchor names.

Manual corrections:

- `SP02-054 Infrared Film (Aerochrome)`: reframed plant/landscape pressure as false-spectrum material
  response.
- `SP02-065 God Rays (Volumetric)`: reframed church/forest/window pressure as volumetric light
  behavior.
- `SP02-115 Home Movies - Marker-Edge Improvised Sitcom`: removed youth/school/suburban-room
  assumptions while keeping improvised TV softness.
- `SP02-037 Anime (90s Aesthetic)`: removed concrete school/city-night wording while keeping 90s
  broadcast anime anchors.
- `SP02-005 French New Wave`: replaced old `Create a style-card...` placeholder with concrete
  handheld/jump-cut/available-light film grammar.
- Removed `vertical style-card composition` from older camera/composition fields.

Card review:

- Generated a temporary contact sheet for all 128 thumbnails.
- Film, TV, photography, lighting, sensor, and DIY cards broadly communicate their style clearly.
- The caricature/cartoon section includes several IP-likeness-heavy thumbnails. This may be acceptable as
  style anchoring in the current pack, but it is a good candidate for a later official-card refresh using
  original subjects that still demonstrate each cartoon grammar.
- No official assets were replaced in this pass.

Verification:

```bash
bun run styles:validate -- --pack=pack_02 --coverage
bun run styles:scene-lock:audit -- --pack=pack_02 --min-severity=low --limit=160
```

Both passed. `pack_02` now reports `critical=0`, `high=0`, `medium=0`, `low=0`,
`clean=128`.

## Pack 05 Anime Battle And Worlds Pass

Scope:

- Completed `pack_05 / Anime Battle & Worlds` across all 135 presets.
- Removed the remaining scene-lock findings by rewriting 41 `creative_brief` entries and 4
  composition fields.
- Preserved anime/IP/title anchors where they are useful style connectors, but translated them into
  transferable style mechanics instead of cast, prop, set, or story requirements.
- Added a generator guardrail in `scripts/generate-style-defaults.ts` so future `pack_05` card
  prompts must choose a concept preset by preset rather than falling back to a generic attractive
  character, generic fighter, grim hero, corridor, alley, or weapon pose.

Manual corrections:

- `SP05-021`, `SP05-022`, `SP05-023`, `SP05-028`, `SP05-031`, `SP05-033`,
  `SP05-034`, `SP05-036`, `SP05-037`, `SP05-038`, `SP05-039`, and `SP05-040`:
  reframed modern shonen/action prompts as motion, silhouette, energy, emotion, comedy, strategy,
  and symbolic-pressure systems.
- `SP05-051` through `SP05-060` and `SP05-221` through `SP05-229`: reframed mecha/cyberpunk
  prompts as machine grammar, signal pressure, surveillance, chrome/noir texture, civic procedure,
  grief/control, and cyber-goth atmosphere.
- `SP05-061`, `SP05-065`, `SP05-067`, `SP05-262`, `SP05-265`, `SP05-268`,
  `SP05-271`, `SP05-273`, `SP05-274`, and `SP05-277`: reframed dark fantasy/seinen prompts
  around adult tension, moral pressure, abyssal material lure, decadence, suspicion, memory, and
  psychological atmosphere.
- `SP05-121`, `SP05-122`, `SP05-130`, and `SP05-131`: preserved named modern-anime references
  while removing required signature characters, weapons, urban incidents, exorcism setups, and fixed
  fight setups.
- `SP13-024`: removed card-era `foreground` composition language while keeping impact-burst scale.

Card review:

- Generated a temporary contact sheet for all 135 existing thumbnails:
  `C:\Users\cristian\AppData\Local\Temp\codex-pack05-style-card-contact-sheet.jpg`.
- The current cards are varied across shonen action, mecha/cyberpunk, dark fantasy/seinen, and action
  setpieces. They include characters where anime identity benefits from character acting, plus
  mechanical, symbolic, horror, and setpiece cards.
- No official assets were replaced in this pass. The cards do not currently show the single-formula
  sensual/glamour collapse, and no generated candidate has been reviewed as a better replacement.

Verification:

```bash
bun run styles:validate -- --pack=pack_05 --coverage
bun run styles:scene-lock:audit -- --pack=pack_05 --min-severity=low --limit=180
bun run check -- scripts/generate-style-defaults.ts
```

All passed. `pack_05` now reports `critical=0`, `high=0`, `medium=0`, `low=0`,
`clean=135`.

## Pack 10 Abstract And Experimental Pass

Scope:

- Completed `pack_10 / Abstract & Experimental` across all 80 presets.
- Added category-specific router contracts to the remaining 24 weak briefs:
  - geometric abstraction;
  - fluid/organic process;
  - digital glitch/noise;
  - surreal/dream logic;
  - textile and ornamental patterns;
  - material-surface textures;
  - diagram/data systems;
  - point, mosaic, and glass systems.
- Reframed `SP10-043 Dark Fantasy` as transferable surreal-nightmare vocabulary rather than a
  required dark-fantasy locale/cast.
- Reframed `SP10-078 Neon Light Lines` composition so `dark background` became reusable dark-field
  contrast and glow hierarchy rather than a card staging instruction.
- Added a global `CARD CONCEPT RULE` to `scripts/generate-style-defaults.ts`: future default-card
  prompts must choose their representative subject preset by preset, while the preset remains the
  style catalyst. This explicitly blocks fallback drift into generic sexy figures, generic fighters,
  generic portraits, isolated objects, corridors, or stock scenes unless the exact preset benefits
  from that concept.

Card review:

- Generated a temporary contact sheet for all 80 existing thumbnails:
  `C:\Users\cristian\AppData\Local\Temp\codex-pack10-style-card-contact-sheet.jpg`.
- Existing cards mostly read as abstract systems, textures, patterns, glitch, surrealism, glass,
  data, and light finishes. Figure cards appear mainly where surreal/dream/glitch logic benefits
  from a body or portrait-like anchor.
- No official assets were replaced in this pass.

Verification:

```bash
bun run styles:validate -- --pack=pack_10 --coverage
bun run styles:scene-lock:audit -- --pack=pack_10 --min-severity=low --limit=120
bun run check -- scripts/generate-style-defaults.ts
```

All passed. `pack_10` now reports `critical=0`, `high=0`, `medium=0`, `low=0`,
`clean=80`.

## Pack 17 Medieval Fantasy And Dungeon Zine Focus Pass

Scope:

- Re-audited `pack_17 / Medieval Fantasy & Dungeon Zine` specifically because it was still the
  most literal pack: several presets were acting like card-scene prompts instead of transferable
  style routers.
- Completed the remaining manifest cleanup across the original 44 presets, then expanded the pack to
  52 presets with a new `Weird Medieval Editorial` subfamily. The automatic scene-lock audit now
  reports `critical=0`, `high=0`, `medium=0`, `low=0`, `clean=52`.
- Added a dedicated `PACK17_CARD_CONCEPTS` table in `scripts/generate-style-defaults.ts` so each
  Pack 17 default card gets a preset-specific concept. This prevents the generator from falling back
  to a shared medieval bag of `monster/relic/castle/knight/plague` subjects.
- Added per-preset hard avoids for the two visually stubborn cases:
  - `SP17-011 Fogbound Witch Trial`: blocks central inquisitor, judge, executioner, accused figure,
    visible crowd, foreground observers, robed witnesses, gallows, literal village trial, and torture
    staging.
  - `SP17-034 Medieval Ink Fantasy Plate`: blocks crusader, knight hero, cross tabard, cross shield,
    sword pose, heraldic banner, humanoid armor pin-up, religious military icon, and bridge-troll gate
    scene.
- Rewrote Pack 17 category defaults and scene anchors so they describe category grammar plus
  preset-specific concepts, not fixed subject lists.

Expansion rule:

- New presets are allowed when a pack has room for a real style subfamily or a useful variant inside
  the same universe.
- A new preset must add a transferable visual grammar: material behavior, color system, editorial
  posture, framing logic, rendering finish, or mood mechanics that can be applied to arbitrary
  `prompt X`.
- A new preset must not exist only to preserve one thumbnail subject, named location, prop bundle, or
  scene pitch.
- Card prompts for new presets can be stranger, darker, more sensual, more political, or more adult
  when that best represents the style, but the preset must still remain an abstract router layered on
  top of the card prompt.

New `Weird Medieval Editorial` presets:

- `SP17-045 Rotten Gold Court Romance`: decadent courtly decay, poisonous ornament, velvet-gold
  intimacy, and bruised botanical accents.
- `SP17-046 Moth Abbey Vellum Horror`: pale vellum, moth-wing translucency, quiet monastic horror,
  and torn-paper halo logic.
- `SP17-047 Salt Cathedral Pilgrimage`: salt-white sacred surfaces, desert glare, bleached ceremonial
  architecture, and dry devotional austerity.
- `SP17-048 Leech Moon Apothecary`: moon-green medical relics, wet glass, herbal darkness, and
  controlled leech-like silhouettes.
- `SP17-049 Debt-Saint Ledger Gothic`: ledger geometry, legal-sacred unease, pinned icon posture, and
  accounting-as-ritual gothic order.
- `SP17-050 Wormwood Carnival Feudal`: feudal carnival graphics, bitter folk spectacle, banner logic,
  and controlled grotesque pageantry.
- `SP17-051 Opal Bone Masquerade`: bone-white masks, opalescent inlay, predatory etiquette, and
  aristocratic concealment.
- `SP17-052 Black Parchment Siege Omen`: burnt parchment maps, siege-diagram pressure, red ember
  signals, and ominous strategic abstraction.

Card review and candidate status:

- Generated reviewed variants for the most literal/high-risk cards:
  `SP17-002`, `SP17-007`, `SP17-011`, `SP17-016`, and `SP17-034`.
- First contact sheet:
  `C:\Users\cristian\AppData\Local\Temp\codex-pack17-audit-variant02-sheet.jpg`.
- Correction sheet for `SP17-011` and `SP17-034`:
  `C:\Users\cristian\AppData\Local\Temp\codex-pack17-011-034-v2-v3-sheet.jpg`.
- Final `SP17-011` comparison:
  `C:\Users\cristian\AppData\Local\Temp\codex-pack17-011-v02-v03-v04-sheet.jpg`.
- Official-vs-candidate comparison:
  `C:\Users\cristian\AppData\Local\Temp\codex-pack17-official-vs-candidates-sheet.jpg`.
- Early official critical-card sheet:
  `C:\Users\cristian\AppData\Local\Temp\codex-pack17-critical-official-post-audit-sheet.jpg`.
- User review flagged the first approved replacements as too poor/safe. The temporary replacements
  for `SP17-011` (`variant-04`) and `SP17-034` (`variant-03`) were restored back to the prior
  official cards.
- Updated the Pack 17 generator again to reduce safe specimen/card-catalog behavior:
  - Added adult weird-fantasy editorial intent to the Pack 17 card prompt branch.
  - Removed automatic armor/cloak wording from the generic Pack 17 form block.
  - Strengthened the card concepts for `SP17-002`, `SP17-007`, `SP17-011`, `SP17-016`, and
    `SP17-034`.
- Stronger candidate sheet:
  `C:\Users\cristian\AppData\Local\Temp\codex-pack17-official-vs-v05-stronger-sheet.jpg`.
- Focused comparison for `SP17-007` and `SP17-011`:
  `C:\Users\cristian\AppData\Local\Temp\codex-pack17-007-011-official-v05-v06-sheet.jpg`.
- Final recommended candidate sheet:
  `C:\Users\cristian\AppData\Local\Temp\codex-pack17-recommended-candidates-sheet.jpg`.
  These candidates were promoted to official default cards:
  - `SP17-002`: `variant-05`.
  - `SP17-007`: `variant-06`.
  - `SP17-011`: `variant-06`.
  - `SP17-016`: `variant-05`.
  - `SP17-034`: `variant-05`.
- New `Weird Medieval Editorial` sheet:
  `C:\Users\cristian\AppData\Local\Temp\codex-pack17-weird-editorial-new-presets-sheet.jpg`.
  The generated cards show varied adult medieval-editorial concepts instead of one repeated
  monster/knight/relic formula.
- Left generated variants in `assets/recipes/styles/defaults/variants/` as review evidence. They are
  not referenced by the runtime manifest.

Verification:

```bash
bun run check -- scripts/generate-style-defaults.ts
bun run styles:validate -- --pack=pack_17 --coverage
bun run styles:scene-lock:audit -- --pack=pack_17 --min-severity=low --limit=160
bun run styles:runtime
```

All passed after the final corrections. `pack_17` now reports `critical=0`, `high=0`,
`medium=0`, `low=0`, `clean=52`.

## Pack 01 Photography And Realism Pass

Scope:

- Completed the current `pack_01 / Photography & Realism` scene-lock cleanup across the 14 presets
  reported by the low-severity audit.
- The pack's main issue was not hard scene replacement. It was photographic vocabulary that looked
  like card staging to the auditor (`background`, `street`, `city`) plus several briefs that used
  `input` or poetic copy without the formal router contract.
- Preserved camera/lens identity, photographic technique, film-stock behavior, commercial lighting,
  and optical artifacts. The fix was to translate card-like wording into transferable photographic
  mechanics such as focal falloff, defocused surround, separation field, panned motion smear,
  overhead geometry, and reusable exposure logic.

Manual corrections:

- `SP01-002`, `SP01-005`, `SP01-009`, `SP01-048`, `SP01-049`, and `SP01-052`: replaced
  `background`-based card staging language with photographic focus, separation, and motion grammar.
- `SP01-014`, `SP01-024`, `SP01-026`, `SP01-035`, `SP01-037`, `SP01-058`, and `SP01-074`: added
  explicit reusable/any-subject router contracts while preserving the specific film, lens, lighting,
  or focus behavior.
- `SP01-034`: reframed neon-noir as reusable lighting and reflective-surface behavior instead of
  street/city pressure.

Card review:

- Generated a full existing-card contact sheet:
  `C:\Users\cristian\AppData\Local\Temp\codex-pack01-style-card-contact-sheet.jpg`.
- Generated `variant-01` previews for all 14 corrected presets and compared them against official
  cards:
  `C:\Users\cristian\AppData\Local\Temp\codex-pack01-official-vs-variant01-sheet.jpg`.
- No official cards were replaced in this pass. The variants prove the corrected prompts can route
  style over independent card prompts, but the current official cards generally communicate the
  photographic technique more clearly. Keeping the official cards is the better quality decision here.

Verification:

```bash
bun run styles:validate -- --pack=pack_01 --coverage
bun run styles:scene-lock:audit -- --pack=pack_01 --min-severity=low --limit=120
bun run styles:runtime
```

All passed. `pack_01` now reports `critical=0`, `high=0`, `medium=0`, `low=0`, `clean=87`.

## Pack 07 Architecture And Interior Pass

Scope:

- Completed the current `pack_07 / Architecture & Interior` router cleanup across the 8 presets
  reported by the low-severity audit.
- All findings were `router_weakness`; there was no hard scene-lock. The presets already had strong
  architecture, interior, landscape, craft, and miniature identities, but several briefs did not use
  the formal `any subject` / reusable-router contract.
- Preserved each style's architectural specificity. Architecture can legitimately route through mass,
  aperture, axis, planting bands, material modules, pressure, ornament, and spatial systems; the fix
  was to make those systems transferable instead of merely describing the source card or a single
  place.

Manual corrections:

- `SP07-029 Adobe/Pueblo`: reframed earthen vernacular as reusable adobe/Pueblo grammar over any
  subject.
- `SP07-038 Ossuary Subterranean`: reframed mineral niches, calcic repetition, and low reverent light
  as a portable visual system without depending on literal catacombs or remains.
- `SP07-039 Data Center Grid`: reframed server/facility cues as reusable data-infrastructure surface,
  light, and modular redundancy logic.
- `SP07-043 Karesansui Dry Abstraction`: made raked mineral abstraction transferable while preserving
  subject legibility.
- `SP07-048 Elevated Biophilic Terrace`: clarified height and biophilic layering as spatial behavior,
  not a mandatory rooftop lounge.
- `SP07-063 Sepulchral Civic Monumentalism`: preserved solemn civic scale while avoiding mandatory
  cemetery/crypt staging.
- `SP07-069 Pressurized Vinyl Playform`: preserved pneumatic vinyl behavior without turning every
  prompt into an inflatable castle/park object.
- `SP07-070 Confectionery Structural Ornament`: preserved edible construction logic without requiring
  a holiday gingerbread-house card.

Card review:

- Generated a full existing-card contact sheet:
  `C:\Users\cristian\AppData\Local\Temp\codex-pack07-style-card-contact-sheet.jpg`.
- Generated `variant-01` previews for all 8 corrected presets and compared them against official
  cards:
  `C:\Users\cristian\AppData\Local\Temp\codex-pack07-official-vs-variant01-sheet.jpg`.
- Promoted only `SP07-070` `variant-01` to the official default card. It reads as edible ornamental
  architecture rather than a generic gingerbread-house product card.
- Kept the other official cards because they still communicate their architectural/material systems
  more clearly than the generated variants.

Verification:

```bash
bun run styles:validate -- --pack=pack_07 --coverage
bun run styles:scene-lock:audit -- --pack=pack_07 --min-severity=low --limit=120
bun run styles:runtime
bun run styles:thumbs
```

All passed. `pack_07` now reports `critical=0`, `high=0`, `medium=0`, `low=0`, `clean=80`.

## Pack 04 Illustration And Graphic Novel Pass

Scope:

- Completed the current `pack_04 / Illustration & Graphic Novel` router cleanup across the 12 presets
  reported by the low-severity audit.
- The audit mixed true router-language gaps with card-composition false positives. The fix was still
  applied at the style-DNA level when the wording could leak a fixed scene, card crop, or source
  thumbnail back into normal prompt use.
- Preserved medium specificity. Comics, posters, print processes, concept-art passes, technical sheets,
  and production-design kits can legitimately route through panel force, ink economy, poster montage,
  annotation hierarchy, shape iteration, and material handling. They should not require the card's
  sample character, prop, city, room, or landscape.

Manual corrections:

- `SP04-001 Golden Age Comic`: clarified the golden-age comic grammar as a reusable subject router
  rather than a heroic-pose or sky-backdrop recipe.
- `SP04-008 Sin City Noir Comic (High Contrast)`: removed noir locale and detective-cast dependency
  while keeping binary black/white discipline.
- `SP04-009 Underground Comix`: converted crowd/street/room cues into counterculture line, print,
  proportion, and density behavior.
- `SP04-011 Junji Ito Horror Manga (Obsessive Ink)`: kept obsessive pattern dread while removing
  village/interior/monster requirements.
- `SP04-013 Chibi Style`: reframed chibi as reusable proportion, silhouette, outline, and sticker-read
  logic across any subject.
- `SP04-016 Tech Noir Comic`: preserved cyan-magenta noir-comic language without requiring alleys,
  skylines, screens, vehicles, or detectives.
- `SP04-030 Scientific Botanical`: made the scientific-plate system transferable without forcing
  plants, readable labels, or a species-study card.
- `SP04-039 Movie Poster (Painted)`: replaced background-card wording with symbolic secondary-field
  montage language.
- `SP04-043 Pulp Magazine Cover`: replaced foreground-exaggeration wording with near-plane action
  staging.
- `SP04-086 Callout Detail Sheet`: clarified the callout-sheet grammar as reusable technical
  presentation rather than machinery/product blueprint dependency.
- `SP04-088 Rough Environment Pass`: replaced foreground-exaggeration wording with near-plane depth
  behavior.
- `SP04-095 Foliage Design Kit`: replaced foreground/garden/forest wording with reusable organic
  growth-system language.

Card review:

- Generated the pre-change official contact sheet:
  `C:\Users\cristian\AppData\Local\Temp\codex-pack04-style-card-contact-sheet.jpg`.
- Regenerated `variant-01` previews for the 12 corrected presets with updated card-concept prompts:
  `SP04-001`, `SP04-008`, `SP04-009`, `SP04-011`, `SP04-013`, `SP04-016`, `SP04-030`,
  `SP04-039`, `SP04-043`, `SP04-086`, `SP04-088`, and `SP04-095`.
- Added second-pass variants for `SP04-001`, `SP04-016`, and `SP04-039` after the first variants
  still drifted toward generic hero/cyber-noir/fantasy-poster staging. Added a third pass for
  `SP04-039` to force a tighter painted-poster montage.
- Comparison sheets:
  `C:\Users\cristian\AppData\Local\Temp\codex-pack04-official-vs-variant01-sheet.jpg`,
  `C:\Users\cristian\AppData\Local\Temp\codex-pack04-second-pass-comparison.jpg`, and
  `C:\Users\cristian\AppData\Local\Temp\codex-pack04-sp04-039-variants.jpg`.
- Promoted 10 default cards after visual review:
  `SP04-001` from `variant-02`, `SP04-008` from `variant-01`, `SP04-009` from `variant-01`,
  `SP04-011` from `variant-01`, `SP04-013` from `variant-01`, `SP04-016` from `variant-02`,
  `SP04-039` from `variant-03`, `SP04-043` from `variant-01`, `SP04-088` from `variant-01`,
  and `SP04-095` from `variant-01`.
- Kept `SP04-030` and `SP04-086` official cards because they remained clearer than their variants.
- Stored promoted-card backups under
  `D:\DEV\codex-studio\.tmp\style-default-card-archive\pack04-router-audit-2026-07-06`.
- Generated the updated official contact sheet:
  `C:\Users\cristian\AppData\Local\Temp\codex-pack04-style-card-contact-sheet-updated.jpg`.

Expansion policy added to the working method:

- New presets and extra variants are in scope, but they should be proposed during audit as
  expansion candidates instead of being added opportunistically inside a cleanup patch.
- A new preset candidate must cover a missing dialect or workflow role, have a distinct visual
  vocabulary from neighboring presets, pass the router contract, and support at least one original
  card concept that is not a copied scene.
- A style-card variant is useful when it proves an alternate valid route for the same style, reveals
  a weak official card, or helps choose between adjacent dialects. It is not useful when it only adds
  another attractive thumbnail.
- Named artists, eras, games, films, or IP-adjacent references may remain as style connectors when
  they are useful vocabulary, but cards must avoid likeness-copying and franchise composition.
- Candidate bank should be tracked pack by pack. For `pack_04`, likely future additions include
  missing comic/print/poster dialects such as newspaper-strip pacing, EC-style horror color logic,
  underground punk flyer systems, paperback-cover illustration, airbrush chrome poster language,
  and production-sheet subtypes when they are sufficiently distinct from the existing technical
  sheets.

Verification:

```bash
bun run styles:validate -- --pack=pack_04 --coverage
bun run styles:scene-lock:audit -- --pack=pack_04 --min-severity=low --limit=160
bun run styles:runtime
bun run styles:thumbs
bun run check -- scripts/generate-style-defaults.ts
```

All passed. `pack_04` now reports `critical=0`, `high=0`, `medium=0`, `low=0`, `clean=100`.

## Pack 12 Video Game Originals Pass

Scope:

- Completed the current `pack_12 / Video Game Originals Vault` router cleanup across the 7 presets
  reported by the low-severity audit.
- These were mostly generated-template artifacts: the preset name and category were repeated inside
  sensitive `visualDna` fields, causing source scene nouns like library, temple, battlefield, shrine,
  arena, hero, and desert to look like mandatory content.
- Preserved the gameplay identity of each preset while moving the implementation language toward
  transferable mechanics: readable encounter hierarchy, material palette, traversal rhythm, role cues,
  lighting logic, and game-card clarity.

Manual corrections:

- `SP12-006 Arcane Library Boss Arena`: reframed the preset as arcane knowledge-encounter game-art
  direction without requiring a literal library or arena.
- `SP12-015 Ancient Mecha Temple`: reframed the preset as ancient machine-ritual language without
  making a temple or mecha subject mandatory.
- `SP12-031 Astral Chess Battlefield`: reframed the preset as astral strategy-combat language with
  boardlike lane logic and rule geometry.
- `SP12-059 Prismatic Arena Hero Draft`: reframed the preset as prismatic competitive-draft language
  without forcing a hero or arena subject.
- `SP12-061 Jade Volcano Shrine Run`: reframed the preset as jade volcanic ritual-run language without
  shrine/locale lock.
- `SP12-063 Obelisk Desert Relic Race`: reframed the preset as arid relic-speed language without
  desert-course lock.
- `SP12-070 Moonlit Shrine Archer Trials`: reframed the preset as moonlit precision-trial language
  without shrine lock.

Card review:

- Generated official contact sheets before and after promotion:
  `C:\Users\cristian\AppData\Local\Temp\codex-pack12-style-card-contact-sheet.jpg` and
  `C:\Users\cristian\AppData\Local\Temp\codex-pack12-style-card-contact-sheet-updated.jpg`.
- Generated `variant-01` previews for all 7 corrected presets and compared them here:
  `C:\Users\cristian\AppData\Local\Temp\codex-pack12-official-vs-variant01-sheet.jpg`.
- Promoted 5 default cards after visual review: `SP12-006`, `SP12-015`, `SP12-031`, `SP12-059`,
  and `SP12-061`, all from `variant-01`.
- Kept `SP12-063` and `SP12-070` official cards because they communicated race/precision-action
  gameplay more clearly than the variants.
- Stored promoted-card backups under
  `D:\DEV\codex-studio\.tmp\style-default-card-archive\pack12-router-audit-2026-07-06`.

Verification:

```bash
bun run styles:validate -- --pack=pack_12 --coverage
bun run styles:scene-lock:audit -- --pack=pack_12 --min-severity=low --limit=120
bun run styles:runtime
bun run styles:thumbs
```

All passed. `pack_12` now reports `critical=0`, `high=0`, `medium=0`, `low=0`, `clean=80`.

## Pack 16 Anime Classics And Prestige Pass

Scope:

- Completed the current `pack_16 / Anime Classics & Prestige` cleanup across the 2 remaining
  low-severity wording findings.
- No image replacement was needed; both issues were card-composition wording leaks rather than visual-card
  failures.

Manual corrections:

- `SP05-030 Gothic Soul-Pop Action Style`: changed `emblem-like background compression` to
  `emblem-like depth compression`.
- `SP13-028 Sacred Heraldic Vow Style`: changed `foreground lineage coding` to language that
  prioritizes lineage coding without using foreground-card staging.

Verification:

```bash
bun run styles:validate -- --pack=pack_16 --coverage
bun run styles:scene-lock:audit -- --pack=pack_16 --min-severity=low --limit=80
```

All passed. `pack_16` now reports `critical=0`, `high=0`, `medium=0`, `low=0`, `clean=140`.

## Current Global Scene-Lock Status

Command:

```bash
bun run styles:scene-lock:audit -- --min-severity=low --limit=100
```

Current result after the Pack 01 pass, Pack 04 pass, Pack 07 pass, Pack 12 pass, Pack 16 pass,
Pack 05, Pack 10, Pack 17 expansion, and latest global audit:

| Severity | Count |
| -------- | ----: |
| Critical |     0 |
| High     |     0 |
| Medium   |     0 |
| Low      |     0 |
| Clean    |  1657 |

Remaining pack risk:

| Pack    | Presets | Critical | High | Medium | Low | Clean | Avg score |
| ------- | ------: | -------: | ---: | -----: | --: | ----: | --------: |
| pack_01 |      87 |        0 |    0 |      0 |   0 |    87 |      0.00 |
| pack_02 |     128 |        0 |    0 |      0 |   0 |   128 |      0.00 |
| pack_03 |      80 |        0 |    0 |      0 |   0 |    80 |      0.00 |
| pack_04 |     100 |        0 |    0 |      0 |   0 |   100 |      0.00 |
| pack_05 |     135 |        0 |    0 |      0 |   0 |   135 |      0.00 |
| pack_06 |     120 |        0 |    0 |      0 |   0 |   120 |      0.00 |
| pack_07 |      80 |        0 |    0 |      0 |   0 |    80 |      0.00 |
| pack_08 |      80 |        0 |    0 |      0 |   0 |    80 |      0.00 |
| pack_09 |      80 |        0 |    0 |      0 |   0 |    80 |      0.00 |
| pack_10 |      80 |        0 |    0 |      0 |   0 |    80 |      0.00 |
| pack_11 |      80 |        0 |    0 |      0 |   0 |    80 |      0.00 |
| pack_12 |      80 |        0 |    0 |      0 |   0 |    80 |      0.00 |
| pack_13 |     132 |        0 |    0 |      0 |   0 |   132 |      0.00 |
| pack_14 |     123 |        0 |    0 |      0 |   0 |   123 |      0.00 |
| pack_15 |      80 |        0 |    0 |      0 |   0 |    80 |      0.00 |
| pack_16 |     140 |        0 |    0 |      0 |   0 |   140 |      0.00 |
| pack_17 |      52 |        0 |    0 |      0 |   0 |    52 |      0.00 |

Next recommended target: run a curated expansion-candidate pass rather than more scene-lock cleanup,
because the current audit now reports no remaining low-or-higher findings.
