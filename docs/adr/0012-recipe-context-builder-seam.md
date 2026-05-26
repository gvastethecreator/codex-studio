# ADR 0012: Recipe Context Builder Seam

## Status

Proposed.

## Context

Recipe-specific prompt and context construction can leak implementation details into generic generation code. Recipes need room to evolve without coupling every feature to every recipe.

## Decision

Introduce a Recipe Context Builder seam. Recipes provide structured context, references, prompt fragments, and capability hints through a small interface. The generic generation pipeline consumes the resulting task description.

## Consequences

- recipes become plug-in-like modules;
- generation stays provider-independent;
- prompt construction is easier to test;
- recipes can opt into richer context without bloating shared pipeline code.
