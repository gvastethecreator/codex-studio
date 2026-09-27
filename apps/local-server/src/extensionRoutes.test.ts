import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createExtensionRoutes } from './extensionRoutes';
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
