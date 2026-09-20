# Interface audit implementation

Status: implementation finished. Functional checks passed. The repository-wide format gate and two manual visual checks remain open. Remote sync: not requested.

## Objective and decisions

Implement T0–T11 from the approved 2026-09-20 interface audit plan. Preserve Create / Workflow / Library, Catalog Entry authority, provider boundaries, saved drafts, and Active / Review / History. New Remaster sessions use conservative restoration. Do not introduce a second source-image identifier.

Baseline: main at 5625b4ad. Existing handoff changes in package.json, tsconfig.web.json, .gitignore, review/, scripts/interface-handoff/, .interface-handoff/, docs/interface-handoff.md and docs/tasks/interface-handoff.md belong to earlier work; preserve them.

## Implementation

- T0: review fixtures keep request prompts, source specs, job IDs, batch IDs, catalog IDs, and dates connected. Failed, review-required, cancelled, retried, partial, library-error, partial-animation, and WebGL-error scenarios are explicit simulations. Review uses its own Vite cache and entry point.
- T1: `packages/shared/src/generationRequirements.ts` owns form requirements. The composer, keyboard action, generation pipeline, and existing backend source-spec validation use it. Assets remain the source authority. Provider status stays separate.
- T2: source controls appear first for source-based workflows. New Remaster drafts preserve geometry, identity, text, light, color, and detail at Fidelity 100. Explicit saved parameters win. Results explain whether they are attached, with `Use as source`.
- T3: Library distinguishes loading, error, empty workspace, and no matches. Timeline offers first-keyframe and prompt actions, with temporal navigation disabled until frames exist.
- T4: the workbench observes its available width, including Jobs. Three panels require 1128 px; two require 800 px. Narrow views keep panels mounted behind Configure/Catalog and Configure/Preview switches. Mobile navigation occupies a separate header row.
- T5: labels use 12 px and body text 13 px tokens. Secondary text and disabled controls have separate colors. Sprite Sheet editing guides are independent from generated dividers. Library has a matching accessible name.
- T6: Output names the effective Studio Library destination. External discovery belongs to Library & imports. Provider connection copy describes applicable CLI, account, key, endpoint, or workflow setup.
- T7: generation summaries count files and sheet/storyboard content. Character Lab actions are concise with an inspectable compiled prompt. Atlas names its current step and primary action. Animation supports manual partial playback, frame scrubbing, preview FPS, loop, and visible gaps before export. Camera initialization failure leaves numeric controls available.
- T8: Styles separates All styles, Collections, My styles, and Favorites; packs remain a provenance filter with unchanged IDs. Empty personal collections are compact, collection previews are larger and less decorated, counts are neutral, and the compact selector uses the full available workspace height, as requested in the follow-up regression fix.
- T9: reversible removal is Archive; permanent deletion keeps its explicit name and confirmation. Selection and downloads show scope and counts. Maintenance applies an inspected plan. Active jobs show pending output/metadata instead of missing-data errors.
- T10: Appearance owns theme, accent, and density. The header theme shortcut remains; the logo no longer changes accent. Ready onboarding folds diagnostics and emphasizes Open Studio. Selection uses the chosen accent.
- T11: this record tracks every finding without changing the original audit. The four code-map artifacts are regenerated together.

## Finding register

Original source: `D:/Downloads/Auditoria_Codex_Studio_20260920.html`. IDs and original observations remain unchanged there. “Implemented” describes the source change; rendered proof and limits are listed below.

