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
      chunk('StudioGenerationDock-abc.js', 62),
      chunk('localGenerationRun-abc.js', 60),
      chunk('StylesRecipe-abc.js', 42),
      chunk('StylePresetCatalogSearchSurface-abc.js', 8),
      chunk('CameraAnglesRecipe-abc.js', 23),
      chunk('three.module-abc.js', 723),
      chunk('jszip.min-abc.js', 96),
    ]);

    expect(report.ok).toBe(true);
    expect(report.unbudgetedLargeChunks).toEqual([]);
    expect(report.packaging).toMatchObject({ chunkCount: 8, tinyChunkCount: 0, ok: true });
  });

  it('fails packaging when microchunks multiply', () => {
    const required = [
      chunk('index-abc.js', 446),
      chunk('StudioGenerationDock-abc.js', 62),
      chunk('localGenerationRun-abc.js', 60),
      chunk('StylesRecipe-abc.js', 42),
      chunk('StylePresetCatalogSearchSurface-abc.js', 8),
      chunk('CameraAnglesRecipe-abc.js', 23),
      chunk('three.module-abc.js', 723),
      chunk('jszip.min-abc.js', 96),
    ];
    const microchunks = Array.from({ length: 101 }, (_, index) => ({
      name: `thumb-${index}.js`,
      bytes: 100,
      gzipBytes: 80,
    }));
    const report = createUiChunkReport([...required, ...microchunks]);

    expect(report.ok).toBe(false);
    expect(report.packaging).toMatchObject({ tinyChunkCount: 101, ok: false });
  });

  it('fails when startup or catalog search regress into large chunks', () => {
    const report = createUiChunkReport([
      chunk('index-abc.js', 650),
      chunk('StudioGenerationDock-abc.js', 62),
      chunk('localGenerationRun-abc.js', 60),
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

  it('uses Vite decimal kilobytes for the main chunk warning threshold', () => {
    const report = createUiChunkReport([
      { name: 'index-abc.js', bytes: 500_001, gzipBytes: 150_000 },
      chunk('StudioGenerationDock-abc.js', 62),
      chunk('localGenerationRun-abc.js', 60),
      chunk('StylesRecipe-abc.js', 42),
      chunk('StylePresetCatalogSearchSurface-abc.js', 8),
      chunk('CameraAnglesRecipe-abc.js', 23),
      chunk('three.module-abc.js', 723),
      chunk('jszip.min-abc.js', 96),
    ]);

    expect(report.ok).toBe(false);
    expect(report.budgetResults.find((result) => result.budget.id === 'main-index')?.ok).toBe(
      false,
    );
  });
});
