import { describe, expect, it } from 'vite-plus/test';
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import type { CatalogImage, EditableStudioSettings } from '../../../packages/shared/src';
import { createDefaultEditableStudioSettings } from '../../../packages/shared/src';
import {
  detectExternalOutputSourceCandidates,
  EXTERNAL_OUTPUT_SOURCES_KEY,
  importExternalOutputSourceFiles,
  listExternalOutputSourceFiles,
  readExternalOutputSourceRegistry,
  registerExternalOutputSource,
} from './outputSources';
import type { StudioSettingsStorage } from './studioSettingsStore';

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

function settings(patch: Partial<EditableStudioSettings> = {}): EditableStudioSettings {
  return {
    ...createDefaultEditableStudioSettings(),
    ...patch,
  };
}

describe('outputSources', () => {
  it('detects preferred and env-provided output directories without registering them', () => {
    const candidates = detectExternalOutputSourceCandidates({
      libraryDir: 'D:/library',
      settings: settings({ preferredOutputPath: 'D:/exports/google-nano-banana' }),
      env: {
        STUDIO_EXTERNAL_OUTPUT_SOURCES: ['D:/ComfyUI/output', 'D:/fal/results'].join(';'),
      },
      pathExists: (sourcePath) => sourcePath !== 'D:\\fal\\results',
    });

    expect(candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'D:\\exports\\google-nano-banana',
          providerId: 'google',
          status: 'detected',
        }),
        expect.objectContaining({
          path: 'D:\\ComfyUI\\output',
          providerId: 'comfy',
          status: 'detected',
        }),
        expect.objectContaining({
          path: 'D:\\fal\\results',
          providerId: 'fal',
          status: 'missing',
        }),
      ]),
    );
  });

  it('blocks Studio Library paths from becoming external output sources', () => {
    const candidates = detectExternalOutputSourceCandidates({
      libraryDir: 'D:/library',
      settings: settings({ preferredOutputPath: 'D:/library/assets' }),
      env: {},
      pathExists: () => true,
    });

    expect(candidates[0]).toMatchObject({
      path: 'D:\\library\\assets',
      status: 'blocked',
      isInsideStudioLibrary: true,
    });
  });

  it('registers existing external output directories into a stable registry', () => {
    const storage = createMemoryStorage();
    const result = registerExternalOutputSource({
      storage,
      libraryDir: 'D:/library',
      input: {
        label: 'Comfy final renders',
        path: 'D:/ComfyUI/output',
        providerId: 'comfy',
      },
      now: '2026-05-25T00:00:00.000Z',
      pathExists: () => true,
    });

    expect(result).toMatchObject({
      ok: true,
      source: {
        label: 'Comfy final renders',
        path: 'D:\\ComfyUI\\output',
        providerId: 'comfy',
        status: 'registered',
      },
    });
    expect(readExternalOutputSourceRegistry(storage).sources).toHaveLength(1);
    expect(storage.getSetting(EXTERNAL_OUTPUT_SOURCES_KEY)).toContain('Comfy final renders');
  });

  it('rejects registration for unmanaged missing paths and Studio Library paths', () => {
    const storage = createMemoryStorage();

    expect(
      registerExternalOutputSource({
        storage,
        libraryDir: 'D:/library',
        input: { path: 'D:/missing/output' },
        pathExists: () => false,
      }),
    ).toEqual({ ok: false, reason: 'path_not_found' });

    expect(
      registerExternalOutputSource({
        storage,
        libraryDir: 'D:/library',
        input: { path: 'D:/library/assets' },
        pathExists: () => true,
      }),
    ).toEqual({ ok: false, reason: 'inside_studio_library' });
  });

  it('lists image files from a registered source without exposing non-images', () => {
    const root = path.join(process.cwd(), 'tmp', `output-source-list-${Date.now()}`);
    const sourceDir = path.join(root, 'source');
    try {
      mkdirSync(sourceDir, { recursive: true });
      writeFileSync(path.join(sourceDir, 'one.png'), 'png');
      writeFileSync(path.join(sourceDir, 'notes.txt'), 'text');
      const storage = createMemoryStorage();
      const registration = registerExternalOutputSource({
        storage,
        libraryDir: path.join(root, 'library'),
        input: { path: sourceDir, providerId: 'comfy' },
        pathExists: () => true,
      });
      if (!registration.ok) throw new Error(registration.reason);

      const result = listExternalOutputSourceFiles({
        storage,
        sourceId: registration.source.id,
      });

      expect(result).toMatchObject({
        ok: true,
        files: [
          {
            relativePath: 'one.png',
            fileName: 'one.png',
            mimeType: 'image/png',
          },
        ],
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('reports registered sources that can no longer be read', () => {
    const storage = createMemoryStorage();
    const registration = registerExternalOutputSource({
      storage,
      libraryDir: 'D:/library',
      input: { path: 'D:/ComfyUI/output', providerId: 'comfy' },
      pathExists: () => true,
    });
    if (!registration.ok) throw new Error(registration.reason);

    expect(
      listExternalOutputSourceFiles({
        storage,
        sourceId: registration.source.id,
        readDir() {
          throw new Error('missing source');
        },
      }),
    ).toEqual({ ok: false, reason: 'source_unavailable' });
  });

  it('imports selected files by copying into the Studio Library and registering Catalog Entries', () => {
    const root = path.join(process.cwd(), 'tmp', `output-source-import-${Date.now()}`);
    const sourceDir = path.join(root, 'source');
    const libraryDir = path.join(root, 'library');
    const catalogImages: CatalogImage[] = [];
    try {
      mkdirSync(sourceDir, { recursive: true });
      writeFileSync(path.join(sourceDir, 'hero.webp'), 'webp');
      const storage = createMemoryStorage();
      const registration = registerExternalOutputSource({
        storage,
        libraryDir,
        input: { label: 'Comfy source', path: sourceDir, providerId: 'comfy' },
        pathExists: () => true,
      });
      if (!registration.ok) throw new Error(registration.reason);

      const result = importExternalOutputSourceFiles({
        storage,
        sourceId: registration.source.id,
        libraryDir,
        input: {
          files: ['hero.webp', '../escape.png', 'ignored.txt'],
          workspaceId: 'workspace-1',
        },
        copyFile: copyFileSync,
        registerCatalogImage(input) {
          const image = {
            id: `catalog-${catalogImages.length + 1}`,
            libraryId: 'library-1',
            filePath: input.filePath,
            thumbnailPath: null,
            publicUrl: `/library/${path.basename(input.filePath)}`,
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
          catalogImages.push(image);
          return image;
        },
      });

      expect(result).toMatchObject({
        ok: true,
        result: {
          sourceId: registration.source.id,
          imported: [
            {
              sourceFile: 'hero.webp',
              catalogId: 'catalog-1',
            },
          ],
          skipped: [
            { sourceFile: '../escape.png', reason: 'path_outside_source' },
            { sourceFile: 'ignored.txt', reason: 'unsupported_file_type' },
          ],
        },
      });
      expect(catalogImages[0]).toMatchObject({
        workspaceId: 'workspace-1',
        mimeType: 'image/webp',
        tags: ['external-output-source', 'comfy', registration.source.id],
      });
      expect(catalogImages[0].filePath).toContain(path.join('outputs', 'external'));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
