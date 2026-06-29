# Style Preset Manifest Reorganization (2026-05-28)

## Scope

Reorganize `Style Pack Manifest` and `Style Preset Manifest` taxonomy to:

- split overloaded anime inventory into coherent packs,
- remove mixed-language taxonomy drift (ES/EN),
- eliminate legacy game catch-all category ids,
- keep compatibility with existing preset ids and manifest graph validation.

This plan follows ADR-0025 (granular manifests) and keeps stable preset identity (`id`, `packId`, file path).

## Findings

### Files

- `components/recipes/styles/manifests/packs/*.yaml`
- `components/recipes/styles/manifests/presets/**/*.yaml`

### Problem

- 7 packs still collapse all presets into a legacy game catch-all category id.
- Category id naming is mixed (`kebab-case` vs `snake_case`).
- Language is mixed in pack metadata (English + Spanish).
- Anime content is semantically broad and currently too dense for one main pack family.

### Solution

1. Normalize naming policy:
   - `category.id` MUST be `kebab-case`.
   - taxonomy ids and tags MUST be English.
2. Split anime inventory into 3 coherent `Style Pack Manifest` groups.
3. Replace legacy game catch-all categories in affected packs with domain-correct categories.
4. Migrate taxonomy fields in affected preset manifests with scripted safety checks.

### Benefits

- Better locality for editorial maintenance (smaller semantic groups).
- Higher leverage in catalog search and browse (less catch-all ambiguity).
- Stronger validation surface (naming/language drift becomes detectable).

### Before / After

**Before:** several packs with a single legacy game catch-all category and mixed-language metadata.

**After:** domain-specific categories, English-only taxonomy ids/tags, balanced anime split across 3 pack groups.

### Recommendation strength

**Strong**

### Dependencies / sequencing

1. Metadata normalization first (safe, low risk).
2. Anime split decision and pack/category mapping freeze.
3. Category migration for legacy game catch-all packs.
4. Validation guardrails in CI for naming/language policy.

### Documentation follow-ups

- `docs/STYLE_PRESET_AUTHORING.md`: add explicit language policy + naming rules.
- `SKILLS.md`: reinforce taxonomy migration workflow + validation checks.

## Approved anime split (3-pack model)

Total anime inventory considered: `pack_05` + `pack_13`.

### A) Anime Battle & Worlds

Target semantic focus: action, combat, sci-fi/fantasy world pressure.

Includes current categories:

- `pack_05 :: 1. Modern Shonen & Action`
- `pack_05 :: 7. Mecha & Cyberpunk`
- `pack_05 :: 8. Isekai & High Fantasy`
- `pack_05 :: 9. Dark Fantasy & Seinen`
- `pack_13 :: 3. Action`

### B) Anime Classics & Prestige

Target semantic focus: era classics, auteur lineages, prestige visual identity.

Includes current categories:

- `pack_05 :: 2. 2000s Classics`
- `pack_05 :: 3. 90s Golden Era`
- `pack_05 :: 6. Sports, Competition & Performance`
- `pack_05 :: 10. Studio Masterpieces`
- `pack_05 :: 11. 70s & 80s Retro Anime`
- `pack_13 :: 4. Samurais & Medieval`
- `pack_13 :: 5. Horror`

### C) Anime Character & Lifestyle

Target semantic focus: character-driven, daily life, style-spectrum, emotional tonality.

Includes current categories:

- `pack_05 :: 4. Shojo, Magical Girl & Visionary Classics`
- `pack_05 :: 5. Slice of Life & Moe`
- `pack_05 :: 12. Anime Style Spectrum`
- `pack_13 :: 1. Core Anime`
- `pack_13 :: 2. Slice of Life / School / Music`

## Non-anime language normalization (Phase 1)

Immediate low-risk normalization:

- `pack_12` name: old non-English game label -> `Video Game Originals Vault`
- `pack_14` description: ES -> EN
- `pack_15` description: ES -> EN

## High-impact taxonomy migration set (Phase 2)

Packs with a single legacy game catch-all category to be decomposed:

- `pack_01`, `pack_02`, `pack_03`, `pack_04`, `pack_07`, `pack_09`, `pack_11`

Migration rule:

- update `packs/<pack>.yaml` category graph,
- update each affected preset `category`, `tags`, `taxonomy.categoryId`, `taxonomy.categoryName`, `taxonomy.tags`.

## Suggested execution order

1. Apply Phase 1 language normalization and validate (`styles:validate`).
2. Freeze anime target manifests and category ids.
3. Execute anime migration with scripted remap table + validation after each pack.
4. Execute legacy game catch-all pack decomposition by domain.
5. Add CI/source verification for:
   - forbidden legacy game catch-all category id,
   - forbidden `snake_case` category id,
   - non-English taxonomy ids/tags.

## Execution status (current)

- done: legacy game catch-all category id removed from previously affected packs.
- done: category ids normalized to `kebab-case` across active pack manifests.
- done: `pack_12` normalized to `Video Game Originals Vault` with taxonomy/tag updates.
- done: anime family split implemented as real 3-pack topology:
  - `pack_05` -> `Anime Battle & Worlds`
  - `pack_16` -> `Anime Classics & Prestige`
  - `pack_13` -> `Anime Character & Lifestyle`
- done: style graph/taxonomy validation passes via `styles:validate`.
- note: `styles:verify` currently fails in this environment at `styles:render:verify` (`import.meta.glob is not a function` under Bun runtime), outside taxonomy graph correctness.
