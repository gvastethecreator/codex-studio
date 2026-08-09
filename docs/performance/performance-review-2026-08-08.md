# Codex Studio performance completion report

Repository: `X:\codex-studio`  
Date: 2026-08-08  
Mode: approved execution  
Status: complete  
Language: Spanish  
Completed improvements: 10 of 10

## Executive summary

The approved batch is complete. The strongest demonstrated results are a 46.7% transfer reduction
on Recipes, 43.2% on first-run onboarding, 33.6% on Character Lab, and a 62.0% reduction in the
initial Styles DOM. Normal startup also transfers 11.4% less and no longer loads the full recipe
registry. Camera rendering is invalidation-driven, while Toolbar live feedback no longer rerenders
the parent control tree.

All quality gates passed. Image changes were checked through deterministic generation, dimensions,
decoded-pixel parity where lossless equivalence was required, and real browser captures. The full
test, check, build, style, asset, and core-route gates pass.

Cold FCP varied against the baseline and was often slower during the final host-load window. This
report therefore does not claim a demonstrated paint-latency improvement. It reports only the
verified reductions in bytes, DOM work, idle scheduling, and React render scope.

## Protected quality invariant

The batch preserves visible content, layout intent, interactions, motion intent, reduced-motion
behavior, accessible names, all 1,677 style presets, all 2,278 logical thumbnail identities,
Character Lab pixels/coordinates, data integrity, and supported compatibility. It does not mutate
Studio Library data, provider secrets, provider execution, or production state.

## Scope and measurement method

- Host: Windows 11 Pro, Ryzen 9 3900XT, about 96 GB RAM.
- Runtime: Bun 1.3.14 and Node v26.5.0.
- Workload: production UI build served on `127.0.0.1:17322`.
- Browser: Playwright Chromium, headless, 1440x900, service workers blocked.
- Cache: one warm-up; measured samples use fresh browser contexts with cold browser cache and warm
  operating-system/server file caches.
- Normal, onboarding, Recipes, and Styles final values use five samples; transfer and DOM were
  invariant across samples. Character Lab final values use three samples.
- Heavy-route baselines were single cold-context probes. Their byte/DOM results are deterministic,
  but time comparisons have low confidence.
- The backend was offline. API failures are excluded from client payload totals and remain a stated
  boundary.

## Aggregate performance result

| User path                     |    Baseline |       Final | Absolute delta | Relative delta |
| ----------------------------- | ----------: | ----------: | -------------: | -------------: |
| Normal startup transfer       |   214,218 B |   189,860 B |      -24,358 B |         -11.4% |
| First-run onboarding transfer |   454,375 B |   257,987 B |     -196,388 B |         -43.2% |
| Recipes transfer              | 1,033,129 B |   550,633 B |     -482,496 B |         -46.7% |
| Character Lab transfer        | 8,425,216 B | 5,597,607 B |   -2,827,609 B |         -33.6% |
| Styles transfer               |   294,164 B |   267,993 B |      -26,171 B |          -8.9% |
| Styles initial DOM            | 4,430 nodes | 1,685 nodes |   -2,745 nodes |         -62.0% |

Build output changed from 263 to 261 chunks. Total raw JavaScript changed from 9,976.37 KiB to
9,986.49 KiB (+10.12 KiB), and the main chunk changed from 344.09 KiB to 345.28 KiB (+1.19 KiB).
Those small aggregate increases are recorded as neutral trade-offs; route demand-loading still
reduced the measured startup and Styles transfers.

## Ticket outcomes

### PERF-01. Lightweight recipe shell metadata

**Ticket / status**

- `docs/performance/WORKPLAN.md#perf-01--lightweight-recipe-shell-metadata`; closed.

**Baseline**

- Normal startup transferred 214,218 B in 45 resources. The full recipe registry contributed a
  19,206 B startup request.

**Implemented**

- Added a lightweight ID/title/parser projection and moved shell/header consumers to it. Full recipe
  modules remain on recipe and generation paths.

**Final result**

