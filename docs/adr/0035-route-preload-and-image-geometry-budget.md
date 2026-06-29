# ADR 0035: Route preload and image geometry budget

## Status

Accepted.

## Context

The first catalog fluidity slice reduced Home DOM and button cost, but Chrome DevTools traces still showed two hot-path problems:

- Home idle preloading could still import route/card assets before user intent.
- The masonry grid could lazy-load the image that became LCP because linear row priority did not match mixed-aspect masonry geometry.

The goal remains to preserve animation quality and rich route transitions while moving invisible network, parse, and image-discovery work out of the early interaction path.

## Decision

- Route idle and recipe-card hover/focus preloads must cross `Route Preload Budget`.
- Home may preload the Recipes list shell after a bounded idle delay, but it must not fan out every recipe component.
- Recipe-card hover/focus may preload only the targeted recipe component.
- Image grid priority loading must be based on estimated initial-viewport geometry, not only linear item index.
- Catalog Entry dimensions should flow into UI images when available; generation aspect ratio remains the fallback geometry source.
- Off-viewport Catalog images stay lazy so preserving LCP does not become a full-gallery eager load.

## Consequences

- The Studio keeps smooth hover/route affordances without importing all recipe surfaces on Home startup.
- The first viewport gets eager/high priority images in mixed masonry layouts, improving LCP discovery while keeping off-viewport work lazy.
- DevTools traces remain the source of truth for route preload and image discovery regressions.
- Remaining performance debt is now clearer: CLS/reflow and high-frequency animation timers need the next architecture slice.
