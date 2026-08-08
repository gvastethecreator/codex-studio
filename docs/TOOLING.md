# Tooling

## Package manager and runtime

Codex Studio uses **Bun** as both package manager and backend runtime. Prefer `bun` / `bunx` over `npm`, `npx`, `pnpm`, or `yarn` for operational scripts.

The repository is a **single Bun package**. Nested `apps/*` and `packages/*` folders are source boundaries, not separate package manifests, until real package.json files exist.

## Canonical scripts

| Script                        | Purpose                               |
| ----------------------------- | ------------------------------------- |
| `bun run validate:fast`       | Focused unit tests + server typecheck |
| `bun run validate`            | Main PR gate                          |
| `bun run validate:release`    | Release gate                          |
| `bun run doctor`              | `bunx react-doctor@0.8.1`             |
| `bun run docs:check`          | Broken local doc links                |
| `bun run repo:hygiene:verify` | Reject tracked secrets/DBs/scratch    |
| `bun run repo:assets:audit`   | Asset size report                     |

## CI

CI should call these named scripts. Do not fork gate step lists inside workflow YAML.
