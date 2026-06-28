# Character Lab Recipe Plan

Date: 2026-06-23
Status: Studio-native workflow integrated and visually verified

## Objective

Integrate the complete `port-this/` character-production workflow into Codex Studio as a Studio-native recipe named `Character Lab`, preserving every reference option and adapting execution to the Codex-first recipe/provider/catalog pipeline.

## Source Inventory

The reference app contributes:

- 39 pose actions.
- 41 special/character-sheet actions.
- 48 spritesheet actions.
- 80 scene actions.
- 38 effect actions.
- 8 motion/video actions.
- 7 profile/live-interview actions.
- 47 style options.
- 104 clothing options.
- 12 body-type options.
- 16 expression options.
- 14 palette presets.
- 10 requested aspect-ratio values grouped as square, landscape, portrait, and flexible.

Current generated catalog: `lib/characterLabCatalog.generated.ts`.

## Product Direction

Use `Character Lab`, not plain `Assets`, because Studio already uses `Local Asset`, `Catalog Entry`, and output-source vocabulary. The recipe should feel like a production workbench:

- Source image first.
- Up to three additional reference images.
- Left column owns source upload/dropzone first, then Action Setup with global character controls, reference slots, prompt preview, and generation action.
- Center column owns the action browser: mode tabs in one horizontal row, search below, then grouped action options.
- Right column owns the selection summary, source/action preview composition, selected option cards, prompt snapshot, and recent Character Lab outputs.
- Motion/Profile/Live visible as planned capabilities until provider-independent tasks and durable persistence exist.

ImageGen concept guides were generated as part of ideation, then rejected after reviewing the live `port-this` app. The implemented prototype follows the simpler reference layout instead of those exploratory mockups. ImageGen is now used for the production icon source sheet only.

## Architecture Decisions

- Do not port `port-this/server.ts`, Vite env defines, direct Gemini client flow, localStorage history, or standalone app shell.
- Keep UI inside `RecipeRouter` and `RecipeLayout`.
- Keep prompt construction in pure helpers and recipe context builders, not React components.
- Keep all action IDs/prompts in a typed generated catalog.
- Compile recipe params into Generation Task Specs and provider directives.
- Use Catalog Entry / Local Asset as durable output truth.
- Preserve source/reference intent by treating the first Character Lab attachment as `input` and up to three later attachments as `reference`.
- Use existing task kinds for phase 1: `image_generate`, `image_edit`, and `sprite_sheet`.
- Do not add `video_generate`, profile-analysis, or live-audio task kinds until their provider boundary and persistence requirements are designed.

## Prototype Scope

Implemented prototype target:

- New recipe id: `character-lab`.
- New recipe card image: `assets/recipes/cards/recipe-character-lab.webp`.
- New lazy recipe surface: `components/recipes/CharacterLabRecipe.tsx`.
- New generated action catalog: `lib/characterLabCatalog.generated.ts`.
- New prompt helper: `lib/characterLabPrompt.ts`.
- New context builder: `lib/recipeContextBuilders/characterLab.ts`.
- New atlas: `assets/recipes/character-lab/character-lab-control-atlas.png`.
- New atlas manifest: `assets/recipes/character-lab/character-lab-control-atlas.manifest.json`.
- New TS atlas frame map: `lib/characterLabIconAtlas.generated.ts`.

Prototype behavior:

- Source upload slot.
- Three reference slots.
- Tabs for all seven workflow modes.
- Full per-mode action lists grouped by source categories, with search.
- Batch and prompt controls for category-level options.
- Right configuration panel with style, clothing, body type, expression, background color, and requested ratio controls.
- Prompt preview.
- Character Lab output thumbnails with use-as-source, filtered away from unrelated Studio renders.
- Generate button for ready image/spritesheet actions.
- Preflight notice for Motion/Profile/Live planned capabilities.

Pipeline hardening added after prototype review:

- `localGenerationRun` preserves Character Lab source/reference roles when creating backend task assets, so the first recipe attachment remains the primary `input` all the way to the provider boundary.
- Character Lab recipe params now include subject/key details, media type, frame count, and couples/group-pose intent for traceable specs and compact provider directives.
- Category batch generation builds the prompt and recipe params from the launched action, not from whichever action was previously selected.
- Reference uploads are gated until a source image exists, matching the current source-first attachment contract.
- The inspector UI now separates action setup, character brief, controls, references, and generation without duplicate subject fields.

