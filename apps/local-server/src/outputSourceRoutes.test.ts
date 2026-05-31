import { describe, expect, it, vi } from 'vite-plus/test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  createDefaultEditableStudioSettings,
  type CatalogImage,
} from '../../../packages/shared/src';
import type { StudioSettingsStorage } from './studioSettingsStore';
import { createOutputSourceRoutes } from './outputSourceRoutes';

function createMemoryStorage(initial?: Record<string, string>): StudioSettingsStorage {
  const values = new Map(Object.entries(initial ?? {}));
  return {
    getSetting(key) {
      return values.get(key) ?? null;
    },
    setSetting(key, value) {
      values.set(key, value);
    },
  };
}

describe('outputSourceRoutes', () => {
  it('registers and lists output source files through the route seam', async () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'output-source-routes-'));
    const sourceDir = path.join(root, 'source');
    const libraryDir = path.join(root, 'library');

    try {
      mkdirSync(sourceDir, { recursive: true });
      mkdirSync(libraryDir, { recursive: true });
      writeFileSync(path.join(sourceDir, 'one.png'), 'png');

      const storage = createMemoryStorage();
      const publishEvent = vi.fn();

      const routes = createOutputSourceRoutes({
        settingsStorage: storage,
        readSettings: () => createDefaultEditableStudioSettings(),
        readConfig: () => ({ libraryDir }) as ReturnType<typeof import('./config').getSettings>,
        registerCatalogImage: () => {
          throw new Error('registerCatalogImage should not be called in this test');
        },
        publishEvent,
      });

      const createResponse = await routes.request('/', {
        method: 'POST',
        body: JSON.stringify({
          label: 'external source',
          path: sourceDir,
          providerId: 'comfy',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      expect(createResponse.status).toBe(201);
      const created = (await createResponse.json()) as { id: string };
      expect(created.id).toBeTruthy();

      const filesResponse = await routes.request(`/${created.id}/files?limit=10`);
      expect(filesResponse.status).toBe(200);
      const filesPayload = (await filesResponse.json()) as { files: Array<{ fileName: string }> };
      expect(filesPayload.files).toEqual([expect.objectContaining({ fileName: 'one.png' })]);
      expect(publishEvent).toHaveBeenCalledWith(
        'output-source.registered',
        expect.objectContaining({ id: created.id }),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('imports files and publishes imported event', async () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'output-source-routes-import-'));
    const sourceDir = path.join(root, 'source');
    const libraryDir = path.join(root, 'library');

    try {
      mkdirSync(sourceDir, { recursive: true });
      mkdirSync(libraryDir, { recursive: true });
      writeFileSync(path.join(sourceDir, 'hero.webp'), 'webp');

      const storage = createMemoryStorage();
      const publishEvent = vi.fn();
      const registerCatalogImage = vi.fn((input: any) => {
        const image = {
          id: 'catalog-1',
          libraryId: 'library-1',
          filePath: input.filePath,
          thumbnailPath: null,
          publicUrl: '/library/fake',
          thumbnailUrl: null,
          prompt: input.prompt ?? null,
          negativePrompt: null,
          aspectRatio: null,
          imageSize: null,
          width: null,
          height: null,
          mimeType: input.mimeType,
          fileSizeBytes: input.fileSizeBytes ?? null,
          jobId: null,
          workspaceId: input.workspaceId ?? null,
          batchId: null,
          recipeId: null,
          isFavorite: false,
          isDeleted: false,
          deletedAt: null,
          tags: input.tags ?? [],
          generationConfig: input.generationConfig ?? null,
          createdAt: '2026-05-25T00:00:00.000Z',
        } satisfies CatalogImage;
        return image;
      });

      const routes = createOutputSourceRoutes({
        settingsStorage: storage,
        readSettings: () => createDefaultEditableStudioSettings(),
        readConfig: () => ({ libraryDir }) as ReturnType<typeof import('./config').getSettings>,
        registerCatalogImage,
        publishEvent,
      });

      const createResponse = await routes.request('/', {
        method: 'POST',
        body: JSON.stringify({
          label: 'external source',
          path: sourceDir,
          providerId: 'comfy',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const created = (await createResponse.json()) as { id: string };

      const importResponse = await routes.request(`/${created.id}/import`, {
        method: 'POST',
        body: JSON.stringify({ files: ['hero.webp'], workspaceId: 'workspace-1' }),
        headers: { 'Content-Type': 'application/json' },
      });

      expect(importResponse.status).toBe(201);
      const payload = (await importResponse.json()) as {
        imported: Array<{ sourceFile: string; catalogId: string }>;
      };

      expect(payload.imported).toEqual([
        expect.objectContaining({ sourceFile: 'hero.webp', catalogId: 'catalog-1' }),
      ]);
      expect(registerCatalogImage).toHaveBeenCalled();
      expect(publishEvent).toHaveBeenCalledWith(
        'output-source.imported',
        expect.objectContaining({
          imported: [expect.objectContaining({ sourceFile: 'hero.webp', catalogId: 'catalog-1' })],
        }),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('rejects malformed JSON and invalid payload shapes', async () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'output-source-routes-invalid-'));
    const sourceDir = path.join(root, 'source');
    const libraryDir = path.join(root, 'library');

    try {
      mkdirSync(sourceDir, { recursive: true });
      mkdirSync(libraryDir, { recursive: true });

      const storage = createMemoryStorage();
      const publishEvent = vi.fn();

      const routes = createOutputSourceRoutes({
        settingsStorage: storage,
        readSettings: () => createDefaultEditableStudioSettings(),
        readConfig: () => ({ libraryDir }) as ReturnType<typeof import('./config').getSettings>,
        registerCatalogImage: () => {
          throw new Error('registerCatalogImage should not be called in this test');
        },
        publishEvent,
      });

      const malformedRegister = await routes.request('/', {
        method: 'POST',
        body: '{"path":"x"',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(malformedRegister.status).toBe(400);
      await expect(malformedRegister.json()).resolves.toMatchObject({ code: 'invalid_json' });

      const invalidRegister = await routes.request('/', {
        method: 'POST',
        body: JSON.stringify({ label: 'x', path: 123 }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(invalidRegister.status).toBe(400);
      await expect(invalidRegister.json()).resolves.toMatchObject({ code: 'invalid_request_body' });

      const createResponse = await routes.request('/', {
        method: 'POST',
        body: JSON.stringify({ label: 'ok', path: sourceDir, providerId: 'comfy' }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(createResponse.status).toBe(201);
      const created = (await createResponse.json()) as { id: string };

      const malformedImport = await routes.request(`/${created.id}/import`, {
        method: 'POST',
        body: '{"files":["a.png"]',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(malformedImport.status).toBe(400);
      await expect(malformedImport.json()).resolves.toMatchObject({ code: 'invalid_json' });

      const invalidImport = await routes.request(`/${created.id}/import`, {
        method: 'POST',
        body: JSON.stringify({ files: 'hero.webp' }),
        headers: { 'Content-Type': 'application/json' },
      });
      expect(invalidImport.status).toBe(400);
      await expect(invalidImport.json()).resolves.toMatchObject({ code: 'invalid_request_body' });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
