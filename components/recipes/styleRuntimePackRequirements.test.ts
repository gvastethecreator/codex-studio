import { describe, expect, test } from 'vite-plus/test';
import { resolveStyleRuntimePackLoadRequest } from './styleRuntimePackRequirements';

const runtimePackIds = ['pack_01', 'pack_02', 'pack_03'] as const;

function createOptions(
  overrides: Partial<Parameters<typeof resolveStyleRuntimePackLoadRequest>[0]> = {},
) {
  return {
    isPackLandingOpen: false,
    currentPackId: 'pack_01',
    activeStyleCollectionId: null,
    activeCollectionSourcePackIds: [],
    isGlobalStyleBrowseTab: false,
    favoritesCount: 0,
    isGlobalStyleSearchActive: false,
    runtimePackIds,
    favoritesPackId: 'favorites',
    ...overrides,
  };
}

describe('resolveStyleRuntimePackLoadRequest', () => {
  test('does not request runtime packs while the landing surface is open', () => {
    expect(
      resolveStyleRuntimePackLoadRequest(
        createOptions({
          isPackLandingOpen: true,
          currentPackId: 'pack_01',
        }),
      ),
    ).toEqual({
      requiredPackIds: [],
      loadAll: false,
      requiredThumbnailPackIds: [],
    });
  });

  test('requests landing thumbs from visible family source packs only', () => {
    expect(
      resolveStyleRuntimePackLoadRequest(
        createOptions({
          isPackLandingOpen: true,
          visibleCollectionSourcePackIds: ['pack_05', 'favorites', 'pack_16'],
        }),
      ),
    ).toEqual({
      requiredPackIds: [],
      loadAll: false,
      requiredThumbnailPackIds: ['pack_05', 'pack_16'],
    });
  });

  test('requests only the explicitly selected runtime pack', () => {
    expect(
      resolveStyleRuntimePackLoadRequest(
        createOptions({
          currentPackId: 'pack_02',
        }),
      ),
    ).toEqual({
      requiredPackIds: ['pack_02'],
      loadAll: false,
      requiredThumbnailPackIds: ['pack_02'],
    });
  });

  test('keeps collection source packs available for an active collection', () => {
    expect(
      resolveStyleRuntimePackLoadRequest(
        createOptions({
          currentPackId: 'collection_capture_reality',
          activeStyleCollectionId: 'capture_reality',
          activeCollectionSourcePackIds: ['pack_01', 'pack_02'],
        }),
      ),
    ).toEqual({
      requiredPackIds: ['pack_01', 'pack_02'],
      loadAll: false,
      requiredThumbnailPackIds: ['pack_01', 'pack_02'],
    });
  });

  test('loads every runtime pack for global browse tabs', () => {
    expect(
      resolveStyleRuntimePackLoadRequest(
        createOptions({
          currentPackId: 'all-style-cards',
          isGlobalStyleBrowseTab: true,
        }),
      ),
    ).toEqual({
      requiredPackIds: [],
      loadAll: true,
      requiredThumbnailPackIds: ['pack_01', 'pack_02', 'pack_03'],
    });
  });

  test('loads every runtime pack when favorites are selected and populated', () => {
    expect(
      resolveStyleRuntimePackLoadRequest(
        createOptions({
          currentPackId: 'favorites',
          favoritesCount: 2,
        }),
      ),
    ).toEqual({
      requiredPackIds: [],
      loadAll: true,
      requiredThumbnailPackIds: ['pack_01', 'pack_02', 'pack_03'],
    });
  });

  test('does not load all runtime packs for an empty favorites tab', () => {
    expect(
      resolveStyleRuntimePackLoadRequest(
        createOptions({
          currentPackId: 'favorites',
        }),
      ),
    ).toEqual({
      requiredPackIds: [],
      loadAll: false,
      requiredThumbnailPackIds: [],
    });
  });

  test('loads every runtime pack for global search without an active collection', () => {
    expect(
      resolveStyleRuntimePackLoadRequest(
        createOptions({
          currentPackId: 'pack_01',
          isGlobalStyleSearchActive: true,
        }),
      ),
    ).toEqual({
      requiredPackIds: ['pack_01'],
      loadAll: true,
      requiredThumbnailPackIds: ['pack_01', 'pack_02', 'pack_03'],
    });
  });

  test('keeps collection source packs scoped during collection search', () => {
    expect(
      resolveStyleRuntimePackLoadRequest(
        createOptions({
          currentPackId: 'collection_capture_reality',
          activeStyleCollectionId: 'capture_reality',
          activeCollectionSourcePackIds: ['pack_01', 'pack_02'],
          isGlobalStyleSearchActive: true,
        }),
      ),
    ).toEqual({
      requiredPackIds: ['pack_01', 'pack_02'],
      loadAll: false,
      requiredThumbnailPackIds: ['pack_01', 'pack_02'],
    });
  });

  test('does not load runtime packs for the user styles surface', () => {
    expect(
      resolveStyleRuntimePackLoadRequest(
        createOptions({
          currentPackId: 'user-styles',
        }),
      ),
    ).toEqual({
      requiredPackIds: [],
      loadAll: false,
      requiredThumbnailPackIds: [],
    });
  });

  test('landing mode takes precedence over global browse and search', () => {
    expect(
      resolveStyleRuntimePackLoadRequest(
        createOptions({
          isPackLandingOpen: true,
          currentPackId: 'favorites',
          favoritesCount: 3,
          isGlobalStyleBrowseTab: true,
          isGlobalStyleSearchActive: true,
        }),
      ),
    ).toEqual({
      requiredPackIds: [],
      loadAll: false,
      requiredThumbnailPackIds: [],
    });
  });
});
