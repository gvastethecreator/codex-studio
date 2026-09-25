# pack_01 :: 6. Nature And Wildlife — audit

Audited 2026-09-25 from the contact sheet (6 primaries + 1 variant) and full manifests.

## Category-wide defects

- All 6 DNA blocks were the router template, with a shared filler per field ("render fur, feathers, plant texture, rock, water, star noise, mist, mud …") listing every nature subject at once — the mechanism the review warns about: a landscape tone can pull a mountain into an animal request.
- Only 6 presets for a broad domain; no bird-in-flight, camera trap, seascape, nightscape, storm or botanical approaches.
- Cards are competent but generic (a fox at sunset, a golden retriever in a meadow, a catalog spiral galaxy, a turtle over coral) and three of six show nothing specific to their technique.

## Per-preset card defects

| Preset                           | Card defect                                               |
| -------------------------------- | --------------------------------------------------------- |
| SP01-047 Landscape (Ansel Adams) | B&W mountains read; zones flat, no true blacks            |
| SP01-048 Macro                   | dragonfly and ladybird read well; generic subjects        |
| SP01-053 Wildlife                | fox walking at sunset: postcard, no telephoto compression |
| SP01-054 Astrophotography        | generic spiral galaxy illustration look                   |
| SP01-055 Underwater              | turtle over coral: stock                                  |
| SP01-065 Pet                     | golden retriever in a meadow: stock                       |

## Changes

- DNA rewritten for all 6 (version 2). Every preset keeps the requested subject and applies its approach to it. Zone System Landscape states the ten-zone scale, f/64 and red-filter skies, and applies to an animal as well (one brief is a moose). Astrophotography is limited to telescope deep-sky; wide-field night landscapes moved to the new Milky Way Nightscape.
- Renamed SP01-047 "Landscape (Ansel Adams)" to **Zone System Landscape**: the preset name is injected into the prompt through `creative_brief`, so a real photographer's name would ask for his work. The DNA describes the mechanism instead.
- 3 new briefs per preset, no subject repeated in the category.
- New presets (pending cards): Bird-in-Flight Telephoto, Camera-Trap Night Flash, Long-Exposure Seascape, Milky Way Nightscape, Supercell Storm Landscape, Intimate Forest Landscape, Backlit Botanical, High-Key Snow Wildlife, Low-Key Rim-Lit Wildlife, Focus-Stacked Specimen, Nature Abstract Pattern, Animal-in-Habitat Wide Angle, Minimalist Fog Landscape, Blackwater Night Dive. Category now 20.
- Camera-Trap and Animal-in-Habitat own only the camera placement; the rest are approaches that keep the requested subject.

## Pending (local session)

- Generate the `--card-set` cards and check the paired presets for clear separation: High-Key Snow vs Low-Key Rim-Lit, Underwater vs Blackwater, Wildlife vs Animal-in-Habitat.
