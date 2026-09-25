# pack_02 :: 3. Animation Styles — audit

Audited 2026-09-25 from the contact sheet (15 primaries) and full manifests.

## Category-wide defects

- All 15 DNA blocks were the router template ("animation pipeline grammar, cel or puppet surface, shape acting …").
- **Nine preset names were studio or franchise names** (Classic Disney, Studio Ghibli, Pixar, Laika, Looney Tunes Chuck Jones, Fleischer, Spider-Verse, UPA, South Park), and the DNA cited more ("Snow White style", "Miyazaki", "Sailor Moon/Eva", "A Scanner Darkly", "Newgrounds", "Loving Vincent"). The card generator writes `preset.name` into every card prompt, and the cards show the result.
- **Card likeness violations**: SP02-036 shows mouse-like and cat-like studio mascots; SP02-040 shows a character in a well-known cutout show's design.
- Tropes: road cyclist on SP02-041, bicycle on SP02-040.
- The review rule (a non-character subject keeps its identity without a studio-like cast) was not stated anywhere.

## Changes

- DNA rewritten for all 15 (version 2). Each describes its medium: multiplane cels over gouache, painted landscapes with small cel figures, rounded CG with subsurface glow, replacement-face stop-motion, smear frames, rubber-hose limbs and pie-cut eyes, halftone over 3D, flat mid-century geometry, construction-paper pieces, traced line boil, folded paper, tweened vectors, frame-by-frame impasto, indexed pixel sprites. `subject_treatment` says the subject is redrawn in the medium and no studio cast or mascot is added.
- Renamed (IDs unchanged): SP02-031 **Golden Age Multiplane Cel Feature**, SP02-032 **Painterly Nature Anime Feature**, SP02-033 **Family Feature CG Animation**, SP02-034 **Moody Miniature Stop-Motion**, SP02-035 **Golden Age Slapstick Cartoon**, SP02-036 **1930s Rubber Hose Cartoon**, SP02-038 **Comic Offset 3D Animation**, SP02-039 **Mid-Century Modernist Animation**, SP02-040 **Construction Paper Cutout Cartoon**. The old names remain in `styleAnchors` for search.
- 3 new briefs per preset with original characters only.
- New presets (pending cards): Shadow-Puppet Silhouette Animation, Pinscreen Animation, Charcoal Erasure Animation, 70s Limited TV Animation, Direct-on-Film Scratch Animation. Category now 20. Claymation already exists elsewhere, so it was not added.

## Pending (local session)

- Regenerate SP02-036 and SP02-040 first (likeness violations).
