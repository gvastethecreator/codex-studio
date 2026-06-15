import { describe, expect, it, vi } from 'vite-plus/test';
import { createStudioDiagnosticsRefreshPolicy } from './studioDiagnosticsRefreshPolicy';

function createPolicyHarness(initialVisibility: DocumentVisibilityState | null = 'visible') {
  let intervalCallback: (() => void) | null = null;
  let visibilityCallback: (() => void) | null = null;
  let visibilityState = initialVisibility;
  const refreshDiagnostics = vi.fn(async () => {});
  const clearIntervalFn = vi.fn();
  const removeVisibilityListener = vi.fn();

  const policy = createStudioDiagnosticsRefreshPolicy({
    refreshDiagnostics,
    refreshIntervalMs: 30_000,
    getVisibilityState: () => visibilityState,
    setIntervalFn: (callback) => {
      intervalCallback = callback;
      return 'interval-id';
    },
    clearIntervalFn,
    addVisibilityChangeListener: (callback) => {
      visibilityCallback = callback;
      return removeVisibilityListener;
    },
  });

  return {
    policy,
    refreshDiagnostics,
    clearIntervalFn,
    removeVisibilityListener,
    runInterval: () => intervalCallback?.(),
    setVisibility: (nextVisibility: DocumentVisibilityState) => {
      visibilityState = nextVisibility;
      visibilityCallback?.();
    },
  };
}

describe('studioDiagnosticsRefreshPolicy', () => {
  it('runs passive interval refreshes while visible', () => {
    const harness = createPolicyHarness('visible');

    harness.runInterval();

    expect(harness.refreshDiagnostics).toHaveBeenCalledTimes(1);
  });

  it('skips passive interval refreshes while hidden', () => {
    const harness = createPolicyHarness('hidden');

    harness.runInterval();

    expect(harness.refreshDiagnostics).toHaveBeenCalledTimes(0);
  });

  it('refreshes once when returning to visible', () => {
    const harness = createPolicyHarness('hidden');

    harness.setVisibility('visible');

    expect(harness.refreshDiagnostics).toHaveBeenCalledTimes(1);
  });

  it('cleans up interval and visibility listener', () => {
    const harness = createPolicyHarness('visible');

    harness.policy.dispose();

    expect(harness.clearIntervalFn).toHaveBeenCalledWith('interval-id');
    expect(harness.removeVisibilityListener).toHaveBeenCalledTimes(1);
  });
});
