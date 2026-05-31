import { beforeAll, describe, expect, it, vi } from 'vite-plus/test';

import { extractUsageSnapshot, pickRateLimitSnapshot } from './rateLimitUsage';

vi.mock('./rpcClient', () => ({
  CodexRpcClient: class {
    async connect() {}
    async request() {
      return null;
    }
    notify() {}
    close() {}
  },
}));

let buildLocalCodexSessionResponse: typeof import('./localCodexSession').buildLocalCodexSessionResponse;
let classifyLocalCodexSessionFallbackReason: typeof import('./localCodexSession').classifyLocalCodexSessionFallbackReason;

beforeAll(async () => {
  ({ buildLocalCodexSessionResponse, classifyLocalCodexSessionFallbackReason } =
    await import('./localCodexSession'));
});

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

describe('localCodexSession fallback cause taxonomy', () => {
  it('maps fallback connection errors to app_server_unavailable', () => {
    expect(classifyLocalCodexSessionFallbackReason(new Error('ECONNREFUSED 127.0.0.1'))).toBe(
      'app_server_unavailable',
    );
    expect(classifyLocalCodexSessionFallbackReason('websocket timed out while connecting')).toBe(
      'app_server_unavailable',
    );
  });

  it('maps non-network fallback errors to unknown', () => {
    expect(classifyLocalCodexSessionFallbackReason(new Error('invalid payload shape'))).toBe(
      'unknown',
    );
    expect(classifyLocalCodexSessionFallbackReason(null)).toBe('unknown');
  });

  it('uses fallbackReason when source is fallback and error is present', () => {
    const response = buildLocalCodexSessionResponse({
      authMode: null,
      planType: null,
      usage: null,
      source: 'fallback',
      fetchedAt: '2026-05-31T00:00:00.000Z',
      error: 'invalid payload shape',
      fallbackReason: 'unknown',
    });

    expect(response.state).toBe('unavailable');
    expect(response.reason).toBe('unknown');
    expect(response.canRunLocalJobs).toBe(false);
  });
});
