# Style Preset DNA Completeness Audit

This audit adds a second quality layer after the scene-lock pass.

Scene-lock answers: "Does this preset force a card scene, subject, prop bundle, or thumbnail
composition?"

DNA completeness answers: "Does every required preset property contain enough specific style
behavior to act as a reusable router?"

Passing scene-lock does not mean the preset is complete. A preset can avoid scene-lock while still
being only a short list of labels, or a generated template with the preset name pasted into every
field.

## New Tool

Command:

```bash
bun run styles:dna:audit -- --min-severity=high --limit=40
bun run styles:dna:audit -- --pack=pack_09 --min-severity=high --limit=40
```

The tool checks:

- all eight required `visualDna` fields exist;
- required fields have enough field-specific detail to route style behavior;
- `creative_brief` and `key_features` are present and useful as recommended differentiators;
- generated boilerplate such as "Use a controlled palette that supports..." is not mistaken for
  authored style DNA;
- repeated field values do not pretend to cover separate style properties;
- weak `avoidRules` and `negativePrompt` controls are visible.

This is a diagnostic tool for the current audit. It should not become a hard verify gate until one
manual correction cycle tunes false positives.

## Full Scan Result

Command:

```bash
bun run styles:dna:audit -- --min-severity=high --limit=40
```

Result:

| Severity | Count |
| -------- | ----: |
| Critical |   462 |
| High     |   143 |
| Medium   |   583 |
| Low      |   409 |
| Clean    |    60 |

The old scene-lock audit is still useful, but it was blind to this failure class. The strongest new
finding is that many presets technically contain every required field while the fields are too short
or too generic to work as full preset routers.

## Pack Risk

| Pack      | Presets | Critical | High | Medium | Low | Clean | Avg score | Incomplete required fields | Generic fields | Main failure                                                           |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | --------: | -------------------------: | -------------: | ---------------------------------------------------------------------- |
| `pack_09` |      80 |       80 |    0 |      0 |   0 |     0 |     69.15 |                        621 |              0 | Material presets are mostly labels, not behavior.                      |
| `pack_10` |      80 |       80 |    0 |      0 |   0 |     0 |     67.75 |                        615 |              0 | Abstract presets are mostly labels, not behavior.                      |
| `pack_12` |      80 |       77 |    0 |      3 |   0 |     0 |     61.85 |                          0 |            551 | Long generated boilerplate, weak specificity.                          |
| `pack_01` |      87 |       74 |    1 |     10 |   2 |     0 |     51.28 |                        594 |              2 | Many photographic properties are terse cue labels.                     |
| `pack_06` |     120 |       70 |    9 |     11 |  22 |     8 |     37.78 |                        578 |              6 | Mixed media/game-art presets need property expansion.                  |
| `pack_03` |      80 |       64 |    4 |     11 |   1 |     0 |     41.26 |                        488 |             12 | CGI/material/render fields remain underdescribed.                      |
| `pack_04` |     100 |        9 |   58 |     21 |  10 |     2 |     27.77 |                        467 |              2 | Illustration packs improved for scene-lock, but many fields stay thin. |
| `pack_02` |     128 |        8 |   52 |     31 |  24 |    13 |     21.02 |                        450 |              2 | Film/animation/media presets need richer per-field mechanics.          |
| `pack_11` |      80 |        0 |   14 |     37 |  28 |     1 |     15.85 |                        212 |              2 | Misc/source presets are mixed; many are usable but shallow.            |
| `pack_08` |      80 |        0 |    5 |     51 |  17 |     7 |     12.26 |                        159 |              2 | Fashion/costume needs more material/body/framing detail.               |
| `pack_14` |     123 |        0 |    0 |    123 |   0 |     0 |     16.00 |                          0 |            246 | Medium-risk boilerplate pattern.                                       |
| `pack_16` |     140 |        0 |    0 |    119 |  11 |    10 |     13.99 |                         11 |            238 | Medium-risk boilerplate pattern plus a few thin fields.                |
| `pack_07` |      80 |        0 |    0 |     60 |  12 |     8 |     13.75 |                          3 |            120 | Architecture is mostly router-safe, but many fields are template-like. |
| `pack_05` |     135 |        0 |    0 |     45 |  90 |     0 |      8.61 |                         98 |             84 | Anime/action styles need differentiated finish and composition fields. |
| `pack_15` |      80 |        0 |    0 |     30 |  49 |     1 |      7.00 |                        112 |              0 | Punk rewrite is router-safe but some fields are still concise.         |
| `pack_13` |     132 |        0 |    0 |     28 |  94 |    10 |      6.73 |                        117 |             38 | Anime classics mostly need polish and specificity.                     |
| `pack_17` |      52 |        0 |    0 |      3 |  49 |     0 |      6.65 |                         34 |              0 | Medieval rewrite is scene-safe; only minor depth gaps remain.          |

## Failure Modes Found

1. Short-label DNA.
   Example shape: `aesthetic: Volcanic glass`, `lighting_and_shadow: Matte`,
   `camera_and_composition: Cracks`. This exists structurally but does not tell the generator how
   to route the style over arbitrary subjects.

2. Template DNA.
   Example shape: "Use a controlled palette that supports [preset name]..." across many fields.
   This is longer text, but it is not authored style behavior.

3. Missing differentiators.
   Many presets have no `key_features`, or a one-word `key_features` value. This makes neighboring
   presets harder to compare and weakens card/preset review.

4. Weak negative controls.
   Some presets include only one or two avoid rules. That is not always fatal, but it is a useful
   cleanup signal when the preset also has shallow required fields.

5. Router-safe but underpowered presets.
   Packs already cleaned for scene-lock can still need expansion. The correction target is no longer
   "remove fixed scene"; it is "write complete style mechanics for each visual property."

## Recommended Correction Order

1. `pack_09` and `pack_10`.
   These are the clearest structural failures. They are not mostly false positives: nearly every
   required field is a tiny label. Rewrite with a material/abstract property template that maps
   surface, light, edge behavior, composition, mood, and render finish onto arbitrary subjects.

2. `pack_12`.
   This is a different repair. The fields are long enough, but they are generated boilerplate. Rewrite
   by gameplay/visual-system dialect: encounter hierarchy, readability, palette logic, traversal
   rhythm, material language, camera grammar, and finish.

3. `pack_01`, `pack_06`, `pack_03`.
   Large critical groups with many short required fields. These should be done after the material and
   abstract patterns are tuned.

4. `pack_04` and `pack_02`.
   Mixed high/medium groups. Prior card/scene work helped, but the per-field style anatomy still
   needs more craft.

5. Remaining medium/low packs.
   Audit after the high-risk corrections, then decide whether they need full rewrites or smaller
   enrichment passes.

## Correction Contract

For every corrected preset:

- preserve `id`, `packId`, category membership, supported tasks, and official card assets unless the
  card is explicitly replaced after visual review;
