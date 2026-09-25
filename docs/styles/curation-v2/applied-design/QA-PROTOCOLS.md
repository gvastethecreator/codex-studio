# Applied design QA protocols

These nine research recipes describe checks, not visual styles, so they are not presets. Use them when you review generated applied-design output. They are adapted from the package described in `AUDIT.md`.

Every protocol follows the same rules:

- **Work on a copy.** Keep the source artwork, text or data unchanged.
- **Mark every mismatch.** Never fix a result silently.
- **A matching look is not a pass.** It passes only when the preserved content matches the source.

| Id | Protocol | What to compare | Pass | Fail |
| --- | --- | --- | --- | --- |
| R-ICO-19 | Small-size optical repair | The scaled-down master and a corrected version, side by side at native size (for example 16, 24 and 48 px) | Gaps, joins and fill are adjusted per size; the meaning, anchor and nominal box stay the same | Automatic sharpening, a changed meaning, or blurry half-pixel alignment |
| R-HUD-20 | Telemetry consistency trial | The same data state rendered in three visual systems, with a table of expected values | Every variant shows the same values, units, alerts and hierarchy in equivalent places | Different data, missing units, or variants compared on different scenes |
| R-PRD-19 | Three-view consistency | Front, side and back views of one concept at a common scale, with a feature table | The views show one object with the same features, proportions and joins | Three different objects, mismatched scales, or invented back details |
| R-MCK-19 | Surface refraction check | Flat artwork beside the same artwork applied on glass or liquid, with witness points | Distortion follows the declared surface, and text and shapes are still the source artwork | Invented refraction, new text, or claims of accurate physics without a simulation |
| R-TYP-19 | Exact-copy lettering proof | Each character, accent and sign against the source string, checked by Unicode sequence and by a human transcription | Every character matches; style choices are recorded separately from text errors | Text that looks similar but is different, missing signs, or a silent fix of the source |
| R-DAT-19 | Data-locked styling pass | Data hashes, text lists and mark bounding boxes before and after styling | Only the permitted appearance layers change; coordinates, values and labels stay within a stated tolerance | Bars redrawn by the generator, a changed scale, missing values, or text that does not match the source |
| R-DAT-20 | Explanation consistency audit | Legends, references, units, values and arrow directions across several pieces, in a findings table | Every entity and claim agrees across pieces; a planted wrong unit and a planted wrong arrow are both found | Approval because it looks good, fixes with no source, or errors made up to fill the report |
| R-ENV-19 | Route walkthrough audit | The walk from entrance to decision point, destination and return, on the plan and in the views | Every sign, arrow and confirmation agrees along the route; a planted wrong arrow is found | A simulated site visit, approval because it looks good, or fixes that lose the original |
| R-MOT-20 | Reduced-motion companion | The original sequence and a reduced version that uses cuts, state changes or short fades | The reduced version keeps the same information, order and focus | Zooms kept, messages dropped, or accessibility claimed without a real evaluation |

A single generated image does not verify any of these protocols. Record the prompt that was used, the provider and model, the job or asset id, and the verdict with its reason.
