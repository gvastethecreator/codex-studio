# Style Recipe Workflow Plan

This plan resets the Style Preset audit around a more useful workflow: keep the
current fast preset browser, add advanced layer controls only when requested,
and introduce user-authored styles through a local-first `My Styles` pack.

## Quick Path

1. Keep the existing Styles recipe as the default fast path: browse, select,
   generate.
2. Continue extracting style composition into pure helpers before editing large
   preset packs.
3. Add user styles as a local virtual pack backed by SQLite, not by generated
   YAML manifests.
4. Ship the editor in two modes: `Manual` and `Assist`.
5. Let Codex create drafts and audits, but never save a style without user
   review.

## Current State

| Area              | Status                                                                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Audit reset       | Previous local audit artifacts were removed from `.tmp/style-card-review`.                                                                   |
| Inventory         | 17 packs, 1649 presets, 111 categories, complete taxonomy and default-image coverage.                                                        |
| Advanced controls | First slice implemented inside the existing Styles recipe.                                                                                   |
| Composition model | `styleLayerComposer` now owns selected-style layers, field toggles, field weights, and avoid-rule behavior.                                  |
| UI extraction     | `StyleAdvancedControlsPanel` is extracted from `StylesRecipe.tsx`.                                                                           |
| User style model  | Shared contracts, sanitizers, SQLite table/store, API routes, and service calls are implemented.                                             |
| My Styles pack    | Virtual local-first `My Styles` pack is integrated into the Styles browser, tabs, landing cards, search, favorites, and selection flow.      |
| Style editor      | V1 editor supports manual creation, assisted drafts, save/update/archive/duplicate, Save Blend, Clone Style, and Edit Style entry points.    |
| Codex Assist      | Draft route and editor assist mode are wired with validated local fallback drafts; live Codex drafting remains a later provider integration. |
| Browser QA        | Browser smoke passed for `My Styles` create/save/edit/archive, Clone draft, Save Blend draft, and Advanced controls.                         |
| Pack 09 tasks     | Texture audit completed; 57 high-confidence material presets now support `texture_generate`.                                                 |
| Pack reorg        | Deep V2 collection plan documented; source packs stay stable while user-facing collections split mixed packs more aggressively.              |
| Full gates        | Superseded 2026-07-10: `bun run test`, `bun run check`, and `bun run build` pass.                                                            |

## Product Principles

- Simple mode stays simple.
- Advanced mode is demand-mounted and optional.
- User-created styles are first-class local content, not repo source manifests.
- Codex assists authoring, but the user owns final saved presets.
- Storage must remain local-first and recoverable.
- Generated system packs and user packs must be visibly distinct.
- Prompt quality should improve through structured fields, not larger prompt blobs.

## Non-Goals

- Do not write user styles into `components/recipes/styles/manifests/`.
- Do not require runtime regeneration for user-created styles.
- Do not use `localStorage` as durable style storage.
- Do not add a large form to the default Styles screen.
- Do not let Codex save or overwrite a user style automatically.
- Do not make image analysis required for the first editor release.

## Current Plan: Style Presets Refactor And Audit

### Phase 0: Reset And Baseline

Outcome: the new audit starts from a clean baseline.

Done:

- Removed stale local style-card review artifacts.
- Preserved unrelated dirty worktree changes.
- Created the current progress log at
  `logs/manual/style-presets-audit-reset-2026-07-04.md`.
- Confirmed current manifest health with style validation.

Acceptance:

- [x] Old local audit output is not used as current evidence.
- [x] Pack inventory is documented.
- [x] Current validation commands and results are recorded.

### Phase 1: Style System Map

Outcome: the team can see where style data flows before changing many presets.

Map these surfaces:

- Manifest source: packs, categories, preset refs, supported tasks, taxonomy.
- Runtime source: generated chunks, runtime summaries, lazy pack loading.
- Browser source: render plan, virtualization, catalog search, favorites.
- Generation source: selected styles, recipe params, recipe context, provider
  directives.
- Asset source: default images, category fallbacks, result images, stale-image
  diagnostics.

Acceptance:

- [x] Inventory and flat task coverage are documented.
- [ ] Ownership map exists for browser, selection, composition, and generation.
- [ ] Refactor targets are ranked before broad edits.

### Phase 2: Refactor Styles Surface

Outcome: `StylesRecipe.tsx` becomes an orchestration shell instead of one large
owner of browser, selection, prompt composition, and generation behavior.

Completed first slices:

- `components/recipes/styleLayerComposer.ts`
- `components/recipes/StyleAdvancedControlsPanel.tsx`

