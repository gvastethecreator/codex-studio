# Onboarding Setup Hardening

## Goal

Make first setup depend on Codex Studio readiness instead of exact tool
releases.

## Decisions

- App readiness is the setup source of truth: `bun run studio:init`, `bun run dev`,
  `/api/health`, `/api/codex/session`, Codex Runtime Doctor capability, and
  `codex app-server` reachability.
- Bun and Codex metadata remain useful diagnostics, but should not block setup
  when supported scripts, app-server support, Studio Library health, and Local
  Codex Session are healthy.
- Runtime repair copy should guide the user toward removing known bad shims,
  logging in with ChatGPT, and rerunning `runtime:doctor`; installation/update
  channels should stay current outside hardcoded release gates.

## Progress

- [x] README quick start describes capability requirements instead of a pinned
      tool release.
- [x] Agent and setup skill instructions say to collect tool metadata as diagnostics
      only.
- [x] Onboarding handoff prompt passes app-readiness state and warns agents not
      to block on exact tool releases.
- [x] Onboarding handoff prompt now labels Bun/Codex command output as
      diagnostic metadata instead of release-labeled output.
- [x] Repo docs, repo skills, and the global `codex-studio` skill were scanned
      for explicit setup/runtime release gates; remaining release-like text is
      dependency, schema, fixture, or license metadata.
- [x] Global `codex-studio` skill no longer pins Bun, React, Vite, Electron, or
      old dev ports in its project summary.
- [x] Troubleshooting frames `runtime:doctor` findings around selected CLI,
      app-server support, and auth.
- [x] Focused onboarding prompt test passed again after release-neutral copy
      changes: 2 tests.
- [x] Full test suite passed again after release-neutral copy changes: 177
      files, 628 tests.
- [x] Focused check for touched docs/code passed.
- [x] Focused formatting check for touched docs reported all files formatted;
      command exits nonzero afterward because there are no lintable files.
- [x] Superseded 2026-07-10: broad build passes with `StylesRecipe` at 77.27 KB.
- [x] Superseded 2026-07-10: broad check passes with no formatting, lint, or type errors.

## Desktop Onboarding Visibility

- [x] Onboarding modal compacted for desktop: smaller header/footer, tighter
      hero, reduced preview footprint, compact readiness rows, and collapsed
      setup prompt preview.
- [x] 1440x900 Playwright check: `mainNeedsScroll=false`, footer visible,
      prompt preview visible. Screenshot:
      `output/playwright/onboarding-desktop-after-1440x900.png`.
- [x] 1366x768 Playwright check: `mainNeedsScroll=false`, footer visible,
      prompt preview visible. Screenshot:
      `output/playwright/onboarding-desktop-after-1366x768.png`.
- [x] React Doctor diff improved from 83 to 90 after fixing onboarding warnings;
      remaining diff warnings are in `components/recipes/StylesRecipe.tsx`.
