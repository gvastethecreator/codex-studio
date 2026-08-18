# Tooling

## Package manager and runtime

Codex Studio uses **Bun** as package manager and backend runtime. Use `bun` or `bunx` for operational scripts. Do not use `npm`, `npx`, `pnpm`, or `yarn` for those scripts.

The repository and CI pin Bun `1.3.14` through `packageManager` and the workflow setup step. Use `bun install` for a local dependency refresh. Use `bun install --frozen-lockfile` for reproducible validation and CI.

The repository is one Bun package. Nested `apps/*` and `packages/*` folders are source boundaries, not separate package manifests, until real `package.json` files exist.

`tsconfig.json` is the aggregate compatibility config that `vp check` uses. Environment truth lives in `tsconfig.web.json`, `apps/local-server/tsconfig.json`, `packages/shared/tsconfig.json`, `tsconfig.scripts.json`, and `tsconfig.browser-scripts.json`.

## Canonical scripts

| Script                           | Purpose                                      |
| -------------------------------- | -------------------------------------------- |
| `bun run validate:fast`          | Focused unit tests + server typecheck        |
| `bun run validate`               | Main PR gate                                 |
| `bun run validate:release`       | Release gate                                 |
| `bun run validate:full`          | Compatibility alias of the release gate      |
| `bun run typecheck:environments` | Web, server, shared, and script boundaries   |
| `bun run doctor`                 | `bunx react-doctor@0.9.7`                    |
| `bun run docs:check`             | Broken local doc links                       |
| `bun run repo:hygiene:verify`    | Reject tracked secrets, DBs, and scratch     |
| `bun run repo:assets:audit`      | Core budget and optional pack hashes         |
| `bun run repo:assets:lock`       | Refresh optional pack integrity lock         |
| `bun run core-assets:smoke`      | Build and route smoke without optional packs |
| `bun run portability:smoke`      | Isolated local API health smoke              |

## Dependency maintenance

```bash
bun outdated
bun update --latest
bun audit
bun install --frozen-lockfile
```

Review the direct dependency diff and every changed upstream release before you accept the new lock. Use top-level overrides only for a real transitive security or compatibility gap. Bun does not support nested overrides.

### 2026-08-08 security refresh

All direct dependencies were already current. The lock refresh removed nine transitive advisories:

| Package | Previous                 | Current                                      | Project value                                                                                                                                                                                                                                                                                             |
| ------- | ------------------------ | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Undici  | Global `7.28.0` override | `8.10.0` for JSDOM and `7.29.0` for Electron | Removes cache disclosure, header or cookie injection, retry desynchronization, and related HTTP correctness risks. Adds HTTP/2 and retry or readable-body fixes. See [8.10.0](https://github.com/nodejs/undici/releases/tag/v8.10.0) and [7.29.0](https://github.com/nodejs/undici/releases/tag/v7.29.0). |
| PostCSS | `8.5.15` in Vite Plus    | `8.5.26`                                     | Hardens source-map path loading, tracks symlinks, and fixes `list.split()` and BOM regressions. See [8.5.23](https://github.com/postcss/postcss/releases/tag/8.5.23) and [8.5.26](https://github.com/postcss/postcss/releases/tag/8.5.26).                                                                |
| Nano ID | `3.3.15` in Vite Plus    | `3.3.18`                                     | Removes the negative-size infinite loop and keeps the supported PostCSS `^3.3.17` contract. See [3.3.16](https://github.com/ai/nanoid/releases/tag/3.3.16) and [3.3.18](https://github.com/ai/nanoid/releases/tag/3.3.18).                                                                                |

Nano ID 6 is the newest standalone major. PostCSS consumes Nano ID 3 as a private dependency. Forcing 6 violates the PostCSS range without adding a project feature. The lock uses the newest compatible 3.x release.

## CI

CI must call these named scripts. Do not fork gate step lists inside workflow YAML.
