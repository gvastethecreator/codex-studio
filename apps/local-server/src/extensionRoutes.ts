import { Hono } from 'hono';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import {
  compareExtensionVersions,
  EXTENSION_LAYERS,
  type ExtensionLayerName,
} from '../../../packages/shared/src/extensions';
import {
  ExtensionInstallError,
  installExtensionArchive,
  installExtensionLayer,
} from './extensionInstaller';
import type { ExtensionSourceClient, RemoteExtensionSource } from './extensionSources';
import type { ExtensionStore } from './extensionStore';

interface ExtensionRoutesDependencies {
  store: ExtensionStore;
  /** Remote install support; omitted in contexts that only read local extensions. */
  remote?: {
    client: ExtensionSourceClient;
    sources: RemoteExtensionSource[];
    installDir: string;
  };
}

const CONTENT_TYPES: Record<string, string> = {
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

/** Lists, serves, installs and removes Cozy Extensions (ADR 0011). */
export function createExtensionRoutes({ store, remote }: ExtensionRoutesDependencies) {
  const app = new Hono();
  const isInstalledCopy = (root: string) =>
    remote !== undefined && path.dirname(path.resolve(root)) === path.resolve(remote.installDir);

  app.get('/', async (c) => {
    const { extensions, invalid } = await store.list({ refresh: c.req.query('refresh') === '1' });
    return c.json({
      extensions: extensions.map(({ manifest }) => manifest),
      installedLayers: Object.fromEntries(
        extensions.map(({ manifest, layers }) => [manifest.id, layers] as const),
      ),
      invalid: invalid.map(({ folder, issues }) => ({ folder: path.basename(folder), issues })),
    });
  });

  app.get('/available', async (c) => {
    if (!remote) return c.json({ error: 'Remote extension sources are not configured' }, 404);
    const installed = new Map(
      (await store.list()).extensions.map((item) => [item.manifest.id, item] as const),
    );
    const sources = await Promise.all(
      remote.sources.map(async (source) => {
        try {
          const index = await remote.client.fetchIndex(source);
          return {
            id: source.id,
            repo: source.repo,
            extensions: index.extensions.map((entry) => {
              const local = installed.get(entry.id);
              return {
                ...entry,
                installedVersion: local?.manifest.version ?? null,
                installedLayers: local?.layers ?? [],
                installedFrom: local
                  ? isInstalledCopy(local.root)
                    ? 'download'
                    : 'builtin'
                  : null,
                updateAvailable: local
                  ? compareExtensionVersions(entry.version, local.manifest.version) > 0
                  : false,
              };
            }),
            error: null,
          };
        } catch (error) {
          return { id: source.id, repo: source.repo, extensions: [], error: errorMessage(error) };
        }
      }),
    );
    return c.json({ tokenConfigured: remote.client.tokenConfigured, sources });
  });

  app.post('/install', async (c) => {
    if (!remote) return c.json({ error: 'Remote extension sources are not configured' }, 404);
    const body = (await c.req.json().catch(() => null)) as {
      sourceId?: unknown;
      id?: unknown;
      layers?: unknown;
    };
    const requestedLayers = Array.isArray(body?.layers)
      ? body.layers.filter((layer): layer is ExtensionLayerName =>
          EXTENSION_LAYERS.includes(layer as ExtensionLayerName),
        )
      : [];
    const source = remote.sources.find((item) => item.id === body?.sourceId);
    if (!source || typeof body?.id !== 'string')
      return c.json({ error: 'Request needs a known sourceId and an extension id' }, 400);
    try {
      const entry = (await remote.client.fetchIndex(source)).extensions.find(
        (item) => item.id === body.id,
      );
      if (!entry) return c.json({ error: `${source.repo} does not publish ${body.id}` }, 404);
      const archive = await remote.client.downloadAsset(source, entry.tag, entry.archive);
      const manifest = await installExtensionArchive({
        archive,
        entry,
        installDir: remote.installDir,
      });
      const extensionRoot = path.join(remote.installDir, entry.id);
      const installedLayers: string[] = [];
      for (const name of requestedLayers) {
        const layer = entry.layers?.find((item) => item.name === name);
        if (!layer) continue;
        const layerArchive = await remote.client.downloadAsset(source, entry.tag, layer.archive);
        await installExtensionLayer({ archive: layerArchive, layer, extensionRoot });
        installedLayers.push(name);
      }
      await store.list({ refresh: true });
      return c.json({ extension: manifest, installedLayers });
    } catch (error) {
      const status = error instanceof ExtensionInstallError ? 422 : 502;
      return c.json({ error: errorMessage(error) }, status);
    }
  });

  app.delete('/:id', async (c) => {
    const id = c.req.param('id');
    const extension = (await store.list()).extensions.find((item) => item.manifest.id === id);
    if (!extension) return c.json({ error: 'Not found' }, 404);
    if (!isInstalledCopy(extension.root))
      return c.json({ error: 'Built-in and local extensions cannot be removed here' }, 409);
    await rm(extension.root, { recursive: true, force: true });
    await store.list({ refresh: true });
    return c.body(null, 204);
  });

  app.get('/:id/files/*', async (c) => {
    const id = c.req.param('id');
    const relativePath = decodeURIComponent(c.req.path.split(`/${id}/files/`)[1] ?? '');
    const contentType = CONTENT_TYPES[path.extname(relativePath).toLowerCase()];
    if (!relativePath || !contentType) return c.json({ error: 'Unsupported file' }, 400);
    const file = await store.readFile(id, relativePath);
    if (!file) return c.json({ error: 'Not found' }, 404);
    return c.body(new Uint8Array(file), 200, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    });
  });

  return app;
}
