# Tooling

## Package manager and runtime

Codex Studio uses **Bun** as package manager and backend runtime. Use `bun` or `bunx` for operational scripts. Do not use `npm`, `npx`, `pnpm`, or `yarn` for those scripts.

The repository and CI pin Bun `1.3.14` through `packageManager` and the workflow setup step. Use `bun install` for a local dependency refresh. Use `bun install --frozen-lockfile` for reproducible validation and CI.

The repository is one Bun package. Nested `apps/*` and `packages/*` folders are source boundaries, not separate package manifests, until real `package.json` files exist.

`tsconfig.json` is the aggregate compatibility config that `vp check` uses. Environment truth lives in `tsconfig.web.json`, `apps/local-server/tsconfig.json`, `packages/shared/tsconfig.json`, `tsconfig.scripts.json`, and `tsconfig.browser-scripts.json`.

## Canonical scripts

Use one validation level per integration. Each broader gate includes the narrower checks it needs; do not rerun its components separately. For one test file, use `bun run test -- path/to/test.ts`.

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

## React Doctor

At integration, run `bun run doctor -- --verbose --scope changed --base origin/main`. Use the target branch as `--base` when it differs from `origin/main`. An explicit base also works when local commits are on `main`; automatic diff detection can run a full scan in that case.

The commit hook calls the same pinned `doctor` script with `--staged --blocking warning --no-score`. It skips changes that contain only documentation or generated code maps. The hook remains advisory. A nonzero exit can mean diagnostics or a tool execution error; inspect `logs/react-doctor/pre-commit.log` before calling it a regression. Each scan replaces that ignored local log.

## Dependency maintenance

```bash
bun outdated
bun update --latest
bun audit
bun install --frozen-lockfile
```

Review the direct dependency diff and every changed upstream release before you accept the new lock. Use top-level overrides only for a real transitive security or compatibility gap. Bun does not support nested overrides.

## CI

CI must call these named scripts. Do not fork gate step lists inside workflow YAML.