- keep `prompt X + preset` as the mental model;
- expand each required field into a different property of the style, not repeated adjectives;
- write `subject_treatment` as transformation behavior for arbitrary subjects;
- write `camera_and_composition` as reusable framing grammar;
- write `rendering_and_quality` as finish/process guidance, not "style-card" boilerplate;
- use `creative_brief` to state the router contract;
- use `key_features` as a compact differentiator, not a one-word label;
- run both audits after each pack:

```bash
bun run styles:dna:audit -- --pack=<pack_id> --min-severity=low --limit=160
bun run styles:scene-lock:audit -- --pack=<pack_id> --min-severity=low --limit=160
```

## Completed Passes

### 2026-07-06 - `pack_09` Texture & Materiality

`pack_09` was rewritten as a material router pack rather than a set of short surface labels. The
pass keeps the existing taxonomy, categories, supported tasks, preset IDs, and official card assets,
but expands every required `visualDna` property into usable style behavior.

Before the pass, every `pack_09` preset was critical in the DNA completeness audit:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_09` |      80 |       80 |    0 |      0 |   0 |     0 |               720 |              0 |

After the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_09` |      80 |        0 |    0 |      0 |   0 |    80 |                 0 |              0 |

Authoring pattern used:

- `aesthetic` defines the material system as a transferable visual language.
- `subject_treatment` explains how arbitrary subjects inherit the surface logic.
- `color_and_tone`, `lighting_and_shadow`, and `texture_and_material` separate palette, light
  response, and tactile behavior.
- `camera_and_composition` turns one original cue into reusable framing grammar instead of locking a
  card scene.
- `atmosphere_and_mood` and `rendering_and_quality` define finish, density, and anti-noise behavior.
- `creative_brief` is preserved when it already has enough substance; otherwise it becomes the
  concise router contract.
- `key_features`, `avoidRules`, and `negativePrompt` were strengthened for material drift, generic
  stock texture, muddy noise, watermarking, and readable text.

Verification:

```bash
bun run styles:dna:audit -- --pack=pack_09 --min-severity=low --limit=120
bun run styles:scene-lock:audit -- --pack=pack_09 --min-severity=low --limit=120
bun run styles:validate -- --pack=pack_09 --coverage
bun run styles:runtime
bun run styles:verify
bun run check -- package.json scripts/audit-style-preset-dna-completeness.ts scripts/audit-style-preset-dna-completeness.test.ts scripts/style-migration/enrich-pack-09-material-dna.ts docs/STYLE_PRESET_DNA_COMPLETENESS_AUDIT.md components/recipes/styleRuntimeData.generated.ts
bun run test -- scripts/audit-style-preset-dna-completeness.test.ts
```

Card review artifact:

```text
C:\Users\cristian\AppData\Local\Temp\codex-pack09-style-card-contact-sheet.jpg
```

The official `pack_09` cards were not replaced in this pass because the pack is mostly material
reference imagery and the current cards are still useful for quick surface recognition. They should
be replaced only after a separate visual pass confirms that a card is too literal, misleading, or
too generic for the rewritten router.

### 2026-07-06 - `pack_10` Abstract & Experimental

`pack_10` was rewritten as an abstract/experimental router pack. Unlike `pack_09`, it required
separate authoring grammar for each internal family: geometric abstraction, fluid/organic systems,
digital glitch, surreal/dream systems, textile ornament, material surfaces, diagram/data systems,
point-mosaic-glass systems, and print/light finishes.

Before the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_10` |      80 |       80 |    0 |      0 |   0 |     0 |               615 |              0 |

After the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_10` |      80 |        0 |    0 |      0 |   0 |    80 |                 0 |              0 |

Authoring pattern used:

- `aesthetic` defines the preset as a transferable abstract, surface, mark, or information system.
- `subject_treatment` preserves prompt identity while describing how the style transforms form.
- `color_and_tone` binds palette to structural logic: device behavior, dye/thread, substrate,
  diagram coding, optical mixing, or surreal emotional temperature.
- `lighting_and_shadow` describes process-specific light response instead of generic beauty light.
- `texture_and_material` distinguishes marks, pixels, fibers, tiles, ink, glass, diagrams, fluids,
  and physical surfaces.
- `camera_and_composition` turns each cue into reusable spatial grammar for portraits, objects,
  environments, and action scenes.
- `atmosphere_and_mood` preserves stronger adult/darker/stranger prompt intent when relevant,
  without injecting it by default.
- `key_features` stores short source cues so the migration remains idempotent under `--force`.

Additional quality checks during the pass:

- Tested `SP10-013 Oil Slick` alone before broad application.
- Detected and fixed `--force` recursion where enriched prose could become the next cue source.
- Normalized repeated cues in `aesthetic` so presets like `Circuit Board` and `Letterpress` do not
  read as mechanical cue duplication.

Verification:

```bash
bun run styles:dna:audit -- --pack=pack_10 --min-severity=low --limit=120
bun run styles:scene-lock:audit -- --pack=pack_10 --min-severity=low --limit=120
bun run styles:validate -- --pack=pack_10 --coverage
bun run styles:runtime
bun run styles:verify
bun run styles:dna:audit -- --min-severity=high --limit=20
```

Card review artifact:

```text
C:\Users\cristian\AppData\Local\Temp\codex-pack10-style-card-contact-sheet.jpg
```

The official `pack_10` cards were not replaced in this pass. The contact sheet shows generally
legible abstract, pattern, material, and diagram cards. Possible future visual-review candidates are
`SP10-026 JPEG Artifacts`, `SP10-043 Dark Fantasy`, and `SP10-044 Solarpunk`, but none was confirmed
bad enough to replace blindly during the DNA rewrite.

Global DNA status after `pack_09` and `pack_10`:

| Critical | High | Medium | Low | Clean |
| -------: | ---: | -----: | --: | ----: |
|      302 |  143 |    583 | 409 |   220 |

The next highest-risk pack is now `pack_12`, which is a boilerplate rewrite problem rather than a
short-label problem.

### 2026-07-06 - `pack_12` Video Game Originals Vault

`pack_12` was rewritten as a video-game art-direction router. This pass was different from the
short-label rewrites: most required fields were long, but they were generated boilerplate. The fix
was to replace the template language with category grammar plus token-level vocabulary derived from
each preset name.

Before the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_12` |      80 |       77 |    0 |      3 |   0 |     0 |                 0 |            551 |

After the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_12` |      80 |        0 |    0 |      0 |   0 |    80 |                 0 |              0 |

Authoring pattern used:

- The preset name remains metadata, but required `visualDna` fields avoid treating that name as a
  literal scene prompt.
- `aesthetic` frames the preset as transferable game-art direction, not a required mission, scene,
  character, or card image.
- `subject_treatment` uses category grammar for route pressure, role clarity, encounter
  readability, and silhouette transformation.
