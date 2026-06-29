# Style Presets Style-First Refactor

This tracker records the style-first refactor direction for Style Preset Manifests.

## Current Policy

- A Style Preset is a reusable visual language, not a fixed scene.
- `visualDna` fields must describe mechanics: line, palette, light, material, composition, spatial behavior, atmosphere, and render finish.
- `creative_brief` must explain transferable style logic.
- Presets should avoid hard-coded locations, story beats, single body poses, celebrity/event references, and repeated neighboring-pack staging.
- Pack/category taxonomy must stay in English and match `docs/STYLE_PRESET_AUTHORING.md`.

## Completed Direction

- The legacy monolithic YAML path is retired.
- Granular manifests under `components/recipes/styles/manifests/presets/` are the authoring source.
- `styles:validate`, `styles:runtime:check`, `styles:source:verify`, and `styles:render:verify` are the source of truth for manifest correctness.
- Anime packs are split by purpose:
  - `pack_05`: Anime Battle & Worlds.
  - `pack_13`: Anime Character & Lifestyle.
  - `pack_16`: Anime Classics & Prestige.
- Non-anime packs must preserve non-anime visual grammar and avoid drifting into manga/anime/cel-character staging.

## Review Rules

When reviewing or editing a preset:

1. Check whether the preset works for at least five different subjects.
2. Remove or rewrite concrete scene nouns if they are carrying the identity.
3. Compare against neighboring presets in the same category.
4. Keep prompts and `visualDna` in English.
5. Add changed presets to `docs/active/style-preset-card-regeneration-backlog.md` when card images need regeneration.
6. Run `bun run styles:validate -- --preset=<id>` for focused edits, or `bun run styles:verify` for broad waves.

## Deferred Work

- Continue spot audits for scene-locked, body-locked, or IP-adjacent manifests.
- Regenerate default cards after meaningful `visualDna`, `avoidRules`, or `negativePrompt` changes.
- Keep large wave notes out of this file unless they summarize durable decisions.
