import { describe, expect, it } from 'vite-plus/test';

import { extractUsageSnapshot, pickRateLimitSnapshot } from './rateLimitUsage';

describe('localCodexSession usage parsing', () => {
  it('picks codex rate limit snapshots from app-server responses', () => {
    const { snapshot, path } = pickRateLimitSnapshot({
      rateLimitsByLimitId: {
        codex: {
          primary: { used_percent: 25, window_minutes: 300, resets_at: 1778731862 },
        },
      },
    });

    expect(path).toBe('rateLimitsByLimitId.codex');
    expect(snapshot.primary.used_percent).toBe(25);
  });

  it('extracts 5h and weekly quota availability from snake_case rate limits', () => {
    const usage = extractUsageSnapshot(
      {
        primary: { used_percent: 30, window_minutes: 300, resets_at: 1778731862 },
        secondary: { used_percent: 45, window_minutes: 10080, resets_at: 1779147097 },
        credits: null,
        plan_type: 'prolite',
      },
      'rateLimitsByLimitId.codex',
    );

    expect(usage).toMatchObject({
      available: 70,
      unit: 'quota_percent',
      display: '70%',
      path: 'rateLimitsByLimitId.codex.primary',
    });
    expect(usage?.limits).toEqual([
      expect.objectContaining({
        id: 'primary',
        label: '5h',
        usedPercent: 30,
        availablePercent: 70,
        windowMinutes: 300,
        resetsAt: 1778731862,
      }),
      expect.objectContaining({
        id: 'secondary',
        label: 'Weekly',
        usedPercent: 45,
        availablePercent: 55,
        windowMinutes: 10080,
        resetsAt: 1779147097,
      }),
    ]);
  });

  it('prefers quota windows over legacy credits when both are present', () => {
    const usage = extractUsageSnapshot(
      {
        primary: { usedPercent: 10, windowDurationMins: 300 },
        credits: { balance: '999' },
      },
      'rateLimits',
    );

    expect(usage).toMatchObject({
      available: 90,
      unit: 'quota_percent',
      display: '90%',
    });
  });
});
