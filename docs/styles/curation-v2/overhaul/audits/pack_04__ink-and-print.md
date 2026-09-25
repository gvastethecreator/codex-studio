# pack_04 :: 5. Ink And Print — audit

Audited 2026-09-25 from the contact sheet (20 primaries + 22 variants) and full manifests. The category already has 20 presets, so none were added.

## Findings

- All 20 DNA blocks were the router template ("acts as a transferable illustration router"). They listed tags ("Hatching, crosshatching, fine-line density") but not how each mark is made.
- The review rule (one neutral subject must look different in linocut, etching and scratchboard) was not stated. The linocut and etching cards are both calm lakeside scenes with similar hatching.
- Card tropes: a tram in SP04-023 and SP04-077, a bicycle in SP04-066, a lone cloaked figure in SP04-074-01, and a bearded dock worker in SP04-072.
- Five cards show a generic dark-haired printmaker holding her own plate or print (061-01, 062-01, 067-01, 080-01, 080-02).
- SP04-076 Graffiti (Tag) rendered a 3D chrome creature instead of spray handstyle. SP04-079 shows letter-like glyphs close to readable text.
- SP04-063 was named after a real artist (Hokusai).
- Four names duplicated pack_06 Printmaking presets: Monotype (SP06-036), Aquatint (SP06-037), Mezzotint (SP06-038) and Rubber Stamp (SP06-041). Scratchboard and Ballpoint Pen also duplicated pack_06 Drawing & Sketching, but that category's spec already renames its copies, so these two keep their names here.
- SP04-068 Cyanotype (Blueprint) overlapped the photographic Cyanotype in pack_02 Photography Eras.

## Changes

- DNA rewritten for all 20 (8 fields + key features). One shared contract redraws the subject with the process's own physical mark. Each preset names that mark:
  - linocut: V/U gouge strokes and a speckled ink roll
  - etching: needled, acid-bitten lines with a platemark
  - scratchboard: white lines scraped out of black
  - mezzotint: rocker ground burnished to light
  - aquatint: rosin grain and spit-bite pools
  - lithograph: greasy crayon on stone grain
  - stipple: dots only
  - trace monotype: stylus lines with hand-pressure ghosts
- Renamed, with old names kept as aliases:
  - SP04-063 **Floating World Woodblock** (real person removed)
  - SP04-067 **Trace Monotype**
  - SP04-069 **Carved Eraser Stamp**, redefined as hand-carved repeat stamps, not an office stamp
  - SP04-070 **Rocked-Plate Mezzotint**
  - SP04-071 **Spit-Bite Aquatint**
- SP04-068 is now a white-line sun print from a hand-inked negative plus photograms, not a blue-toned photograph.
- SP04-076 is a single continuous spray line on a real wall. SP04-077 builds the subject from wildstyle arrows and bevels. SP04-079 builds it from blackletter strokes. All three forbid readable letters.
- `dropAvoid` removes `perfect` and `clean` on the stamp preset. A new category negative forbids a printmaker holding a plate or print.
- 60 new briefs with no subject repeated. None show a printmaker with a plate, a tram, a bicycle or a cliff wanderer, and each names the mark, ink and paper.

## Pending (local session)

- Generate cards. Run the review validation by hand: one neutral object (for example a pear) through linocut, etching and scratchboard. This is a comparison test, not a card slot.
- Check that the graffiti and blackletter cards contain no readable letters.
- If the pack_06 Printmaking agent renames its Monotype, Aquatint, Mezzotint or Rubber Stamp, check that the new names do not collide with these.
