# pack_02 :: 6. Caricature And Cartoon Styles — audit

Audited 2026-09-25 from the contact sheet (33 primaries + 27 variants) and full manifests. The category already has 33 presets.

## Findings

- The DNA was already authored in an earlier review (drawing mechanics separated from named casts and gags) and is specific; it was **kept unchanged**.
- **17 preset names were TV show titles or a real person** (Ren & Stimpy, Smiling Friends, Aaahh!!! Real Monsters, Rugrats, Ed, Edd n Eddy, Rocko's Modern Life, Courage the Cowardly Dog, Cow and Chicken, CatDog, SpongeBob, Beavis and Butt-Head, Mike Judge, The Oblongs, Dr. Katz/Squigglevision, Doug, Angela Anaconda, Garbage Pail). The card generator writes `preset.name` into every card prompt, so these names asked for the shows' casts.
- Cards are varied and mostly good, but four show near-identical green slime monsters (SP02-103-01, SP02-119, SP02-119-01, SP02-120), and SP02-083 and SP02-085 use generic young-woman faces.
- 38 scene-lock findings (`router_weakness` in `creative_brief`) pre-date this pass and belong to the authored DNA; they are not changed here.

## Changes

- Renamed 17 presets to their mechanism (IDs unchanged, old names kept as `styleAnchors` search aliases): Veiny Close-Up Grossout, Flat Weird Dayjob Chaos, Sewer Grotesque Monster Cartoon, Toddler Crayon Panic Cartoon, Vibrating Scam Comedy Cartoon, Beige Suburban Anxiety Cartoon, Rural Nightmare Pastel Cartoon, Loud Primary Derangement Cartoon, Shared-Body Elastic Nonsense, Gross-Up Freeze Frame, Dumb Couch Slouch Cartoon, Office Boredom Sketch, Toxic Suburb Family Cartoon, Squiggle-Line Therapy Doodle, Notebook Anxiety Cartoon, Photo-Cutout Menace Cartoon, Crash Zoom Sticker-Card Caricature.
- 3 new briefs per preset (99 total), each naming the preset's own marks (crosshatching, Ben-Day dots, marker bleed, boiled ink, squiggle drift …). Several use household objects (teakettle, toaster, houseplant, alarm clock, lunchbox) per the review validation. Only SP02-119 keeps a slime monster; Political Satire uses invented figures and symbols, never real politicians. Toddler Crayon Panic is the one preset whose identity needs children; its briefs are wholesome.

## Pending (local session)

- Generate cards; confirm no card resembles a show's characters now that the names are gone.
- Optional follow-up: add transfer wording to the `creative_brief` of these authored presets to clear the pre-existing scene-lock findings.
