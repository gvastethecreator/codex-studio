# Codex Studio Performance Workplan

Date: 2026-08-08  
Mode: approved execution  
Language: Spanish  
Status: closed — 10 of 10 tickets complete

## Goal and invariant

Reduce measured client payload, initial DOM work, idle rendering, and avoidable React rerenders.
Preserve product behavior, visual fidelity, motion intent, accessibility, catalog coverage, data,
and compatibility. Backend/provider latency and Studio Library mutation are outside this batch.

## Baseline contract

- Windows 11, Ryzen 9 3900XT, about 96 GB RAM, Bun 1.3.14, Node v26.5.0.
- Production UI build served on loopback with Playwright Chromium at 1440x900.
- Service workers blocked. One warm-up, then fresh cold browser contexts with warm host caches.
- Browser measurements cover the built client. The local backend was not listening.
- Build duration is diagnostic only because unchanged builds varied widely with host load.

## Closed tickets

### PERF-01 — Lightweight recipe shell metadata

- Status: closed.
- Change: normal shell titles and context parsing no longer import the full recipe registry.
- Acceptance: header/parser tests pass; normal startup does not request `recipeModules`.
- Evidence: normal route transfer 214,218 B → 189,860 B; 45 → 40 resources.

### PERF-02 — Responsive onboarding previews

- Status: closed.
- Change: generated 384/768 px same-aspect WebP derivatives with `srcSet` and `sizes`.
- Acceptance: all 16 derivatives reproduce deterministically; desktop/mobile captures reviewed.
- Evidence: onboarding route 454,375 B → 257,987 B; first image 208,010 B → 35,528 B.

### PERF-03 — Responsive recipe cards

- Status: closed.
- Change: generated 256/512/768 px card derivatives and browser selection metadata.
- Acceptance: all 39 derivatives reproduce deterministically; Recipes capture reviewed.
- Evidence: Recipes route 1,033,129 B → 550,633 B; eight images 840,552 B → 360,214 B.

### PERF-04 — Lossless WebP Character Lab atlases

- Status: closed.
- Change: both atlas builders, manifests, QA metadata, and runtime imports use lossless WebP.
- Acceptance: decoded RGBA hashes match the old PNG pixels; dimensions and coordinates match.
- Evidence: atlas files 8,141,960 B → 5,340,990 B; route 8,425,216 B → 5,597,607 B.

### PERF-05 — Exact style-thumbnail aliases

- Status: closed.
- Change: 24 byte-identical files were replaced by hash-guarded canonical URL aliases.
- Acceptance: all 2,278 logical thumbnail keys remain; style validation and asset audit pass.
- Evidence: 807,538 B of exact duplicate files removed.

### PERF-06 — Demand-mounted Styles sections

- Status: closed.
- Change: offscreen family/source sections use stable functional placeholders and mount near view.
- Acceptance: deep navigation remains clickable; source section mounts after scroll; captures reviewed.
- Evidence: initial Styles DOM 4,430 → 1,685 nodes.

### PERF-07 — Demand-loaded Styles motion runtime

- Status: closed.
- Change: CSS preserves entry motion; GSAP loads on the first folder interaction.
- Acceptance: reduced-motion behavior remains; hover motion and navigation were inspected.
- Evidence: `motionRuntime` absent initially and present after hover; route 294,164 B → 267,993 B.

### PERF-08 — Invalidation-driven Camera rendering

- Status: closed.
- Change: Camera schedules a frame only for state, texture, resize, or interaction invalidation.
- Acceptance: azimuth interaction updates the viewport; idle instrumentation observed 2 global RAF
  callbacks in one second after settle instead of a hook-owned perpetual loop.

### PERF-09 — Isolated generation elapsed clock

- Status: closed.
- Change: the 100 ms clock owns state inside `GenerationElapsedStatus`.
- Acceptance: elapsed text advances to 0.3 s while the Toolbar harness renders once.

### PERF-10 — Isolated prompt scramble feedback

- Status: closed.
- Change: the 30 ms scramble owns state inside `LivePromptTextarea`.
- Acceptance: shape/cadence remain and the Toolbar harness renders once.

## Final gates

- `bun run test`: pass — 231 files, 856 tests.
- `bun run check`: pass — 2,680 formatted files; 872 files with no lint/type warnings.
- `bun run build`: pass — UI, chunk budgets, and server TypeScript build.
- `bun run styles:verify`: pass — 17 packs, 1,677 presets, zero render violations.
- `bun run core-assets:smoke`: pass — Studio, Recipes, Styles, Character Lab; zero asset failures.
- `bun run repo:assets:audit`: pass — core assets below policy limit and lock current.

## Residuals

- Cold FCP did not improve consistently under variable host load, so this batch makes no latency
  claim from FCP. The demonstrated gains are transfer bytes, DOM work, idle scheduling, and render
  isolation.
- Backend/provider latency was not measured because the local API runtime was offline.
