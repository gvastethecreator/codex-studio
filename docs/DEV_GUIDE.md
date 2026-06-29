# Development Guide

This guide summarizes the conventions for understanding, extending, and contributing to Codex Studio.

## Fast Path

1. Read `CONTEXT.md` and `docs/ARCHITECTURE.md`.
2. Make small, verifiable changes through clear seams.
3. Validate with `bun run check`, `bun run test`, and `bun run build`.

## Project Conventions

- Use strict TypeScript and avoid `any`.
- Put shared contracts in `packages/shared` or `types.ts`.
- Frontend backend calls should go through `services/localStudioService.ts` or `services/studioEventSource.ts`.
- Durable state belongs to SQLite and the Image Catalog.
- `GenerationBatch[]` is a compatibility surface, not durable truth.
- Tooling configuration lives in `vite.config.ts`.

## Recipes

When adding or changing a recipe:

1. Update the Recipe Module metadata and builders.
2. Keep derived params and task-spec builders out of React components.
3. Validate with `recipes:verify` and `recipes:source:verify`.

## Persistence And Security

- Durable state lives in the Studio Library plus backend SQLite.
- Browser storage is for UI convenience and compatibility only.
- Provider Secrets must not be stored in SQLite, logs, metadata, screenshots, or docs.

## UI And Performance

- Use Tailwind CSS v4 and shared tokens.
- Prefer Demand-Mounted Surfaces for heavy UI.
- Keep startup dependencies small.

## Debugging

- Quality and build logs are written under `logs/tooling/`.
- When a gate fails, use the exact `*.latest.log` file in bug reports or PR notes.
