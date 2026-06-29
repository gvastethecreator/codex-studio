# Style Preset Card Regeneration Backlog

This tracker records when default style-card images should be regenerated after manifest or prompt changes.

## Policy

- Default cards are prompt-derived artifacts.
- Existing `.webp` files do not update when a manifest changes.
- Add a preset here when `name`, `visualDna`, `avoidRules`, `attributes.negativePrompt`, card thumbnail behavior, or pack/category prompt anchors change.
- Keep notes in English.
- Prefer short batches with exact preset ids and validation commands.

## Current Regeneration Triggers

Regenerate cards when a preset was changed to remove:

- fixed scene/location identity;
- body/wearer dependence;
- celebrity, event, or IP-adjacent references;
- generic neighboring-preset staging;
- literal object-only replacements where a transferable visual grammar is needed;
- stale prompt anchors that no longer match the Style Preset Manifest.

## Batch Template

````md
## YYYY-MM-DD - <pack_id> <reason>

Presets:

- `SPxx-yyy`

Reason:

- <short English reason>

Validation:

```bash
bun run styles:validate -- --pack=<pack_id>
bun run styles:runtime
bun run styles:verify
```
````

## Open Work

- Continue regenerating cards after style-first manifest rewrites.
- Verify generated cards visually before marking a batch complete.
- Keep generated assets out of git unless they are intentional repo defaults.
