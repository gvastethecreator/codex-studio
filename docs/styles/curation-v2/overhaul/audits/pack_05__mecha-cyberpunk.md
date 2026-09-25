# pack_05 :: 2. Mecha & Cyberpunk — audit

Audited 2026-09-25 from the contact sheet (30 primaries + 18 variants) and the full manifests. The category has 30 presets, so none are added.

Review line: kind `mixed`, preserve "mechanical line precision, hard shadows and color separation", validation "a requested plant remains a plant rather than becoming a robot or hangar scene".

## Findings

- **All 30 DNA blocks came from one template.** They are mood words plus a palette ("keep the requested subject … add no X"), and every preset has the same mechanism: "crisp cel shadows, precise contours, restrained accents, controlled glow". None describes how the image is made (which line tool, cel or airbrush, what light effect, what print or lens process). This is why the cards look like one generic dark digital anime look.
- **Names:** none contain a franchise, studio or person title. "Tokusatsu" is a genre term, like "noir", so it stays. No renames and no aliases.
- **Franchise names in DNA:** five inherited avoid rules named franchises (`Gurren-like drill face`, `Psycho-Pass-specific weapon/device`, `Gundam-like faceplate`, `Eva-like giant`, `Darling-like couple pose`). They are removed with `dropAvoid` and replaced by descriptive negatives (drill-faced super robot copy, enforcement pistol copy, V-fin horned faceplate copy, purple horned giant copy, piloting couple pose copy).
- **Card defects:**

| Preset                                           | Defect                                                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| SP05-238                                         | Primary shows a white-blue-red V-fin hero robot close to a well-known franchise design (likeness) |
| SP05-222                                         | Tram and overhead catenary (trope)                                                                |
| SP05-052, 058, 059, 232                          | Photoreal office / control room / military drone photo, not anime at all                          |
| SP05-223, 235                                    | Plastic 3D CG render (chrome suit, showroom car)                                                  |
| SP05-054-01, 057-01, 060-01, 228-01              | Same white-haired young woman in white armor or robes, repeated                                   |
| SP05-051-01, 052-01, 055-01, 058-01, 059-01, 229 | Repeated dark-haired brooding figure in cyber gear, generic                                       |
| SP05-230, 226                                    | Near-empty dark frames; the subject barely reads as a thumbnail                                   |
| SP05-233                                         | Cockpit-with-Earth cliché that the avoid rules already forbid                                     |

## Changes

- **DNA rewritten for all 30** (version bump), each tied to one concrete anime production or print mechanism so that neighbours separate:
  - 056 triangular brush-pen limited-animation cel
  - 222 late-80s procedural OVA cel with poster-color daylight
  - 224 hairline 3D-layout lines with white bloom
  - 228 colored-pencil bleached pastel on paper grain
  - 236 early-80s real-robot TV cel with sponge dirt and black shadow fills
  - 238 worm's-eye telephoto giant scale with grid-line contours
  - 240 lineless triangular color facets
  - 051 tracking-pan blur and RGB split
  - 052 scanline duotone feed with bracket marks
  - 054 backlit-cel glow lines with halation
  - 055 flat color-field silhouettes with G-pen hatching
  - 057 diffusion bloom and flare ghosts
  - 058 shallow depth of field and lifted-black grade
  - 059 stacked translucent planes and optical-camouflage refraction
  - 060 polygon-shard specular highlights
  - 221 80s airbrush sky with looping vapor ribbons
  - 223 airbrushed chrome banding
  - 225 rough key drawing with blue pencil and smear frames
  - 226 copperplate burin hatching with a crimson spot color
  - 229 two-color risograph over screentone
  - 230 ruled pen and ink-wash plate
  - 231 self-luminous fluorescent linework
  - 232 stacked haze cels with 16 mm grain
  - 233 hard-vacuum zero-fill light
  - 234 phosphor vector wireframe
  - 235 Y2K jelly gloss with pixel dither
  - 237 flat-brush backlit key art
  - 239 90s rainbow airbrush with holo sparkle
  - 227 fine-liner tangles over rust watercolor
  - 053 gouache model-kit box art
- `subject_treatment` is one shared const that states the review rule: a plant, animal, object or person keeps its identity and is never turned into a robot, hangar or battle. SP05-238 is the one exception: it states that it owns a low telephoto giant-scale camera.
- `dropAvoid` also removes `muddy noisy darks` on SP05-052 (sensor noise) and SP05-229 (toner grit), because grit in the darks is the technique there.
- **90 new briefs**, with no subject repeated. Mecha and characters are original, and every human is an adult. At least one brief per preset proves the validation rule (a sunflower, bonsai, owl, fox, heron, lily, dandelions, koi, snow leopard, swallows, black swan, goat, thistle, bull terrier, fern, stag, rhinoceros, whale, chameleon, horse, otter, crow, plus ordinary objects such as a kettle, canister, pump and jacket). No trams, buses, bicycles, umbrellas, wet markets or lighthouses.
- **Overlaps checked:** the risograph, engraving, vector-wireframe, chrome and bokeh techniques also exist as presets in other packs (Risograph Print, Copperplate Burin Engraving, Vectrex Vector Display, Chrome & Metal, Bokeh). The versions here are anime cel renderings with their own palette and mecha vocabulary. They keep their original names and are not new presets.

## Pending (local session)

- Generate the `--card-set` for all 30. Regenerate SP05-238 first (likeness), then the photoreal and 3D cards (052, 058, 059, 232, 223, 235).
- Check that the mechanisms are visible in the cards, especially the subtle ones: 054 backlit-cel halation versus 237 painted rim light; 226 engraving versus 227 fine-liner tangles; 221 versus 239 airbrush skies.
- Check that the plant, animal and object briefs stay non-mechanical.