- `color_and_tone`, `lighting_and_shadow`, and `texture_and_material` combine token cues with
  category art direction.
- `camera_and_composition` intentionally avoids literal card staging and instead describes reusable
  lane rhythm, scale contrast, objective hierarchy, negative space, depth, and motion vectors.
- `key_features` keeps compact source cues so a reviewer can still see what tokens shaped the
  preset.
- `avoidRules` now include fixed-scene and official-card-framing protection.

Additional quality checks during the pass:

- Tested `SP12-003 Desert Mech Convoy`, `SP12-016 Shadow Opera Assassin Court`, and `SP12-037
Mushroom Kingdom Frontier` before broad application.
- Initial DNA cleanup passed but `scene-lock` still found concrete actors/foreground staging, so the
  migration was revised to remove role lists and literal card-composition cues.
- Final pass removed the old `style-card` boilerplate and source-card composition phrasing.

Verification:

```bash
bun run styles:dna:audit -- --pack=pack_12 --min-severity=low --limit=120
bun run styles:scene-lock:audit -- --pack=pack_12 --min-severity=low --limit=120
bun run styles:validate -- --pack=pack_12 --coverage
bun run styles:runtime
bun run styles:verify
bun run styles:dna:audit -- --min-severity=high --limit=20
```

Card review artifact:

```text
C:\Users\cristian\AppData\Local\Temp\codex-pack12-style-card-contact-sheet.jpg
```

The official `pack_12` cards were not replaced during this DNA pass. The contact sheet confirms that
many cards are intentionally scene-like game thumbnails. The corrected presets no longer require
those scenes, but a later visual-card pass should decide whether this pack should keep source-scene
cards as flavor references or regenerate cards that demonstrate `prompt X + preset` more directly.

Global DNA status after `pack_09`, `pack_10`, and `pack_12`:

| Critical | High | Medium | Low | Clean |
| -------: | ---: | -----: | --: | ----: |
|      225 |  143 |    580 | 409 |   300 |

The next highest-risk packs are now `pack_01`, `pack_06`, and `pack_03`.

### 2026-07-06 - `pack_01` Photography & Realism

`pack_01` was rewritten as a photographic router pack. The key correction was to stop treating each
preset as a short camera/scene cue and instead split the style into photographic method, subject
treatment, palette behavior, light response, surface/grain, framing grammar, mood, and finish.

Before the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_01` |      87 |       74 |    1 |     10 |   2 |     0 |               594 |              2 |

After the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_01` |      87 |        0 |    0 |      0 |   0 |    87 |                 0 |              0 |

Authoring pattern used:

- `aesthetic` now identifies the photographic tradition, camera logic, or realism strategy as a
  transferable style layer.
- `subject_treatment` describes how arbitrary prompts should inherit lens behavior, posture,
  presence, documentary pressure, or photographic believability.
- `camera_and_composition` avoids hard subject or location staging and defines reusable framing
  grammar instead.
- Scene-lock terms such as fixed backgrounds, foreground props, city/street/forest assumptions, and
  centered thumbnail phrasing were sanitized from regenerated briefs.
- `avoidRules` and `negativePrompt` now protect against overprocessed CG, stock-photo blandness,
  fake-text artifacts, and style-card literalism.

Verification:

```bash
bun run styles:dna:audit -- --pack=pack_01 --min-severity=low --limit=100
bun run styles:scene-lock:audit -- --pack=pack_01 --min-severity=low --limit=100
bun run styles:validate -- --pack=pack_01 --coverage
bun run styles:runtime
bun run check:fix -- scripts/style-migration/enrich-pack-01-photo-dna.ts
```

Card review artifact:

```text
C:\Users\cristian\AppData\Local\Temp\codex-pack01-style-card-contact-sheet.jpg
```

The official `pack_01` cards were reviewed but not replaced in this DNA pass. The contact sheet
shows many portrait-oriented cards, which is expected for a photography-heavy pack; a later card
replacement pass should only replace cards that are confirmed misleading or too samey for navigation.

### 2026-07-06 - `pack_06` Essential Art Styles

`pack_06` was rewritten as a broad art-method router pack. The pack needed more than a single
template because it spans traditional painting, drawing/sketching, printmaking, digital art, mixed
media, retro game visual systems, game art direction, and UI-adjacent styles.

Before the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_06` |     120 |       70 |    9 |     11 |  22 |     8 |               578 |              6 |

After the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_06` |     120 |        0 |    0 |      0 |   0 |   120 |                 0 |              0 |

Authoring pattern used:

- Each internal family uses its own vocabulary: pigment, draftsmanship, print matrix, digital brush,
  collage assembly, pixel/retro display behavior, game readability, or interface-surface grammar.
- `subject_treatment` is now transformation behavior for arbitrary prompts rather than a list of
  sample card subjects.
- Retro and pixel presets avoid generic denoise/low-resolution conflict where low-res behavior is
  part of the intended style.
- Known source/IP-adjacent names were kept when they materially anchor the style, but required
  fields avoid forcing a fixed scene from that name.
- Negative controls were strengthened against prompt-literal cards, generic fantasy fallback,
  muddy noise, unreadable text, and accidental photoreal drift.

Verification:

```bash
bun run styles:dna:audit -- --pack=pack_06 --min-severity=low --limit=140
bun run styles:scene-lock:audit -- --pack=pack_06 --min-severity=low --limit=140
bun run styles:validate -- --pack=pack_06 --coverage
bun run styles:runtime
bun run check:fix -- scripts/style-migration/enrich-pack-06-essential-art-dna.ts
```

Card review artifact:

```text
C:\Users\cristian\AppData\Local\Temp\codex-pack06-style-card-contact-sheet.jpg
```

The official `pack_06` cards were reviewed but not replaced in this pass. They are varied enough for
navigation after the DNA correction, although a later pack-by-pack visual replacement pass can still
raise the ambition of individual cards.

### 2026-07-06 - `pack_03` 3D & CGI Rendering

`pack_03` was rewritten as a CGI/rendering router pack. The pass separates renderer dialect,
material response, lighting model, shader/surface behavior, product or character CGI grammar,
environment scale, sensor/technical visualization, and final render quality.

Before the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_03` |      80 |       64 |    4 |     11 |   1 |     0 |               488 |             12 |

After the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_03` |      80 |        0 |    0 |      0 |   0 |    80 |                 0 |              0 |

Authoring pattern used:

- Render engines, material systems, lighting/atmosphere, hard-surface/product CGI, organic character
  CGI, environment/worldbuilding, and sensor/technical shaders each receive distinct field grammar.
- Presets such as Redshift, Claymation, Porcelain, Metaballs, Glitch 3D, Toon Shader, Scientific
  Visualization, Retro CGI, Glassmorphism UI, and Clay UI were given explicit differentiator cues
  instead of generic generated fallbacks.
- `camera_and_composition` now describes render-friendly spatial grammar and object readability
  rather than a fixed demo object.
