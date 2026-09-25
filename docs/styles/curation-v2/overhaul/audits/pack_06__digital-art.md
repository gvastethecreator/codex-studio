# pack_06 :: 4. Digital Art — audit

Audited 2026-09-25 from the contact sheet (15 primaries) and full manifests. Category kind `mixed`. The review found digital painting and vector looks mixed with concept outputs and low-poly construction, and set the rule "a digital painting preset must not force a concept board or 3D object render".

## Findings

- All 15 DNA blocks were the router template. Digital Painting's DNA asked for "modern concept render clarity", which pulls toward concept boards.
- Five names duplicate presets elsewhere: Speedpaint (SP04-046), Low Poly (SP03-021), Voxel Art (SP03-022), Double Exposure (SP10-036 and SP02-067), ASCII Art (SP10-025).
- Cards: Pixel Art (16-bit) shows a quest-log UI scroll with icons, and Voxel Art shows a UI icon set; both break the no-UI rule. Polygon Art barely shows facets.
- The same subject set is reused from the other pack_06 categories: runner (Digital Painting), apple bowl (Speedpaint), bearded bike mechanic (Vector), hiker with dog (Low Poly), lighthouse (Concept Art), bearded woodcarver (Isometric), cyclist (Glitch), pear in hand (Synthwave), fjord (Double Exposure), gardener (Polygon), kite (Paper Cutout), bridge (ASCII).

## Changes

- DNA rewritten for all 15 (version 2), using three contracts:
  - 2D and painting presets use the shared `subject_treatment`: the prompt is redrawn as one finished picture and never becomes a concept board, turnaround sheet or 3D object render.
  - Low Poly and Voxel use a `build` contract: the preset owns the geometry, not the subject.
  - Matte Painting (wide establishing scale), Isometric (camera) and Silhouette Double Exposure (nested layout) state that they are profiles.
- Concept Art is now a single cinematic keyframe; avoid adds `multiple views on one sheet`, `callout annotations` and `orthographic turnaround`. Pixel Art now forbids interface, icons and inventory grids. The shared avoid list adds `game UI or HUD`.
- Renamed 5 (aliases in spec): Speedpaint → Block-In Speedpaint, Low Poly → Flat-Shaded Low Poly, Voxel Art → Voxel Cube Build, Double Exposure → Silhouette Double Exposure, ASCII Art → Terminal Glyph Art.
- `dropAvoid` `noise` on Glitch Art.
- 3 new briefs per preset (60), no repeated subject.
- New presets (pending cards): Flow-Field Generative Lines, Pen-Plotter Hatch Drawing, Layered Gradient Silhouette, Mirror-Tool Kaleidoscope, Grain-Shaded Flat Illustration. Category now 20. Skipped because they already exist: Voronoi Pattern, Pixel Sorting, Datamosh, Dithering (1-bit), Vaporwave, Photobash, Form-Driven Vector Gradients, Fractal Geometry.

## Pending (local session)

- Generate cards; confirm that Pixel Art and Voxel no longer produce UI or icon sheets, and that Concept Art is a single frame.
- Overlaps to review later: Flat-Shaded Low Poly vs SP03-021 and SP10-007; Voxel Cube Build vs SP03-022 and SP06-090 Voxel Block Sprites; Isometric vs SP03-023 and SP04-052; Terminal Glyph Art vs SP10-025.
