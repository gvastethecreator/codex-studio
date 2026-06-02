import { describe, expect, it, vi } from 'vite-plus/test';
import { createCodexRoutes } from './codexRoutes';

describe('codexRoutes', () => {
  it('returns model catalog snapshot', async () => {
    const readCodexModelCatalog = vi.fn(async () => ({
      models: [],
      authMode: null,
      planType: null,
      recommendedDefaultModel: null,
      source: 'fallback' as const,
      fetchedAt: '2026-05-29T00:00:00.000Z',
      error: null,
    }));
    const readLocalCodexSession = vi.fn(async () => {
      throw new Error('readLocalCodexSession should not be called');
    });
    const readCodexAccountStatus = vi.fn(async () => {
      throw new Error('readCodexAccountStatus should not be called');
    });

    const routes = createCodexRoutes({
      readCodexModelCatalog,
      readLocalCodexSession,
      readCodexAccountStatus,
    });

    const response = await routes.request('/models');
    expect(response.status).toBe(200);

    const payload = (await response.json()) as { models?: unknown[] };
    expect(Array.isArray(payload.models)).toBe(true);
    expect(readCodexModelCatalog).toHaveBeenCalledTimes(1);
  });

  it('returns codex session and compatibility account snapshots', async () => {
    const sessionPayload = {
      authMode: 'chatgpt' as const,
      planType: 'plus',
      usage: null,
      source: 'app-server' as const,
      fetchedAt: '2026-05-29T00:00:00.000Z',
      error: null,
      authLabel: 'ChatGPT login',
      state: 'ready' as const,
      reason: null,
      isChatgptLogin: true,
      isSupportedAuthMode: true,
      canRunLocalJobs: true,
    };

    const readCodexModelCatalog = vi.fn(async () => {
      throw new Error('readCodexModelCatalog should not be called');
    });
    const readLocalCodexSession = vi.fn(async () => sessionPayload);
    const readCodexAccountStatus = vi.fn(async () => ({
      ...sessionPayload,
      source: 'fallback' as const,
    }));

    const routes = createCodexRoutes({
      readCodexModelCatalog,
      readLocalCodexSession,
      readCodexAccountStatus,
    });

    const sessionResponse = await routes.request('/session');
    expect(sessionResponse.status).toBe(200);
    await expect(sessionResponse.json()).resolves.toEqual(sessionPayload);

    const accountResponse = await routes.request('/account');
    expect(accountResponse.status).toBe(200);
    await expect(accountResponse.json()).resolves.toEqual(
      expect.objectContaining({ source: 'fallback' }),
    );

    expect(readLocalCodexSession).toHaveBeenCalledTimes(1);
    expect(readCodexAccountStatus).toHaveBeenCalledTimes(1);
  });
});