- 189,860 B in 40 resources: -24,358 B (-11.4%) and five fewer requests. No `recipeModules` request
  appears on normal startup.

**Quality evidence**

- Header titles and registered-ID parsing are covered by focused tests. Recipe routes still build.

**Verification**

- `bunx vp test run lib/recipeShellMetadata.test.ts`; production-preview resource inspection.

**Residual risk**

- Normal-route median FCP changed from 240 ms to 280 ms under a slower final host window; no FCP
  improvement is claimed.

### PERF-02. Responsive onboarding previews

**Ticket / status**

- `docs/performance/WORKPLAN.md#perf-02--responsive-onboarding-previews`; closed.

**Baseline**

- First-run transferred 454,375 B. Its first 1024x1536 image transferred 208,010 B.

**Implemented**

- Generated 384/768 px same-aspect WebP derivatives and added `srcSet`/`sizes` selection.

**Final result**

- 257,987 B: -196,388 B (-43.2%). The first displayed image is 35,528 B: -172,482 B (-82.9%).

**Quality evidence**

- All 16 files pass deterministic dimensions/content checks. Desktop and mobile captures preserve
  crop, color, aspect, and readable detail. Across all responsive assets, resized-reference PSNR
  averaged 40.62 dB; the minimum was 32.57 dB on the highest-frequency onboarding source.

**Verification**

- `bun run assets:responsive:check`; browser inspection at desktop and mobile sizes.

**Residual risk**

- Median FCP was 424 ms versus 300 ms at baseline during different host load. Bytes improved;
  perceived latency is not claimed.

### PERF-03. Responsive recipe-card images

**Ticket / status**

- `docs/performance/WORKPLAN.md#perf-03--responsive-recipe-cards`; closed.

**Baseline**

- Recipes transferred 1,033,129 B; its eight visible card images used 840,552 B.

**Implemented**

- Generated 256/512/768 px WebP derivatives and shared their `srcSet` between foreground and blur.

**Final result**

- 550,633 B: -482,496 B (-46.7%). Eight selected images use 360,214 B: -480,338 B (-57.1%).

**Quality evidence**

- All 39 card derivatives pass deterministic dimensions/content checks; rendered cards and blurred
  backgrounds were visually inspected. Recipe-card minimum resized-reference PSNR is 35.08 dB.

**Verification**

- `bun run assets:responsive:check`; final production-preview Recipes capture and resource ledger.

**Residual risk**

- Baseline route timing had one sample, so no route-latency comparison is asserted.

### PERF-04. Lossless WebP Character Lab atlases

**Ticket / status**

- `docs/performance/WORKPLAN.md#perf-04--lossless-webp-character-lab-atlases`; closed.

**Baseline**

- Two PNG atlases used 8,141,960 B; Character Lab transferred 8,425,216 B.

**Implemented**

- Both asset builders now write lossless WebP. Runtime imports, manifests, reports, QA metadata, and
  asset policy follow the new format.

**Final result**

- Atlas files use 5,340,990 B: -2,800,970 B (-34.4%). Route transfer is 5,597,607 B:
  -2,827,609 B (-33.6%).

**Quality evidence**

- Decoded RGBA SHA-256 comparisons matched exactly for both atlases. Dimensions, channels, frame
  coordinates, and Character Lab browser composition match.

**Verification**

- Both builders; `bun run core-assets:smoke`; manifest/QA checks; browser capture.

**Residual risk**

- None observed.

### PERF-05. Exact style-thumbnail aliases

**Ticket / status**

- `docs/performance/WORKPLAN.md#perf-05--exact-style-thumbnail-aliases`; closed.

**Baseline**

- SHA-256 found 24 byte-identical redundant files using 807,538 B.

**Implemented**

- Added a hash-guarded alias ledger. Generated maps retain every logical key but reuse canonical
  physical files; only proven duplicates were removed.

**Final result**

- 807,538 B removed with zero decoded-image change. Logical coverage remains 2,278 thumbnails.

**Quality evidence**

- Alias target hashes are validated on generation. All 17 packs and 1,677 presets validate.

