# pack_03 :: 5. Hard Surface And Product CGI — audit

Audited 2026-09-25 from the contact sheet (11 primaries + 11 variants) and full manifests. Review rule: a hero product image must not become a multi-view asset sheet unless the prompt asks for one.

## Findings

- All 11 DNA blocks were the router template ("acts as a transferable CGI-style router", "Lookdev camera for …"). Every field repeated the same shared tail (bevel logic, studio strips, packshot discipline), so the presets were hard to tell apart in text.
- The review rule was not stated anywhere. The card for SP03-046-01 shows the drift: a hero prop with a row of material balls and blocks under it. The Glassmorphism cards show fake UI rows and toggles.
- Brand, person and franchise leaks in DNA: "Apple flagship product launch" (Product Render), "Deus Ex" (Cybernetic Implant), "Marmoset" (Game Asset).
- Several presets overlap others in the library: Product Render with SP03-007 KeyShot Product Studio and SP01-082 Seamless Packshot, Architectural Visualization with SP03-006 V-Ray ArchViz, and Automotive Render with SP01-066 Automotive Photography.
- SP03-067 "Cybernetic Implant" has the same name as SP08-041 (costume pack).

| Preset                  | Card defect                                                                                   |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| SP03-025 Kitbash        | Primary is a generic pair of headphones, nearly the same as the SP03-061 primary.             |
| SP03-046 Game Asset     | Primary is a plain sneaker. The variant adds a material swatch row (reads as an asset sheet). |
| SP03-047 Arch Viz       | Loft interior looks the same as the V-Ray ArchViz output.                                     |
| SP03-048 Product Render | Generic speaker on grey.                                                                      |
| SP03-052 Automotive     | Generic hatchback. Fine as a test of the technique, but not memorable.                        |
| SP03-053 Jewelry        | Hoop earrings, generic.                                                                       |
| SP03-061 Hard Surface   | Headphones again.                                                                             |
| SP03-064 Exploded View  | Sneaker again. The variant scatters organic parts instead of following one assembly axis.     |
| SP03-067 Implant        | The variant is a generic handsome man portrait.                                               |
| SP03-071 Glassmorphism  | Settings UI with fake rows and toggles.                                                       |
| SP03-074 Neon Sign      | Diner facade, and the wet-street trope.                                                       |

## Changes

- DNA rewritten for all 11 (version 2), using three shared contracts. `rebuild` is for media such as Kitbash, Hard Surface, Neon and the new builds. `profile(...)` is for presets that own a format: Game Asset single-asset stage, competition exterior, launch reveal, automotive studio, jewelry macro, exploded axis, glass UI and section plane. `change(...)` is for declared construction changes. Every contract carries the no-asset-sheet rule, and `multi-view asset sheet` is in the shared avoid list.
- Separated near-duplicates:
  - Product Render now owns the dark launch-reveal stage (strip-light edge tracing, black mirror floor). KeyShot keeps the gradient-backdrop studio and Seamless Packshot keeps the white cove.
  - Architectural Visualization is now the eye-level design-competition exterior (planted foreground, ghosted entourage). V-Ray keeps daylight interiors, and SP01-114 keeps blue-hour photography.
  - Automotive Render is a CG studio under an overhead light canopy, with no rolling shots. Those stay with the photography preset.
  - Glassmorphism is stated to be distinct from Clay UI (frosted panes vs extruded matte clay), and all controls stay blank.
- Renamed SP03-067 "Cybernetic Implant" to **Flush-Seam Cyber Implant** because the name was duplicated (alias added). The implant is now declared as a design change that follows anatomical lines, with no gore and no full robot body.
- Removed the brand and person references from the DNA.
- 3 new briefs per preset. There are 60 distinct subjects, each built around one striking object (siege tortoise, reliquary box, war chariot, serpent ring, vault door, bell section, and so on), with the technique named in every brief. Each profile preset has at least one modern object (earbuds, camera lens, pressure cooker, drone).
- New presets (pending cards): Half-Section Engineering Cutaway, Curvature Wear Hero Prop, Horology Macro Render, Milled Design Clay Buck, Clear-Shell Electronics Render, Riveted Sheet-Metal Build, CNC Billet-Machined Render, Streamline Enamel Appliance, Generative-Design Lattice Part. Category now 20.
- Overlaps checked and skipped:
  - Architecture Massing Model (SP04-091) and Architectural Twilight Exterior (SP01-114) already exist.
  - Toy-Scale Sectional Cutaway (SP07-074) is a toy diorama, so the engineering section is kept distinct from it.
  - Transparent Plastic (SP08-059) is clothing. Clear-Shell Electronics covers housings.
  - Plastic (Injection Molded) (SP09-026) is a material, not a product format.

## Pending (local session)

- Generate the cards. Check that Game Asset and Exploded View stay single hero images with no swatch rows or extra views.
- Check that Glassmorphism, Neon Sign and Clear-Shell stay free of text and numbers.
- Check that Cyber Implant cards stay non-gory.
