# pack_06 :: 1. Traditional Painting — audit

Audited 2026-09-25 from the contact sheet (15 primaries) and full manifests. Category kind `style`; the review rule is "changing medium alters edges and layering while subject and framing remain constant".

## Findings

- All 15 DNA blocks were the router template ("acts as a transferable art-medium router … derive mood from medium history, touch, pigment weight …"), so the pigments differed only by their tag words. `rendering_and_quality` on Oil Painting said "Masterpiece, museum quality".
- Impressionist Oil and Pointillism named real painters in their DNA.
- Several cards do not show their medium: Watercolor (Soft) looks like opaque impasto oil, Tempera shows a lantern alley with no gold or hatching, Encaustic looks like ordinary oil, Casein is a generic kite landscape.
- Tropes: bearded man at a bicycle wheel (Gouache), bearded woodcarver (Impressionist), cyclist with bike (Pointillism), lighthouse (Ink Wash). Hiker with dog and runner at sunset are generic.

| Preset                          | Card defect                               |
| ------------------------------- | ----------------------------------------- |
| SP06-001 Oil Painting (Classic) | Sunset runner, no chiaroscuro             |
| SP06-002 Watercolor (Soft)      | Opaque impasto, no paper whites or blooms |
| SP06-004 Gouache (Flat)         | Bearded mechanic with bicycle wheel       |
| SP06-005 Tempera (Egg)          | No gold leaf, no hatching                 |
| SP06-006 Encaustic (Wax)        | Reads as oil; hiker and dog               |
| SP06-008 Ink Wash (Sumi-e)      | Lighthouse trope                          |
| SP06-009 Impressionist Oil      | Bearded craftsman                         |
| SP06-010 Pointillism            | Cyclist and bike                          |
| SP06-014 Casein Paint           | Generic kite landscape                    |

## Changes

- DNA rewritten for all 15 (version 2) with the review rule as a shared `subject_treatment`: the subject, pose and framing stay, only edges, layering, paint body and surface change. Each field now names its mechanism: thin darks and thick lights with a four-to-one side light (oil), reserved paper whites, blooms and tide lines (watercolor), hard-edged opaque layers (acrylic), chalky single-layer shapes with dry-brush streaks (gouache), hatching over green earth with punched gold (tempera), fused and scraped wax (encaustic), pigment in lime plaster with day-patch seams (fresco), five ink tones and flying white (ink wash), broken color with violet shadows (impressionist), uniform complementary dots with edge haloes (pointillism), knife slabs with raking-light ridges (palette knife), stencil layers, overspray and drips (spray), frisket gradients and star highlights (airbrush), velvety scumbled matte (casein), bare velvet as shadow (black velvet).
- Painter names removed from DNA. No renames were needed.
- `dropAvoid`: `blurry` on Watercolor, Encaustic and Ink Wash (bleed and melted edges are the technique); `noise` on Spray Paint (overspray speckle).
- 3 new briefs per preset (60), no subject repeated; dark-medieval subjects where they fit (plague doctor, wyrm-slaying knight, burning keep, monks' procession).
- New presets (pending cards): Alla Prima Plein-Air Sketch, Reverse Glass Painting, Fine-Line Silk Painting, Sanded Lacquer Painting, Tonalist Veil Oil. Category now 20. Skipped because they already exist: Layered Oil Glaze and Sculptural Grisaille (pack_22/23), Directional Dry Brush, Sgraffito Reveal, Painted Miniature.

## Pending (local session)

- Generate cards; check that Watercolor, Tempera and Encaustic now visibly differ in edges and layering from oil.
- Possible overlap to review later: SP06-010 Pointillism and SP10-072 Pointillism (Seurat) in pack_10.
