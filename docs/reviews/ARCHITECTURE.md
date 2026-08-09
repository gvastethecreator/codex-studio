# Architecture review

Date: 2026-08-09.

The project still has the right runtime boundary: React/Vite for the client and Bun/Hono plus `bun:sqlite` for the local product runtime. Bun is therefore retained.

The active Styles change now has one complete asset contract:

1. Provider generation writes a WEBP and provenance manifest outside UI code.
2. `styles:provider-variants:verify` checks coverage, dimensions, format, failures, and provenance.
3. Pack-scoped generated modules expose URLs on demand.
4. `styleThumbnailCatalog` projects provider variants as additional images.
5. Style cards render them without replacing manifest or default-card truth.
6. `styles:verify` owns the aggregate gate.

This preserves the existing Provider Boundary and Style Preset Manifest authority. No runtime plugin registry or provider-specific task kind was introduced.