**Verification**

- `bun run styles:thumbnails:check`; `bun run styles:verify`; `bun run repo:assets:audit`.

**Residual risk**

- Hash changes intentionally fail generation until the alias ledger is reviewed.

### PERF-06. Demand-mounted Styles sections

**Ticket / status**

- `docs/performance/WORKPLAN.md#perf-06--demand-mounted-styles-sections`; closed.

**Baseline**

- Styles mounted 4,430 DOM nodes on initial entry.

**Implemented**

- Offscreen family and source sections render stable, labeled, clickable placeholders and mount near
  the internal scroll viewport.

**Final result**

- Initial DOM is 1,685 nodes: -2,745 (-62.0%). At the bottom, source packs mount and the observed DOM
  grows to 2,869 nodes as intended.

**Quality evidence**

- Placeholder geometry keeps the 10,457 px scroll range stable. Initial, hover, and bottom captures
  were inspected. Navigation targets and accessible button labels remain present before mount.

**Verification**

- Final Playwright DOM/scroll probe; `bun run styles:render:verify`; browser screenshots.

**Residual risk**

- Browser proof used desktop 1440x900; responsive image surfaces, not this card grid, received the
  separate mobile pass.

### PERF-07. Demand-loaded Styles motion runtime

**Ticket / status**

- `docs/performance/WORKPLAN.md#perf-07--demand-loaded-styles-motion-runtime`; closed.

**Baseline**

- Styles loaded 294,164 B and pulled the motion runtime on its critical path.

**Implemented**

- Initial folder/layout entry uses equivalent CSS keyframes. GSAP imports on pointer, focus, or open.
  Reduced-motion rules remain explicit.

**Final result**

- Styles transfers 267,993 B: -26,171 B (-8.9%), in 70 rather than 73 resources. Runtime inspection
  shows `motionRuntime=false` initially and `true` after hover.

**Quality evidence**

- Resting and active hover frames were inspected after the final build. Folder open state becomes
  true and no page errors occur.

**Verification**

- Final Playwright resource/interaction probe and screenshots.

**Residual risk**

- The first interaction pays the deferred runtime request; loopback proof confirms behavior, not
  real-network interaction latency.

### PERF-08. Invalidation-driven Camera rendering

**Ticket / status**

- `docs/performance/WORKPLAN.md#perf-08--invalidation-driven-camera-rendering`; closed.

**Baseline**

- The hook scheduled another RAF after every callback, even when rendering was skipped.

**Implemented**

- A coalescing invalidation scheduler requests frames for camera state, reference state, texture
  completion, resize, and recovery only.

**Final result**

- After settling, browser instrumentation observed two global RAF callbacks in one idle second;
  Camera no longer owns a perpetual frame loop. Relative CPU savings were not measured.

**Quality evidence**

- Changing azimuth to 20 degrees invalidated rendering and updated the visible `AZ:20°` state.
  The Camera screenshot remained correctly framed.

**Verification**

- Production-preview RAF instrumentation and Camera interaction smoke; full build/type gates.

**Residual risk**

- The two observed callbacks can originate from other app surfaces; no whole-app CPU percentage is
  claimed.

### PERF-09. Isolated generation elapsed clock

**Ticket / status**

- `docs/performance/WORKPLAN.md#perf-09--isolated-generation-elapsed-clock`; closed.

**Baseline**

- A 100 ms state tick lived in the full Toolbar and therefore scheduled about ten parent renders per
  second while generating.

**Implemented**

- `GenerationElapsedStatus` owns the tick, progress scale, queue icon, and tenth-second text.

**Final result**

- The child advances to 0.3 s while the parent harness render count remains one.

**Quality evidence**

- Existing text, cadence, progress formula, icon, and tabular time presentation remain.

**Verification**

- `bunx vp test run components/ToolbarLiveStatus.test.tsx`; full 856-test suite.

**Residual risk**

- No production React Profiler trace was recorded; the render boundary is proven deterministically.

### PERF-10. Isolated prompt scramble feedback

**Ticket / status**

