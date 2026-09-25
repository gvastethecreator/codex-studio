# pack_04 :: 3. Editorial And Poster — audit

Audited 2026-09-25 from the contact sheet (17 primaries + 19 variants) and full manifests. The category had 17 presets; 3 are added.

## Findings

- All 17 DNA blocks were the router template ("acts as a transferable illustration router", "use color as communication pressure …"), and several asked for typography ("command-tone typography", "serif titling", "masthead-safe title zone", "bottom title-lockup zone", "swirling typographic masses"). That goes against the review rule: an image treatment does not invent slogans, frames or a poster layout.
- The category mixes pure print treatments (Risograph, Minimalist Vector, Dada Collage, Stencil) with poster profiles that own a composition. The template did not tell them apart.
- SP04-032 had a real artist in its name (Mucha).
- SP04-040 inherited the negative `art`, which works against an illustrated infographic.

| Preset                      | Card defects                                                                  |
| --------------------------- | ----------------------------------------------------------------------------- |
| SP04-031                    | Variant is a horned caped figure close to a known film villain.               |
| SP04-032                    | Two near-identical long-haired women with flowers.                            |
| SP04-034                    | Primary shows a long-haired rock band on stage (real-musician likeness risk). |
| SP04-035                    | Lighthouse (trope).                                                           |
| SP04-039                    | Three of four cards reuse the same black eclipse motif.                       |
| SP04-040                    | Variant is a dashboard of charts and icons (UI).                              |
| SP04-044                    | Primary has an empty title plate at the bottom.                               |
| SP04-045                    | Fake letterforms across the top.                                              |
| SP04-078                    | Crowd holding blank protest placards; a slogan layout without text.           |
| SP04-038-01, 039-01, 045-01 | Caped fantasy wanderers repeated across presets.                              |

## Changes

- DNA rewritten for all 17 (version 2). Treatments (SP04-015, 035, 036, 078 and the new Op-Ed spot) share a `subject_treatment` that keeps subject, setting and framing and adds no slogans, borders, frames or layout, plus negatives against poster borders and title zones.
- Poster profiles (Art Deco, Art Nouveau, Constructivist, Psychedelic, Bauhaus, Park, Painted One-Sheet, Infographic, Album Cover, Pulp Cover, Travel, Gig Print, and the new Painterly Metaphor and Swiss Grid) say which composition they own. They never add lettering or empty title plates. Title bands, mastheads, blurbs and credits were removed from the DNA.
- SP04-041 Fashion Illustration openly states its nine-heads-tall elongation. SP04-033 bans real leaders and national emblems. SP04-034 bans stage bands. SP04-039 bans the eclipse motif.
- Renamed: SP04-032 **Art Nouveau Halo Lithograph** (old name kept as an alias). Negatives dropped: `art` on SP04-040 and `photo` on SP04-042 (its surreal covers are photographic).
- New presets: **Painterly Metaphor Poster** (one painted visual pun), **Op-Ed Conceptual Spot Illustration** (tiny figures and huge symbols, grainy flats), **Swiss Grid Photo Poster** (black-and-white photo crop on a strict grid). A grep found no visual-metaphor, op-ed or Swiss-grid preset. Constructivism (SP10-003) and Soviet Constructivist (SP07-030) exist elsewhere as general styles; SP04-033 stays the poster profile.
- 60 briefs with no repeated subject, no lighthouses, placards, stage bands or eclipses.

## Pending (local session)

- Generate the cards. Check that no poster card adds letterforms, title bands or empty plates, and that treatment cards keep the requested framing without a border.