- `rendering_and_quality` carries finish/process pressure: sample quality, shader legibility,
  topology/material credibility, denoise discipline, and artifact control.

Verification:

```bash
bun run styles:dna:audit -- --pack=pack_03 --min-severity=low --limit=100
bun run styles:scene-lock:audit -- --pack=pack_03 --min-severity=low --limit=100
bun run styles:validate -- --pack=pack_03 --coverage
bun run styles:runtime
bun run check:fix -- scripts/style-migration/enrich-pack-03-cgi-dna.ts
```

Card review artifact:

```text
C:\Users\cristian\AppData\Local\Temp\codex-pack03-style-card-contact-sheet.jpg
```

The official `pack_03` cards were reviewed but not replaced in this pass. Many cards are demo
objects or material showcases, which is appropriate for a CGI/render pack as long as the preset DNA
does not force that object into user prompts.

### 2026-07-06 - `pack_04` Illustration & Graphic Novel

`pack_04` was rewritten as an illustration and graphic-novel router pack. This pass focused on
keeping illustration cards independent from preset behavior: the preset now routes line language,
palette, surface, mark-making, composition, and finish over prompt X instead of carrying card-scene
subjects into user generations.

Before the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_04` |     100 |        9 |   58 |     21 |  10 |     2 |               467 |              2 |

After the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_04` |     100 |        0 |    0 |      0 |   0 |   100 |                 0 |              0 |

Authoring pattern used:

- Internal families now use distinct grammar: comic-book styles, children's illustration, editorial
  and poster, concept art, ink and print, and technical/reference sheets.
- Short fields such as `Bold`, `Screenprint`, `Thick ink`, `Grid paper`, and `Heroic angle` were
  expanded into style mechanics for arbitrary subjects.
- Scene-prone words such as street, hero, foreground, background, castle, dungeon, creature, and
  thumbnail are sanitized when they would imply a fixed card setup.
- Existing useful `creative_brief` direction was preserved in spirit, but required `visualDna`
  fields now carry the actual router behavior.
- `SP04-007 Franco-Belgian (Ligne Claire)` received an explicit fallback after inspection found
  old template prose that passed structure checks but still read too generic.

Verification:

```bash
bun run styles:dna:audit -- --pack=pack_04 --min-severity=low --limit=140
bun run styles:scene-lock:audit -- --pack=pack_04 --min-severity=low --limit=140
bun run styles:validate -- --pack=pack_04 --coverage
bun run styles:runtime
bun run check:fix -- scripts/style-migration/enrich-pack-04-illustration-dna.ts
```

Card review artifact:

```text
C:\Users\cristian\AppData\Local\Temp\codex-pack04-dna-pass-contact-sheet.jpg
```

The official `pack_04` cards were reviewed but not replaced in this DNA pass. The sheet remains
usable for navigation across comics, storybook/editorial, concept art, ink/print, and technical
sheet families. Some cards are narrative or subject-heavy, but the corrected presets no longer
inherit those subjects as mandatory generation content.

### 2026-07-06 - `pack_02` Cinematic & Media

`pack_02` was rewritten as a cinematic/media router pack. The correction target was to separate
media treatment from fixed scenes: film, TV, broadcast, animation, historical photography, lighting,
cartoon, sensor, and DIY-media presets now route optical behavior, signal texture, palette, light,
composition, mood, and finish over prompt X without requiring the official card subject.

Before the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_02` |     128 |        8 |   52 |     31 |  24 |    13 |               450 |              2 |

After the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_02` |     128 |        0 |    0 |      0 |   0 |   128 |                 0 |              0 |

Authoring pattern used:

- Internal families now use distinct grammar: film genres, TV/broadcast, animation styles,
  photography eras, lighting/atmosphere, caricature/cartoon, sensor/technical imaging, and
  hand-drawn/DIY media.
- `News Broadcast`, `Sports Broadcast`, `Weather Channel`, and related presets use package geometry,
  signal texture, safe-frame layout, compression, and graphic hierarchy without requiring anchors,
  desks, logos, captions, or readable UI.
- `Underwater Light`, `X-Ray Photography`, `Thermal Camera`, and other optical/sensor presets route
  physics and capture modality without forcing literal underwater, medical, or device scenes.
- Named film, animation, and cartoon references remain as style connectors where useful, but
  required fields now describe transferable media mechanics rather than copied IP scenes.
- A scene-lock false-positive pass caught category grammar words like `background` and `centered`;
  these were replaced with safer composition vocabulary before the full pack rewrite.

Verification:

```bash
bun run styles:dna:audit -- --pack=pack_02 --min-severity=low --limit=160
bun run styles:scene-lock:audit -- --pack=pack_02 --min-severity=low --limit=160
bun run styles:validate -- --pack=pack_02 --coverage
bun run styles:runtime
bun run check:fix -- scripts/style-migration/enrich-pack-02-media-dna.ts
```

Card review artifacts:

```text
C:\Users\cristian\AppData\Local\Temp\codex-pack02-dna-pass-contact-sheet.jpg
C:\Users\cristian\AppData\Local\Temp\codex-pack02-dna-pass-contact-sheet-081-128.jpg
```

The official `pack_02` cards were reviewed but not replaced in this DNA pass. Many cards are
scene/person/media-frame oriented, which is acceptable for navigation in this pack as long as the
preset does not force that scene. The second contact sheet is needed because the `ffmpeg` tile pass
outputs the pack in two blocks for reliable inspection.

### 2026-07-06 - `pack_11` Miscellaneous & Fun

`pack_11` was rewritten as a source/style-router pack rather than a grab bag of shallow cue lists.
The key distinction is that toy, craft, medium, aesthetic, food, micro/macro, sensor, and diagram
presets can keep their source vocabulary, but each required field now explains how that vocabulary
transfers onto prompt X.

Before the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_11` |      80 |        0 |   14 |     37 |  28 |     1 |               212 |              2 |

After the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_11` |      80 |        0 |    0 |      0 |   0 |    80 |                 0 |              0 |

Authoring pattern used:

- Internal families now use distinct grammar: toys/crafts, artistic mediums, aesthetics,
  food/drink, micro/macro, sensor/technical imaging, and diagram/technical drawing.
- Presets that are inherently source-like, such as `Insect Eye`, `Latte Art`, `Blueprint`,
  `Thermal Vision`, or `Action Figure (90s)`, keep their anchor vocabulary while explicitly
  preserving the user's subject, motion, and context.
- Generic template fields were replaced with concrete source behavior: construction grammar,
  palette logic, light response, material treatment, composition grammar, mood source, and finish.
- A second pass removed a low-confidence scene-lock hit in `Action Figure (90s)` by avoiding
  thumbnail-ish subject bundles in `subject_treatment`.
- The migration was made idempotent under `--force`, including compact `key_features` reuse and
  duplicate cue suppression.

Verification:

