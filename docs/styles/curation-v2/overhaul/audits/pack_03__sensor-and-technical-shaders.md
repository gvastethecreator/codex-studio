# pack_03 :: 8. Sensor And Technical Shaders — audit

Audited 2026-09-25 from the contact sheet (2 primaries + 2 variants) and full manifests. Review rule: kind `profile`; compare identical geometry in sensor-capture and CGI-shader representations.

## Findings

- Both DNA blocks were the "acts as a transferable CGI-style router" template with shared sensor filler ("monochrome x-ray values, heat gradients, cold-to-hot ramps…"), so neither said it was a shader rather than a sensor.
- SP03-043 X-Ray Shader described a radiograph ("clinical spectrum", "bone-like density", "Medical, sci fi, diagnostic scan"), which overlaps pack_02 X-Ray Photography and pack_11 X-Ray.
- SP03-044 Thermal Vision had the same name as SP11-035 and described a thermal camera ("sensor overlay", "tactical"), which overlaps pack_01 Ironbow Thermal Imaging, pack_02 Thermal Camera and pack_11 Thermal Vision.

| Preset                  | Card defect                                                                     |
| ----------------------- | ------------------------------------------------------------------------------- |
| SP03-043 X-Ray Shader   | bird wing with bones reads as a radiograph; variant is a generic sci-fi reactor |
| SP03-044 Thermal Vision | speedboat wake and a sci-fi bust read as a thermal camera feed with bloom       |

## Changes

- Both rewritten (version 2) with a shared profile contract: geometry, pose, setting and camera stay; only the beauty render is replaced by a pass computed from 3D geometry, never a sensor capture. Four overlay shaders (heat distortion, force field, dissolve, scanner pulse) use a second contract: the beauty render stays and one effect is added.
- SP03-043 is now a **fresnel facing-ratio x-ray**: additive rims, modeled interior as nested contours, no density or bone logic.
- SP03-044 renamed **Thermal Heatmap Shader** (duplicate name with SP11-035; alias kept). It is now a simulated temperature attribute on clean geometry with a jet ramp, crisp mesh edges and no sensor bloom; ironbow, white-hot and "predator vision" are negatives.
- 3 new briefs per preset, 60 distinct subjects.
- New presets (pending cards): Lidar Point Cloud Render, Z-Depth Pass, World-Space Normal Pass, UV Checker Grid Shader, Curvature Cavity Map, Object ID Matte Pass, Motion Vector Pass, Heat-Distortion Shimmer Shader, Voxel Cross-Section Cutaway, Depth-Sliced Hologram Shader, Unlit Albedo Pass, SDF Contour Band Shader, Overdraw Accumulation View, Hex Force-Field Shield Shader, Noise Dissolve Edge Shader, Radial Scanner Pulse Shader, Edge Detection Line Pass, Tonal Art Map Hatching Shader. Category now 20.
- Overlaps checked and avoided: Ambient Occlusion Pass (pack_03::3), Toon Shader, Wireframe Render, Wireframe on Shaded, Voxel Art and Glitch 3D (pack_03::4), matcap (used by ZBrush Digital Clay Sculpt), Hologram material (SP03-019: cyan scanlines and projector beam; the new hologram is stacked depth slices without scanlines), Gaussian Splat Capture (soft blobs, not lidar points), Exploded View (the cutaway removes half the model, nothing explodes), Schlieren Photography (pack_01; heat distortion is a refraction warp, not a shadowgraph), Toy-Scale Sectional Cutaway and Topographic Map (other media). No microscopy or display looks (left for pack_11::6), no medical or detector outputs (pack_02::7), no camera techniques (pack_01::7).

## Pending (local session)

- Generate the cards; check that the passes show no legends, numbers or UI (UV checker cells must stay unnumbered) and that X-Ray and Thermal cards look like shaders, not captures.
- Hatching and edge-detection cards must read as computed 3D render passes, not hand drawings.