| ID     | Disposition                              | Implementation or accepted exception                                                                                                                                             |
| ------ | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CS-001 | Implemented                              | Shared form requirements; provider readiness no longer labels an incomplete form Ready.                                                                                          |
| CS-002 | Implemented                              | Remaster requires an input/reference asset before persistent job creation. Click and shortcut share the guard.                                                                   |
| CS-003 | Implemented                              | Conservative defaults and a visible correction summary; saved explicit parameters remain valid.                                                                                  |
| CS-004 | Implemented                              | Source or brief precedes source-dependent controls in the composer. Character Lab can start from text.                                                                           |
| CS-005 | Implemented                              | Empty Library explains the state and offers Create an image.                                                                                                                     |
| CS-006 | Implemented                              | No matching images names the search/filter state and offers Clear filters.                                                                                                       |
| CS-007 | Implemented; finding qualified           | Separate search and navigation. The old Style map already contained all modes; it was a discovery issue.                                                                         |
| CS-008 | Implemented                              | Workbench width thresholds preserve 320/360/400 px minimums for three panels.                                                                                                    |
| CS-009 | Implemented                              | Mobile header has separate utility and navigation rows.                                                                                                                          |
| CS-010 | Implemented                              | Brighter secondary text tokens; distinct disabled color. Solid-token contrast is checked separately from image overlays.                                                         |
| CS-011 | Implemented                              | 12 px label and 13 px body tokens; compact controls reduce space rather than text size.                                                                                          |
| CS-012 | Implemented                              | Recent result, source use, and previous result during execution have explicit labels.                                                                                            |
| CS-013 | Implemented                              | Generate summaries explain scenes/cells and file count.                                                                                                                          |
| CS-014 | Implemented                              | Collections describe intent; source packs remain a filter with stable identities.                                                                                                |
| CS-015 | Implemented                              | Empty My styles and Favorites use compact entry controls.                                                                                                                        |
| CS-016 | Implemented                              | Wider collection cards, brighter image previews, fewer decorative flaps and repeated labels.                                                                                     |
| CS-017 | Implemented                              | Count badges use neutral panel/text tokens without decorative text shadows.                                                                                                      |
| CS-018 | Implemented                              | Compact picker uses the full available workspace height with internal scrolling. Existing Escape/focus behavior is retained.                                                     |
| CS-019 | Implemented                              | Independent editing guides show cell boundaries and indices.                                                                                                                     |
| CS-020 | Implemented                              | Match Source and Preserve Style need an image; From prompt selects compatible options.                                                                                           |
| CS-021 | Implemented                              | Short action cards; the compiled technical prompt remains inspectable.                                                                                                           |
| CS-022 | Implemented; finding qualified           | Capacity reads actions available; execution requirements are separate and do not always require an image.                                                                        |
| CS-023 | Implemented                              | Editable numeric Fidelity from 0 to 100, synchronized with the slider.                                                                                                           |
| CS-024 | Implemented within existing workflow     | Current Atlas step and primary row-job action. Completed run steps survive errors. Production atlas composition remains an existing unsupported capability, disclosed in the UI. |
| CS-025 | Implemented                              | Add first keyframe / Create from prompt; no meaningless empty sequence navigation.                                                                                               |
| CS-026 | Implemented                              | Manual playback with partial frames and visible gaps before export; export still requires all frames.                                                                            |
| CS-027 | Implemented                              | Effective generation destination shown separately from external discovery/imports.                                                                                               |
| CS-028 | Implemented                              | Provider-specific next steps; ComfyUI does not inherit CLI or mandatory-key warnings.                                                                                            |
| CS-029 | Implemented                              | Apply plan replaces Write; planned quantities and consequences are shown before confirmation. No maintenance was executed.                                                       |
| CS-030 | Implemented                              | Appearance groups preferences; static logo; retained quick theme toggle.                                                                                                         |
| CS-031 | Implemented                              | Archive terminology is consistent across grid, selected images, tools, and archive dialog.                                                                                       |
| CS-032 | Implemented; existing safeguard retained | Loaded/selected/result counts are explicit. Download-all remains unavailable for a partial catalog.                                                                              |
| CS-033 | Implemented                              | Running jobs show output and execution details as pending, with a smaller placeholder.                                                                                           |
| CS-034 | Implemented                              | Open Library matches visible Library text.                                                                                                                                       |
| CS-035 | Implemented in review export             | Fixtures retain request identity and coherent dates; review HTML loads the production font. Manrope already loaded in the real app.                                              |
| CS-036 | Implemented; finding qualified           | Controlled WebGL failure produces a message and keeps numeric controls. A headless failure is not evidence that normal GPU initialization fails.                                 |
| CS-037 | Implemented                              | Ready setup folds diagnostics and keeps Open Studio prominent.                                                                                                                   |
| CS-038 | Implemented                              | Shared dropdown selection and Cinematic selection use the configured accent. Semantic state colors and artwork remain distinct.                                                  |
| CS-039 | Implemented in review export             | Deterministic failure, review, cancellation, retry, and partial scenarios. They are labelled simulations, not real provider proof.                                               |
| CS-040 | Existing behavior verified               | Aliases already select their Character Lab group and preserve valid saved actions; no replacement implementation.                                                                |

