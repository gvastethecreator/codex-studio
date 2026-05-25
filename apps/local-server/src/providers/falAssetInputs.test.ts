import { describe, expect, it } from 'vite-plus/test';

import { createFalAssetRequestFields } from './falAssetInputs';
import type { ProviderAssetInputRef } from './externalProviderInputs';

function asset(overrides: Partial<ProviderAssetInputRef>): ProviderAssetInputRef {
  return {
    role: 'input',
    name: 'asset',
    catalogId: null,
    localPath: null,
    sourceUrl: null,
    strength: null,
    hasInlineData: false,
    ...overrides,
  };
}

describe('fal asset inputs', () => {
  it('maps hosted task assets into common fal image input fields', async () => {
    expect(
      await createFalAssetRequestFields([
        asset({ role: 'input', name: 'input', sourceUrl: 'https://cdn.example/input.png' }),
        asset({ role: 'mask', name: 'mask', sourceUrl: 'https://cdn.example/mask.png' }),
        asset({ role: 'control', name: 'control', sourceUrl: 'https://cdn.example/control.png' }),
        asset({
          role: 'reference',
          name: 'reference-a',
          sourceUrl: 'https://cdn.example/reference-a.png',
        }),
        asset({
          role: 'reference',
          name: 'reference-b',
          sourceUrl: 'https://cdn.example/reference-b.png',
        }),
      ]),
    ).toEqual({
      image_url: 'https://cdn.example/input.png',
      mask_url: 'https://cdn.example/mask.png',
      control_image_url: 'https://cdn.example/control.png',
      reference_image_urls: [
        'https://cdn.example/reference-a.png',
        'https://cdn.example/reference-b.png',
      ],
    });
  });

  it('uploads local assets when an uploader is provided', async () => {
    expect(
      await createFalAssetRequestFields(
        [asset({ role: 'input', name: 'local-input.png', localPath: 'D:/input.png' })],
        {
          uploadLocalAsset: async (localAsset) => `https://v3.fal.media/files/${localAsset.name}`,
        },
      ),
    ).toEqual({
      image_url: 'https://v3.fal.media/files/local-input.png',
    });
  });

  it('rejects local assets without uploader and inline assets without compact data', async () => {
    await expect(
      createFalAssetRequestFields([asset({ name: 'local-input', localPath: 'D:/input.png' })]),
    ).rejects.toThrow('must be uploaded to a hosted URL');
    await expect(
      createFalAssetRequestFields([asset({ name: 'inline-input', hasInlineData: true })]),
    ).rejects.toThrow('inline asset "inline-input" is not available in the compact Provider Input');
  });

  it('rejects non-http source URLs and upload results', async () => {
    await expect(
      createFalAssetRequestFields([asset({ name: 'file-input', sourceUrl: 'file:///tmp/a.png' })]),
    ).rejects.toThrow('sourceUrl must be an http(s) URL');
    await expect(
      createFalAssetRequestFields([asset({ name: 'local-input', localPath: 'D:/input.png' })], {
        uploadLocalAsset: async () => 'file:///tmp/upload.png',
      }),
    ).rejects.toThrow('upload returned a non-http URL');
  });
});
