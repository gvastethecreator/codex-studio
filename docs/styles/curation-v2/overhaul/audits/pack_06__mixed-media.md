# pack_06 :: 5. Mixed Media — audit

Audited 2026-09-25 from the contact sheet (20 primaries) and full manifests. The category already has 20 presets; none added.

## Findings

- All 20 DNA blocks were the art-medium router template ("acts as a transferable art-medium router … layered material collision, visible joins …"), with legacy tags pasted into each field (`Invisible`, `Torn edges`, `Flat`, `Varied`). Every field also carried the same shared list (collage cuts, thread, tape, smoke, coffee stain, gilding, marbling, stencil bridges), so every preset asked for every medium at once.
- **The cards collapsed into one look**: beige torn paper, red tape strips and gold flecks on all 20, whatever the medium. Embroidery on Photo shows no thread, Fumage shows apples with no soot, Stencil Art shows a painted hiker, Tape Art shows no tape.
- The category review rule (a stitched effect must not replace clothing or anatomy) was not stated anywhere.
- Photo-based presets fought their own negatives: Photomontage carried `photo`, `realistic`, `photorealistic`; Embroidery on Photo and Paint over Photo carried `realistic`, `photorealistic`.
- Zine Aesthetic carried `noise` although toner speckle is its texture.

| Preset                       | Card defect                                                |
| ---------------------------- | ---------------------------------------------------------- |
| SP06-061 Cut-Paper Collage   | lantern alley, same beige collage as the rest              |
| SP06-062 Photomontage        | hiker and golden retriever, collage not a seamless montage |
| SP06-063 Decoupage           | tree in a plaza, no varnish or painted object ground       |
| SP06-064 Assemblage          | lighthouse (trope), no found objects                       |
| SP06-065 Scrapbook           | bearded woodcarver (trope), no page layout                 |
| SP06-066 Trash Polka         | cyclist and bicycle (trope)                                |
| SP06-067 Mixed Media Canvas  | hand holding a pear, acceptable texture                    |
| SP06-068 Zine                | sea cliff in grey, no photocopy marks                      |
| SP06-069 Moodboard           | gardener in a painting, no board or swatches               |
| SP06-070 Planning Board      | kite landscape, no cork, pins or thread                    |
| SP06-071 Torn Paper Mosaic   | mountain stream, scraps too large to read as mosaic        |
| SP06-072 Tape Art            | bearded guitarist, no tape                                 |
| SP06-073 Embroidery on Photo | butterfly, no stitches                                     |
| SP06-074 Paint over Photo    | tram in a wet street (trope)                               |
| SP06-075 Digital Collage     | runner at sunset, looks like the physical collages         |
| SP06-076 Fumage              | bowl of apples, no soot plumes                             |
| SP06-077 Coffee Painting     | lake at dawn, acceptable browns                            |
| SP06-078 Gold Leaf           | bearded bike mechanic and wheel (two tropes)               |
| SP06-079 Paper Marbling      | lantern alley repeated from SP06-061                       |
| SP06-080 Stencil Art         | hiker and dog repeated from SP06-062                       |

## Changes

- DNA rewritten for all 20 (version 2). Contract as a shared const: media keep subject, pose, action and camera and put the material on the image surface, never replacing clothing, skin or anatomy. Scrapbook, Moodboard and Planning Board are declared layout profiles. Embroidery on Photo states the review rule explicitly (thread over the print, garments and skin stay photographic).
- Each preset now has a single mechanism that separates it from its neighbors: scissor-cut printed fragments (Cut-Paper Collage), torn fingernail-sized tesserae (Torn Paper Mosaic), hard masks and duotone maps (Digital Collage), invisible seams and matched light (Photomontage), motifs sanded flush under amber varnish (Decoupage), relief salvage in raking light (Assemblage), candle soot plus eraser lifts (Fumage), coffee dilutions and tide lines (Coffee), leaf on red bole with punched tooling (Gold Leaf), stylus-combed floated pigment (Marbling).
- Overlaps checked: Stencil Art is now multi-layer tonal studio stencil, distinct from SP04-078 Street Protest Stencil (single ink, wall, message). Zine Aesthetic is a drawn-plus-copied page, distinct from SP02-099 Punk Zine Cut-and-Paste (collage). Gold Leaf Art is the water-gilded panel technique, distinct from the gold leaf material presets SP08-075 and SP09-019. Digital Collage is separated from SP22-202 Analog Photocollage by its hard masks and duotones.
- `dropAvoid`: `photo`/`realistic`/`photorealistic` on Photomontage, `realistic`/`photorealistic` on the two photo-overlay presets, `noise` on Zine. New shared negatives stop the uniform beige wash and default red tape.
- No renames: no name contains a person, franchise or brand, and none duplicates another preset.
- 60 new briefs, no repeated subject; none uses lanterns, hikers with dogs, lighthouses, trams, bicycles or bearded craftsmen.

## Pending (local session)

- Generate the 3-card sets and confirm the cards no longer share the beige collage look.
- Check that Embroidery on Photo and Paint over Photo cards keep a visible photographic base, and that the dancer card keeps her leotard photographic.
