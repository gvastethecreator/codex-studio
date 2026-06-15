export type StudioDiagnosticsRefreshVisibility = DocumentVisibilityState | null;

export interface CreateStudioDiagnosticsRefreshPolicyOptions {
  refreshDiagnostics: () => void | Promise<void>;
  refreshIntervalMs: number;
  getVisibilityState?: () => StudioDiagnosticsRefreshVisibility;
  setIntervalFn?: (callback: () => void, delayMs: number) => unknown;
  clearIntervalFn?: (intervalId: unknown) => void;
  addVisibilityChangeListener?: (callback: () => void) => () => void;
}

export interface StudioDiagnosticsRefreshPolicy {
  dispose: () => void;
}

function defaultGetVisibilityState(): StudioDiagnosticsRefreshVisibility {
  return typeof document === 'undefined' ? null : document.visibilityState;
}

function defaultAddVisibilityChangeListener(callback: () => void) {
  if (typeof document === 'undefined') return () => {};
  document.addEventListener('visibilitychange', callback);
  return () => document.removeEventListener('visibilitychange', callback);
}

function shouldRunPassiveRefresh(visibilityState: StudioDiagnosticsRefreshVisibility) {
  return visibilityState === null || visibilityState === 'visible';
}

export function createStudioDiagnosticsRefreshPolicy({
  refreshDiagnostics,
  refreshIntervalMs,
  getVisibilityState = defaultGetVisibilityState,
  setIntervalFn = (callback, delayMs) => globalThis.setInterval(callback, delayMs),
  clearIntervalFn = (intervalId) =>
    globalThis.clearInterval(intervalId as ReturnType<typeof setInterval>),
  addVisibilityChangeListener = defaultAddVisibilityChangeListener,
}: CreateStudioDiagnosticsRefreshPolicyOptions): StudioDiagnosticsRefreshPolicy {
  const refreshIfVisible = () => {
    if (shouldRunPassiveRefresh(getVisibilityState())) {
      void refreshDiagnostics();
    }
  };

  const intervalId = setIntervalFn(refreshIfVisible, refreshIntervalMs);
  const removeVisibilityListener = addVisibilityChangeListener(() => {
    if (getVisibilityState() === 'visible') {
      void refreshDiagnostics();
    }
  });

  return {
    dispose: () => {
      clearIntervalFn(intervalId);
      removeVisibilityListener();
    },
  };
}
