import { afterEach, expect, it, vi } from 'vite-plus/test';
import {
  getGenerationProviderCapabilities,
  getGenerationProviderRuntimePreflight,
  invalidateGenerationProviderReads,
} from './providers';
afterEach(() => {
  vi.unstubAllGlobals();
  invalidateGenerationProviderReads();
});

it('shares concurrent diagnostics, releases failures, and invalidates reads after auth changes', async () => {
  const pending: Array<(response: Response) => void> = [];
  const fetchMock = vi.fn(() => new Promise<Response>((resolve) => pending.push(resolve)));
  vi.stubGlobal('fetch', fetchMock);
  const first = getGenerationProviderCapabilities();
  const second = getGenerationProviderCapabilities();
  const preflight = getGenerationProviderRuntimePreflight();
  const repeated = getGenerationProviderRuntimePreflight();
  expect(fetchMock).toHaveBeenCalledTimes(2);
  pending[0](Response.json({ providers: [] }));
  pending[1](Response.json({ error: 'offline' }, { status: 503 }));
  await expect(first).resolves.toEqual(await second);
  await expect(preflight).rejects.toThrow('offline');
  await expect(repeated).rejects.toThrow('offline');
  const retry = getGenerationProviderRuntimePreflight();
  expect(fetchMock).toHaveBeenCalledTimes(3);
  invalidateGenerationProviderReads();
  const afterAuth = getGenerationProviderRuntimePreflight();
  expect(fetchMock).toHaveBeenCalledTimes(4);
  pending[2](Response.json({ providers: ['old'] }));
  await retry;
  expect(getGenerationProviderRuntimePreflight()).toBe(afterAuth);
  pending[3](Response.json({ providers: [] }));
  await afterAuth;
});
