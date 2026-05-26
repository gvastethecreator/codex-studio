# Developer Guide

This document explains the main conventions for understanding, extending, and contributing to Codex Studio.

## 1. Project conventions

- **Strict typing:** avoid `any`. Shared contracts should live in `types.ts` or `packages/shared` when they cross UI/backend seams.
- **Canonical documentation:** `CONTEXT.md` is the glossary, `docs/ARCHITECTURE.md` describes the current system shape, and ADRs in `docs/adr/` record hard-to-reverse decisions. Do not merge those layers into one file.
- **Local-first frontend:** calls to the local backend should go through `services/localStudioService.ts` or `services/studioEventSource.ts`. Avoid direct `fetch()` calls from components unless the case is clearly infrastructure-level.
- **Catalog vs visual cache:** SQLite/Image Catalog is the durable source of truth. `GenerationBatch[]` is a compatibility edge for the current grid, not the durable product model for new decisions.
- **Unified toolchain:** UI validation and builds go through **Vite+**. Use `bun run check`, `bun run test`, and `bun run build` as the main commands. Avoid reintroducing separate ESLint, Prettier, or Vitest configuration outside `vite.config.ts` unless strongly justified and documented.
- **Animation:** use **GSAP** for React animation. Do not reintroduce `motion/react` or similar parallel animation layers.
- **Tests:** unit tests must import helpers from `vite-plus/test`.

## 2. Adding a recipe

Recipe Modules are provider-independent workflow contracts. React recipe pages collect parameters and preview state, but task spec building, derived params, and provider directives should stay pure and testable.

When adding a recipe:

1. Add or update metadata in `lib/recipeModules.ts`.
2. Add provider-independent derived params in tested helpers when needed.
3. Add prompt fragments or Recipe Context builders under `lib/recipeContextBuilders/` if the recipe needs them.
4. Keep provider-ready prompt text out of React components.
5. Register UI routing in the recipe surfaces only after the module contract is available.
6. Run recipe validation before closing the change.

Useful commands:

```bash
bun run recipes:catalog -- --query=<text> --limit=20
bun run recipes:verify
bun run recipes:source:verify
```

## 3. Persistence

- Durable job, asset, library, settings, and log state belongs in the Studio Library and SQLite-backed backend surfaces.
- Browser storage is compatibility or UI convenience state only.
- Do not store Provider Secrets in SQLite-backed Studio Settings, generated metadata, logs, screenshots, or docs.

## 4. Styling guidelines

- Use **Tailwind CSS v4** and shared tokens in `index.css`.
- Keep visual tokens such as color, typography, easing, and base animation primitives centralized before adding new style files.
- Use `lucide-react` for icons.
- Follow `docs/DESIGN.md` for product tone, motion, and open-source presentation goals.

## 5. Performance and loading

For heavy dependencies or expensive surfaces:

- prefer demand-mounted UI surfaces;
- use `React.lazy()` and `Suspense` for large routes or panels;
- avoid adding large dependencies to the startup chunk;
- run `bun run ui:chunks:verify` when touching bundle-sensitive areas.

## 6. DX, logs, and debugging

- Format, lint, test, build, and validation commands write logs to `logs/tooling/`.
- If a command fails locally or in CI, link the relevant log in the issue or PR.
- New quality commands should route through `scripts/tooling-task.ts` so logs stay consistent.
