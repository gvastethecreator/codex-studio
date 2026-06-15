import { describe, expect, it } from 'vite-plus/test';

import { createUiChunkReport, type UiChunkInfo } from './report-ui-chunks';

function chunk(name: string, kib: number): UiChunkInfo {
  return {
    name,
    bytes: kib * 1024,
    gzipBytes: Math.round(kib * 512),
  };
}

describe('UI chunk report', () => {
  it('passes current demand-mounted chunk budgets', () => {
    const report = createUiChunkReport([
      chunk('index-abc.js', 446),
      chunk('StylesRecipe-abc.js', 42),
      chunk('StylePresetCatalogSearchSurface-abc.js', 8),
      chunk('CameraAnglesRecipe-abc.js', 23),
      chunk('three.module-abc.js', 723),
      chunk('jszip.min-abc.js', 96),
    ]);

    expect(report.ok).toBe(true);
    expect(report.unbudgetedLargeChunks).toEqual([]);
  });

  it('fails when startup or catalog search regress into large chunks', () => {
    const report = createUiChunkReport([
      chunk('index-abc.js', 650),
      chunk('StylesRecipe-abc.js', 42),
      chunk('StylePresetCatalogSearchSurface-abc.js', 155),
      chunk('stylePresetCatalogData-abc.js', 149),
      chunk('stylePresetCatalogData.pack_01-abc.js', 21),
      chunk('CameraAnglesRecipe-abc.js', 23),
      chunk('three.module-abc.js', 723),
      chunk('jszip.min-abc.js', 96),
      chunk('unexpected-vendor-abc.js', 520),
    ]);

    expect(report.ok).toBe(false);
    expect(
      report.budgetResults.filter((result) => !result.ok).map((result) => result.budget.id),
    ).toEqual(['main-index', 'style-catalog-search-surface', 'style-catalog-data-shell']);
    expect(report.unbudgetedLargeChunks.map((chunk) => chunk.name)).toEqual([
      'unexpected-vendor-abc.js',
    ]);
  });
});