Interface polish added after first integration review:

- Action cards use a two-column browser with larger atlas sprites so the neutral mannequin/action icons read at browsing distance.
- Mode tabs, source controls, contextual batch, selected action, empty canvas, references, and generation controls now use context-appropriate icon sizes instead of shrinking atlas art into unreadable micro-icons.
- The category header was condensed by removing the redundant per-category prompt-preview command.
- Form controls now include names and stronger focus-visible states for keyboard use.
- Source and action surfaces were reduced and restyled to match the dense dark Studio tool language more closely.
- The recipe now uses floating left/right work panels around an unboxed canvas instead of a single heavy full-surface frame.
- `Prompt` and `Generate` are styled as compact action cards in the setup panel, with icon slots and secondary labels instead of generic rectangular buttons.
- The source picker is a single compact drop target; the redundant source-selection button was removed.
- Native selects were replaced with animated Studio-native dropdown/listbox controls, including keyboard navigation, click-outside close, Escape close, icon slots, selected state, and exact open/close motion.
- All enabled buttons now expose a pointer cursor and dense controls use press/hover transitions with reduced-motion coverage.
- The central preview now shows a larger staged character preview, source/reference tray, large portrait cards for the current option configuration, and a compact prompt snapshot instead of a mostly empty canvas.
- Dropdowns and preview cards now use dedicated generated option icons for expression, ratio, style, clothing, and body type instead of generic heuristic action sprites.
- Dropdown option icon QA generated 189 rendered options from the generated option atlas with zero missing atlas sprites.
- The central preview keeps selected output/action identity and attached source imagery as separate portrait cards, so uploading a source no longer visually replaces the selected action.
- Prompt Snapshot now sits below the preview/context composition; context cards use height-constrained portrait previews and only appear in the center when there is enough horizontal room, avoiding overlap with the Action Setup panel.
- The 2026-06-27 redesign moved the source dropzone and Action Setup into the left column, moved mode tabs/search/action options into the center column, and moved selected-output/source/options/prompt preview into the right summary column. Mobile stacks those columns in the same order.
- The stronger 2026-06-27 redesign rebalanced the desktop workbench to 30% / 30% / 40%, replaced the large source dropzone with a four-slot attachment row (`Main`, `R1`, `R2`, `R3`) that unlocks references after the principal image, removed the redundant prompt/preview controls, switched the action browser to vertical recipe-styles-inspired cards, and made the right column own selected inputs, option previews, prompt, and outputs.
- The current 2026-06-27 density pass keeps the workbench at 100% available width with a 25% / 30% / 45% desktop ratio, removes the left-column selected-action highlight card, and keeps Generate as a floating bottom-right action over the preview panel.
- The action browser now follows the recipe-styles density pattern with width-driven card tracks: compact vertical cards auto-fit from 2 to 5 columns as the middle panel grows, with tighter title/description spacing and prompt-derived descriptions.
- The right panel now behaves like a compact bento summary: source and selected inputs share the top row when width allows, option previews auto-fit below, and the prompt snapshot shares horizontal space instead of forcing a long single-column stack.

## Icon Atlas Strategy

Use a generated raster atlas strategy:

- Tabler icons remain the standard for common UI controls.
- The Character Lab atlas provides one real raster sprite frame per ported action and control button.
- The source sheet was generated with ImageGen, then normalized and composed through `sprite-atlas-builder` using the `custom-asset-atlas` slot workflow.
- The runtime atlas was rebuilt from 512px source frames into centered 128px cells with content-fit cropping and mild sharpening before resize.
- The atlas uses shared visual families by mode plus per-action frame IDs, so the catalog is complete without hundreds of imports.
- Accessible names come from button labels/tooltips, not decorative sprite pixels.

Atlas count:

- 261 action frames.
- 18 control frames.
- 279 total frames.
- Runtime atlas size: 2048x2304.
- Runtime cell size: 128px.
- Runtime SHA-256: `a10347718291477aa1c64673f58b6d05ae965469cfeaf1b113cdff19324e622f`.
- Source icon grids: 18 PNG grids at 2048x2048, 512px per slot.
- Source slots: 288 generated slots, including 9 intentional empty cells outside runtime.
- Runtime icon QA: 279/279 frames present, p95 center offset 12.5px after stricter visible-pixel measurement, no missing ids.
- Edge-artifact cleanup removes small border-connected components before runtime cropping; latest run cleaned 130 control frames, 740 components, and 99,728 pixels.
- Visual audit contacts: `output/character-lab-icon-audit/control-atlas-page-1.png` through `output/character-lab-icon-audit/control-atlas-page-6.png`.

