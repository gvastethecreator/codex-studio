# pack_03 :: 4. 3D Styles — audit

Audited 2026-09-25 from the contact sheet (20 primaries + 20 variants) and full manifests. The category already has 20 presets.

## Findings

- All 20 DNA blocks were the router template ("Lookdev camera for …", "palette and exposure choices that support …").
- The review rule (switch media without changing the requested view; isometric is the explicit exception) was not stated.
- Cards: a tram (SP03-015), the same glass elevator in SP03-024 and SP03-078, a voxel house that reads as a well-known mining game, and a brand name in SP03-077.
- SP03-070 Retro CGI (90s) now overlapped the new 90s scanline and classic raytracer presets in Render Engines.

## Changes

- DNA rewritten for all 20 (version 2). Media presets keep the requested view; Isometric 3D, Knolling, 3D Icon and Clay UI declare the view or layout they own.
- SP03-070 redefined as the 90s pre-rendered CD-ROM scene (lonely surreal spaces, dithered color, flat fog), distinct from the renderer presets.
- SP03-077 renamed **Toy Brick-Built 3D** (old name kept as a search alias); its negatives forbid brand names on studs.
- SP03-058 3D Typography uses invented ornamental glyphs unless the prompt supplies exact text; SP03-072 Clay UI keeps all controls textless.
- 3 new briefs per preset, no repeated subject, no trams or elevators.

## Pending (local session)

- Regenerate the cards; confirm the voxel cards no longer imitate a known game.
