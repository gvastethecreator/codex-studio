# pack_05 :: 1. Modern Shonen & Action — audit

Audited 2026-09-25 from the contact sheet (40 primaries and 41 variants) and the full manifests. The category already has 40 presets, so no new presets were added.

Review rule (`validation`): an ordinary quiet activity keeps its action and location under the drawing style.

## Findings

- **All 40 DNA blocks used the same slot template.** Each field was one sentence pattern with different words filled in ("Build the graphic anime treatment from … Let … set its rhythm", "Treat lighting graphically: …", "Within the requested camera and crop …"). The drawing mechanics were abstract ("tight oscillations that gather, curve, and release"), so neighboring presets could not be told apart.
- **24 names were anime titles** (for example Demon Slayer, Attack on Titan, One-Punch Man, Chainsaw Man, Bleach, Solo Leveling and Samurai Champloo). **Three more names pointed at a franchise costume or title**: Bright Hero Academy, Headband Ninja Journey and Grand Pirate Adventure. The cards for these three show a forehead-plate ninja, a straw-hat pirate in a red vest and a hero-academy boy.
- **Near-duplicate pairs came from the same source show:** Impact Frame Comedy Hero and One-Punch Man; Psychedelic Psychic Minimalism and Mob Psycho; Painterly Blade Fantasy and Demon Slayer; Chaotic Splatter Action and Chainsaw Man; Lo-Fi Sword Roadtrip and Samurai Champloo; Urban Spirit Blade and Bleach TYBW; Kagurabachi and Darker than Black (two neon-rain noirs). Three presets were close to Attack on Titan: Gritty Wallbound Survival, Colossal War Drama and the titled preset.
- **Cards:** most of the 81 tiles show the same dark-haired teen boy in a jacket. Many cards are night, rain or rubble scenes. There is a bicycle in SP05-028, and a soccer player with a ball in SP05-124 (its negatives forbid a ball close-up). SP05-038 is almost blank. No card shows a quiet everyday activity, even though the review rule requires one.
- The briefs were missing for 39 presets. Only SP05-039 had one, and it used hikers with a map.

## Changes

- **DNA rewritten for all 40** (all eight fields and `key_features`). Each preset now names one mechanism that sets it apart:
  - crosshatched cel shadows
  - deadpan filigree against brick-square forms
  - a single snapped smear
  - ink-smoke ribbons
  - facial stress lines at a vertical scale
  - painted war backgrounds with grain
  - a wobbling aura outline
  - woodblock-print effect trails
  - ultramarine eye-light trails
  - partial negative inversion
  - worm's-eye views into the sky
  - glass-shard halftone
  - etched gold lightning
  - sumi black with one neon edge
  - crosshatched giant-scale forms
  - pale spell-ring geometry
  - an impact frame
  - dual detail levels
  - airbrushed manhwa glow
  - composited volumetric effects
  - white-core flames
  - hi-vis civic equipment
  - acid smear frames
  - poison-flower etching
  - pencil minimalism
  - paint-on-glass smears
  - chalk schematics
  - an ink-wash brush
  - a screen-print poster
  - a muted handheld film grade
  - gothic chiaroscuro
  - a jazz-age ensemble
  - sakuga smears
  - fashion-plate elongation
  - rubbery anatomy
  - road-movie dry brush
  - indie panel collage
  - tropical sweat and haze
  - a false starfield noir
  - record-scratch stutter outlines
- **Duplicate pairs separated.** Impact frame (037) is kept apart from dual-detail satire (129). Minimal pencil (038) is kept apart from paint-on-glass (130). Wet ink-wash (031) is kept apart from printed effect trails (121). Screen-print poster (033) is kept apart from muted cinematic grime (122). Dry-brush road movie (028) is kept apart from record-scratch stutter (144). Fashion-plate negative space (022) is kept apart from inverted negative ink (128). Sumi black with a neon edge (138) is kept apart from the starfield noir (143). Of the three presets close to Attack on Titan, vertical stress lines (035), a painted war grade (036) and crosshatched giant scale (139) now each hold a different mechanism.
- A shared `subject_treatment` states the review rule: the prompt's action and location stay as written, and effect marks attach only to motion that is already there. The third brief of every preset is an ordinary quiet task (baker, tailor, laundromat, cobbler, potter and others). It proves that no fight, weapon or power effect is added.
- **27 renames to the mechanism.** The IDs are unchanged and the old names are in `aliases`:
  - Crosshatched Primary Hero Cel
  - Deadpan Filigree Brick Comedy
  - Fluorescent Everyday Snap Action
  - Printed-Wave Effect Trail Cel
  - Ultramarine Glare Foreshortening
  - Inverted Negative Ink Opera
  - Sky-Blue Low-Angle Brawler Cel
  - Broken-Rule Halftone Shatter
  - Etched Branch-Lightning Cel
  - Sumi-Black Neon Edge Stillness
  - Crosshatched Giant-Scale Panic
  - Pale Calm Spell Geometry
  - Dual-Detail Deadpan Satire
  - Full-Color Manhwa Shadow Glow
  - White-Core Flame Halo Cel
  - Hazard-Orange Monster Response Cel
  - Acid Occult Color-Burst Smear
  - Toxic Flower Etched Ink
  - Paint-on-Glass Surge Burst
  - Chalk-Schematic Inventor Cel
  - Muted Cinematic Grime Frenzy
  - Amber Jazz-Age Ensemble Cel
  - Teal-Orange Sakuga Smear
  - Elastic Big-Grin Adventure Cel
  - Humid Tropic Grit Cel
  - Cold Starfield Night Noir
  - Record-Scratch Stutter Swagger
- **Negatives.** A shared set blocks franchise likeness, costumes, emblems and signature weapons, the generic spiky-haired teen, and fights added to quiet prompts. Presets also block their own franchise cues: forehead-plate headband, straw hat with red vest, checkered haori, goldfish spirits, bald caped hero, red-apple motif and others. The inherited negatives were kept. SP05-122 now says "sober adult proportions" so it does not fight the inherited `realistic` negative.
- **120 briefs**, with no subject repeated. They use original adult characters, many of them in dark medieval settings (portcullis guardian, abbey exorcist, plague doctor in poison orchids, necromancer queen, stone golem). Every brief names the preset's own marks. There are no trams, buses, bicycles, umbrellas or wet markets, no franchise costumes, and no weapons where a preset's negatives forbid them.
- **Overlaps checked** against the repo names: Ukiyo-e Woodblock Anime, Sumi-e Impact Brushstroke, Webtoon Style, Deadpan-Explosion Absurd Timing and Halftone Pop Manga. 121 changes only its effect trails, not the whole image, and 132 is a full-color airbrushed painting rather than panel pacing. The lint check reports no name clash.

## Pending (local session)

- Generate the 3-card sets. Check that no card still shows a franchise protagonist, and that the repeated dark-haired teen boy is gone.
- Check that the quiet third brief of each preset stays calm, with no aura, smoke, lightning or impact graphic leaking in.
- SP05-121 and SP05-031 both draw on Japanese print and brush traditions. SP05-138 and SP05-143 are both dark night noirs. Compare their cards side by side before accepting them.