```bash
bun run check:fix -- scripts/style-migration/enrich-pack-11-source-dna.ts
bun run styles:dna:audit -- --pack=pack_11 --min-severity=low --limit=120
bun run styles:scene-lock:audit -- --pack=pack_11 --min-severity=low --limit=120
bun run styles:validate -- --pack=pack_11 --coverage
bun run styles:runtime
bun run styles:dna:audit -- --min-severity=high --limit=20
bun run styles:scene-lock:audit -- --min-severity=low --limit=5
```

Card review artifact:

```text
C:\Users\cristian\AppData\Local\Temp\codex-pack11-style-card-contact-sheet.jpg
```

The official `pack_11` cards were reviewed but not replaced in this DNA pass. The contact sheet is
varied enough for navigation across toy, craft, food, micro/macro, sensor, and aesthetic families.
The issue in this pack was mainly underpowered preset DNA, not misleading card imagery.

### 2026-07-06 - `pack_08` Fashion & Costume

`pack_08` was rewritten as a fashion/costume router pack. The correction was not simply to make
fields longer: each preset now separates silhouette, fit, body-volume logic, styling hierarchy,
material behavior, light response, framing grammar, mood, and finish so the official card outfit
does not become mandatory generation content.

Before the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_08` |      80 |        0 |    5 |     51 |  17 |     7 |               159 |              2 |

After the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_08` |      80 |        0 |    0 |      0 |   0 |    80 |                 0 |              0 |

Authoring pattern used:

- Internal families now use distinct grammar: contemporary fashion, subcultures,
  historical/fantasy costume, fantasy/sci-fi costume, and fabric/material transformation.
- `subject_treatment` preserves prompt subject, motion, and context while routing silhouette, fit,
  layering, body-volume logic, edge behavior, and styling hierarchy.
- Material-forward presets such as `Smoke Dress`, `Water Dress`, `Fire Dress`, `Transparent
Plastic`, `Stone Statue`, and `Shadow Form` route material physics without requiring a model,
  pose, body type, or one fixed outfit.
- Subculture and historical presets keep source vocabulary such as denim, leather, regalia,
  mourning black, armor plates, or club light, but avoid mandatory venue/persona/card composition.
- A forced re-run verified that the migration is idempotent and does not inflate enriched prose.

Verification:

```bash
bun run check:fix -- scripts/style-migration/enrich-pack-08-fashion-dna.ts
bun run styles:dna:audit -- --pack=pack_08 --min-severity=low --limit=120
bun run styles:scene-lock:audit -- --pack=pack_08 --min-severity=low --limit=120
bun run styles:validate -- --pack=pack_08 --coverage
bun run styles:runtime
bun run styles:dna:audit -- --min-severity=high --limit=20
bun run styles:scene-lock:audit -- --min-severity=low --limit=5
```

Card review artifact:

```text
C:\Users\cristian\AppData\Local\Temp\codex-pack08-style-card-contact-sheet-full.jpg
```

The official `pack_08` cards were reviewed but not replaced in this DNA pass. The pack is naturally
outfit/model-heavy, and the current cards are acceptable for fashion navigation. A future card pass
could diversify poses, bodies, and non-human/object applications, but no card was confirmed wrong
enough for blind replacement during this preset-router rewrite.

### 2026-07-06 - `pack_14` Mythic Noir Curated Vault

`pack_14` was rewritten as a mythic-noir router pack. The original manifests were especially
misleading because all required fields existed and had enough length, but almost every field was
generated boilerplate with the preset name pasted into the same template. The pass replaces that
template with category grammar plus token-level vocabulary derived from each preset name.

Before the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_14` |     123 |        0 |    0 |    123 |   0 |     0 |                 0 |            246 |

After the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_14` |     123 |        0 |    0 |      0 |   0 |   123 |                 0 |              0 |

Authoring pattern used:

- Internal families now use distinct grammar: mythic symbolism, ritual noir, pantheons, cosmology
  and omens, Greek epics, African cosmologies, Japanese kami/yokai, Norse sagas, and Mesoamerican
  sun-cycle systems.
- Preset names such as `Broken Neon Saint Icon`, `Whispering Foxfire Threshold`, `Baobab Star
Counsel`, `Orbital Death Spiral`, and `Twin Gods Tidal Duality` are treated as style vocabulary,
  not as required scene prompts.
- `subject_treatment` preserves prompt X while routing silhouette pressure, symbolic contour,
  ritual posture, edge weight, and motif placement.
- `color_and_tone`, `lighting_and_shadow`, `texture_and_material`, and `camera_and_composition`
  are generated from separate token/category cues so the fields do not repeat the same sentence.
- A second quality pass removed weak fallback language such as generic "mythic-noir cue" phrasing
  for the most visible token families.
- Scene-lock-sensitive terms such as chapel, shrine, court, hero, foreground, background, and
  thumbnail are sanitized or converted into style mechanics when they would imply a fixed card.

Verification:

```bash
bun run check:fix -- scripts/style-migration/enrich-pack-14-mythic-noir-dna.ts
bun run styles:dna:audit -- --pack=pack_14 --min-severity=low --limit=160
bun run styles:scene-lock:audit -- --pack=pack_14 --min-severity=low --limit=160
bun run styles:validate -- --pack=pack_14 --coverage
bun run styles:runtime
bun run styles:dna:audit -- --min-severity=high --limit=20
bun run styles:scene-lock:audit -- --min-severity=low --limit=5
```

Card review artifact:

```text
C:\Users\cristian\AppData\Local\Temp\codex-pack14-style-card-contact-sheet.jpg
```

The official `pack_14` cards were reviewed but not replaced in this DNA pass. They are dark,
narrative, and character-heavy, but that is broadly appropriate for a mythic-noir pack. A later card
pass could diversify the pack with more symbolic, material, and object-led cards, but no card was
confirmed misleading enough for a blind replacement during this router rewrite.

### 2026-07-06 - `pack_16` Anime Classics & Prestige

`pack_16` was rewritten as an anime-prestige router pack. This pack is unusual because it uses
curated `SP05-*` and `SP13-*` preset IDs inside `pack_16`, so the pass keeps useful source/style
connector names as lineage vocabulary while preventing those names from forcing canon characters,
title scenes, props, or screenshot-like compositions.

Before the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_16` |     140 |        0 |    0 |    119 |  11 |    10 |                11 |            238 |

After the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_16` |     140 |        0 |    0 |      0 |   0 |   140 |                 0 |              0 |

Authoring pattern used:

- `aesthetic` states the transferable anime-prestige router role and separates source lineage from
  prompt content.
- `subject_treatment` preserves prompt X while translating arbitrary subjects through anime contour,
  expression economy, pose energy, and silhouette discipline.
- `color_and_tone`, `lighting_and_shadow`, and `texture_and_material` combine category grammar
  (retro cel, golden-era drama, sports performance, samurai severity, prestige horror, etc.) with
  preset-name cues.
