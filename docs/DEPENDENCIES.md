# Dependencies

Codex Studio uses Bun as its package manager and backend runtime. `bun:sqlite` and Bun script APIs are runtime dependencies. Changing the package manager alone does not replace them.

## Version sources

- `package.json` declares dependency ranges, overrides, and the Bun baseline.
- `bun.lock` records resolved packages.
- `.github/workflows/ci.yml` selects the CI runtime.
- `vitest.config.ts` owns tests. Tests import `vitest` directly; Vite+ supplies the build and check commands.

Read these files for current versions. A local run on another Bun release does not prove compatibility with the CI baseline.

## Compatibility constraints

- Keep the Bun baseline, CI runtime, and `@types/bun` aligned when changing the runtime.
- Review Vite, Vite+, the React plugin, Oxfmt, Oxlint, and matching overrides together. Do not bump one pin solely to clear an outdated-package report.
- Verify the Electron development shell before a major Electron update.
- Before updating Sharp, verify `writePngFromSvg` through the Sprite Atlas fixture path. A previous `sharp@0.35.4` evaluation stalled there; resolve that path before accepting the update.
- Use a top-level override only for a demonstrated compatibility or security problem. Bun does not support nested overrides.

## Update workflow

1. Run `bun outdated` and `bun audit`. Review official release notes for the affected packages.
2. Identify the compatibility issue or feature that justifies each update. Keep unrelated versions unchanged.
3. Use `bun update` or explicit `bun add` commands. Do not edit `bun.lock` manually.
4. Run `bun install --frozen-lockfile`, then the affected migration check and `bun run validate` once at integration.
5. Record unresolved advisories and incompatible updates with their failing command. An outdated package is not, by itself, a failed gate.

See [Tooling](TOOLING.md) for the command and logging contracts.
