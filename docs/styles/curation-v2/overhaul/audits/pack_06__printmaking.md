# pack_06 :: 3. Printmaking — audit

Audited 2026-09-25 from the contact sheet (15 primaries) and full manifests. Category kind `style`. The review rule is "blind comparisons must distinguish the process without requiring a particular scene". The review notes that print families recur in packs 04, 10, 11 and 17.

## Findings

- All 15 DNA blocks were the router template; each process was described only by tags ("Plate mark", "Gouge marks", "Grainy texture"), so etching, drypoint, aquatint and mezzotint could not be told apart.
- Four names exactly duplicate pack_04 presets: Monotype (SP04-067), Aquatint (SP04-071), Mezzotint (SP04-070), Rubber Stamp (SP04-069).
- Cards reuse the same subject set as the painting and drawing categories: bearded bike mechanic (Etching), lantern alley (Woodcut), hiker with dog (Linocut), lighthouse (Screenprint), bearded woodcarver (Monotype), cyclist (Aquatint), pear in hand (Mezzotint), fjord with sailboat (Risograph), gardener (Cyanotype), kite (Rubber Stamp), bridge landscape (Halftone), bearded guitarist (Security Engraving), tram (Collagraph).
- Process fidelity on cards: Halftone shows no visible dots, Lithography looks like a pencil drawing, and Collagraph reads as a digital collage.

## Changes

- DNA rewritten for all 15 (version 2). The shared `subject_treatment` states the review rule: ink transfer, plate or block marks, registration and paper identify the process, with no scene required. Each process now names its physical tell: bite depth and plate tone (etching), wood grain in solid blacks (woodcut), flowing grainless cuts (linocut), stone grain and reticulated tusche (lithography), overprints and misregistration (screenprint), rag-wiped lights (monotype), stepped rosin-grain tone (aquatint), burnished rocker-ground black (mezzotint), fluorescent dither (riso), photogram halos on Prussian blue (cyanotype), patchy tilted repeats (stamp), 65–85 line dot gain (halftone), guilloche and swelling burin lines (security), burr halos (drypoint), and embossed sand and fabric (collagraph).
- Renamed 4 (aliases in spec): Monotype → Glass-Plate Monotype, Aquatint → Rosin-Grain Aquatint, Mezzotint → Rocker-Ground Mezzotint, Rubber Stamp → Carved Rubber Stamp.
- `dropAvoid`: `noise` on Aquatint, Mezzotint and Risograph (grain is the process); `blurry` on Monotype.
- 3 new briefs per preset (60), no repeated subject. Halftone, Security Engraving and Stamp briefs exclude headlines, numbers and stamp text.
- New presets (pending cards): End-Grain Wood Engraving, Reduction Linocut, Chine-Collé Etching, Carborundum Print, Pochoir Hand Stencil. Category now 20. Skipped because they already exist: Soft Ground Crayon Etching, Chiaroscuro Tone Block Woodcut, Copperplate Burin Engraving, Letterpress, Mimeograph Violet Ditto Zine, Crayon Rubbing Frottage, Stencil Art.

## Pending (local session)

- Generate cards; check that Etching, Drypoint, Aquatint and Mezzotint are distinguishable side by side.
- Family overlap with pack_04 (Etching (Engraving), Linocut Print, Lithograph, Screenprint (Serigraph), Cyanotype (Blueprint)) and pack_20 (Monotype Wipe, Mezzotint Velvet, Collagraph Plate, Cyanotype Contact) remains. Decide later whether pack_06 keeps the neutral baseline of each process.