- `docs/performance/WORKPLAN.md#perf-10--isolated-prompt-scramble-feedback`; closed.

**Baseline**

- A 30 ms state tick lived in the full Toolbar and therefore scheduled about 33 parent renders per
  second during refine/refactor feedback.

**Implemented**

- `LivePromptTextarea` owns scrambling and textarea height updates.

**Final result**

- Scramble text advances while the parent harness render count remains one.

**Quality evidence**

- Spaces, prompt length, 30 ms cadence, read-only behavior, accessible name, final prompt state, and
  textarea sizing remain.

**Verification**

- `bunx vp test run components/ToolbarLiveStatus.test.tsx`; full test/check/build gates.

**Residual risk**

- None observed.

## Quality-equivalence result

- Responsive assets: 55 of 55 deterministic outputs validated, totaling 4,008,344 B.
- Character Lab: both decoded atlas pixel buffers matched the old PNGs exactly.
- Styles: 17 packs, 1,677 presets, 2,278 logical thumbnails, and zero render violations.
- Browser: Recipes, onboarding desktop/mobile, Character Lab, Camera, and Styles resting/hover/bottom
  states inspected. Final Styles probe reported no page errors.
- Accessibility: placeholder and live-control accessible names remain; reduced-motion CSS is present.
- Known browser request failures were only calls to the intentionally offline local backend.

## Final integration verification

| Command / proof             | Result                                               |
| --------------------------- | ---------------------------------------------------- |
| Focused performance tests   | 3 files, 8 tests passed                              |
| `bun run test`              | 231 files, 856 tests passed                          |
| `bun run check`             | Passed; no formatting, lint, or type issues          |
| `bun run build`             | Passed; UI, chunk budgets, server TypeScript         |
| `bun run styles:verify`     | Passed; zero violations                              |
| `bun run core-assets:smoke` | Passed; four routes, zero asset failures             |
| `bun run repo:assets:audit` | Passed; lock current, core 78,560,484 B under 96 MiB |
| `git diff --check`          | Passed                                               |

## Failed or neutral experiments

- Build duration was rejected as a performance metric. Equivalent output varied from about 17 s to
  174 s before the final 168 s build, dominated by host/cache and output preparation variance.
- Final cold FCP was not consistently lower. Normal median was 280 ms versus 240 ms baseline;
  onboarding 424 ms versus 300 ms; Recipes 284 ms versus a one-sample 244 ms baseline; Styles
  316 ms versus a one-sample 248 ms baseline. Character Lab observed 288 ms versus a one-sample
  420 ms baseline. These mixed values do not support an aggregate latency claim.
- Total raw JavaScript grew 10.12 KiB because responsive URL catalogs and new scheduling seams add
  code. Route transfer improvements remain directly measured.

## Decisions and trade-offs

- Lossless WebP was required for atlases; no quality/size trade-off was accepted there.
- Responsive photo derivatives use quality 92 and preserve original fallback assets for large
  selections. Visual-equivalence evidence, not byte size alone, governed acceptance.
- Placeholder buttons remain functional before heavy Styles content mounts, preserving navigation
  and keyboard order while lowering initial DOM.
- Deleted PNG atlases and 24 duplicate thumbnails are tracked deletions and remain recoverable from
  Git until committed.

## Residual risks

- Backend, provider, disk-library, and real-network latency remain unmeasured because the local API
  runtime was offline.
- Heavy-route baseline timing used one sample, so only deterministic bytes/DOM comparisons are
  considered strong evidence.
- A real-network run would quantify the first deferred GSAP interaction and responsive-image cache
  behavior; it is not required to support the current byte and demand-loading results.

## Evidence artifacts

- Work queue: `docs/performance/WORKPLAN.md`.
- The ignored execution ledger, browser captures, and HTML companion were retired during repository
  cleanup on 2026-08-09 after their measurements and residual limits were consolidated into this
  tracked report.
- The 2026-08-09 revalidation reran the Styles browser gate and the 38-scenario responsive matrix
  before removing its temporary screenshots.
