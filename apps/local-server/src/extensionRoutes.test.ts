import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import JSZip from 'jszip';
import { afterEach, describe, expect, it } from 'vitest';
import { createExtensionRoutes } from './extensionRoutes';
import type { ExtensionSourceClient } from './extensionSources';
import { createExtensionStore } from './extensionStore';

const manifest = {
  schemaVersion: 1,
  id: 'cozy.pack-14',
  kind: 'style-pack',
  version: '1.0.0',
  studio: '>=0.1.0',
  title: 'Mythic Noir Curated Vault',
  files: {
    pack: 'pack.json',
    runtime: 'runtime.json',
    search: 'search.json',
    thumbnails: 'thumbnails.json',
  },
  stylePack: { id: 'pack_14', name: 'Mythic Noir', description: 'Myths.', presetCount: 197 },
  assets: [],
};

let source = '';
afterEach(() => rm(source, { recursive: true, force: true }));

async function createRoutes() {
  source = await mkdtemp(path.join(tmpdir(), 'cozy-extensions-'));
  await mkdir(path.join(source, 'cozy.pack-14'));
  await writeFile(path.join(source, 'cozy.pack-14', 'extension.json'), JSON.stringify(manifest));
  await writeFile(path.join(source, 'cozy.pack-14', 'pack.json'), '{"packManifest":{}}');
  await writeFile(path.join(source, 'secret.json'), '{"token":"x"}');
  await mkdir(path.join(source, 'broken'));
  await writeFile(path.join(source, 'broken', 'extension.json'), '{"id":"Broken"}');
  return createExtensionRoutes({ store: createExtensionStore([source]) });
}

describe('extension routes', () => {
  it('lists valid extensions and reports invalid ones without failing', async () => {
    const routes = await createRoutes();
    const body = await (await routes.request('/')).json();
    expect(body.extensions.map((item: { id: string }) => item.id)).toEqual(['cozy.pack-14']);
    expect(body.invalid).toEqual([
      expect.objectContaining({ folder: 'broken', issues: expect.any(Array) }),
    ]);
  });

  it('serves files inside an extension and refuses paths outside it', async () => {
    const routes = await createRoutes();
    const pack = await routes.request('/cozy.pack-14/files/pack.json');
    expect(pack.status).toBe(200);
    expect(await pack.json()).toEqual({ packManifest: {} });
    expect((await routes.request('/cozy.pack-14/files/..%2Fsecret.json')).status).toBe(404);
    expect((await routes.request('/cozy.pack-14/files/extension.exe')).status).toBe(400);
    expect((await routes.request('/cozy.missing/files/pack.json')).status).toBe(404);
  });
});

