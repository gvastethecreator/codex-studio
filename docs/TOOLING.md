# Tooling

## Package manager and runtime

Codex Studio uses **Bun** as both package manager and backend runtime. Prefer `bun` / `bunx` over `npm`, `npx`, `pnpm`, or `yarn` for operational scripts.

The repository is a **single Bun package**. Nested `apps/*` and `packages/*` folders are source boundaries, not separate package manifests, until real package.json files exist.

`tsconfig.json` is the aggregate compatibility config used by `vp check`. Environment truth is enforced separately by `tsconfig.web.json`, `apps/local-server/tsconfig.json`, `packages/shared/tsconfig.json`, `tsconfig.scripts.json`, and `tsconfig.browser-scripts.json`.

## Canonical scripts

| Script                           | Purpose                                      |
| -------------------------------- | -------------------------------------------- |
| `bun run validate:fast`          | Focused unit tests + server typecheck        |
| `bun run validate`               | Main PR gate                                 |
| `bun run validate:release`       | Release gate                                 |
| `bun run validate:full`          | Compatibility alias of release gate          |
| `bun run typecheck:environments` | Web, server, shared, and script boundaries   |
| `bun run doctor`                 | `bunx react-doctor@0.9.7`                    |
| `bun run docs:check`             | Broken local doc links                       |
| `bun run repo:hygiene:verify`    | Reject tracked secrets/DBs/scratch           |
| `bun run repo:assets:audit`      | Core budget and optional pack hashes         |
| `bun run repo:assets:lock`       | Refresh optional pack integrity lock         |
| `bun run core-assets:smoke`      | Build and route smoke without optional packs |
| `bun run portability:smoke`      | Isolated local API health smoke              |

## CI

CI should call these named scripts. Do not fork gate step lists inside workflow YAML.
