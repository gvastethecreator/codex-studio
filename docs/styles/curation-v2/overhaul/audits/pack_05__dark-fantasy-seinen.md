# pack_05 :: 4. Dark Fantasy & Seinen — audit

Audited 2026-09-25 from the contact sheet (30 primaries + 20 variants) and full manifests. The category already has 30 presets, so none were added. Review line: kind `mixed`; validation "a gentle prompt remains gentle in content while its visual treatment changes".

## Findings

- **All 30 DNA blocks were one template.** Each field opened with "A transferable ink-led illustrated treatment built around …", "Preserve the requested subject …", "Respect the prompt's colors …", and closed with "Keep texture subordinate to form …" and "Darkness and tension are optional tonal pressure …". The mechanism clause in each was usually specific, but most of every field was repeated boilerplate, so the presets read as one style.
- **The primary cards do not show the style.** Most primaries are photographic still lifes of a single object (quartz crystal SP05-278, cracked stone disk SP05-261, cloth on black SP05-263, white flower SP05-264, carved plant SP05-066, iron latch SP05-069, obsidian shards SP05-062, crystal SP05-070). Others are generic photoreal or painterly scenes with no ink treatment at all: a hospital corridor couple (262), snowy cabin (266), bell-tower landscape (268), bridge at sunset (280), a bus-shelter in rain (275, a trope), and a line of labourers (276).
- **The variants repeat one character.** About 15 variant cards (278-01, 262-01, 265-01, 271-01, 272-01, 273-01, 061-01/02, 062-01/02, 063-01, 064-01/02, 065-01, 067-01, 068-01, 070-01) show the same hooded, dark-haired swordsman in ruins. He comes close to a well-known dark-fantasy manga lead.
- **Franchise name:** SP05-070 "Devilman Crybaby – Neon Tragic Metamorphosis".
- The person-free contract of SP05-062 and the no-body/face contract of SP05-066 were only in `avoid`; SP05-062-03 still showed a mask.

## Changes

- **Rewrote all 30 DNA blocks** (eight fields + key_features). Each preset kept its original mechanism and became a named seinen ink technique with its own palette, light ratio and mark scale. Examples: fissure planes in chalk and slate (278), crescent sweeps with a midtone scar (261), dashed transmission contours in black pockets (263), carmine sumi slash on rice paper (267), stacked smoke washes with clear windows (269), angular-to-round dual stroke (270), selective-focus band with red pinpoints (279), concentric ritual value rings (280), doubled screentone rumor print (275), and three-to-five-direction nib crosshatch (061).
- `subject_treatment` is a shared const. It redraws the subject in the ink treatment and keeps a gentle prompt gentle in content. SP05-062 and SP05-066 get a person-free variant.
- **Renamed** SP05-070 → "Neon Tragic Metamorphosis" (alias recorded in the spec). All other names are mechanism names and were kept.
- Added avoid rules to every preset: photographic still-life object, photoreal scene, repeated hooded dark-haired swordsman, franchise character likeness and readable text. Also added `rows of uniformed figures` (276) and `mask`/`face` (062).
- **90 new briefs**, all with original subjects and no repeats across the category: dark medieval fantasy (queen, bell-ringer, countess, gravedigger, regent, hedge witch, clockwork knight). Each preset also has at least one gentle everyday subject that proves the validation rule (baker, cellist, grandmother pouring tea, laundress, florist, potter, cook, weaver, clockmaker, herbalist). Briefs respect each preset's existing avoid list (no weapons where weapon is banned, no lantern for 067, no monster/corridor for 065, objects only for 066, nonhuman subjects only for 062).

## Pending (local session)

- Generate the 3-card sets. Check that the primaries now show ink or anime illustration, not photos of objects, and that the swordsman does not come back.
- Check that 268 (offset print edges), 277 (rust + neon slips) and 070 (elastic smears) stay visually distinct. All three use magenta/cyan accents.
- Check the gentle-subject cards (e.g. 061 potter, 070 birthday cake) for unwanted violence or horror.
