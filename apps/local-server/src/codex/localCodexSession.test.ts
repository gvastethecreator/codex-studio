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
let createCachedLocalCodexSessionReader: typeof import('./localCodexSession').createCachedLocalCodexSessionReader;
let createLocalCodexSessionReader: typeof import('./localCodexSession').createLocalCodexSessionReader;

beforeAll(async () => {
  ({
    buildLocalCodexSessionResponse,
    classifyLocalCodexSessionFallbackReason,
    createCachedLocalCodexSessionReader,
    createLocalCodexSessionReader,
  } = await import('./localCodexSession'));
});

describe('localCodexSession request coalescing', () => {
  it('shares concurrent handshakes and briefly reuses the completed session', async () => {
    let currentTime = 10_000;
    let callCount = 0;
    let releaseFirstRead!: () => void;
    const firstReadGate = new Promise<void>((resolve) => {
      releaseFirstRead = resolve;
    });
    const response = buildLocalCodexSessionResponse({
      authMode: 'chatgpt',
      planType: 'pro',
      usage: null,
      source: 'app-server',
      fetchedAt: '2026-07-14T00:00:00.000Z',
      error: null,
    });
    const reader = createCachedLocalCodexSessionReader({
      maxAgeMs: 1_000,
      now: () => currentTime,
      read: async () => {
        callCount += 1;
        if (callCount === 1) await firstReadGate;
        return response;
      },
    });

    const first = reader();
    const concurrent = reader();
    expect(callCount).toBe(1);
    releaseFirstRead();
    await expect(Promise.all([first, concurrent])).resolves.toEqual([response, response]);

    await expect(reader()).resolves.toBe(response);
    expect(callCount).toBe(1);

    currentTime += 1_001;
    await expect(reader()).resolves.toBe(response);
    expect(callCount).toBe(2);
  });

  it('does not let an invalidated in-flight request repopulate the cache', async () => {
    let callCount = 0;
    let releaseFirstRead!: () => void;
    const firstReadGate = new Promise<void>((resolve) => {
      releaseFirstRead = resolve;
    });
    const response = buildLocalCodexSessionResponse({
      authMode: 'chatgpt',
      planType: null,
      usage: null,
      source: 'app-server',
      fetchedAt: '2026-07-14T00:00:00.000Z',
      error: null,
    });
    const reader = createCachedLocalCodexSessionReader({
      read: async () => {
        callCount += 1;
        if (callCount === 1) await firstReadGate;
        return response;
      },
    });

    const stale = reader();
    reader.invalidate();
    const fresh = reader();
    releaseFirstRead();
    await Promise.all([stale, fresh]);

    expect(callCount).toBe(2);
    reader.invalidate();
    await reader();
    expect(callCount).toBe(3);
  });
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

  it('marks required account/read protocol failures unavailable and recovers on the next read', async () => {
    const failures = [
      new Error('Method not found: account/read') as unknown,
      {
        account: { type: 'chatgpt' },
      },
    ];
    const reader = createLocalCodexSessionReader({
      createClient: () => ({
        async connect() {},
        async request(method: string) {
          if (method === 'initialize') return null;
          if (method === 'account/read') {
            const next = failures.shift();
            if (next instanceof Error) throw next;
            return next;
          }
          return null;
        },
        notify() {},
        close() {},
      }),
    });

    const failed = await reader();
    expect(failed.state).toBe('unavailable');
    expect(failed.reason).toBe('protocol_incompatible');
    expect(failed.state).not.toBe('requires_chatgpt_login');

    const recovered = await reader();
    expect(recovered.state).toBe('ready');
    expect(recovered.reason).toBeNull();
    expect(recovered.canRunLocalJobs).toBe(true);
  });

  it('maps an account/read timeout to protocol_incompatible instead of login required', async () => {
    const reader = createLocalCodexSessionReader({
      createClient: () => ({
        async connect() {},
        async request(method: string) {
          if (method === 'initialize') return null;
          if (method === 'account/read') {
            throw new Error(
              'Timed out waiting for Codex app-server response to account/read after 15ms',
            );
          }
          return null;
        },
        notify() {},
        close() {},
      }),
    });

    const response = await reader();
    expect(response.state).toBe('unavailable');
    expect(response.reason).toBe('protocol_incompatible');
    expect(response.canRunLocalJobs).toBe(false);
  });

  it('rejects malformed or unknown account/read payloads as protocol incompatibilities', async () => {
    const invalidPayloads: unknown[] = [
      undefined,
      'corrupt',
      { account: 'corrupt' },
      { account: {} },
      { account: { type: 'unknown' } },
    ];

    for (const payload of invalidPayloads) {
      const reader = createLocalCodexSessionReader({
        createClient: () => ({
          async connect() {},
          async request(method: string) {
            if (method === 'initialize') return null;
            if (method === 'account/read') return payload;
            return null;
          },
          notify() {},
          close() {},
        }),
      });

      const response = await reader();
      expect(response.state).toBe('unavailable');
      expect(response.reason).toBe('protocol_incompatible');
      expect(response.canRunLocalJobs).toBe(false);
    }
  });

  it('keeps a null account as a valid logged-out response', async () => {
    const reader = createLocalCodexSessionReader({
      createClient: () => ({
        async connect() {},
        async request(method: string) {
          if (method === 'initialize') return null;
          if (method === 'account/read') return { account: null };
          return null;
        },
        notify() {},
        close() {},
      }),
    });

    const response = await reader();
    expect(response.state).toBe('requires_chatgpt_login');
    expect(response.reason).toBe('chatgpt_login_required');
  });

  it('recognizes supported account types without waiting for optional rate limits first', async () => {
    const calls: string[] = [];
    let resolveAccount!: (value: unknown) => void;
    const accountResponse = new Promise((resolve) => {
      resolveAccount = resolve;
    });
    const reader = createLocalCodexSessionReader({
      createClient: () => ({
        async connect() {},
        async request(method: string) {
          calls.push(method);
          if (method === 'initialize') return null;
          if (method === 'account/read') return accountResponse;
          return null;
        },
        notify() {},
        close() {},
      }),
    });

    const pending = reader();
    await Promise.resolve();
    await Promise.resolve();
    expect(calls).toEqual(expect.arrayContaining(['account/read', 'account/rateLimits/read']));

    resolveAccount({ account: { type: 'externalTokens' } });
    const response = await pending;
    expect(response.state).toBe('unsupported_auth');
    expect(response.reason).toBe('external_tokens_not_supported');
  });
});
