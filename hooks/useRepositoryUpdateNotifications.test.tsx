/** @vitest-environment jsdom */
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useRepositoryUpdateNotifications } from './useRepositoryUpdateNotifications';

const api = vi.hoisted(() => ({ check: vi.fn() }));
vi.mock('../services/studio-api/updates', () => ({
  checkRepositoryUpdates: api.check,
  readPendingStudioRestart: () => null,
}));
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
});

it('checks only when enabled and notifies once per remote commit across hourly checks', async () => {
  vi.useFakeTimers();
  api.check.mockResolvedValue({ behind: 2, latestCommit: 'first', error: null });
  const addToast = vi.fn();
  const { rerender } = renderHook(
    ({ enabled }) => useRepositoryUpdateNotifications(enabled, addToast),
    { initialProps: { enabled: false } },
  );
  expect(api.check).not.toHaveBeenCalled();
  await act(async () => {
    rerender({ enabled: true });
  });
  expect(addToast).toHaveBeenCalledTimes(1);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
  });
  expect(api.check).toHaveBeenCalledTimes(2);
  expect(addToast).toHaveBeenCalledTimes(1);
  api.check.mockResolvedValue({ behind: 3, latestCommit: 'second', error: null });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
  });
  expect(addToast).toHaveBeenCalledTimes(2);
  rerender({ enabled: false });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
  });
  expect(api.check).toHaveBeenCalledTimes(3);
});
