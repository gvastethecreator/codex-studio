import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import { createGenerationTaskSpec } from '../../../packages/shared/src';
import {
  isManagedGenerationAssetPath,
  validateManagedGenerationAssets,
} from './managedAssetPolicy';

describe('managed generation asset policy', () => {
  it('accepts only public outputs and managed reference or mask roots', () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'studio-managed-assets-'));
    const context = { libraryId: 'library-1', rootPath: root };

    try {
      const output = path.join(root, 'outputs', 'image.png');
      const reference = path.join(root, '.studio', 'references', 'job-1', 'reference.webp');
      const database = path.join(root, '.studio', 'studio.sqlite');
      const outside = path.join(path.dirname(root), `${path.basename(root)}-outside.png`);
      mkdirSync(path.dirname(output), { recursive: true });
      mkdirSync(path.dirname(reference), { recursive: true });
      mkdirSync(path.dirname(database), { recursive: true });
      writeFileSync(output, 'output');
      writeFileSync(reference, 'reference');
      writeFileSync(database, 'private');
      writeFileSync(outside, 'outside');

      expect(isManagedGenerationAssetPath(output, context)).toBe(true);
      expect(isManagedGenerationAssetPath(reference, context)).toBe(true);
      expect(isManagedGenerationAssetPath(database, context)).toBe(false);
      expect(isManagedGenerationAssetPath(outside, context)).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(path.join(path.dirname(root), `${path.basename(root)}-outside.png`), { force: true });
    }
  });

  it('rejects symlink escapes even when the link lives under outputs', () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'studio-managed-symlink-'));
    const outsideRoot = mkdtempSync(path.join(os.tmpdir(), 'studio-managed-outside-'));
    const context = { libraryId: 'library-1', rootPath: root };

    try {
      const outsideFile = path.join(outsideRoot, 'secret.png');
      const link = path.join(root, 'outputs', 'linked');
      mkdirSync(path.dirname(link), { recursive: true });
      writeFileSync(outsideFile, 'secret');
      symlinkSync(outsideRoot, link, 'junction');

      expect(isManagedGenerationAssetPath(path.join(link, 'secret.png'), context)).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(outsideRoot, { recursive: true, force: true });
    }
  });

  it('returns a field-addressable issue for provider input rejection', () => {
    const sourceSpec = createGenerationTaskSpec({
      id: 'spec-1',
      task: 'image_edit',
      providerId: 'google',
      prompt: 'edit',
      assets: [{ role: 'input', name: 'secret.png', localPath: 'D:/secrets/secret.png' }],
    });

    expect(
      validateManagedGenerationAssets(sourceSpec, {
        libraryId: 'library-1',
        rootPath: 'D:/StudioLibrary',
      }),
    ).toEqual([
      expect.objectContaining({
        code: 'unmanaged_asset_path',
        field: 'sourceSpec.assets.0.localPath',
      }),
    ]);
  });
});
