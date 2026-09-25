# pack_03 :: 6. Organic Character And Bio CGI — audit

Audited 2026-09-25 from the contact sheet (7 primaries + 7 variants) and the full manifests. Review rule: never force a person into a T-pose, and never turn a requested object into an avatar.

## Findings

- All 7 DNA blocks were the router template. They shared one filler tail ("subsurface lift, cloth sheen, food steam, rim grooming…"), so medical, food, fashion and avatar presets read almost the same.
- Nothing in the text stated the review rule. SP03-049 inherited `action pose` as a negative, so a requested action pose was pushed toward a T-pose.
- Person and brand leaks in the DNA: "Bored Ape" (SP03-057), "Jeff Koons" (SP03-076), and "Clo3D/Marvelous Designer" and "ZBrush" (SP03-059, SP03-062).
- Name clash: "Balloon Art (Inflatable)" is nearly the same name as SP11-018 "Balloon Art" (twisted latex). The two are different techniques.
- Overlap risk: Organic Modeling vs SP03-009 ZBrush Digital Clay Sculpt (matcap viewport).

| Preset                    | Card defect                                                                                              |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| SP03-049 T-Pose           | Primary is a generic outdoor-jacket man. The variant adds material ball and swatch panels (sheet drift). |
| SP03-051 Medical          | Primary is fine (translucent creature). The variant is a plain kidney model.                             |
| SP03-054 Food             | Halved grapefruit: generic.                                                                              |
| SP03-057 Avatar           | Tentacle vase in the primary. The variant is a generic eagle bust.                                       |
| SP03-059 Digital Fashion  | Generic young woman in a silver jacket.                                                                  |
| SP03-062 Organic Modeling | Primary is a photographic dandelion, not CGI sculpture at all. The variant is a dryad bust.              |
| SP03-076 Balloon          | Giraffe balloon: a twisted-latex look, not mylar.                                                        |

## Changes

- Rewrote the DNA for all 7 presets (version 2) with three shared contracts:
  - `organic`: rebuild the surfaces and keep subject, pose and view.
  - `profile(...)`: the model-sheet, food-ad, collectible bust, rig and strain-map formats.
  - `change(...)`: declared anatomy, wardrobe or construction changes.
    Each contract carries the review rule, and `forced T-pose` and `object turned into an avatar` are in the shared avoid list.
- SP03-049 now uses an A-pose or T-pose only when the prompt leaves the pose open. `dropAvoid: ['action pose']` was added, and variant 02 proves the rule with a lunge that is kept.
- SP03-057 keeps a requested object as an object with no face. Variant 02 proves this with an hourglass.
- SP03-062 is now a polypainted sculpture on a turntable plinth with subsurface light. That keeps it distinct from the matcap SP03-009 and from the new Photoreal Creature Hide (final film surfacing).
- Renamed SP03-076 "Balloon Art (Inflatable)" to **Mylar Foil Balloon Render** because its name nearly duplicated SP11-018 (alias added). Its DNA now spells out heat-sealed foil seams to separate it from twisted latex.
- Removed person and brand names from the DNA.
- Wrote 3 new briefs per preset. The category has 60 distinct subjects, all adult or creature subjects; "knight" was used only once after deduplication.
- New presets (pending cards): Photoreal Digital Human, Hand-Painted Texture Character, Écorché Muscle Study, Articulated Skeleton Render, Differential Growth Folds, Space-Colonization Vine Overgrowth, Soft-Body Squash Simulation, Animation Rig Overlay, Garment Fit Strain Map, Chitin Exoskeleton Plating, Motion-Capture Marker Suit, Photoreal Creature Hide, Animated-Film Food Render. The category now has 20.
- Overlaps checked and skipped: Reaction Diffusion (SP10-018), Mycelium Network (SP10-015), Cellular Life (SP11-058), Plushie, Feathers, Knitted Wool, Skin Pores (SP11-069), Pressurized Vinyl Playform (SP07-069), Creature Design (SP04-051) and Anatomy Reference Sheet (SP04-094) already exist.
- Specs from other agents running in parallel have similar names but different domains: "Hand-Painted Texture Environment" (pack_03 env), "Chitin Carapace Architecture" (pack_07) and "Rigid-Body Destruction Simulation" (pack_03 env).

## Pending (local session)

- Generate the cards.
- Check that the T-pose variant keeps the lunge and that the hourglass gets no face.
- Check that Écorché, Skeleton and Medical stay free of gore.
- Check that Rig Overlay and Strain Map show no UI, legend or numbers.
- Check that the digital humans read as original adults.
