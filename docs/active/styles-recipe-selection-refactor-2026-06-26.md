# Styles Recipe Selection Refactor - 2026-06-26

## Scope

- Add a Styles landing surface with Style Pack cards.
- Let the Styles recipe collect up to 5 reference images.
- Change preset cards from immediate generation to selection toggles.
- Add 5 selected style slots with per-slot style strength and matching card previews.
- Allow generation with at least 1 selected style.
- Keep uploaded references compact as 5 small image cards and make the style preview the dominant left-side surface.
- Animate entry into each Style Pack folder.
- Keep side rails dense: references use one compact strip, empty style slots use compact rows, and Generate stays near the slot stack.
- Give each Styles tab a canonical hash URL (`#recipe-styles/packs`, `#recipe-styles/favorites`, `#recipe-styles/pack_XX`) and support internal Previous/Next tab navigation.

## Contract

- `recipeParams.presetId` and `presetName` remain populated for compatibility.
- Multi-style runs add `recipeParams.selectedStyles[]` with slot, pack, preset, category, and strength data.
- Style results should match every preset listed in `selectedStyles[]`, not only the first preset.
- Uploaded references remain source/reference material; style influence comes from the selected style slots.
- Browser back/forward and internal Previous/Next navigation must keep the active Styles tab synchronized with the hash URL.

## Validation Notes

- Run focused unit coverage for recipe identity, recipe context/directives, generation request shaping, and recipe modules.
- Run visual verification on `#recipe-styles` after the UI builds.
