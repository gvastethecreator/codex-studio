# pack_03 :: 7. Environment And Worldbuilding — audit

Audited 2026-09-25 from the contact sheet (9 primaries + 9 variants) and full manifests. Review rule: kind `theme`; a retained environment direction is labeled as such, and portable variants preserve the user's location.

## Findings

- All 9 DNA blocks were the "acts as a transferable CGI-style router" template, with the shared filler list ("modular kits, photogrammetry scan grain, terrain relief, vegetation glow, pyro volume…") in every field.
- No preset said whether it supplies a world or keeps the user's location, which is what the review rule asks for.
- Brand and franchise names in active fields: "Blade Runner" (SP03-033), "Avatar/Pandora" (SP03-039), "Oculus" (SP03-055), "Quixel Megascans" (SP03-068), "Houdini" (SP03-069).
- Inherited negatives contradicted the briefs: `subject`/`object` on Abstract Background (a subject may sit in front of it) and `fantasy`/`magic` on Scientific Visualization (a fantasy subject can still be visualized).

| Preset                            | Card defect                                                                       |
| --------------------------------- | --------------------------------------------------------------------------------- |
| SP03-033 Neon City (Cyberpunk)    | wet night market street with a crowd (trope); variant is a lookdev board with UI  |
| SP03-039 Bioluminescent Forest    | film-coded alien forest with a lone backpacker                                    |
| SP03-055 VR Environment           | shows VR controllers, generic sci-fi hub                                          |
| SP03-056 Scientific Visualization | harbor with a lighthouse-like pier and a rainbow overlay; variant is a protein UI |
| SP03-060 Environment Design       | generic park lake and city skyline at sunset; nothing designed                    |
| SP03-063 3D Map                   | acceptable isometric village; relief-map mechanism weak                           |
| SP03-066 Abstract Background      | acceptable, but random floating spheres and a fantasy city intrude                |
| SP03-068 3D Scan                  | acceptable; no scan artifacts visible (reads as a clean model)                    |
| SP03-069 VFX Simulation           | burning greenhouse acceptable; variant is a lookdev board                         |

## Changes

- DNA rewritten for all 9 (version 2). Two contracts in `subject_treatment`: **environment direction (retained on purpose)** for Neon City, Bioluminescent Forest and Abstract Background, which supply a world and place the prompt subject in it; **portable environment render** for VR, Scientific Visualization, Environment Design, 3D Scan and VFX Simulation, which keep the user's location. 3D Map is a **profile** that owns the isometric relief-map view.
- Each preset now names its mechanism: emissive panels as the only key lights and stacked haze (Neon City), plants as the only light (Bioluminescent), standing eye height with baked lightmaps and no depth of field (VR), streamlines, isosurfaces and one perceptual colormap (Sci Vis), three depth planes and one landmark (Environment Design), hypsometric contour block (3D Map), glossy ribbons in depth layers (Abstract), stretched texels and ragged mesh borders (Scan), blackbody pyro volume (VFX).
- Brand and franchise names removed from all fields; no renames needed.
- `dropAvoid`: `subject`, `object` (SP03-066); `fantasy`, `magic` (SP03-056).
- 3 new briefs per preset, 60 distinct subjects, dark medieval fantasy where it fits; tropes (wet market, umbrellas, lighthouse, backpacker) banned in the negatives.
- New presets (pending cards): Hydraulic Erosion Heightfield, Modular Dungeon Kit Render, Rigid-Body Destruction Simulation, Simulated Open Ocean Swell, Floating Sky Island Archipelago, Instanced Foliage Overgrowth, Geode Cavern Environment, Particle Blizzard Simulation, Exoplanet Surface Environment, Level Blockout Greybox, Hand-Painted Texture Environment. Category now 20.
- Overlaps checked: Matte Painting / Matte Painting Extension and Diorama Box exist elsewhere, so no matte-projection or diorama preset; Kitbash (pack_03::5) differs from the dungeon kit (environment theme, not hard-surface greebles); Grey Clay Lighting Test (render engines) shades finished models, while the greybox replaces them with primitives; Underwater and Volumetric Cloud presets exist, so none added; Glacier Ice, Crystal Growth and Glass & Crystal are materials, while the geode cavern is an environment lit by refraction.

## Pending (local session)

- Generate the cards; check that portable presets keep the prompt's location (tractor and research-station briefs must stay modern) and that the direction presets place the subject instead of replacing it.
- Check Neon City cards show no readable sign text and Bioluminescent Forest avoids film-world likeness.