Next slices:

1. Extract selected-style slot presentation.
2. Extract style setup drawer/aside boundary.
3. Extract pack tab/browser header boundary.
4. Keep prompt composition in pure helpers.
5. Add tests before changing manifest data.

Acceptance:

- [x] Advanced composition has focused unit tests.
- [x] Advanced panel is extracted.
- [ ] Slot surface can be tested or smoke-checked independently.
- [ ] `StylesRecipe.tsx` chunk stays under the current build budget.

### Phase 3: Advanced Style Controls

Outcome: the user can keep a style selected while disabling or down-weighting
specific visual DNA fields.

Implemented model:

- Layer `enabled`
- Layer `strength`
- Per-field `enabled`
- Per-field `weight`
- Avoid-rule mode: `merge`, `ignore`, `strict`

Visual DNA fields:

- Aesthetic
- Subject
- Color
- Lighting
- Texture
- Camera
- Mood
- Quality

Current behavior:

- Simple mode defaults all fields to enabled with weight `1.00`.
- Disabled layers are omitted from generated recipe params.
- Disabled fields are omitted from joined visual DNA values.
- Field weights below `1.00` are serialized as compact annotations.
- Provider directives include active fields and avoid-rule mode.

Next options:

- Add global blend controls after per-layer behavior settles.
- Decide whether to lazy-load Advanced controls.
- Add preset-level advanced metadata only after pack audits justify it.

Acceptance:

- [x] Desktop smoke opens Advanced controls after selecting a style.
- [x] Mobile smoke opens Advanced controls through the setup drawer.
- [x] Focused tests cover omitted fields, weights, disabled layers, and avoid rules.
- [ ] UI copy and tooltip pass after the first user-facing review.

### Phase 4: Task And Workflow Granularity

Outcome: style packs declare workflows they actually support.

Current finding:

- Most presets still support only `image_generate`, `image_edit`, and
  `style_preset_card`.
- `pack_09` is the first audited texture slice: 57 high-confidence material
  presets now support `texture_generate`.
- Only `pack_06` currently has `sprite_sheet` presets.

Candidate audit order:

| Priority | Pack                                 | Reason                                                                       |
| -------- | ------------------------------------ | ---------------------------------------------------------------------------- |
| 1        | `pack_09` Texture & Materiality      | Natural first candidate for `texture_generate`.                              |
| 2        | `pack_10` Abstract & Experimental    | Some presets may be surface/material workflows.                              |
| 3        | `pack_06` Essential Art Styles       | Existing sprite support needs workflow review.                               |
| 4        | `pack_12` Video Game Originals Vault | Game-world styles may need task hints and sprite adjacency.                  |
| 5        | `pack_05`, `pack_13`, `pack_16`      | Anime packs need prefix consistency and character/reference workflow review. |

Acceptance:

- [x] Audit rubric exists before changing pack data.
- [x] `pack_09` has a decision table for texture candidates.
- [x] Any task change has focused `styles:validate` coverage.

### Phase 5: Pack Quality Audit

Outcome: edits improve usefulness, not only catalog neatness.

Score each preset on:

- Transferability across subjects.
- Distinctness from neighboring presets.
- Visual DNA completeness.
- Avoid-rule quality.
- Task support fit.
- Default-card usefulness.
- Advanced-control readiness.
- Category and taxonomy fit.

Decision states:

- `keep`
- `edit text`
- `change tasks`
- `split`
- `merge or archive later`
- `needs generated preview review`

Acceptance:

- [ ] Each audited pack has a small decision table.
- [ ] Broad manifest rewrites are avoided.
- [ ] Any preset edit keeps source manifests in English with durable slugs.

### Phase 6: Provider Directives And Traceability

Outcome: providers receive compact, structured instructions while source specs
remain complete for traceability.

Rules:

- Do not send disabled fields.
- Preserve selected layer order.
- Preserve source spec fields for history/debugging.
- Keep stable output rules in Provider Session Contract.
- Prefer Recipe Provider Directives once focused tests prove parity.

Acceptance:

- [x] Advanced selected-style directives serialize active fields.
- [x] Preset IDs are not leaked into provider-facing selected style directives.
- [ ] Pack task changes include directive fixtures when needed.

## Next Plan: User Style Editor

### Product Decision

Add a local-first `My Styles` pack that contains user-authored presets.

This should be a virtual runtime pack backed by SQLite and projected into the
existing Styles browser. It must not mutate generated system manifests.

### User Experience

The default Styles flow remains unchanged:

1. Browse official or user packs.
2. Select styles.
3. Generate.