Atlas files:

- Runtime PNG: `assets/recipes/character-lab/character-lab-control-atlas.png`.
- Runtime manifest: `assets/recipes/character-lab/character-lab-control-atlas.manifest.json`.
- ImageGen source sheet: `assets/recipes/character-lab/sources/character-lab-imagegen-icon-sheet.png`.
- 512px source grids: `assets/recipes/character-lab/sources/mannequin-v1-512/`.
- Source mapping/provenance: `assets/recipes/character-lab/character-lab-control-atlas.source.json`.
- Builder QA report: `assets/recipes/character-lab/character-lab-control-atlas.report.json`.
- Icon asset QA report: `assets/recipes/character-lab/character-lab-icon-assets.qa.json`.
- Rebuild command: `bun run assets:character-lab:icons`.

## Option Icon Atlas Strategy

Use a second generated raster atlas for global option values:

- Expression, aspect-ratio, style, clothing, and body-type options each get one stable `option:*` id.
- ImageGen source sheets are generated as 2x2 grids so each option starts from a large 512px source cell.
- The builder exports 512px normalized frames for large preview portrait cards and a 128px runtime atlas for dropdown/listbox controls.
- The UI maps option text to ids with the same slug contract used by `scripts/prepare-character-lab-option-icon-prompts.ts`.
- If a future option is missing a frame, the UI falls back to the older mode/action atlas, but the QA report should keep `missing: []`.

Option atlas count:

- 16 expression frames.
- 10 aspect-ratio frames.
- 47 style frames.
- 104 clothing frames.
- 12 body-type frames.
- 189 total option frames.
- Runtime atlas size: 2048x1536.
- Runtime cell size: 128px.
- Runtime SHA-256: `75d80cfc2fef608334cf17142027679fac655d5319c4ab1ed43e5ecce5ed05ae`.
- Source option grids: 48 PNG grids at 1024x1024 or larger, 2x2 layout.
- Normalized source frames: 189 PNG frames at 512px.
- Runtime option QA: 189/189 frames present, p95 center offset 1px, no missing ids.
- Edge-artifact cleanup removes small border-connected components before 512px frame export and runtime atlas composition; latest run cleaned 66 option frames, 248 components, and 65,120 pixels.
- Visual audit contacts: `output/character-lab-icon-audit/all-frames-page-1.png` through `output/character-lab-icon-audit/all-frames-page-4.png`.

Option atlas files:

- Runtime PNG: `assets/recipes/character-lab/character-lab-option-atlas.png`.
- Runtime manifest: `assets/recipes/character-lab/character-lab-option-atlas.manifest.json`.
- Source mapping/provenance: `assets/recipes/character-lab/character-lab-option-atlas.source.json`.
- Option icon QA report: `assets/recipes/character-lab/character-lab-option-atlas.qa.json`.
- Source 2x2 grids: `assets/recipes/character-lab/sources/option-icons-v1/`.
- Normalized 512px frames: `assets/recipes/character-lab/sources/option-icons-v1/frames-512/`.
- TS atlas/source frame map: `lib/characterLabOptionIconAtlas.generated.ts`.
- Prompt planner: `scripts/prepare-character-lab-option-icon-prompts.ts`.
- Rebuild command: `bun run assets:character-lab:option-icons`.

## Implementation Phases

### Phase 1: Studio-Native Image Prototype

Deliver the current prototype and make sure it can generate through existing queue/provider/catalog paths.

Acceptance:

- `character-lab` appears in the recipe catalog.
- Selecting it opens the lazy recipe surface.
- `image_generate`, `image_edit`, and `sprite_sheet` actions compile into provider-independent specs.
- First attachment becomes source/input; up to three more remain references.
- Motion/Profile/Live are visible but gated.
- Prompt preview matches selected action and controls.
- Backend queued assets preserve the same source/reference roles as the Generation Task Spec.
- Visual QA screenshots cover desktop, mobile action browser, and mobile inspector states.

### Phase 2: Catalog-Backed Character Asset Model

Design durable character asset metadata around Catalog Entries.

Acceptance:

- Source image, references, generated outputs, notes, and selected profile data can be associated without storing large base64 blobs in hot reads.
- Summary-first views remain small.
- Export uses catalog/local asset paths.

