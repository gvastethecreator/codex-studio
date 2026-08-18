# Design system and UX

## Objective

Codex Studio must feel like a professional creative tool. It is precise and technical. It stays clear for new users.

## Principles

- Clarity before decoration.
- Visible and actionable system state.
- One vocabulary across the UI.

## Palette

- Dark main background, near-black or zinc.
- Restrained surfaces. No decorative glassmorphism.
- Accent color for generation and ready states.
- Clear color meaning for danger and info.

## Typography

- Legible sans-serif for general UI.
- Monospace for technical data such as IDs, ports, and logs.

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