The editor appears only from explicit actions:

- `Create Style`
- `Clone Style`
- `Save Blend`
- `Edit Style`

Recommended creation paths:

| Path          | Purpose                                             | First release |
| ------------- | --------------------------------------------------- | ------------- |
| `Save Blend`  | Turn current selected layers into a reusable style. | Yes           |
| `Clone Style` | Duplicate an official preset into `My Styles`.      | Yes           |
| `Blank Style` | Start from an empty form.                           | Optional      |
| `Assist Me`   | Ask Codex to draft or improve a style.              | Yes, scoped   |

### Editor Modes

#### Manual

Manual mode is for precise editing.

Fields:

- Name
- Category
- Tags
- Supported tasks
- Avoid rules
- Visual DNA fields
- Creative brief
- Optional source note
- Optional preview/default image reference

The form should avoid showing eight empty textareas as the default first
impression. Prefer populated drafts from `Clone Style`, `Save Blend`, or Codex
Assist.

#### Assist

Assist mode is for drafting, improvement, and audit.

Inputs:

- Plain description of the desired style.
- Optional current selected style layers.
- Optional current prompt.
- Optional existing draft.

Actions:

- `Draft from description`
- `Improve draft`
- `Make more transferable`
- `Create variants`
- `Audit style quality`

Codex output is always a draft. The user must review and save it manually.

### Codex Assist Contract

Codex Assist should return strict structured JSON, not prose.

```ts
interface CodexStyleDraft {
  name: string;
  category: string;
  tags: string[];
  supportedTasks: Array<
    'image_generate' | 'image_edit' | 'style_preset_card' | 'sprite_sheet' | 'texture_generate'
  >;
  visualDna: {
    aesthetic: string;
    subject_treatment: string;
    color_and_tone: string;
    lighting_and_shadow: string;
    texture_and_material: string;
    camera_and_composition: string;
    atmosphere_and_mood: string;
    rendering_and_quality: string;
    creative_brief: string;
  };
  avoidRules: string[];
  warnings: string[];
}
```

Validation rules:

- Reject missing required visual DNA fields.
- Reject empty names.
- Reject unsupported task values.
- Warn when text is too scene-specific.
- Warn when the style depends on one location, prop, character, franchise, or
  fixed story beat.
- Warn when avoid rules are empty for photo/texture/image-edit styles.
- Never apply a draft directly to storage without user confirmation.

### Storage Model

Use a dedicated SQLite table, not Studio Settings.

Proposed table:

```sql
CREATE TABLE IF NOT EXISTS user_style_presets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  domain TEXT,
  tags_json TEXT NOT NULL,
  supported_tasks_json TEXT NOT NULL,
  visual_dna_json TEXT NOT NULL,
  avoid_rules_json TEXT NOT NULL,
  attributes_json TEXT,
  assets_json TEXT,
  source_json TEXT,
  is_archived INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

Indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_user_style_archived_updated
  ON user_style_presets(is_archived, updated_at DESC);
```

Why not settings JSON:

- User styles are content, not preferences.
- Search, archive, import/export, and future previews need row-level behavior.
- A dedicated table keeps migrations and validation explicit.

### Shared Types

Add provider-independent contracts under `packages/shared/src`.

Suggested types:

- `UserStylePreset`
- `CreateUserStylePresetInput`
- `UpdateUserStylePresetInput`
- `UserStylePresetDraft`
- `CodexStyleDraftRequest`
- `CodexStyleDraftResponse`

Keep runtime conversion near the Styles recipe:

- `UserStylePreset` -> `StyleRuntimePreset`
- `UserStylePreset[]` -> virtual `StyleRuntimePack`

### Backend API

Routes:

| Method   | Path                             | Purpose                                  |
| -------- | -------------------------------- | ---------------------------------------- |
| `GET`    | `/api/styles/user`               | List active user styles.                 |
| `POST`   | `/api/styles/user`               | Create a reviewed user style.            |
| `PATCH`  | `/api/styles/user/:id`           | Update a user style.                     |
| `DELETE` | `/api/styles/user/:id`           | Archive a user style.                    |
| `POST`   | `/api/styles/user/:id/duplicate` | Duplicate a style.                       |
| `POST`   | `/api/styles/draft`              | Ask Codex to produce or improve a draft. |

Route rules:

- Return sanitized JSON only.
- Do not expose provider secrets.
- Do not write files outside Studio Library.
- Do not require image generation to save a style.
- Keep draft generation separate from image generation jobs.

### Frontend Integration

New modules:

- `services/studio-api/userStyles.ts`: user style API calls.
- `hooks/useUserStylePresets.ts`: loading, saving, archiving, refresh state.
- `components/recipes/UserStyleEditorSurface.tsx`: editor shell.
- `components/recipes/UserStyleEditorManual.tsx`: manual form.
- `components/recipes/UserStyleEditorAssist.tsx`: Codex-assisted draft form.
- `components/recipes/userStyleRuntimeAdapter.ts`: converts DB rows to runtime pack.

Styles browser integration:

- Add virtual pack summary: `user_styles`, name `My Styles`.
- Keep it visually distinct from official packs.
- Show empty state with `Create Style` and `Save Blend` actions.
- Let user styles participate in search and selection.
- Mark user styles with a small local/custom badge.

### Save Blend Flow

Save Blend should use the selected advanced layers as input.

Draft behavior:

1. Read selected layers from `styleLayerComposer`.
2. Build a normalized visual DNA draft from active fields.
3. Merge avoid rules using the selected avoid-rule modes.
4. Suggest a category such as `Custom Blends`.
5. Let the user name and edit before saving.

Acceptance:

- [ ] Saving a blend produces a user style visible in `My Styles`.
- [ ] Disabled fields are not saved as active style DNA.
- [ ] Field weights influence saved text or metadata predictably.
- [ ] The saved style can be selected like an official preset.

### Clone Style Flow

Clone Style should copy an existing preset into editable local content.

Rules:

- Preserve source metadata in `source_json`.
- Generate a new local id.
- Copy visual DNA and avoid rules.
- Do not mutate the official preset.
- Mark the clone as user-owned.

Acceptance:

- [ ] Cloning an official style creates one editable local style.
- [ ] The clone appears in `My Styles`.
- [ ] Editing the clone does not change official pack data.

### Codex Assist Flow

Assist should run after manual input, before save.

First release actions:

1. `Draft from description`
2. `Improve draft`
3. `Make more transferable`

Optional later actions:

- `Create 3 variants`
- `Extract from image`
- `Generate style card preview`
- `Audit against neighboring presets`

Codex prompt should instruct:

- Return only JSON.
- Build transferable style mechanics.
- Avoid fixed scenes, copyrighted identities, readable text, logos, and named
  character dependence.
- Keep all fields concise but specific.
- Include warnings for weak fields or scene-locked language.

Acceptance:

- [ ] Draft response validates before entering the editor.
- [ ] Invalid draft responses show recoverable UI errors.
- [ ] User review is required before saving.
- [ ] Draft generation does not enqueue an image generation job.

### Preview Strategy

Do not require generated previews for v1.

Preview options by phase:

1. Use pack/custom badge placeholder.
2. Let user choose an existing catalog image as preview.
3. Add `Generate Style Card` action after user style storage is stable.

Acceptance:

- [ ] Missing preview image does not block saving.
- [ ] Browser cards have a usable fallback.
- [ ] Preview generation remains optional and explicit.

## Implementation Sequence

### Slice 1: User Style Contracts And Storage

Build:

- Shared types and sanitizers.
- SQLite migration.
- Store functions.
- Unit tests for sanitize/create/update/archive.

Validation:

```bash
bun run test -- packages/shared/src/<user-style-tests> apps/local-server/src/<user-style-store-tests>
bun run check -- packages/shared/src/<user-style-files> apps/local-server/src/<user-style-files>
```

Status: implemented.

### Slice 2: User Style API

Build:

- Hono routes.
- App factory wiring.
- Domain client calls through `services/studio-api/userStyles.ts`.
- Route tests.

Acceptance:

- [x] List/create/update/archive work through injected storage.
- [x] Invalid payloads are sanitized or rejected with useful errors.

Status: implemented.

### Slice 3: Virtual `My Styles` Pack

Build:

- `userStyleRuntimeAdapter`.
- Hook for user style loading.
- Merge virtual pack into Styles browser.
- Empty state actions.

Acceptance:

- [x] `My Styles` appears without breaking official pack loading.
- [x] Official pack browser performance remains stable after browser smoke.
- [x] User styles can be selected and generated through the existing style slot flow.

Status: implemented and browser-smoked.

### Slice 4: Manual Editor

Build:

- Demand-mounted editor surface.
- Manual fields with simple validation.
- Save/update/archive actions.

Acceptance:

- [x] User can create and edit a style manually.
- [x] Validation blocks incomplete required fields through shared sanitizers.
- [x] The existing Styles recipe remains usable with editor closed after browser smoke.

Status: implemented and browser-smoked.

### Slice 5: Save Blend And Clone Style

Build:

