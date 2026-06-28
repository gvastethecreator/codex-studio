import { describe, expect, it } from 'vite-plus/test';

import {
  buildStyleSearchFilters,
  planStyleSearchPackIds,
  projectStyleSearchResultsFromIndex,
  STYLE_SEARCH_TASK_FILTERS,
} from './styleSearchProjection';

describe('styleSearchProjection', () => {
  it('normalizes filters and plans pack loading from manifest summaries', () => {
    const filters = buildStyleSearchFilters({
      query: '  ink  ',
      packId: '',
      task: ' image_generate ',
      limit: 1,
    });

    expect(filters).toEqual({
      query: 'ink',
      packId: undefined,
      categoryId: undefined,
      categoryName: undefined,
      domain: undefined,
      tag: undefined,
      task: 'image_generate',
      limit: 1,
    });
    expect(
      planStyleSearchPackIds({
        packSummaries: [
          { id: 'pack_01', name: 'Pack 1', presetCount: 1 },
          { id: 'pack_02', name: 'Pack 2', presetCount: 10 },
        ],
        filters,
      }),
    ).toEqual(['pack_01', 'pack_02']);
    expect(STYLE_SEARCH_TASK_FILTERS.map((filter) => filter.id)).toContain('style_preset_card');
  });

  it('projects loaded search-index results through the same filter contract', () => {
    const results = projectStyleSearchResultsFromIndex({
      searchIndex: {
        packs: [{ id: 'pack_01', name: 'Pack 1', presetCount: 2 }],
        totalPresetCount: 2,
        presets: [
          {
            id: 'SP01-001',
            name: 'Ink Study',
            ref: 'pack_01/SP01-001.yaml',
            packId: 'pack_01',
            packName: 'Pack 1',
            categoryId: 'ink',
            categoryName: 'Ink',
            tags: ['ink'],
            supportedTasks: ['image_generate'],
            searchableText: 'sp01-001 ink study ink',
          },
          {
            id: 'SP01-002',
            name: 'Oil Study',
            ref: 'pack_01/SP01-002.yaml',
            packId: 'pack_01',
            packName: 'Pack 1',
            categoryId: 'paint',
            categoryName: 'Paint',
            tags: ['paint'],
            supportedTasks: ['image_edit'],
            searchableText: 'sp01-002 oil study paint',
          },
        ],
      },
      filters: buildStyleSearchFilters({ query: 'ink', task: 'image_generate' }),
    });

    expect(results.map((result) => result.id)).toEqual(['SP01-001']);
  });
});
