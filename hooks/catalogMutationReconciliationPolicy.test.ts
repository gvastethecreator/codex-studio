import { describe, expect, it, vi } from 'vite-plus/test';

import { createCatalogMutationReconciliationPolicy } from './catalogMutationReconciliationPolicy';

describe('catalogMutationReconciliationPolicy', () => {
  it('refreshes after a successful mutation when no SSE acknowledgement arrives', async () => {
    const scheduled: Array<{ callback: () => void; delayMs: number }> = [];
    const reconcile = vi.fn(async () => {});
    const policy = createCatalogMutationReconciliationPolicy({
      reconcile,
      schedule: (callback, delayMs) => {
        scheduled.push({ callback, delayMs });
        return scheduled.length as unknown as ReturnType<typeof setTimeout>;
      },
    });

    policy.request({ kind: 'all' });
    const fallback = scheduled.shift();
    expect(fallback?.delayMs).toBe(500);
    fallback?.callback();
    await Promise.resolve();

    expect(reconcile).toHaveBeenCalledOnce();
  });

  it('cancels the fallback after an SSE-driven refresh succeeds', () => {
    const cancel = vi.fn();
    const policy = createCatalogMutationReconciliationPolicy({
      reconcile: vi.fn(),
      schedule: () => 42 as unknown as ReturnType<typeof setTimeout>,
      cancel,
    });

    policy.request();
    policy.acknowledge();

    expect(cancel).toHaveBeenCalledWith(42);
  });

  it('keeps an all-scope fallback when SSE only reconciles a partial scope', () => {
    const cancel = vi.fn();
    const policy = createCatalogMutationReconciliationPolicy({
      reconcile: vi.fn(),
      schedule: () => 42 as unknown as ReturnType<typeof setTimeout>,
      cancel,
    });

    policy.request({ kind: 'all' });
    policy.acknowledge({ kind: 'trash' });

    expect(cancel).not.toHaveBeenCalled();
  });

  it('does not let an older refresh acknowledge a newer mutation', () => {
    const scheduled: Array<() => void> = [];
    const cancel = vi.fn();
    const policy = createCatalogMutationReconciliationPolicy({
      reconcile: vi.fn(),
      schedule: (callback) => {
        scheduled.push(callback);
        return scheduled.length as unknown as ReturnType<typeof setTimeout>;
      },
      cancel,
    });

    policy.request({ kind: 'all' });
    const olderGeneration = policy.getGeneration();
    scheduled.shift()?.();
    policy.request({ kind: 'all' });
    policy.acknowledge({ kind: 'all' }, olderGeneration);

    expect(cancel).not.toHaveBeenCalled();
    expect(scheduled).toHaveLength(1);
  });

  it('retries a transient fallback refresh failure', async () => {
    const scheduled: Array<{ callback: () => void; delayMs: number }> = [];
    const reconcile = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error('temporary failure'))
      .mockResolvedValue(undefined);
    const policy = createCatalogMutationReconciliationPolicy({
      reconcile,
      schedule: (callback, delayMs) => {
        scheduled.push({ callback, delayMs });
        return scheduled.length as unknown as ReturnType<typeof setTimeout>;
      },
    });

    policy.request();
    scheduled.shift()?.callback();
    for (let index = 0; index < 4; index += 1) await Promise.resolve();
    const retry = scheduled.shift();
    expect(retry?.delayMs).toBe(300);
    retry?.callback();
    for (let index = 0; index < 4; index += 1) await Promise.resolve();

    expect(reconcile).toHaveBeenCalledTimes(2);
  });
});
