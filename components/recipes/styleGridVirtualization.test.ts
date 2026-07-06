import { describe, expect, it } from 'vite-plus/test';

import {
  STYLE_GRID_WINDOW_TARGET_PRESET_COUNT,
  createStyleGridVirtualWindow,
  estimateStyleGridMountedPresetCount,
  estimateStyleGroupPlaceholderHeight,
} from './styleGridVirtualization';

describe('styleGridVirtualization', () => {
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