describe('remote extension install', () => {
  async function createRemoteRoutes({
    localPack = true,
    defaultPackId = undefined as string | undefined,
  } = {}) {
    const builtin = await mkdtemp(path.join(tmpdir(), 'cozy-builtin-'));
    const installDir = await mkdtemp(path.join(tmpdir(), 'cozy-installed-'));
    source = builtin;
    if (localPack) {
      await mkdir(path.join(builtin, 'cozy.pack-14'));
      await writeFile(
        path.join(builtin, 'cozy.pack-14', 'extension.json'),
        JSON.stringify(manifest),
      );
    }

    const zip = new JSZip();
    zip.file('extension.json', JSON.stringify({ ...manifest, version: '1.1.0' }));
    zip.file('pack.json', '{"version":"1.1.0"}');
    const archive = await zip.generateAsync({ type: 'uint8array' });
    const cardsZip = new JSZip();
    cardsZip.file('SP14-142.webp', 'full-card');
    const cardsArchive = await cardsZip.generateAsync({ type: 'uint8array' });
    const entry = {
      id: 'cozy.pack-14',
      version: '1.1.0',
      title: 'Mythic Noir Curated Vault',
      tag: 'cozy.pack-14-v1.1.0',
      archive: 'cozy.pack-14-1.1.0.zip',
      sha256: createHash('sha256').update(archive).digest('hex'),
      bytes: archive.byteLength,
      layers: [
        {
          name: 'cards' as const,
          archive: 'cozy.pack-14-1.1.0-cards.zip',
          sha256: createHash('sha256').update(cardsArchive).digest('hex'),
          bytes: cardsArchive.byteLength,
        },
      ],
    };
    const client: ExtensionSourceClient = {
      tokenConfigured: false,
      fetchIndex: async () => ({ schemaVersion: 1, extensions: [entry] }),
      downloadAsset: async (_source, tag, name) => {
        expect(tag).toBe(entry.tag);
        return name === entry.layers[0]!.archive ? cardsArchive : archive;
      },
    };
    const store = createExtensionStore([installDir, builtin]);
    const routes = createExtensionRoutes({
      store,
      remote: { client, sources: [{ id: 'cozy-styles', repo: 'owner/cozy-styles' }], installDir },
      defaultPackId,
    });
    return { routes, installDir };
  }

  it('installs the default pack once when Studio has no style pack', async () => {
    const { routes, installDir } = await createRemoteRoutes({
      localPack: false,
      defaultPackId: 'cozy.pack-14',
    });
    try {
      const started = await routes.request('/default-pack', { method: 'POST' });
      expect(await started.json()).toEqual({ state: 'installing' });
      let state = { state: 'installing' };
      for (let attempt = 0; attempt < 50 && state.state === 'installing'; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 20));
        state = await (await routes.request('/default-pack')).json();
      }
      expect(state).toEqual({ state: 'installed' });
      const listed = await (await routes.request('/')).json();
      expect(listed.origins['cozy.pack-14'].from).toBe('download');

      // A removed default pack stays removed.
      await routes.request('/cozy.pack-14', { method: 'DELETE' });
      const again = await routes.request('/default-pack', { method: 'POST' });
      expect(await again.json()).toEqual({ state: 'skipped' });
    } finally {
      await rm(installDir, { recursive: true, force: true });
    }
  });

  it('does not install the default pack when a style pack is present', async () => {
    const { routes, installDir } = await createRemoteRoutes({ defaultPackId: 'cozy.pack-14' });
    try {
      const response = await routes.request('/default-pack', { method: 'POST' });
      expect(await response.json()).toEqual({ state: 'skipped' });
    } finally {
      await rm(installDir, { recursive: true, force: true });
    }
  });

  it('offers an update over a local pack, installs it and removes it again', async () => {
    const { routes, installDir } = await createRemoteRoutes();
    try {
      const before = await (await routes.request('/available')).json();
      expect(before.sources[0].extensions[0]).toMatchObject({
        installedVersion: '1.0.0',
        installedFrom: 'local',
        updateAvailable: true,
      });

      const install = await routes.request('/install', {
        method: 'POST',
        body: JSON.stringify({ sourceId: 'cozy-styles', id: 'cozy.pack-14', layers: ['cards'] }),
      });
      expect(install.status).toBe(200);
      expect((await install.json()).installedLayers).toEqual(['cards']);
      const card = await routes.request('/cozy.pack-14/files/cards/SP14-142.webp');
      expect(await card.text()).toBe('full-card');
      const pack = await routes.request('/cozy.pack-14/files/pack.json');
      expect(await pack.json()).toEqual({ version: '1.1.0' });
      const after = await (await routes.request('/available')).json();
      expect(after.sources[0].extensions[0]).toMatchObject({
        installedVersion: '1.1.0',
        installedFrom: 'download',
        installedLayers: ['cards'],
        updateAvailable: false,
      });
      const listed = await (await routes.request('/')).json();
      expect(listed.origins['cozy.pack-14'].from).toBe('download');

      expect((await routes.request('/cozy.pack-14', { method: 'DELETE' })).status).toBe(204);
      const restored = await (await routes.request('/')).json();
      expect(restored.extensions[0].version).toBe('1.0.0');
      expect(restored.origins['cozy.pack-14'].from).toBe('local');
      expect((await routes.request('/cozy.pack-14', { method: 'DELETE' })).status).toBe(409);
    } finally {
      await rm(installDir, { recursive: true, force: true });
    }
  });
});
