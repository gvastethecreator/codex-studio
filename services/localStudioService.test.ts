import { describe, expect, it } from 'vite-plus/test';

import { buildCatalogQuery, readLocalStudioErrorMessage } from './localStudioService';

describe('buildCatalogQuery', () => {
  it('returns an empty string when no filters are provided', () => {
    expect(buildCatalogQuery()).toBe('');
  });

  it('serializes supported filters in a stable order', () => {
    expect(
      buildCatalogQuery({
        workspaceId: 'ws-main',
        libraryId: 'library-default',
        q: 'neo noir',
        favorite: true,
        offset: 40,
        limit: 20,
      }),
    ).toBe(
      '?workspace_id=ws-main&library_id=library-default&favorite=true&q=neo+noir&offset=40&limit=20',
    );
  });

  it('keeps explicit false flags instead of dropping them', () => {
    expect(buildCatalogQuery({ favorite: false, deleted: false })).toBe(
      '?favorite=false&deleted=false',
    );
  });
});

describe('readLocalStudioErrorMessage', () => {
  it('extracts readable backend errors from JSON responses', () => {
    expect(readLocalStudioErrorMessage('{"error":"Prompt fixture failed"}', 500)).toBe(
      'Prompt fixture failed',
    );
    expect(readLocalStudioErrorMessage('{"message":"Run not found"}', 404)).toBe('Run not found');
  });

  it('preserves plain text and supplies a status fallback', () => {
    expect(readLocalStudioErrorMessage('Export failed', 409)).toBe('Export failed');
    expect(readLocalStudioErrorMessage('', 503)).toBe('Local studio request failed: 503');
  });
});
