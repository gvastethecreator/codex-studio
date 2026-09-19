# Design system and UX

## Objective

Codex Studio must feel like a professional creative tool. It is precise and technical. It stays clear for new users.

## Principles

- Clarity before decoration.
- Visible and actionable system state.
- One vocabulary across the UI.

## Palette

Studio chrome uses Workbench UI **0.4.0** tokens (`--wb-*` + `--wbp-*`) with **Ambient Carbon Comfortable** and a Paper appearance.

- Carbon (dark): background `#0a0a0a`, panels `#161616`, controls `#2a2a2a`, wells `#0d0d0d`. Catalog Carbon (`#202020` / `#282828`) is not used.
- Paper (light): background `#efece4`, panels `#e4e0d6`, controls `#d8d2c4`, wells `#f6f3eb`.
- Accent starts as brass `#c3b28d` on `--wb-accent`, `--wba-accent`, and `--wbp-accent`. Logo click cycles palettes for Generate, tabs, and selection. Catalog signature coral `#e79a72` is not the Studio default.
- Comfortable control size: `--wbp-row` 30px, `--wbp-text` 12px, `--wbp-radius` 4px (`data-density=comfortable`, no `--wbp-size` so the 30px default stays).
- Precision density is `comfortable` (`--wbp-gap` 18px, `--wbp-pad` 24px). The Create Generate cluster keeps `--create-control-gap: 12px`.
- Typography is `neutral` (Manrope / system UI for labels, mono for values). Edges are `soft`. Presentation is `utility` — Studio does not ship Compose instrument editors, knobs, or Workbench.js.
- Lighting paints `.studio-surface`, `.studio-control`, `.studio-well`, `.studio-bar`, `.studio-popover`, `.studio-dialog`, and 0.4 dial/thumb targets when `supportsWorkbenchLighting()` is true. Otherwise `data-ambient-fallback="unsupported-css"` keeps flat Carbon or Paper colors.

Do not treat the Create rail as a cream panel in Carbon. Generate uses a darkened accent fill so the label stays readable.

Overlays (Settings, Jobs, Trash, Activity, recipes) use the same `--wb-*` tokens and `studio-dialog` / `studio-field` / `studio-list-row` chrome as Create.

## Typography

- `--wbp-font-label` / `--wbp-font-heading`: Manrope, then system UI.
- `--wbp-font-value`: monospace for IDs, ports, logs, and status numerals.

## Motion

- GSAP is the standard.
- Typical durations: 150-250 ms.
- Animate state, reveal, and feedback. Do not add motion for its own sake.
- Prefer `transform` and `opacity`.

## Interaction

- Global drag and drop for references.
- Useful shortcuts: `Escape`, carousel navigation, comparison.
- Destructive confirmations must explain impact and recovery.
- Demand-mounted surfaces need visible loading and error states. Do not leave silent gaps.
- Show a command only when it has real behavior or a blocked reason that the user can act on.
- The bottom composer must keep stable rows on mobile. Controls must not overlap the prompt or create horizontal overflow.

## Open-source goal

- Copy must be clear for first-time visitors.
- Empty states must teach the next step.
- Diagnostics must name the blocker and the next action.
