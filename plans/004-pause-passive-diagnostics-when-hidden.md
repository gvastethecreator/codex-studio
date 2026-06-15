# Plan 004: Pause Passive Diagnostics When The App Is Hidden

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report - do not improvise. When done, update the status row for this plan in
> `plans/README.md` unless a reviewer dispatched you and told you they maintain
> the index.
>
> **Drift check (run first)**:
> `git diff --stat 25bd32e4..HEAD -- hooks/useStudioDiagnostics.ts hooks/localStudioSyncRefreshPolicy.test.ts`
> Also run:
> `git status --short -- hooks/useStudioDiagnostics.ts hooks/localStudioSyncRefreshPolicy.test.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `25bd32e4`, 2026-06-15

## Why this matters

`useStudioDiagnostics` refreshes health and local Codex session state every
30 seconds. That is useful while the app is visible, but it still creates
periodic network and React state churn when the window is hidden or the user is
not looking at diagnostics. Pausing passive refreshes while hidden reduces
background work without changing explicit refresh behavior.

## Current state

- `hooks/useStudioDiagnostics.ts` - refreshes studio health and local Codex
  session on a fixed interval.
- `hooks/localStudioSyncRefreshPolicy.test.ts` - good local example for testing
  small scheduling/coalescing policy logic with injected callbacks.

Current excerpt from `hooks/useStudioDiagnostics.ts:33`:

```ts
export function useStudioDiagnostics({
  initialHealth = null,
  isBackendConnected = false,
  refreshIntervalMs = 30_000,
}: UseStudioDiagnosticsOptions = {}) {
```

Current excerpt from `hooks/useStudioDiagnostics.ts:61`:

```ts
const refreshDiagnostics = useCallback(async () => {
  if (!isMountedRef.current) return;

  const [healthResult, sessionResult] = await Promise.allSettled([
    getStudioHealth(),
    getLocalCodexSession(),
  ]);
```

Current excerpt from `hooks/useStudioDiagnostics.ts:78`:

```ts
useEffect(() => {
  void refreshDiagnostics();

  const interval = window.setInterval(() => {
    void refreshDiagnostics();
  }, refreshIntervalMs);

  return () => {
    window.clearInterval(interval);
  };
}, [refreshDiagnostics, refreshIntervalMs]);
```

Testing style example from `hooks/localStudioSyncRefreshPolicy.test.ts:13`:

```ts
describe('localStudioSyncRefreshPolicy', () => {
  it('triggers backend refresh when an asset arrives', () => {
    const refreshBackendState = vi.fn(async () => {});
```

## Commands you will need

| Purpose               | Command                                                    | Expected on success |
| --------------------- | ---------------------------------------------------------- | ------------------- |
| Focused tests         | `vp test run hooks/studioDiagnosticsRefreshPolicy.test.ts` | exit 0              |
| Existing policy tests | `vp test run hooks/localStudioSyncRefreshPolicy.test.ts`   | exit 0              |
| Full tests            | `bun run test`                                             | exit 0              |
| Static check          | `bun run check`                                            | exit 0              |
| Build                 | `bun run build`                                            | exit 0              |

## Scope

**In scope**:

- `hooks/useStudioDiagnostics.ts`
- `hooks/studioDiagnosticsRefreshPolicy.ts` (create if useful)
- `hooks/studioDiagnosticsRefreshPolicy.test.ts` (create)

**Out of scope**:

- `useLocalStudioSync` event stream behavior
- Backend health endpoints
- Onboarding explicit refresh button behavior, except to preserve it
- Changing the default 30 second visible-window interval without evidence

## Git workflow

- Branch: `codex/004-pause-passive-diagnostics-when-hidden`
- Commit style: `fix: pause hidden diagnostics refresh`
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Extract refresh scheduling policy

Create a small pure policy module, for example
`hooks/studioDiagnosticsRefreshPolicy.ts`, that answers when passive refreshes
should run. It should support:

- initial refresh still runs,
- interval refresh runs only when `document.visibilityState` is `visible` or
  visibility cannot be determined,
- when visibility changes back to visible, trigger one refresh immediately,
- explicit `refreshDiagnostics` calls from UI remain unaffected.

Inject timer and visibility dependencies where practical so the policy can be
tested without rendering React.

**Verify**:
`vp test run hooks/studioDiagnosticsRefreshPolicy.test.ts` -> exit 0 after adding tests in Step 2.

### Step 2: Add policy tests

Create `hooks/studioDiagnosticsRefreshPolicy.test.ts` with cases mirroring the
style of `localStudioSyncRefreshPolicy.test.ts`:

- visible interval triggers refresh,
- hidden interval does not trigger refresh,
- hidden to visible transition triggers exactly one refresh,
- cleanup removes timers/listeners.

Use fake timers or injected scheduler callbacks. Do not make real network
requests in these tests.

**Verify**:
`vp test run hooks/studioDiagnosticsRefreshPolicy.test.ts` -> exit 0.

### Step 3: Wire `useStudioDiagnostics` to the policy

Replace the unconditional `setInterval` effect in `useStudioDiagnostics.ts` with
the policy from Step 1. Preserve:

- the first `void refreshDiagnostics()` on mount,
- the `refreshDiagnostics` function returned to callers,
- fallback behavior when `document` or `window` is unavailable.

**Verify**:
`vp test run hooks/studioDiagnosticsRefreshPolicy.test.ts hooks/localStudioSyncRefreshPolicy.test.ts` -> exit 0.

## Test plan

- New pure policy tests in `hooks/studioDiagnosticsRefreshPolicy.test.ts`.
- Existing local sync policy tests should still pass, proving no accidental
  coupling was introduced.
- Full suite at wave close.

## Done criteria

- [ ] Hidden tabs/windows do not run passive diagnostics interval refreshes.
- [ ] Returning to visible triggers one immediate diagnostics refresh.
- [ ] Explicit refresh APIs still work.
- [ ] `vp test run hooks/studioDiagnosticsRefreshPolicy.test.ts hooks/localStudioSyncRefreshPolicy.test.ts` exits 0.
- [ ] Full closeout gates from `plans/README.md` pass or exact blockers are recorded.
- [ ] `plans/README.md` status row updated.

## STOP conditions

Stop and report back if:

- Diagnostics refresh cadence is already visibility-aware in the live code.
- The app relies on hidden-window diagnostics to keep server jobs alive.
- Testing the hook requires adding a React test library dependency.
- Preserving explicit refresh behavior conflicts with pausing passive refreshes.

## Maintenance notes

If future diagnostics add active job progress, reconsider the hidden-window
policy. Job/event sync belongs in `useLocalStudioSync`; this plan should not
make diagnostics responsible for queue liveness.
