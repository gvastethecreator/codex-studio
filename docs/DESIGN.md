# Design and UX System

## 1. Design philosophy

Codex Studio is a professional creative tool. It takes cues from video editors, DAWs, game engines, and local developer tools: dense, precise, task-oriented, and dark by default so generated images stay visually dominant.

The interface should feel technical without becoming hostile. New users should understand what is ready, what is blocked, and what action to take next.

## 2. Color palette

- **Main background:** near-black and very dark zinc neutrals.
- **Surfaces:** subtle translucent panels with restrained borders. Avoid decorative glassmorphism.
- **Primary accent:** emerald/accent tones for generation and ready states.
- **Danger:** red tones for destructive operations.
- **Info:** blue/cyan tones for metrics, usage, and diagnostics.
- **Text:** high-contrast foreground text, with zinc grays for secondary labels and metadata.

Use color as state and hierarchy, not decoration. Inactive surfaces should stay restrained.

## 3. Typography

- **General UI:** system sans or Inter-like sans-serif.
- **Technical data:** JetBrains Mono or similar monospace for IDs, ports, tokens, logs, and runtime details.
- **Hierarchy:** compact uppercase labels with wide tracking are acceptable for metadata, but body copy should remain readable and direct.

## 4. Motion

- The project uses **GSAP** for React animation and local compatibility helpers.
- Use the View Transitions API for full-screen or image-grid transitions when it improves continuity.
- Keep most UI motion in the 150-250 ms range.
- Animate state changes, reveals, loading, and feedback. Avoid purely decorative choreography.
- Prefer transforms and opacity. Do not animate layout properties.

## 5. Interaction model

- Global drag and drop supports reference image input.
- Keyboard shortcuts include carousel navigation, `Escape` to close modals, and spacebar comparison where available.
- Toasts provide non-blocking success/failure feedback.
- Destructive actions should explain exactly what will be removed, what remains, and how recovery works.

## 6. Open-source presentation goals

- Copy should be clear to a first-time user who does not know the repo history.
- Diagnostics should name the blocked subsystem and suggest the next action.
- Empty states should teach the workflow instead of merely saying that nothing exists.
- Keep component vocabulary consistent across toolbar, panels, modals, and settings.
