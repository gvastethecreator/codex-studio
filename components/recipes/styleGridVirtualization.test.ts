import { describe, expect, it } from 'vitest';

import {
  STYLE_GRID_WINDOW_TARGET_PRESET_COUNT,
  createStyleGridVirtualWindow,
  estimateStyleGridMountedPresetCount,
  estimateStyleGroupPlaceholderHeight,
  fitStyleGridColumns,
  resolveStyleGridColumns,
} from './styleGridVirtualization';

describe('styleGridVirtualization', () => {
  it('fits more than 7 columns on a 2400px catalog at the 120px min card', () => {
    expect(fitStyleGridColumns(2400)).toBeGreaterThan(7);
    expect(resolveStyleGridColumns('auto', fitStyleGridColumns(2400))).toBe(
      fitStyleGridColumns(2400),
    );
    expect(resolveStyleGridColumns(4, 12)).toBe(4);
    expect(resolveStyleGridColumns(20, 9)).toBe(9);
  });

  it('estimates enough placeholder height to keep offscreen group layout stable', () => {
    const compactHeight = estimateStyleGroupPlaceholderHeight({
      renderedPresetCount: 12,
      gridColumns: 4,
      containerWidth: 1000,
      hasShowMore: false,
    });
    const fullHeight = estimateStyleGroupPlaceholderHeight({
      renderedPresetCount: 40,
      gridColumns: 4,
      containerWidth: 1000,
      hasShowMore: false,
    });

    expect(compactHeight).toBeGreaterThan(600);
    expect(fullHeight).toBeGreaterThan(compactHeight);
  });

  it('creates a row-aligned virtual window while preserving total scroll height', () => {
    const firstWindow = createStyleGridVirtualWindow({
      presetCount: 1000,
      gridColumns: 4,
      containerWidth: 1000,
      viewportTop: 0,
      viewportBottom: 720,
      overscanRows: 2,
    });
    const scrolledWindow = createStyleGridVirtualWindow({
      presetCount: 1000,
      gridColumns: 4,
      containerWidth: 1000,
      viewportTop: 20000,
      viewportBottom: 20720,
      overscanRows: 2,
    });

    expect(firstWindow.startIndex).toBe(0);
    expect(firstWindow.renderedPresetCount).toBeGreaterThanOrEqual(
      STYLE_GRID_WINDOW_TARGET_PRESET_COUNT,
    );
    expect(firstWindow.endIndex).toBeLessThan(1000);
    expect(firstWindow.bottomSpacerHeight).toBeGreaterThan(0);
    expect(scrolledWindow.startIndex).toBeGreaterThan(0);
    expect(scrolledWindow.renderedPresetCount).toBeGreaterThanOrEqual(
      STYLE_GRID_WINDOW_TARGET_PRESET_COUNT,
    );
    expect(scrolledWindow.endIndex).toBeLessThan(1000);
    expect(scrolledWindow.topSpacerHeight).toBeGreaterThan(0);
    expect(
      scrolledWindow.topSpacerHeight +
        scrolledWindow.bottomSpacerHeight +
        (scrolledWindow.endRow - scrolledWindow.startRow) * scrolledWindow.cardHeight +
        Math.max(0, scrolledWindow.endRow - scrolledWindow.startRow - 1) * scrolledWindow.rowGap,
    ).toBeCloseTo(scrolledWindow.totalHeight);
  });

  it('estimates mounted cards below the logical item count for large groups', () => {
    const mountedPresetCount = estimateStyleGridMountedPresetCount({
      presetCount: 1600,
      gridColumns: 4,
      containerWidth: 1200,
      viewportHeight: 760,
    });

    expect(mountedPresetCount).toBeGreaterThanOrEqual(STYLE_GRID_WINDOW_TARGET_PRESET_COUNT);
    expect(mountedPresetCount).toBeLessThan(1600);
  });
});
