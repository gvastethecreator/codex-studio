# Architecture Review - Codex Studio

Date: 2026-05-29

## Summary

Codex Studio already had useful seams, but several modules exposed too much implementation detail through broad interfaces. The main recommendation was to deepen existing modules rather than introduce parallel abstractions.

## Recommendations

### 1. Finish `Studio Shell` Deepening

Reduce `useStudioShell.ts` fan-in and fan-out. Move composition rules for toolbar, page controller, overlays, and runtime state into a smaller policy module, leaving the hook as a stable facade.

Expected outcome:

- fewer caller-visible fields;
- clearer locality for shell coordination changes;
- tests focused on one shell policy seam instead of a full UI tree.

### 2. Deepen `Studio Generation Session`

Remove duplicated queue and generation policy from consumers. Keep queue orchestration, terminal outcome mapping, and local-generation bridge behavior in one lifecycle seam.

Expected outcome:

- less repeated async policy in hooks;
- clearer ownership of generation state transitions;
- smaller surface for retry/cancel fixes.

### 3. Split `Studio Settings` By Operational Domain

Replace flat settings interfaces with domain-oriented surfaces for editable settings, provider preflight/capabilities, and External Output Sources.

Expected outcome:

- callers depend on only the settings domain they need;
- Provider Secrets stay backend-only;
- future Settings UI can grow without leaking backend details through a single wide interface.

### 4. Finish `appFactory` Deepening

Extract event stream, library serving, and route dependencies behind explicit factory inputs. Avoid route construction that depends on module-level singletons.

Expected outcome:

- stronger isolated tests for route composition;
- easier backend dependency injection;
- fewer hidden runtime assumptions in local-server startup.

### 5. Make `Local Studio Sync` Refresh Policy Explicit

Model refresh reasons and event classes explicitly instead of mixing reconnect, asset, catalog, and disconnect behavior in broad catch-up logic.

Expected outcome:

- bounded refresh behavior;
- easier diagnosis of stale catalog/readiness state;
- fewer duplicated refetch triggers.

### 6. Clarify `Local Generation Run` Naming

Keep the module provider-neutral even though Codex is the primary product runtime. Provider-specific behavior belongs behind provider adapters and compiled inputs.

Expected outcome:

- clearer boundary between product flow and provider implementation;
- easier addition of external adapters without renaming core lifecycle concepts.

## Suggested Execution Order

1. Finish `Studio Shell` and `Studio Generation Session` seams.
2. Split `Studio Settings` domain surfaces.
3. Deepen `appFactory` dependencies and tests.
4. Make `Local Studio Sync` refresh semantics explicit.
5. Review `Local Generation Run` naming and contracts.

## Documentation Fan-Out

Keep `docs/ARCHITECTURE.md`, `docs/TECHNICAL_DEBT.md`, and `docs/architecture/DEEPENING-ROADMAP.md` aligned as these recommendations land.