- `camera_and_composition` describes reusable staging grammar for portraits, props, machines,
  performance, landscapes, symbols, and full scenes rather than one card layout.
- `rendering_and_quality` adds clean denoise, controlled grain, stable anatomy/object structure, no
  photoreal drift, no watermark, no fake text, and no signature controls.
- `avoidRules` retain existing useful negatives, add category-specific controls, and explicitly block
  fixed canon characters, literal title scenes, required screenshots, generic anime filters, and
  prompt-literal cards.

Quality notes:

- Sampled and force-regenerated `SP05-003`, `SP05-004`, and `SP13-034` before the full batch to
  catch template-tone issues.
- Adjusted the migration prose after review so fallback cues read as style mechanics instead of
  pasted token labels.
- Kept named anime/IP lineage where it functions as a style connector, but the final router contract
  forbids required canon casts or title-scene replication.

Verification:

```bash
bun run check:fix -- scripts/style-migration/enrich-pack-16-anime-prestige-dna.ts
bun run styles:dna:audit -- --pack=pack_16 --min-severity=low --limit=160
bun run styles:scene-lock:audit -- --pack=pack_16 --min-severity=low --limit=160
bun run styles:validate -- --pack=pack_16 --coverage
bun run styles:runtime
bun run styles:dna:audit -- --min-severity=high --limit=20
bun run styles:scene-lock:audit -- --min-severity=low --limit=5
bun run styles:verify
```

Card review artifact:

```text
C:\Users\cristian\AppData\Local\Temp\codex-pack16-style-card-contact-sheet.jpg
```

The official `pack_16` cards were reviewed but not replaced in this DNA pass. The sheet is coherent
as an anime/prestige pack across retro, classics, sports/performance, samurai, and horror. There is a
strong character bias, but no card was confirmed misleading enough for replacement during this
router rewrite.

### 2026-07-06 - `pack_07` Architecture & Interior

`pack_07` was rewritten as an architecture/interior router pack. The important distinction in this
pass was to keep architecture as transferable style grammar, not as a command to always generate a
fixed building, room, facade, garden, or miniature. The migration uses the already curated
`SP07-*` card prompts in `scripts/generate-style-defaults.ts` as source vocabulary, then converts
those card-specific anchors into reusable massing, surface, light, material, joinery, threshold,
ornament, scale, and composition rules.

Before the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_07` |      80 |        0 |    0 |     60 |  12 |     8 |                 3 |            120 |

After the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_07` |      80 |        0 |    0 |      0 |   0 |    80 |                 0 |              0 |

Authoring pattern used:

- `aesthetic` defines each preset as a transferable architecture/interior router, using prompt-card
  source cues as style vocabulary rather than required thumbnail anchors.
- `subject_treatment` keeps prompt X intact and applies architectural grammar to any requested
  subject through massing, edge behavior, surface logic, joinery, threshold, scale, and ornament.
- Category grammar separates interior systems, architectural movements, civic infrastructure,
  landscape systems, mythic architecture, toy/craft miniatures, and megastructure/impossible space.
- `camera_and_composition` turns detail crops, section cuts, modular rhythm, facade fragments,
  ground-plane logic, or recursive spaces into reusable framing rules.
- `avoidRules` were expanded to prevent showroom drift, landmark/postcard copying, corridor lock,
  product-photo staging, brand/logo/text artifacts, and prompt-literal cards.

Quality notes:

- Sampled `SP07-016`, `SP07-070`, and `SP07-080` before applying the whole pack to make sure older
  template entries and newer rich entries both survived the rewrite.
- A first broad pass exposed one critical scene-lock false-positive/real wording issue around
  `room`, `facade`, and card-composition wording. The extractor and templates were adjusted, then
  the whole pack was force-regenerated.
- Scene-lock ended fully clean after replacing entity lists and fixed-location negatives with
  subject-agnostic architecture grammar.

Verification:

```bash
bun run check:fix -- scripts/style-migration/enrich-pack-07-architecture-dna.ts
bun run styles:dna:audit -- --pack=pack_07 --min-severity=low --limit=100
bun run styles:scene-lock:audit -- --pack=pack_07 --min-severity=low --limit=100
bun run styles:validate -- --pack=pack_07 --coverage
bun run styles:runtime
bun run styles:dna:audit -- --min-severity=high --limit=20
bun run styles:scene-lock:audit -- --min-severity=low --limit=5
bun run styles:verify
```

Card review artifact:

```text
C:\Users\cristian\AppData\Local\Temp\codex-pack07-style-card-contact-sheet.jpg
```

The official `pack_07` cards were reviewed but not replaced in this DNA pass. They are necessarily
more literal than non-architecture packs, but the current set is coherent across interiors,
movement/vernacular architecture, civic infrastructure, landscapes, fantasy architecture,
miniatures, and impossible spaces. A later dedicated card pass can target individual room-heavy or
portrait-adjacent cards if stricter abstraction is desired.

### 2026-07-06 - `pack_05` Anime Battle & Worlds

`pack_05` was rewritten as a transferable anime-battle/worlds router pack. The pass keeps useful
anime, manga, and title lineage where it helps the model find a style family, but it prevents that
lineage from becoming a required canon cast, title-scene copy, screenshot, prop bundle, or card
composition.

Before the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_05` |     135 |        0 |    0 |     45 |  90 |     0 |                98 |             84 |

After the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_05` |     135 |        0 |    0 |      0 |   0 |   135 |                 0 |              0 |

Authoring pattern used:

- `aesthetic` frames each entry as a style layer to apply after prompt X, separating source lineage
  from required subject matter.
- `subject_treatment` translates arbitrary subjects through contour, pose energy, hardware logic,
  fantasy silhouette, seinen restraint, or action-keyframe force depending on category.
- `color_and_tone`, `lighting_and_shadow`, and `texture_and_material` separate anime palette
  logic, cel-shadow response, material/effect overlays, and denoised finish behavior.
- `camera_and_composition` describes reusable action lanes, scale compression, quest-depth,
  oppressive negative space, or forced-perspective impact without requiring a fixed scene.
- `avoidRules` explicitly block canon-character dependency, title-scene copying, readable UI/text,
  static screenshot drift, photoreal cosplay, prompt-literal card reuse, and noisy AI anime smear.

Quality notes:

- The migration groups presets into modern shonen/action, mecha/cyberpunk, isekai/high fantasy,
  dark fantasy/seinen, and portable action setpieces instead of using one generic anime template.
- First-pass audit exposed remaining scene-lock vocabulary around foreground/background, mecha
  parts, party/dungeon/spell-circle wording, and prop lists; the script was adjusted and the whole
  pack was regenerated.
- Existing official cards were reviewed as a compact contact sheet. The sheet is coherent across
  action, mecha, fantasy, and darker seinen entries. No card was replaced in this pass because no
  current official card was confirmed misleading enough for a blind replacement.