## Verification

- Full `bun run test`: 291 files, 1230 tests; first pass had 7 failures. Updated stale expectations, a missing ResizeObserver test environment, and a test provider setup. The five affected files then passed all 23 tests. Further affected checks passed 58 tests in 8 files, then 16 tests in 3 files, including the four alias cases. No unresolved test failure remains from that run.
- `bun run typecheck:web` and `bun run typecheck:scripts`: passed.
- Final `bun run build`: passed UI, chunk budgets, and server compilation. The last Timeline mobile-focus correction was compiled again in the isolated review build and passed its affected format/lint/type check. The isolated review build completed in about 12 seconds; it contains the current UI with simulated service adapters.
- Full `bun run check`: blocked by 259 formatting findings, 257 outside this task. The two task-owned findings were corrected. The final scoped check passed all 61 task files without warnings, lint errors, or type errors. An earlier concurrent attempt was invalidated when the build replaced `dist` files used by the broad root TypeScript config; the sequential retry passed.
- Live browser: Styles at 1280x720, 1024x768, and 390x844, using actual catalog images. At width 1128 the panels measured 320/360/400; at 1127 the catalog/preview measured 384/707; at 1024, 384/604; at 800, 364/400; at 799 the single panel measured 775. With Jobs at 1024, Preview measured 696. Mobile header used two rows with no overlap.
- Compact style picker follow-up: measured 337x622 at 1280x720, matching the full workspace height. Rendered screenshot confirmed internal scrolling and a visible Done button. The final live Styles check loaded 33 real preview images with a 384 px catalog and 604 px preview, without horizontal overflow.
- Compiled UI: no-results search displays Clear filters; a new Remaster draft uses Fidelity 100 and explicit preserve options; Ctrl+Enter without a source leaves jobs unchanged; Use as source enables the form and changes the result label. Switching workflow preserves a prompt and explicit Fidelity 82. Cinematic reports nine scenes in one file.
- Functional seams: persistent intake rejects source-less Remaster before storing references/jobs; partial animation playback and WebGL failure have focused tests. These tests do not prove provider output quality.

- A focused review-store test passed: partial batch output, retry, cancellation, request identity, linked catalog entries, and coherent dates. No provider was called.
- Compiled review browser: partial Animation showed 2 available / 2 gaps, manual Play/Pause, an explicit missing frame, and disabled incomplete GIF export. Simulated WebGL failure showed the fallback message and accepted an Azimuth keyboard change. Library empty/error states offered Create an image / Retry. At 390 px the content width was exactly 390; navigation occupied a separate 370 px row.
- Timeline mobile: reproduced a hidden-composer focus failure, repaired it using the existing Configure tab seam, then verified Configure selected and Prompt input focused. Empty Prev/Next remain disabled.
- Settings keyboard navigation verified Appearance, the effective Studio Library output path, and separate external folder discovery. Ready onboarding kept Open Studio and folded both setup details and prompt details. Partial Jobs history showed one completed and one failed job with a common batch.
- Solid text-token contrast: dark secondary text against #292929 is 5.56:1 and against #161616 is 6.92:1; paper secondary text against #e4e0d6 is 4.80:1. These measurements do not cover text over artwork or every gradient.
- Code map: all four artifacts published together; 1134 nodes, 5751 edges, 5 bounded static flows. Coverage remains partial with 3084 unresolved references. No new static cycle. Existing tracked `.review` snapshots were restored after saving this task's comparison under `.scratch/interface-audit-map-review`.
- Local UI and backend returned HTTP 200 after the development server recovered. Temporary preview services are stopped at closeout.

## Limits and next action

- Manual visual gate: review the final presentation refinements and browser zoom at 200%. Earlier desktop/mobile screenshots were inspected, but later screenshot requests failed in the in-app browser. Its zoom shortcut left the reported zoom at 1; viewport resizing is not claimed as a substitute for browser zoom. DOM geometry and keyboard checks passed, but these two checks are not marked complete.
- The repository-wide format gate needs a separate cleanup of 257 unrelated files. They were preserved.
- Code-map structural validation is recorded in `.scratch/interface-audit-map-validate.json`; static validity does not prove runtime coverage.
- No real provider generation, destructive maintenance, archive/purge operation, new export ZIP, commit, push, publication, or remote tracker write was performed.
- Preserve the original handoff work and all existing Studio Library data. Local proof logs live in `.scratch/audit-proof-*`; they are not product or provider artifacts.

