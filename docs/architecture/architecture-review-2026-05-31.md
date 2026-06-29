# Architecture Review - Codex Studio

Date: 2026-05-31

## Summary

This pass focused on module depth. The repo had meaningful architecture direction, but several seams still leaked implementation detail through wide props, compatibility adapters, and duplicated policy.

## Recommendations

### 1. Deepen `Studio Shell`

Reduce shell fan-in/fan-out by moving cross-surface policy behind focused controllers. Keep `useStudioShell.ts` as the main facade, but avoid exposing every downstream implementation decision to callers.

### 2. Deepen Workspace Lifecycle

Unify catalog invariants, destructive confirmations, workspace switching, and recovery behavior in one lifecycle seam instead of spreading workspace policy through UI callers.

### 3. Retire The Dual `Studio Settings` Interface

Move from a flat compatibility interface to explicit domains: settings data, provider runtime/preflight, and output sources. This reduces accidental coupling and keeps Provider Secrets out of SQLite-backed settings.

### 4. Deepen Command Center Projection

Encapsulate status, queue, provider, readiness, and transition policy for the top toolbar. The toolbar should render a projection, not re-derive operational state.

### 5. Deepen `Local Studio Sync`

Model event semantics beyond generic asset/disconnect handling. Catalog, job, readiness, and connection updates should have scoped invalidation and bounded refresh rules.

### 6. Strengthen `createStudioApp` Composition Tests

Add tests for failure paths, dependency injection, and non-happy route construction. The factory seam should be proven without relying on singletons.

### 7. Deepen `Studio Overlay Controller`

Reduce domain-to-UI translation in overlay wiring. Settings, debug, activity, and modal orchestration should cross narrow surfaces instead of broad state mirrors.

## Suggested Execution Order

1. Shell composition policy.
2. Workspace lifecycle invariants.
3. Settings domain split.
4. Command Center projection.
5. Local Studio Sync event semantics.
6. `createStudioApp` composition tests.
7. Overlay controller cleanup.

## Documentation Fan-Out

Update `docs/ARCHITECTURE.md`, `docs/TECHNICAL_DEBT.md`, and `docs/architecture/DEEPENING-ROADMAP.md` as slices land.
