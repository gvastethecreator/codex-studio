# pack_05 :: 5. Action Motion Setpieces — audit

Audited 2026-09-25 from the contact sheet (5 primaries, no variants) and full manifests. The category had 5 presets; 15 were added to reach 20. Review line: kind `profile`; validation "use a requested action and verify that its staging improves without inventing opponents, sports gear, extra props or danger".

## Findings

- **Shared template.** All five had the same `subject_treatment` sentence and nearly the same "do not invent flashes, electricity, machinery or magic" clause in lighting and texture. The fields said what not to add but rarely gave a concrete camera, lens or layout, even though a staging profile should own one.
- **Weak separation.** 021 (forward rush) and 024 (impact burst) both relied on "radiating/converging diagonals". 022 and 025 were described through mood words (vertigo, lift) and did not say where the camera sits.
- **Cards.** None of the five is anime: all are photoreal or semi-real. 021 is the only one with a person (raincoat runner in a wet alley, close to the wet-street trope). 022 shows a construction worker, 023 a drone (hardware that is not in the category spirit), 024 a wave hitting a cliff (danger/explosion read) and 025 a plane in a storm. None shows the staging device clearly.
- Inherited avoid rules `calm-composition` (022) and `calm-scene` (025) push toward danger, which contradicts the validation.
- IDs are `SP13-*` but live in `presets/pack_05/`. The `apply.ts --dry` output numbers the new presets SP13-036…050 in `pack_05/`, after the SP13-026…035 already in pack_16.

## Changes

- **Rewrote all 5 DNA blocks** as profiles with a shared `profile(what)` `subject_treatment` ("keeps subject, count, action, props and setting; owns <device>; adds no opponent, sports gear, extra prop or danger"). Each now states one camera or device:
  - 021: 24 mm low front three-quarter lunge with a 2× foreshortened leading limb.
  - 022: 70–80° down-angle where the travel line crosses an edge line in an X.
  - 023: the movement path traced as thin violet-blue vector arcs.
  - 024: peak instant at a radiating hub with a huge-scale foreground element.
  - 025: tall side-on frame with stacked layers and open space above.
- Dropped `calm-composition` (022) and `calm-scene` (025). Added the category avoid rules: added opponent, sports gear, invented danger/explosion, extra props, readable text and franchise likeness.
- **15 new profiles:** Smear-Frame Arc Staging, Negative Impact Frame Staging, Bullet-Time Orbit Freeze, Panning Background Streak Frame, Worm's-Eye Leap Silhouette, Dutch Tilt Momentum Frame, Three-Beat Action Triptych, Near-Lens Pass-By Frame, Top-Down Spiral Path Staging, Fisheye Foreshortened Reach, Cloth-and-Hair Follow-Through Trails, Tiny-Figure Grand Arc Wide, Coiled Anticipation Lead-Space Frame, Ground-Skim Low Tracking Shot, Contact-Point Extreme Close-Up.
- **Overlaps checked** (by name grep and DNA read):
  - Kinetic Impact-Line Choreography (SP05-109, speed lines/afterimages): I did not add a speed-line preset. Smear, Panning and Coiled explicitly avoid speed lines.
  - Chronophotography Sequence (SP01-136): the multi-exposure idea was dropped; the Triptych uses separate panels instead.
  - Telephoto Compression Street (SP01-103): no long-lens preset was added.
  - Golden Age Multiplane Cel Feature: the multiplane idea was dropped.
  - Shoulder-Follow Gameplay: the behind-the-back follow cam was dropped.
  - Pre-Impact Ritual Stillness (SP13-026, samurai theme) vs Coiled Anticipation: mine is a pure staging device with no theme.
- **60 briefs**, one requested action each with no opponent, gear or danger: courier, blacksmith, glassblower, fox pounce, salmon leap, sailor on a heeling deck, stone-carver, and others. Most are medieval-fantasy settings. No subject repeats within the category.

## Pending (local session)

- Generate cards. Check that each card shows its device (smear shape, inverted frame, straight-down view, streaked pan, fisheye curvature) and is drawn as anime, not photoreal.
- Check the edges of the validation. The cliff diver (Coiled Anticipation) and the cathedral roofer (022) must not read as peril. The Triptych must not turn into three different characters or gain panel text.
- 025 (tall side-on rise) and Worm's-Eye Leap Silhouette (straight up from below) both stage upward motion. Confirm from the cards that they stay distinct.
