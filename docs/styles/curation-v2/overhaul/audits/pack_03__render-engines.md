# pack_03 :: 1. Render Engines — audit

Audited 2026-09-25 from the contact sheet (10 primaries + 6 variants) and full manifests.

## Findings

- All 10 DNA blocks were the router template with a shared "Lookdev camera for …" filler, so presets differed only by the software name — the review's diagnosis ("renderer names used as identity without isolating observable differences").
- Cards: a tram on a wet street (SP03-010), generic product objects (robot, fan, office chair), and SP03-008-01 shows a studio-style animated heroine; "Pixar" in the SP03-008 name reaches the card prompt.

## Changes

- DNA rewritten for all 10 (version 2) around what a viewer can actually see: spectral dispersion and glare (SP03-001), real-time bounce GI with TAA softness and fog shafts (SP03-002), clean biased motion-graphics GI (SP03-003), film VFX subsurface skin and volumes (SP03-004), principled procedural materials with a filmic transform (SP03-005), sun-and-sky archviz with straight verticals (SP03-006), studio HDRI swatch renders (SP03-007), colored luminous shadows of feature animation (SP03-008), matcap sculpt viewport with no GI (SP03-009), post-heavy game pipeline with SSR artifacts (SP03-010).
- Software names are kept (they are tools and help search); SP03-008 renamed **Feature Animation Path Tracer** (old name kept as a search alias) because the studio name steered cards toward its characters.
- 3 new briefs per preset, no repeated subject.
- New presets (pending cards): 90s Scanline Phong Render, Classic Raytracer Mirror Demo, Radiosity Color Bleed, Grey Clay Lighting Test, Progressive Preview Noise Render, Gaussian Splat Capture, Baked Lightmap Mobile Render, Lookdev Reference Plate, Live-Action Plate Integration, Film-Emulated CG Beauty Render. Category now 20. A white-model architectural render was dropped because Architecture Massing Model already exists.

## Pending (local session)

- Blind-compare the renderer cards per the review validation; if two still look alike, adjust briefs toward their distinguishing behavior.