### Phase 3: Structured Profile Jobs

Add provider-independent structured analysis tasks for profile, style analysis, equipment, hooks, attributes, and dialogue.

Acceptance:

- No direct frontend provider calls.
- JSON schema validation at backend boundary.
- Durable profile details linked to character asset or catalog output.
- Hot catalog reads do not load full profile detail.

### Phase 4: Motion/Video

Add video-generation task support only after media output contracts, playback UI, retention policy, and provider preflight are ready.

Acceptance:

- New task kind or equivalent provider-neutral contract.
- Video catalog/media metadata.
- Provider capability gate for Google/Veo or other supported providers.
- UI playback and export path.

### Phase 5: Live Interview

Add live audio interview as a demand-mounted provider-specific surface.

Acceptance:

- No secrets in frontend/build config.
- WebSocket/audio lifecycle is isolated.
- Capability preflight blocks unsupported providers.
- Transcript/summary persistence is explicit and bounded.

## Validation Plan

Focused checks:

- `vp test run lib/recipeModules.test.ts`
- `vp test run lib/recipeCatalog.test.ts`
- `vp test run lib/recipeContextBuilders/index.test.ts`
- `vp test run lib/studioGenerationRequest.test.ts`
- `bun run recipes:catalog -- --json`
- `bun run recipes:verify`
- `bun run ui:source:verify`
- `bun run ui:chunks:verify`

Closeout gates:

- `bun run test`
- `bun run check`
- `bun run build`

Visual QA:

- Desktop recipe catalog with Character Lab card.
- Desktop Character Lab default surface.
- Full action browser open.
- Long option names in inspector selects.
- Source + three references.
- Motion/Profile preflight state.
- Mobile/narrow viewport with no incoherent overlap.

Latest evidence:

- `output/playwright/character-lab-integrated-desktop-clean.png`
- `output/playwright/character-lab-integrated-mobile-clean.png`
- `output/playwright/character-lab-integrated-mobile-inspector-mid.png`
- `output/playwright/character-lab-integrated-mobile-inspector-visible.png`
- `output/playwright/character-lab-polish-desktop.png`
- `output/playwright/character-lab-polish-mobile-top.png`
- `output/playwright/character-lab-polish-mobile-inspector.png`
- `output/playwright/character-lab-floating-desktop-1782257950520.png`
- `output/playwright/character-lab-floating-mobile-clean-closed-queue.png`
- `output/playwright/character-lab-dropdown-icons-qa.png`
- `output/playwright/character-lab-polish-dropdown-preview-desktop.png`
- `output/playwright/character-lab-polish-preview-mobile.png`
- `assets/recipes/character-lab/character-lab-icon-assets.qa.json`
- `output/playwright/character-lab-icon-assets-desktop.png`
- `output/playwright/character-lab-icon-assets-mobile-clean.png`
- `output/playwright/character-lab-icon-assets-visual-qa.json`
- `assets/recipes/character-lab/character-lab-option-atlas.qa.json`
- `output/playwright/character-lab-option-cards-desktop.png`
- `output/playwright/character-lab-option-dropdown-expression.png`
- `output/playwright/character-lab-option-cards-mobile.png`
- `output/playwright/character-lab-option-cards-mobile-preview.png`
- `output/playwright/character-lab-option-cards-visual-qa.json`
- `output/playwright/character-lab-redesign-desktop.png`
- `output/playwright/character-lab-redesign-mobile-top.png`
- `output/playwright/character-lab-redesign-mobile-browser.png`
- `output/playwright/character-lab-redesign-mobile-actions.png`
- `output/playwright/character-lab-redesign-mobile-preview.png`
- `output/playwright/character-lab-303040-redesign-final-desktop.png`
- `output/playwright/character-lab-303040-redesign-inspect-mobile-top.png`
- `output/playwright/character-lab-303040-redesign-inspect-mobile-browser.png`
- `output/playwright/character-lab-303040-redesign-inspect-mobile-actions.png`
- `output/playwright/character-lab-303040-redesign-inspect-mobile-preview.png`
- `output/playwright/character-lab-303040-redesign-inspect-mobile-prompt.png`
- `output/playwright/character-lab-303040-redesign-ultrawide-2560.png`

## Known Non-Goals For Phase 1

- No standalone Express server.
- No direct Gemini client import.
- No Vite-exposed provider secret.
- No localStorage history clone.
- No new video/live/profile backend yet.
- No new dependency for icons.
