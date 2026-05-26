# Roadmap

This roadmap describes the product direction while Codex Studio moves toward a more mature open-source preview. It is not a contract. It is an operating guide for what to consolidate, what to improve, and what should stay out of scope for now.

## Current state

Codex Studio is already aligned around the main product pillars:

- **Local-first:** generation state, assets, logs, and SQLite live in a local Studio Library.
- **Codex-native:** the primary flow uses `codex app-server` and the user's local authenticated Codex/ChatGPT session.
- **Traceable:** jobs, logs, transcripts, and catalog entries provide inspection and recovery paths.
- **Portable:** the Studio Library is separate from the source repo and can be configured per machine.
- **Extensible:** Generation Tasks and Generation Providers are separate, with provider-specific execution behind a backend boundary.

The next phase is consolidation: better onboarding, clearer diagnostics, cleaner copy, and a release-ready repository presentation.

## Phase 0: stabilize the current shell

Goal: make the app easier to understand and maintain before adding more surface area.

High priority:

- Decompose remaining orchestration in `components/AppContent.tsx` into smaller shell and overlay modules.
- Keep studio diagnostics, readiness, backend connectivity, usage, and app-server state aligned through shared builders.
- Replace internal or cryptic UI copy with clearer first-user language.
- Improve destructive-action UX with precise confirmation and recovery language.

Exit criteria:

- the main shell is easier to test and navigate;
- status, usage, onboarding, and system panels share the same source of truth;
- destructive operations are understandable and testable.

## Phase 1: finish the catalog-first transition

Goal: make the visible UI model match the durable SQLite/Image Catalog model.

High priority:

- Continue shrinking `GenerationBatch[]` compatibility surfaces.
- Keep image selection, export, trash, and workspace counts catalog-derived.
- Preserve legacy recovery only at explicit compatibility edges.
- Keep `catalog:source:verify` strict enough to block regressions.

Exit criteria:

- the grid and export flows can operate directly from Catalog Entries;
- IndexedDB is no longer treated as a durable image store;
- Visual Batch usage is limited to compatibility and recovery edges.

## Phase 2: improve operability

Goal: make the studio easy to operate and diagnose without reading raw logs first.

High priority:

- Improve the activity feed for persistent jobs, transient UI queue items, recovery, and failures.
- Enrich job detail with events, transcript entries, actionable errors, and related artifacts.
- Make common failures actionable: missing Codex CLI, expired session, app-server failure, port conflict, missing library path.

Medium priority:

- Add visible dry-run or smoke-check flows in onboarding.
- Add a diagnostics export bundle with health, recent logs, and non-secret technical context.

Exit criteria:

- a new user can understand system state from the UI;
- common failures include a next action;
- inspecting a job no longer feels like archaeology.

## Phase 3: setup, portability, and desktop path

Goal: reduce installation friction and prepare a credible desktop strategy.

High priority:

- Improve cross-platform setup for Windows, macOS, and Linux.
- Make onboarding self-sufficient: detect, explain, retry.
- Keep Electron behind the Studio Runtime seam and avoid direct renderer coupling.

Medium priority:

- Expose runtime configuration clearly without turning Settings into an infrastructure panel.
- Explore packaging only after the local backend and Codex runtime story is solid.

Exit criteria:

- a new contributor can install and validate the studio with minimal help;
- Electron has a clear adapter strategy rather than a parallel product architecture.

## Phase 4: open-source release candidate

Goal: make the repository presentable as a useful public preview.

High priority:

- Audit repo hygiene: generated assets, logs, SQLite files, local prompts, and machine-specific paths must stay out of the repo.
- Use `validate:fast` during iteration and `validate:full` as the local release gate.
- Keep README, troubleshooting, architecture, contribution, and security docs aligned with the real product.

Medium priority:

- Add a manual smoke-test checklist covering first run, health, generation or dry-run, import/export, reset, and basic recovery.

Exit criteria:

- the repo can be presented publicly without hiding major operational caveats;
- installation, validation, and support paths are clear.

## Good near-term improvements

UX:

- richer reset confirmation and recovery explanation;
- stronger empty/loading/error states for jobs, logs, and diagnostics;
- clearer distinction between workspace, vault export, and Studio Library;
- tighter responsive behavior in the command center.

Reliability:

- more consistent health/session/SSE revalidation;
- clearer backend disconnect and reconnect states;
- stronger tests for cancellation, recovery, and persistent jobs.

Data and traceability:

- easier transcript, log, and artifact discovery by job;
- clearer backup/restore guidance before destructive operations;
- retention guidance for local libraries that grow over time.

Performance:

- continue demand-loading heavy recipe surfaces;
- measure catalog/grid behavior as libraries grow;
- reduce shell-driven re-renders.

Quality:

- broaden UI integration tests;
- periodically review dependency compatibility;
- keep adding explicit contracts and JSDoc to critical services and hooks.

## Recommended order

1. Decompose `AppContent.tsx` and unify diagnostics.
2. Close the legacy batch vs durable catalog gap.
3. Improve activity feed, job detail, and recovery.
4. Polish cross-platform onboarding and local configuration.
5. Strengthen tests and release criteria.
6. Only then push hard on desktop packaging or advanced extensibility.

## Non-goals for now

- turning Codex Studio into a hosted cloud service;
- making API keys mandatory for the main Codex flow;
- publishing the app as a reusable npm package;
- adding broad new feature surfaces before consolidating shell, data, and operability.

## Golden rule

Every new improvement should answer at least one question:

- Does it reduce real installation or usage friction?
- Does it make system or job state clearer?
- Does it reduce shell or data-model debt?
- Does it prepare the open-source release without adding more complexity than it removes?

If the answer is no, it can probably wait.