Verification:

```bash
bun run check:fix -- scripts/style-migration/enrich-pack-05-anime-battle-dna.ts
bun run styles:dna:audit -- --pack=pack_05 --min-severity=low --limit=160
bun run styles:scene-lock:audit -- --pack=pack_05 --min-severity=low --limit=160
bun run styles:validate -- --pack=pack_05 --coverage
bun run styles:runtime
bun run styles:dna:audit -- --min-severity=high --limit=20
bun run styles:scene-lock:audit -- --min-severity=low --limit=5
```

Card review artifact:

```text
C:\Users\cristian\AppData\Local\Temp\codex-pack05-style-card-contact-sheet-small.jpg
```

### 2026-07-06 - `pack_15` Punk Spectrum Vault

`pack_15` was enriched as a punk-spectrum router pack rather than a single generic punk template.
The base pack was already scene-safe, so the correction focused on underdeveloped properties:
short palette, lighting, material, mood, and finish fields that did not yet carry enough router
behavior.

Before the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_15` |      80 |        0 |    0 |     30 |  49 |     1 |               112 |              0 |

After the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_15` |      80 |        0 |    0 |      0 |   0 |    80 |                 0 |              0 |

Authoring pattern used:

- The pack stays split into ten distinct punk families: industrial-retrofuture, net/signal,
  eco-repair, bio/myco/body, ocean/ice/terrain, DIY public-punk, media/vapor/glitch,
  occult/gothic, space/atomic/ray, and primitive/salvage.
- `aesthetic` now states each preset as a portable punk-spectrum router and keeps the card/sample
  motifs as style identity cues, not required scenes.
- `subject_treatment` preserves prompt X while translating arbitrary subjects through each punk
  family's massing, signal paths, repair seams, organic scaffolds, weather materials, paste layers,
  CRT artifacts, ritual electronics, chrome curves, or salvage mechanics.
- `color_and_tone`, `lighting_and_shadow`, `texture_and_material`, and
  `camera_and_composition` are category-specific enough to avoid short-label DNA while still
  allowing characters, objects, vehicles, symbols, environments, or full scenes.
- `rendering_and_quality` reinforces clean denoise, controlled grit, readable dark-gray shadows,
  no readable text, no watermark, no muddy black fields, and no generic concept-art polish.

Quality notes:

- A three-preset sample pass (`SP15-001`, `SP15-050`, `SP15-074`) exposed an idempotence bug where
  force-regeneration could feed enriched paragraphs back into themselves. The migration was fixed
  to rebuild already-enriched manifests from `key_features` plus category grammar.
- A second polish pass removed duplicated subject grammar before the full batch was accepted.
- Current official cards were reviewed as a contact sheet. They are character-heavy but coherent
  across the punk spectrum, and no card was confirmed misleading enough for replacement in this DNA
  pass.

Verification:

```bash
bun run check:fix -- scripts/style-migration/enrich-pack-15-punk-spectrum-dna.ts
bun run scripts/style-migration/enrich-pack-15-punk-spectrum-dna.ts --force
bun run styles:dna:audit -- --pack=pack_15 --min-severity=low --limit=120
bun run styles:scene-lock:audit -- --pack=pack_15 --min-severity=low --limit=120
bun run styles:validate -- --pack=pack_15 --coverage
bun run styles:runtime
bun run styles:dna:audit -- --min-severity=high --limit=20
bun run styles:scene-lock:audit -- --min-severity=low --limit=5
```

Card review artifact:

```text
C:\Users\cristian\AppData\Local\Temp\codex-pack15-style-card-contact-sheet.jpg
```

### 2026-07-06 - `pack_13` Anime Character & Lifestyle

`pack_13` was rewritten as an anime character/lifestyle router pack. This pack is intentionally
character-first and contains many named anime/manga lineage cues, so the pass preserves names when
they help style routing while preventing canon casts, title scenes, screenshots, fixed venues, or
sample-card prompts from becoming mandatory generation content.

Before the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_13` |     132 |        0 |    0 |     28 |  94 |    10 |               117 |             38 |

After the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_13` |     132 |        0 |    0 |      0 |   0 |   132 |                 0 |              0 |

Authoring pattern used:

- Category grammar is separated into core anime, slice-of-life/music, shojo/magical/visionary
  classics, slice-of-life/moe, and broad anime style spectrum.
- Named IP or auteur lineage remains available as style reference vocabulary, but the router text
  explicitly blocks canon cast copying, title-scene reproduction, logos, copied costumes, and
  screenshot-like compositions.
- `subject_treatment` was deliberately made more category-level and prompt-preserving after a first
  clean DNA pass still produced low-confidence scene-lock warnings from inherited prop bundles.
  Specificity now lives in `aesthetic`, `key_features`, and `creative_brief`.
- `color_and_tone`, `lighting_and_shadow`, `texture_and_material`, `camera_and_composition`,
  `atmosphere_and_mood`, and `rendering_and_quality` now carry enough anime style mechanics to
  work across characters, objects, vehicles, interiors, symbols, actions, and full scenes.

Quality notes:

- Sampled `SP13-001`, `SP05-041`, `SP05-114`, `SP05-183`, and `SP05-326` before the full batch to
  cover core anime, generated shojo boilerplate, material/textile spectrum, romance entries, and
  auteur/IP spectrum entries.
- The first broad pass cleared DNA but left 19 low-confidence scene-lock findings. The migration was
  adjusted to keep subject and composition fields more abstract, then the whole pack was
  force-regenerated.
- Current official cards were reviewed as a contact sheet. They are strongly character-led, which
  matches the pack's purpose, and no official card was replaced in this pass.

Verification:

```bash
bun run check:fix -- scripts/style-migration/enrich-pack-13-anime-lifestyle-dna.ts
bun run scripts/style-migration/enrich-pack-13-anime-lifestyle-dna.ts --force
bun run styles:dna:audit -- --pack=pack_13 --min-severity=low --limit=160
bun run styles:scene-lock:audit -- --pack=pack_13 --min-severity=low --limit=160
bun run styles:validate -- --pack=pack_13 --coverage
bun run styles:runtime
bun run styles:dna:audit -- --min-severity=high --limit=20
bun run styles:scene-lock:audit -- --min-severity=low --limit=5
```

Card review artifact:

```text
C:\Users\cristian\AppData\Local\Temp\codex-pack13-style-card-contact-sheet.jpg
```

### 2026-07-06 - `pack_17` Medieval Fantasy & Dungeon Zine

`pack_17` was enriched as a medieval-fantasy and dungeon-zine router pack. This pack was already
scene-lock clean, but many entries still had short mood fields or missing `key_features`. The pass
keeps the pack's darker adult editorial, grimdark, zine, tarot/bestiary, rune-tech, and plague-court
flavor while preventing any preset from requiring a fixed medieval card, relic, monster, court
scene, manuscript page, or sample-card composition.

