# pack_01 :: 2. Lighting Techniques — audit

Audited 2026-09-25 from the contact sheet of current cards (15 primaries + 3 variants) and full manifests.

## Category-wide defects

- DNA was the shared template ("acts as a transferable photographic style router: begin from …") with the legacy tag list pasted into every field (`Directional, soft`, `Glowing atmosphere`, `Lens flare`). No field stated where the source sits, how big or hard it is, how it falls off, or what color it has.
- Cards reuse inherited tropes instead of showing the light: wet plaza with a folded umbrella (SP01-031, SP01-044), a road cyclist (SP01-033), a woman walking a bicycle (SP01-034), a wet night market (SP01-037, SP01-042), and the same bearded stock model (SP01-036, SP01-043) and brunette in an olive shirt (SP01-038).
- Several cards do not show the named technique at all, so the category cannot be told apart at thumbnail size.
- No reviewed card briefs existed.

## Per-preset card defects

| Preset                   | Card defect                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------- |
| SP01-031 Golden Hour     | wet plaza + umbrella trope; light is fine but the scene is generic                 |
| SP01-032 Blue Hour       | empty landscape, no warm practical accent to show the blue source                  |
| SP01-033 Hard Flash      | midday cyclist on a coast road: **no flash visible at all**                        |
| SP01-034 Neon Noir       | woman walking a bicycle on a wet street; variant is a generic moody male model     |
| SP01-035 Rembrandt       | potter reads as soft window light; lit cheek triangle not visible; variant generic |
| SP01-036 Split Lighting  | bearded stock model, split line soft and off-axis                                  |
| SP01-037 Silhouette      | wet night market; subject not a clean black shape; variant acceptable but generic  |
| SP01-038 Butterfly       | brunette in olive shirt, flat grey backdrop, no butterfly shadow                   |
| SP01-039 Candlelight     | greenhouse lit by string lights: electric light, no candle                         |
| SP01-040 God Rays        | beams read, but park-bench subject is generic                                      |
| SP01-041 Bioluminescence | wave only; acceptable, no subject to carry scale                                   |
| SP01-042 Strobe Freeze   | wet night market again; nothing frozen in mid-air                                  |
| SP01-043 Ring Light      | bearded stock model, ring catchlight barely visible                                |
| SP01-044 Projector       | wet plaza + umbrella again; projection sits on a far wall, not on the subject      |
| SP01-045 Light Painting  | boat with trails reads as long exposure, but no steel-wool or drawn shape          |

## Changes

- DNA rewritten for all 15 (version 2). Every light is a modifier: `subject_treatment` keeps the prompt's subject, action, setting and framing, and the other fields name source position, size, hardness, falloff, color and the visible proof of the technique (lit cheek triangle, butterfly nose shadow, ring catchlight, drop shadow behind a flash subject).
- Avoid rules added: `light that does not match the named technique`, `changing the requested setting`, plus technique guards (`daylight scene without flash`, `front-lit subject`, `electric light`, `readable projected text`).
- 3 new briefs per preset (60 total), each subject built to show the light: grave robber under a hard flash, cartographer under Rembrandt light, war drummer frozen by a strobe, witch lit from below by a cauldron.
- Before applying, the handoff spec repeated subjects inside the category (three knights, two dancers, tenor and opera singer, three horses, three castles, grave robber and gravedigger, two rowing boats, two monks). 15 briefs were rewritten so no subject repeats: vintner, ropemaker, scarred mercenary, weaver at a loom, war drummer, court harpist, fencer, astronomer, windmill, museum night guard, ballerina, barn owl, herbalist, bell-ringer, dead oak.
- New presets (pending cards): SP01-090 Dappled Leaf Light, SP01-091 Horror Underlight, SP01-092 Theatrical Spotlight, SP01-093 Moonlight Night, SP01-094 Lightning Flash. Category now 20.

- Follow-up: `atmosphere_and_mood` (all 20) and `rendering_and_quality` (7) were below the DNA audit minimum length; rewritten to express mood through contrast, rhythm and space, and finish through observable edges and exposure. pack_01 DNA audit findings for this category went to zero.

## Overlap notes

- SP01-094 Lightning Flash vs SP09-052 Electricity/Lightning (pack_09, Elemental And FX): SP09-052 draws electric bolts as an effect; SP01-094 only changes illumination to a strike's blue-white flash. Kept both.
- SP01-092 Theatrical Spotlight vs pack themes with "Spotlight" in the name (Allegorical Spotlight Confrontation, Grotesque Marionette Spotlight): those are narrative themes, not a light modifier.
- SP01-093 Moonlight Night vs Moonlit Hunter Gothic and other "Moonlit" themes: same distinction.

## Pending (local session)

- Generate the 3-card sets with `--card-set`, review the contact sheet, and remove `pending` from SP01-090…094.
- Check that SP01-033 cards visibly show flash and SP01-039 shows a candle flame; those were the two worst misses.
