import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildCatalogQuery } from './catalog';
import { downloadConvertedCatalogImage } from './imageConversion';
import { DEFAULT_IMAGE_CONVERSION_OPTIONS } from '../../packages/shared/src/imageConversion';
import { readLocalStudioErrorMessage, request } from './http';
import { getStudioRuntimeSnapshot, refreshStudioReadiness, runOnboardingSetup } from './runtime';

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
    expect(readLocalStudioErrorMessage('null', 503)).toBe('Local studio request failed: 503');
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

describe('runOnboardingSetup', () => {
  it('posts Setup and invalidates the runtime snapshot cache', async () => {
    const setupResponse = {
      ok: true,
      libraryPath: 'D:/Codex Studio',
      wroteEnv: true,
      initializedLibrary: true,
      installedDeps: false,
      skippedDepInstall: true,
      cloudSyncProvider: null,
      probe: { primaryCta: 'start_app_server' },
    };
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ health: { ok: true } }))
      .mockResolvedValueOnce(jsonResponse(setupResponse))
      .mockResolvedValueOnce(jsonResponse({ health: { ok: true, refreshed: true } }));
    vi.stubGlobal('fetch', fetchMock);

    await getStudioRuntimeSnapshot({ bypassCache: true });
    await expect(
      runOnboardingSetup({
        consent: true,
        libraryPath: 'D:/Codex Studio',
        confirmCloudSync: false,
        initLibrary: true,
        installDeps: true,
      }),
    ).resolves.toMatchObject({ ok: true, libraryPath: 'D:/Codex Studio' });
    await getStudioRuntimeSnapshot();

    const setupCall = fetchMock.mock.calls[1];
    expect(String(setupCall?.[0] as string)).toContain('/api/onboarding/setup');
    expect(setupCall?.[1]).toMatchObject({ method: 'POST' });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});

describe('image conversion download', () => {
  it('reads converted bytes, saved filename and size, and surfaces server failures', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response('converted pixels', {
          headers: {
            'Content-Type': 'image/webp',
            'Content-Disposition':
              "attachment; filename*=UTF-8''2026-10-03_000001_b%C3%BAho-converted.webp",
            'X-Source-Bytes': '42',
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Image file is missing.' }), { status: 404 }),
      );
    vi.stubGlobal('fetch', fetchMock);
    const result = await downloadConvertedCatalogImage(
      'image/one',
      DEFAULT_IMAGE_CONVERSION_OPTIONS,
    );
    expect(result.filename).toBe('2026-10-03_000001_búho-converted.webp');
    expect(result.sourceBytes).toBe(42);
    expect(result.outputBytes).toBe(16);
    expect(await result.blob.text()).toBe('converted pixels');
    expect(fetchMock.mock.calls[0][0]).toContain('/api/catalog/image%2Fone/convert');
    const body = fetchMock.mock.calls[0][1]?.body;
    if (typeof body !== 'string') throw new Error('Expected a JSON request body');
    expect(JSON.parse(body)).toMatchObject({
      format: 'webp',
      preserveMetadata: true,
      destination: 'download',
    });
    await expect(
      downloadConvertedCatalogImage('missing', DEFAULT_IMAGE_CONVERSION_OPTIONS),
    ).rejects.toThrow('Image file is missing.');
  });
});