Before the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_17` |      52 |        0 |    0 |      3 |  49 |     0 |                34 |              0 |

After the pass:

| Pack      | Presets | Critical | High | Medium | Low | Clean | Incomplete Fields | Generic Fields |
| --------- | ------: | -------: | ---: | -----: | --: | ----: | ----------------: | -------------: |
| `pack_17` |      52 |        0 |    0 |      0 |   0 |    52 |                 0 |              0 |

Authoring pattern used:

- Category grammar stays split across dark fantasy realms, hunter gothic/plague courts, acid dungeon
  zines, futuristic medieval rune-tech, apocalyptic wargame/inked dungeon, monochrome
  tarot/bestiary plates, and weird medieval editorial.
- `key_features` now gives each preset a compact differentiator instead of relying on the card image
  or preset name alone.
- `atmosphere_and_mood` now explicitly follows prompt X while preserving the preset's medieval-zine
  identity, instead of remaining as four- or five-word mood labels.
- `creative_brief` states the router contract: prompt X supplies subject, action, setting, tone, and
  intensity; the preset supplies style grammar, material behavior, framing logic, and finish.
- `avoidRules` and `negativePrompt` retain useful existing controls and add protection against
  prompt-literal card reuse, fixed medieval scenes, readable manuscript text, muddy dark texture,
  watermarking, and fake text.

Quality notes:

- The first broad enrichment passed the numeric audit but still produced bad prose in samples:
  `Black-and-white` was split into broken `Black-; -white` fragments, and force-regeneration could
  duplicate generated `creative_brief` and mood text.
- The migration was revised to rebuild `key_features` from base style fields, strip previously
  generated brief tails, rebuild mood from the original seed phrase, and avoid splitting hyphenated
  style terms.
- `SP17-014 Occult Xerox Bestiary` and `SP17-045 Rotten Gold Court Romance` were manually inspected
  after the final force pass because they represented the two failure classes: zine terminology and
  weird-medieval editorial intimacy.
- Current official cards were reviewed as a contact sheet. The sheet is coherent across the seven
  categories, including character, object, creature, tarot/bestiary, zine, and adult editorial
  examples. No card was confirmed misleading enough for replacement in this router pass.

Verification:

```bash
bun run check:fix -- scripts/style-migration/enrich-pack-17-medieval-zine-dna.ts
bun scripts/style-migration/enrich-pack-17-medieval-zine-dna.ts --force
bun run styles:dna:audit -- --pack=pack_17 --min-severity=low --limit=80
bun run styles:scene-lock:audit -- --pack=pack_17 --min-severity=low --limit=80
bun run styles:validate -- --pack=pack_17 --coverage
bun run styles:runtime
```

Card review artifact:

```text
C:\Users\cristian\AppData\Local\Temp\codex-pack17-style-card-contact-sheet.jpg
```

### 2026-07-06 - Final Residual Copy & Negative Prompt Cleanup

A final post-completion pass looked for issues that the DNA and scene-lock auditors can miss:
broken generated punctuation, duplicated `Apply after prompt X` clauses, card/thumbnail language
inside `visualDna`, stale generated runtime text, and duplicated `negativePrompt` terms.

Findings and corrections:

- `pack_03` still had a real card-language leak in the lighting/atmosphere family:
  `vertical style card crop` appeared in `camera_and_composition`, `key_features`, and generated
  runtime chunks. The `pack_03` migration now rewrites that source phrase as `an optional vertical
composition discipline`, then the pack and runtime were regenerated.
- `pack_15` contained many normalized duplicate negative terms caused by hyphen/space variants such
  as `generic-style` versus `generic style` and `excessive-noise` versus `excessive noise`. The
  `pack_15` migration now deduplicates through normalized text before writing `avoidRules` and
  `negativePrompt`.
- The same normalized dedupe guard was added to `pack_05`, `pack_07`, and `pack_16`, then those
  packs were force-regenerated to remove the remaining isolated duplicates.
- A custom static pass over all 1657 manifests then reported zero broken punctuation/card-copy
  residues and zero duplicated negative prompt terms.

Verification:

```bash
bun run check:fix -- scripts/style-migration/enrich-pack-03-cgi-dna.ts
bun scripts/style-migration/enrich-pack-03-cgi-dna.ts --force
bun run check:fix -- scripts/style-migration/enrich-pack-15-punk-spectrum-dna.ts
bun scripts/style-migration/enrich-pack-15-punk-spectrum-dna.ts --force
bun run check:fix -- scripts/style-migration/enrich-pack-05-anime-battle-dna.ts scripts/style-migration/enrich-pack-07-architecture-dna.ts scripts/style-migration/enrich-pack-16-anime-prestige-dna.ts
bun scripts/style-migration/enrich-pack-05-anime-battle-dna.ts --force
bun scripts/style-migration/enrich-pack-07-architecture-dna.ts --force
bun scripts/style-migration/enrich-pack-16-anime-prestige-dna.ts --force
bun run styles:runtime
bun run styles:dna:audit -- --min-severity=low --limit=10
bun run styles:scene-lock:audit -- --min-severity=low --limit=10
bun run styles:verify
bun run check -- scripts/style-migration/enrich-pack-03-cgi-dna.ts scripts/style-migration/enrich-pack-05-anime-battle-dna.ts scripts/style-migration/enrich-pack-07-architecture-dna.ts scripts/style-migration/enrich-pack-15-punk-spectrum-dna.ts scripts/style-migration/enrich-pack-16-anime-prestige-dna.ts components/recipes/styleRuntimeData.generated.ts components/recipes/styleRuntimePacks.generated/pack_03 components/recipes/styleRuntimePacks.generated/pack_05 components/recipes/styleRuntimePacks.generated/pack_07 components/recipes/styleRuntimePacks.generated/pack_15 components/recipes/styleRuntimePacks.generated/pack_16
bun run test
bun run build
```

## Current Global Status

Fresh scan after `pack_09`, `pack_10`, `pack_12`, `pack_01`, `pack_06`, `pack_03`, `pack_04`,
`pack_02`, `pack_11`, `pack_08`, `pack_14`, `pack_16`, `pack_07`, `pack_05`, `pack_15`, and
`pack_13`, and `pack_17`:

| Severity | Count |
| -------- | ----: |
| Critical |     0 |
| High     |     0 |
| Medium   |     0 |
| Low      |     0 |
| Clean    |  1657 |

Scene-lock status is clean across all presets:

| Critical | High | Medium | Low | Clean |
| -------: | ---: | -----: | --: | ----: |
|        0 |    0 |      0 |   0 |  1657 |

Current highest-risk packs:

There are no remaining DNA completeness findings at low-or-higher severity.

Next recommended work is no longer another blind enrichment pass. The stronger next step is a
dedicated visual-card review, where individual thumbnails are judged against the now-clean router
text and replaced only when the card misrepresents the preset.
