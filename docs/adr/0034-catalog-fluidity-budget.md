# ADR 0034: Catalog fluidity budget

## Status

Accepted.

## Context

Codex Studio should feel fluid even with a large Image Catalog. Animations, hover polish, and view transitions are product value, but Home should not mount hundreds of invisible card commands, tooltips, and listeners before the user expresses intent.

Playwright/CDP probes during the 2026-06-29 performance pass showed the Home grid was dominated by the active catalog page size and per-card command chrome. After bounding the active Catalog Page to 48 entries and demand-mounting secondary card actions on desktop, Home dropped to roughly 2k DOM nodes and 252 buttons while preserving hover/focus behavior and mobile touch access.

This ADR extends ADR-0028 (Demand-Mounted UI Surfaces) and ADR-0031 (summary-first hot reads) to the catalog grid render surface.

## Decision

- Active Image Catalog rendering must cross a `Catalog Render Budget` Module instead of inheriting broad catalog defaults.
- Secondary card commands must cross a `Catalog Card Action Surface` Module instead of being mounted for every idle desktop card.
- Touch-width cards may keep actions mounted until a dedicated mobile action sheet exists.
- View transitions, selection, favorite, preview, and transform/opacity animations must be preserved.
- Future large-library work should add a `Catalog Grid Render Plan` before increasing active page size.

## Consequences

- Performance budgets become product contracts, not scattered magic numbers.
- Desktop Home pays command/tooltip cost for the active card, selected cards, or explicit focus, not for every card.
- Mobile remains heavier by design until touch interactions get a deeper action-surface Interface.
- Visual and performance gates should count DOM nodes, buttons, tooltip nodes, mounted card actions, and no-layout-shift hover behavior.
