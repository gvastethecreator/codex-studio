# Design System And UX

## Objective

Codex Studio should feel like a professional creative tool: precise, technical, and task-oriented without sacrificing clarity for new users.

## Principles

- Clarity before decoration.
- Visible and actionable system state.
- Consistent vocabulary across the UI.

## Palette

- Dark main background, near-black/zinc.
- Restrained surfaces, no decorative glassmorphism.
- Accent color for generation/ready states.
- Clear color semantics for danger and info.

## Typography

- Legible sans-serif for general UI.
- Monospace for technical data such as IDs, ports, and logs.

## Motion

- GSAP is the standard.
- Typical durations: 150-250 ms.
- Animate state, reveal, and feedback; avoid motion for its own sake.
- Prioritize `transform` and `opacity`.

## Interaction

- Global drag and drop for references.
- Useful shortcuts: `Escape`, carousel navigation, comparison.
- Destructive confirmations must explain impact and recovery.

- Demand-mounted surfaces need visible loading and error states; do not leave silent gaps.
- Commands should be visible only when they have real behavior or an actionable blocked reason.

- The bottom composer must keep stable rows on mobile; controls must not overlap the prompt or create horizontal overflow.

## Open-Source Goal

- Copy should be clear for first-time visitors.
- Empty states should teach the next step.
- Diagnostics should explain the blocker and recommended action.
