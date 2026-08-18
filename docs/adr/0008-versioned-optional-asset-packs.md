# ADR 0008: Versioned optional asset packs

## Status

Accepted

## Context

In-repo visual assets are large and grow with style packs.

## Decision

Keep the Core Asset Set below the enforced budget in `assets/asset-policy.json`.
Runtime code can depend only on that set.
Large authoring sources and full-size style defaults are versioned optional packs.
`assets/asset-pack-lock.json` records each pack content sha256, file count, and byte count.
Ignored generation failure ledgers (`failures-pack_*.json`) are transient local diagnostics.
They are excluded from the pack inventory and lock.

The current checkout keeps optional files in place for authoring compatibility.
They can be removed from a packaged first run without breaking runtime imports.
Distribution and atomic installation remain separate release work.
Git history rewrite stays blocked until that installer is proven.

## Consequences

- `repo:assets:audit` fails on core budget growth, unclassified files, missing core files, or stale optional-pack hashes.
- Character Lab uses the core runtime atlases and does not import 512px authoring frames.
- Style browsing uses core card thumbnails. Full-size defaults are optional.
- Git history rewrite waits until pack install is proven.
