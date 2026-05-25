import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vite-plus/test';

import { createAssetExtractor } from './assetExtractor';

describe('assetExtractor', () => {
  it('uses savedPath from imageGeneration items when the response already points to the file', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'codex-asset-extractor-'));
    const savedPath = path.join(dir, 'recipe-output.png');
    writeFileSync(savedPath, 'png');

    try {
      const extractor = createAssetExtractor('job-123');
      const assets = await extractor.extract(
        [
          {
            method: 'turn/completed',
            params: {
              threadId: 'thread-1',
              item: {
                type: 'imageGeneration',
                id: 'image-1',
                status: 'completed',
                result: 'ok',
                savedPath,
              },
            },
          },
        ] as any,
        { threadId: 'thread-1' },
      );

      expect(assets).toHaveLength(1);
      expect(assets[0]).toMatchObject({
        type: 'file',
        sourcePath: savedPath,
        mimeType: 'image/png',
        origin: 'generated_item',
      });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});