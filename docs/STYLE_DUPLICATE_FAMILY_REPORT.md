# Style Duplicate Family Report

Generated from runtime style packs with:

```bash
bun run scripts/report-style-duplicate-families.ts --family-limit=30 --preset-limit=6
```

This report is non-destructive. Do not merge, archive, delete, or assign
`styleFamilyId` from this output without preview review.

## Snapshot

- Source packs: 17
- Presets scanned: 1,649
- Candidate families: 77
- Exact duplicate candidates: 58
- Useful variant families: 17
- False-positive candidates: 2
- Method:
  - seed families from the V2 reorganization audit
  - normalized-name groups from preset names
  - seed matching uses preset names only to avoid broad visual-DNA false positives
  - triage classification from normalized names, source pack/category spread,
    explicit sibling markers, and curated false-positive exceptions

## Top Candidate Families

| Family                          | Kind            | Classification            | Confidence | Count | Presets                                                                                                                                                                                                                                                                                                                      |
| ------------------------------- | --------------- | ------------------------- | ---------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Silhouette                      | seed_family     | useful_variant_family     | medium     |     6 | SP01-007 (pack_01, Portrait) Silhouette Portrait<br>SP01-037 (pack_01, Lighting) Silhouette (Backlit)<br>SP02-066 (pack_02, Lighting) Silhouette<br>SP04-081 (pack_04, Concept Art) Thumbnail Silhouette Exploration<br>SP04-087 (pack_04, Concept Art) Silhouette Iteration Sheet<br>SP06-029 (pack_06, Drawing) Silhouette |
| Thermal Camera / Thermal Vision | seed_family     | useful_variant_family     | medium     |     6 | SP01-028 Thermal Camera<br>SP02-059 Thermal Camera<br>SP03-044 Thermal Vision<br>SP06-100 Game Boy Camera Thermal Print<br>SP11-035 Thermal Vision<br>SP05-120 Thermal-Heat-Signature Vision                                                                                                                                 |
| Blueprint                       | seed_family     | useful_variant_family     | medium     |     5 | SP02-098 Napkin Scribble Blueprint<br>SP04-057 Blueprint Schematic<br>SP05-137 Dr. Stone - Science Kingdom Action Blueprint<br>SP10-076 Blueprint<br>SP11-033 Blueprint                                                                                                                                                      |
| Low Poly                        | seed_family     | useful_variant_family     | medium     |     5 | SP03-021 Low Poly<br>SP04-058 Low Poly Concept<br>SP06-051 Low Poly<br>SP10-007 Low Poly Abstract<br>SP11-004 Papercraft Low Poly                                                                                                                                                                                            |
| Carbon Fiber                    | seed_family     | exact_duplicate_candidate | medium     |     4 | SP03-018 Carbon Fiber<br>SP09-021 Carbon Fiber (Forged)<br>SP10-056 Carbon Fiber<br>SP11-079 Carbon Fiber                                                                                                                                                                                                                    |
| Stained Glass                   | seed_family     | useful_variant_family     | medium     |     4 | SP10-074 Stained Glass<br>SP11-008 Stained Glass<br>SP17-024 Stained Glass Starforge<br>SP17-041 Stained Glass Bestiary Icon                                                                                                                                                                                                 |
| Double Exposure                 | normalized_name | exact_duplicate_candidate | high       |     3 | SP02-067 Double Exposure<br>SP06-057 Double Exposure<br>SP10-036 Double Exposure                                                                                                                                                                                                                                             |
| Silhouette                      | normalized_name | exact_duplicate_candidate | high       |     3 | SP01-037 Silhouette (Backlit)<br>SP02-066 Silhouette<br>SP06-029 Silhouette                                                                                                                                                                                                                                                  |
| Cyanotype                       | seed_family     | useful_variant_family     | medium     |     3 | SP02-055 Cyanotype (Photo)<br>SP04-068 Cyanotype (Blueprint)<br>SP06-040 Cyanotype                                                                                                                                                                                                                                           |
| God Rays                        | seed_family     | exact_duplicate_candidate | medium     |     3 | SP01-040 God Rays (Volumetric)<br>SP02-065 God Rays (Volumetric)<br>SP03-041 God Rays (Volumetric)                                                                                                                                                                                                                           |
| Gold Leaf                       | seed_family     | useful_variant_family     | medium     |     3 | SP06-078 Gold Leaf Art<br>SP08-075 Gold Leaf<br>SP09-019 Gold Leaf                                                                                                                                                                                                                                                           |
| Porcelain                       | seed_family     | useful_variant_family     | medium     |     3 | SP03-020 Porcelain<br>SP08-071 Porcelain Doll<br>SP09-025 Porcelain (Cracked)                                                                                                                                                                                                                                                |
| Slime/Goo                       | seed_family     | false_positive_candidate  | medium     |     3 | SP03-017 Slime & Goo<br>SP05-098 Slime Isekai - Monster-Nation Bright Fantasy<br>SP09-043 Slime/Goo                                                                                                                                                                                                                          |
| Sticker Art                     | seed_family     | false_positive_candidate  | medium     |     3 | SP04-029 Sticker Art<br>SP11-021 Sticker Art<br>SP15-045 Sticker Bomb Signal Booth                                                                                                                                                                                                                                           |
| Voxel Art                       | seed_family     | useful_variant_family     | medium     |     3 | SP03-022 Voxel Art<br>SP06-052 Voxel Art<br>SP06-090 Voxel Block Sprites                                                                                                                                                                                                                                                     |
| X-Ray                           | seed_family     | useful_variant_family     | medium     |     3 | SP02-058 X-Ray Photography<br>SP03-043 X-Ray Shader<br>SP11-034 X-Ray                                                                                                                                                                                                                                                        |
| Balloon Art                     | normalized_name | exact_duplicate_candidate | high       |     2 | SP03-076 Balloon Art (Inflatable)<br>SP11-018 Balloon Art                                                                                                                                                                                                                                                                    |
| Bioluminescence                 | normalized_name | exact_duplicate_candidate | high       |     2 | SP01-041 Bioluminescence<br>SP02-073 Bioluminescence                                                                                                                                                                                                                                                                         |
| Blueprint                       | normalized_name | exact_duplicate_candidate | high       |     2 | SP10-076 Blueprint<br>SP11-033 Blueprint                                                                                                                                                                                                                                                                                     |
| Chalkboard Art                  | normalized_name | exact_duplicate_candidate | high       |     2 | SP10-077 Chalkboard Art<br>SP11-006 Chalkboard Art                                                                                                                                                                                                                                                                           |

## Review Rules

- `exact_duplicate_candidate`: likely same visual promise, but still requires
  preview review before merge, alias, archive, or `styleFamilyId`.
- `useful_variant_family`: shared family label with meaningful source, medium,
  workflow, or modifier differences.
- `false_positive_candidate`: shared wording is colliding with a different
  scene, motif, or narrative purpose.
- Exact duplicate means same visual promise, same medium/workflow, and redundant output after preview evidence.
- Useful variant means same family, different enough to keep as siblings.
- False positive means only a shared word or broad aesthetic overlap.

## Next Actions

- Review top families in this order: analog/technical imaging, lighting, print/drawing, materials, style systems.
- Add `styleFamilyId` only after family review stabilizes.
- Keep source preset ids and YAML paths unchanged until migration readiness.
