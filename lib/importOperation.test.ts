import { describe, expect, it } from 'vite-plus/test';

import { removeImportedOutputSourceFiles, summarizeImportOperationResult } from './importOperation';

describe('importOperation', () => {
  it('summarizes import results and removes imported files from the pending list', () => {
    const summary = summarizeImportOperationResult({
      sourceId: 'source-1',
      imported: [
        {
          sourceFile: 'a.webp',
          catalogId: 'catalog-a',
          filePath: 'D:/library/a.webp',
          publicUrl: '/library/a.webp',
        },
      ],
      skipped: [{ sourceFile: 'b.txt', reason: 'unsupported_file_type' }],
    });

    expect(summary.toast).toEqual({
      message: 'Imported 1 file',
      type: 'info',
    });
    expect(
      removeImportedOutputSourceFiles(
        [
          {
            relativePath: 'a.webp',
            fileName: 'a.webp',
            sizeBytes: 10,
            modifiedAt: null,
            mimeType: 'image/webp',
          },
          {
            relativePath: 'b.txt',
            fileName: 'b.txt',
            sizeBytes: 10,
            modifiedAt: null,
            mimeType: 'text/plain',
          },
        ],
        summary,
      ).map((file) => file.relativePath),
    ).toEqual(['b.txt']);
  });
});
