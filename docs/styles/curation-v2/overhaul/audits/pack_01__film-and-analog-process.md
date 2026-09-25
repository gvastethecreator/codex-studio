# pack_01 :: 3. Film And Analog Process — audit

Audited 2026-09-25 from the contact sheet of current cards (13 primaries + 2 variants) and full manifests.

## Category-wide defects

- DNA was the shared template ("acts as a transferable photographic style router: begin from …") with the legacy tag list pasted into each field (`Soft but sharp`, `Natural, forgiving`, `Versatile`). No field said what the emulsion does: grain size, contrast curve, color bias, halation, latitude.
- **The negatives fought the technique.** Nine presets carried `noisy` and `blurry` in `avoidRules`/`negativePrompt`, which suppresses exactly the grain, softness and motion that a film stock needs. This is the most likely cause of the digital-looking cards.
- Cards look digital: clean sensor detail, no grain, no halation, no dye character. Most could pass for a phone photo with a color grade.
- Cards reuse the inherited tropes: tram in the wet street (SP01-016), yellow city bus (SP01-017), road cyclist (SP01-022), woman walking a bicycle (SP01-021), wet plaza with a folded umbrella (SP01-019), and the wet night market (SP01-026).
- Six presets overlap pack_02 "4. Photography Eras", two with identical names (Wet Plate Collodion, Pinhole Camera); SP01-019's DNA said "Aerochrome style", the same as SP02-054.
- SP01-018 had `modern` in its negatives, which would age a modern subject; the category review requires "a modern appliance remains modern".

## Per-preset card defects

| Preset                  | Card defect                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| SP01-011 Portra 400     | greenhouse garden, digital-clean, no grain, no Portra skin because no person             |
| SP01-012 Velvia 50      | alpine train on a viaduct: postcard, saturation is digital HDR rather than slide film    |
| SP01-013 HP5 Plus       | lake with rowboat, smooth like a converted digital file, no grain                        |
| SP01-014 Cinestill 800T | windmill at dusk: no practical lights, no red halation; variant is a smoking stock model |
| SP01-015 Kodachrome 64  | woman reading on a park bench, generic autumn grade                                      |
| SP01-016 Polaroid 600   | tram in a wet street at dusk; no flash, no instant-film color                            |
| SP01-017 Lomo LC-A      | yellow bus in a plaza; vignette present but the subject is a trope                       |
| SP01-018 Wet Plate      | woman kneading dough, reads as sepia tintype, not collodion on glass                     |
| SP01-019 Infrared       | pink trees + man with umbrella in a wet plaza: Aerochrome duplicate and trope            |
| SP01-020 Expired Film   | fox in grass, faint cast; acceptable but weak                                            |
| SP01-021 Large Format   | woman walking a bicycle past a brick wall: nothing shows view-camera detail              |
| SP01-022 Disposable     | road cyclist on a coast road in daylight: no flash                                       |
| SP01-026 Pinhole        | wet night market; variant soft seawall acceptable                                        |

## Changes

- DNA rewritten for all 13 (version 2). Every preset is a capture modifier: `subject_treatment` keeps the prompt's subject, action, setting and framing, forbids aging props or costume, and forbids borders, rebates and sprocket holes (per the category review: "separate film response from frame borders"). Each field names the mechanism: overexposed negative with peach skin (Portra), narrow-latitude slide with crushed blacks (Velvia), box-speed grey scale (HP5), red-orange halation from the missing anti-halation layer (Cinestill), dense slide dyes (Kodachrome), integral instant chemistry with close flash (Polaroid 600), tunnel vignette from the hip (LC-A), view-camera tilt plane (4x5), built-in flash hotspot (disposable), lensless softness and ghosted motion (pinhole).
- `noisy` and `blurry` removed from the negatives of the nine grain presets (new `dropAvoid` in `tools/apply.ts`); `modern` removed from SP01-018. Added guards: `clean digital sensor look`, `aging props or costume to match the film`, plus per-stock rules (`crushed blacks` on Portra, `daylight white balance` on Cinestill, `white instant-print frame` on Polaroid, `light leaks` on LC-A).
- Renamed to stop overlapping Photography Eras (IDs unchanged):
  - SP01-018 Wet Plate Collodion → **Wet Plate Ambrotype** (collodion positive on black-backed glass; SP02-053 keeps the glass negative, SP02-047 the tintype).
  - SP01-019 Infrared Film → **Black-and-White Infrared Film** (white foliage, black sky; SP02-054 keeps color Aerochrome).
  - SP01-026 Pinhole Camera → **Pinhole Long Exposure** (time blur and ghosting; SP02-057 keeps the historical pinhole look).
- Kept, with sharper distinctions from pack_02: Kodachrome 64 is the stock without 1950s staging (SP02-049 owns the era); Polaroid 600 is the emulsion and flash without the print frame (SP02-050 owns the frame); LC-A is lens and vignette without leaks or sprockets (SP02-052 Lomography owns those); Disposable Camera is today's single-use flash look (SP02-051 owns the 90s era).
- 3 new briefs per preset (60 total), every subject chosen to show the stock: a lantern-lit gatehouse for Cinestill halation, a plague doctor on black glass for the ambrotype, a fire-eater for pushed Tri-X, a stag in chemical blooms for film soup. No subject repeats inside the category; no tram, bus, cyclist, umbrella or wet market.
- New presets (pending cards): SP01-095 Redscale Film, SP01-096 Super 8 Home-Movie Film, SP01-097 Kodak Tri-X Pushed, SP01-098 Cross-Processed Slide, SP01-099 Bleach Bypass Print, SP01-100 Lith Print, SP01-101 Film Soup. Category now 20. Cross-processing moved out of LC-A so it lives in one preset.
- Considered and rejected: Ektachrome (a third slide stock next to Velvia and Kodachrome), Half-Frame Diptych (a layout, which the category review keeps out of film response), Hand-Tinted Silver Print (hand-tinting already appears across Photography Eras).

## Overlap notes

- SP01-099 Bleach Bypass Print vs "MTV 90s Grunge Broadcast" (mentions bleach bypass as one ingredient of a music-video look): different scope, kept.
- SP01-097 Tri-X Pushed vs SP01-013 HP5 Plus: both black-and-white 400 film; HP5 is box speed (open shadows, moderate grain), Tri-X is push-processed (blocked shadows, clumped grain). Each lists the other's trait in its negatives.
- SP01-101 Film Soup vs SP01-020 Expired Film: expired film is a global fog and cast; film soup is local chemical blooms around a clean subject.

## Pending (local session)

- Generate the 3-card sets with `--card-set` and review the sheet. Check first that grain and halation are actually visible now that the negatives no longer suppress them; if the provider still returns clean digital images, strengthen the grain wording in the briefs rather than adding overlays.
- Remove `pending` from SP01-095…101 after review.
