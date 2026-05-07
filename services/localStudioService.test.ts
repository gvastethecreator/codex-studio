import { describe, expect, it } from 'vite-plus/test';

import { buildCatalogQuery } from './localStudioService';

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
