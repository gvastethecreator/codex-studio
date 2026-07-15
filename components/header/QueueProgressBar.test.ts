import { describe, expect, it } from 'vite-plus/test';

import { resolveQueueProgressPercent, shouldScheduleQueueProgress } from './QueueProgressBar';

describe('QueueProgressBar', () => {
  it('uses a stable fallback without scheduling work when the start time is unknown', () => {
    expect(resolveQueueProgressPercent(null, 10_000)).toBe(18);
    expect(shouldScheduleQueueProgress(null, 18)).toBe(false);
  });

  it('clamps progress while generation is active', () => {
    expect(resolveQueueProgressPercent(10_000, 10_000)).toBe(6);
    expect(resolveQueueProgressPercent(10_000, 70_000)).toBe(50);
    expect(shouldScheduleQueueProgress(10_000, 50)).toBe(true);
  });

  it('stops scheduling ticks once the visual reaches its cap', () => {
    expect(resolveQueueProgressPercent(10_000, 190_000)).toBe(100);
    expect(shouldScheduleQueueProgress(10_000, 100)).toBe(false);
  });
});