## Motion follow-up

- Shared dropdowns use the existing motion tokens: 180 ms to open and 120 ms to close. Rows no longer enter one at a time. Reopening continues from the current visual state. Closing menus are inert.
- The compact Styles menu keeps its full available height and remains mounted after first use so CSS can animate its exit. Intensity and preview panels gain subtle entry transitions. Preview positioning no longer animates top or left.
- Native disclosures, including Tools and advanced settings, use a short fade. Menu choices share hover and focus feedback. Keyboard navigation and reduced-motion preferences avoid panel movement.
- Browser proof at 1280x720: Styles remains 622 px high; opening, closing, reopening, Escape focus return, Tools disclosure, and Workspace switcher work. Reduced-motion emulation removes the compact panel transform and transition. The emulation was reset.
- Targeted verification: 20 tests across the dropdown, compact selector, header, and composer pass after correcting an asynchronous test assertion. Scoped formatting, lint, and type checks pass. No full suite or build was run for this motion-only follow-up. No routes, storage contracts, dependencies, or code-map boundaries changed.

## Complete motion coverage pass

The first motion pass did not cover the whole interface. This pass adds shared feedback by control type and connects surface removal to the existing presence adapter.

| Family                                                            | Coverage                                                                                                | Evidence                                                               |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Buttons, links, fields, checkboxes, radio controls, tabs, options | Shared color, border, focus, and press transitions; disabled controls do not press                      | Computed styles in Settings; desktop and mobile screenshots            |
| Header and composer dropdowns                                     | Existing shared dropdown, workspace/provider menus, workflow picker, format/size/model, mobile commands | Workflow and Library sort opened; existing dropdown and composer tests |
| Styles                                                            | Full-height compact menu, intensity/preview panels, card preview dialog, personal style editor          | Existing selector tests; Styles draft preserved                        |
| Native disclosures                                                | Tools, provider details, advanced recipe settings, job details                                          | Remaster advanced corrections opened in browser                        |
| Controlled panels                                                 | Composer advanced settings and recipe options                                                           | Presence lifecycle test; composer tests                                |
| Dialogs                                                           | Settings, help/setup, summary, activity, chat, Archive, confirmation, prompt editor, image editor       | Settings and prompt editor opened/closed; full test suite              |
| Jobs                                                              | Rail entrance/exit and view-content fade                                                                | Jobs opened beside Styles with no horizontal overflow                  |
| Settings sections and workflow view tabs                          | Brief content fade; form state stays in the owning component                                            | Appearance switched on desktop and mobile                              |
| Sliders                                                           | Thumb press feedback, unchanged value tracking                                                          | Fidelity control inspected without changing its value                  |
| Tooltips                                                          | Pointer animation and keyboard-visible focus; existing floating tooltip adapter                         | Keyboard focus styles; menu and editor focus return                    |
| Toasts                                                            | Entry and retained exit; progress uses transform instead of width                                       | Shared presence test and full build                                    |
| Existing route, canvas and image motion                           | Preserved; shared GSAP motion now honors reduced motion and exit state                                  | Full suite and build; no generation or library mutation                |

The presence adapter now retains removed keyed children for 120 ms, makes exits inert, cancels removal on reopen, and supports sequential replacement with `mode="wait"`. Dialog focus restoration does not override a control the user focused during an exit.

Native select option windows and file pickers remain controlled by the browser/OS. Continuous canvas gestures, slider values, typing, and progress measurements stay immediate. Loading indicators retain their semantic motion. Reduced-motion mode removes added movement and exit delay.

Verification: full suite passed (293 files, 1,232 tests). Full build passed including chunk and server checks. Global `bun run check` reported formatting issues in 255 files; scoped checks cover this pass. Desktop proof uses 1280x720; mobile Settings and commands use 390x844 with no horizontal overflow. No generated jobs, commits, remote writes, or library mutations were performed.
