import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { buildCatalogQuery } from './catalog';
import { readLocalStudioErrorMessage, request } from './http';
import { getStudioRuntimeSnapshot, refreshStudioReadiness } from './runtime';

function jsonResponse(value: unknown) {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('buildCatalogQuery', () => {
  it('returns an empty string when no filters are provided', () => {
    expect(buildCatalogQuery()).toBe('');
  });

  it('serializes supported filters in a stable order', () => {
    expect(
      buildCatalogQuery({
        workspaceId: 'ws-main',
        libraryId: 'library-default',
        q: 'neo noir',
        favorite: true,
        offset: 40,
        limit: 20,
      }),
    ).toBe(
      '?workspace_id=ws-main&library_id=library-default&favorite=true&q=neo+noir&offset=40&limit=20',
    );
  });

  it('keeps explicit false flags instead of dropping them', () => {
    expect(buildCatalogQuery({ favorite: false, deleted: false })).toBe(
      '?favorite=false&deleted=false',
    );
  });
});

describe('readLocalStudioErrorMessage', () => {
  it('extracts readable backend errors from JSON responses', () => {
    expect(readLocalStudioErrorMessage('{"error":"Prompt fixture failed"}', 500)).toBe(
      'Prompt fixture failed',
    );
    expect(readLocalStudioErrorMessage('{"message":"Run not found"}', 404)).toBe('Run not found');
  });

  it('preserves plain text and supplies a status fallback', () => {
    expect(readLocalStudioErrorMessage('Export failed', 409)).toBe('Export failed');
    expect(readLocalStudioErrorMessage('', 503)).toBe('Local studio request failed: 503');
  });
});

describe('local studio request headers', () => {
  it('keeps GET requests simple and sends JSON content type only when there is a body', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => jsonResponse({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await request('/api/health');
    await request('/api/settings', { method: 'PATCH', body: JSON.stringify({}) });

    const getHeaders = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
    const patchHeaders = fetchMock.mock.calls[1]?.[1]?.headers as Headers;
    expect(getHeaders.has('Content-Type')).toBe(false);
    expect(patchHeaders.get('Content-Type')).toBe('application/json');
  });
});

describe('runtime snapshot cache', () => {
  it('does not let an older snapshot overwrite the result of a forced readiness refresh', async () => {
    const staleSnapshot = { marker: 'stale' };
    const freshSnapshot = { marker: 'fresh' };
    const readiness = { marker: 'readiness-refreshed' };
    const staleResponse = createDeferred<Response>();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockReturnValueOnce(staleResponse.promise)
      .mockResolvedValueOnce(jsonResponse(readiness))
      .mockResolvedValueOnce(jsonResponse(freshSnapshot));
    vi.stubGlobal('fetch', fetchMock);

    const staleRead = getStudioRuntimeSnapshot({ bypassCache: true });
    await refreshStudioReadiness({ reason: 'manual', force: true });
    const freshRead = getStudioRuntimeSnapshot();
    await expect(freshRead).resolves.toEqual(freshSnapshot);

    staleResponse.resolve(jsonResponse(staleSnapshot));
    await expect(staleRead).resolves.toEqual(staleSnapshot);
    await expect(getStudioRuntimeSnapshot()).resolves.toEqual(freshSnapshot);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
