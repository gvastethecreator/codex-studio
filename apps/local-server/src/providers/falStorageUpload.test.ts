import { describe, expect, it } from 'vite-plus/test';

import type { ProviderAssetInputRef } from './externalProviderInputs';
import { createFalLocalAssetUploader } from './falStorageUpload';

function asset(overrides: Partial<ProviderAssetInputRef>): ProviderAssetInputRef {
  return {
    role: 'input',
    name: 'asset.png',
    catalogId: null,
    localPath: null,
    sourceUrl: null,
    strength: null,
    hasInlineData: false,
    ...overrides,
  };
}

describe('fal storage upload', () => {
  it('uploads a local asset as a typed file and returns the hosted URL', async () => {
    const seenFiles: File[] = [];
    const uploadLocalAsset = createFalLocalAssetUploader({
      apiKey: 'secret-fal-value',
      readFile: (filePath) => {
        expect(filePath).toBe('D:/inputs/source.png');
        return new Uint8Array([1, 2, 3]);
      },
      upload: async (file) => {
        seenFiles.push(file as File);
        return 'https://v3.fal.media/files/source.png';
      },
    });

    const url = await uploadLocalAsset(
      asset({ name: 'source.png', localPath: 'D:/inputs/source.png' }),
    );

    expect(url).toBe('https://v3.fal.media/files/source.png');
    expect(seenFiles).toHaveLength(1);
    expect(seenFiles[0].name).toBe('source.png');
    expect(seenFiles[0].type).toBe('image/png');
    expect(Array.from(new Uint8Array(await seenFiles[0].arrayBuffer()))).toEqual([1, 2, 3]);
  });

  it('fails when asked to upload an asset without localPath', async () => {
    const uploadLocalAsset = createFalLocalAssetUploader({
      apiKey: 'secret-fal-value',
      upload: async () => 'https://v3.fal.media/files/source.png',
    });

    await expect(uploadLocalAsset(asset({ name: 'source.png' }))).rejects.toThrow(
      'does not have a local path',
    );
  });
});