- Save current selected layer blend.
- Clone selected official preset.
- Source metadata.

Acceptance:

- [x] Save Blend preserves selected active layer intent as editable visual DNA.
- [x] Clone Style preserves official preset values without mutating source data.

Status: implemented.

### Slice 6: Codex Assist Drafts

Build:

- Draft request/response contracts.
- Backend route for Codex-assisted style drafting.
- Assist tab UI.
- Validation and warnings display.

Acceptance:

- [ ] Live Codex drafts structured JSON only.
- [x] Drafts enter the editor as editable unsaved data.
- [x] User confirmation is required to persist.
- [x] Draft generation does not enqueue an image generation job.

Status: implemented with local fallback draft service; live Codex provider call remains future work.

### Slice 7: Pack Audit Resume

After user style editor v1 is stable, resume preset audit:

1. Define scoring columns.
2. Audit `pack_09`.
3. Mark `texture_generate` candidates.
4. Validate focused pack changes.
5. Record decisions before broad edits.

Status: completed first slice. `docs/STYLE_PACK_09_TEXTURE_AUDIT.md`
records the rubric and decisions. `pack_09` validation passed and runtime data
was regenerated.

### Slice 8: Style Pack Reorganization

Reorganize the browser around user-facing collections before moving manifests.
Architecture is documented in
`docs/STYLE_COLLECTION_ARCHITECTURE_PLAN.md`.

Build first:

- Collection contracts and runtime projection.
- Collection metadata with stable ids.
- Collection entries that can point to a full pack or a pack category.
- Pack landing grouped by collections.
- Deep links and existing pack tabs preserved.

Target early splits:

1. Put `pack_02/photography-eras` under Photography, Optics & Scientific
   Imaging, not Cinema.
2. Separate Cinema, TV & Broadcast from Animation & Cartoons.
3. Group `pack_05`, `pack_13`, and `pack_16` into one Anime & Manga collection.
4. Separate Illustration/Publishing from Painting, Drawing, Print & Mixed Media.
5. Move "Miscellaneous & Fun" out of top-level navigation by splitting it into
   Play/Craft/Food, Art Media, Aesthetics/Punk, and Technical/Scale slices.
6. Cross-link Materials, Textures & Patterns across `pack_09`, `pack_10`,
   `pack_08`, and `pack_03`.

Acceptance:

- [x] `docs/STYLE_PACK_REORGANIZATION_PLAN.md` defines target collections.
- [ ] Collection surface ships without moving manifests.
- [ ] Existing `#recipe-styles/pack_XX` URLs still work.
- [ ] Browser smoke verifies pack landing, direct pack open, and category entry behavior.

## Validation Strategy

Use focused checks while iterating:

```bash
bun run check -- <touched files>
bun run test -- <focused tests>
bun run styles:source:verify
bun run styles:runtime:check
bun run styles:render:verify
```

Use broad closeout after feature slices:

```bash
bun run test
bun run check
bun run build
```

Use browser checks after UI slices:

```bash
bun run styles:browser:verify -- --url=http://localhost:17222/#recipe-styles
```

Add Playwright smoke checks for:

- Desktop Advanced controls.
- Mobile setup drawer and Advanced controls.
- `My Styles` empty state.
- Create style, save, select, generate button enabled.

## Open Questions

| Question                                 | Recommended answer                                            |
| ---------------------------------------- | ------------------------------------------------------------- |
| Should user styles live in manifests?    | No. Use SQLite and virtual packs.                             |
| Should Codex save drafts automatically?  | No. Drafts require user review.                               |
| Should `Blank Style` ship in v1?         | Optional. `Save Blend` and `Clone Style` are safer first.     |
| Should previews be required?             | No. Add optional previews after storage and selection work.   |
| Should Assist analyze images in v1?      | No. Start with text and selected-layer context.               |
| Should Advanced controls be lazy-loaded? | Decide after build chunk evidence from the next broad build.  |
| Should pack reorg move manifests first?  | No. Add collection UX first; migrate source only after proof. |

## Immediate Next Step

Build the collection-first Style Pack reorganization slice from
`docs/STYLE_PACK_REORGANIZATION_PLAN.md` and
`docs/STYLE_COLLECTION_ARCHITECTURE_PLAN.md`:

1. Add collection contracts and metadata.
2. Add runtime projection for collection summaries and resolved preset lists.
3. Make the Style browser landing collection-first.
4. Preserve source pack direct links.
5. Use `pack_02` as the proof slice: Photography Eras moves to Photography,
   Cinema/TV separates from Animation/Cartoons, and Anime references cross-link
   without manifest moves.
