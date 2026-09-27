import { describe, expect, it, vi } from 'vitest';
import {
  createGitHubExtensionSourceClient,
  resolveRemoteExtensionSources,
} from './extensionSources';

const source = { id: 'owner/cozy-styles-dev', repo: 'owner/cozy-styles-dev' };
const entry = {
  id: 'cozy.pack-14',
  version: '1.1.0',
  title: 'Mythic Noir',
  tag: 'cozy.pack-14-v1.1.0',
  archive: 'cozy.pack-14-1.1.0.zip',
  sha256: 'a'.repeat(64),
  bytes: 3,
};

describe('GitHub extension source client', () => {
  it('reads the index and a release asset with the token on every request', async () => {
    const fetchImpl = vi.fn(async (url: string, _init?: RequestInit) => {
      if (url.endsWith('/contents/index.json'))
        return Response.json({ schemaVersion: 1, extensions: [entry] });
      if (url.includes('/releases/tags/'))
        return Response.json({
          assets: [{ name: entry.archive, url: 'https://api.test/assets/9' }],
        });
      return new Response(new Uint8Array([1, 2, 3]));
    });
    const client = createGitHubExtensionSourceClient({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      apiBase: 'https://api.test',
      token: 'secret-token',
    });

    await expect(client.fetchIndex(source)).resolves.toEqual({
      schemaVersion: 1,
      extensions: [entry],
    });
    const bytes = await client.downloadAsset(source, entry.tag, entry.archive);

    expect([...bytes]).toEqual([1, 2, 3]);
    expect(fetchImpl.mock.calls.map(([url]) => url)).toEqual([
      'https://api.test/repos/owner/cozy-styles-dev/contents/index.json',
      'https://api.test/repos/owner/cozy-styles-dev/releases/tags/cozy.pack-14-v1.1.0',
      'https://api.test/assets/9',
    ]);
    for (const [, init] of fetchImpl.mock.calls)
      expect(init?.headers).toMatchObject({ Authorization: 'Bearer secret-token' });
    expect(client.tokenConfigured).toBe(true);
  });

  it('rejects an invalid index and explains a missing private repository', async () => {
    const invalid = createGitHubExtensionSourceClient({
      fetchImpl: (async () =>
        Response.json({ schemaVersion: 1, extensions: [{ id: 'x' }] })) as unknown as typeof fetch,
      apiBase: 'https://api.test',
    });
    await expect(invalid.fetchIndex(source)).rejects.toThrow('index.json');

    const missing = createGitHubExtensionSourceClient({
      fetchImpl: (async () => new Response('', { status: 404 })) as unknown as typeof fetch,
      apiBase: 'https://api.test',
    });
    await expect(missing.fetchIndex(source)).rejects.toThrow('COZY_STYLES_GITHUB_TOKEN');
    expect(missing.tokenConfigured).toBe(false);
  });

  it('defaults to the public cozy-styles repository', () => {
    expect(resolveRemoteExtensionSources({})).toEqual([
      { id: 'gvastethecreator/cozy-styles', repo: 'gvastethecreator/cozy-styles' },
    ]);
    expect(
      resolveRemoteExtensionSources({
        STUDIO_EXTENSION_REMOTE_SOURCES: 'a/public, bad, b/private',
      }).map((item) => item.repo),
    ).toEqual(['a/public', 'b/private']);
  });
});
