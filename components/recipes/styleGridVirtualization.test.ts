import { describe, expect, it } from 'vite-plus/test';

import {
  estimateStyleGroupPlaceholderHeight,
  getVisibleStylePresets,
} from './styleGridVirtualization';

describe('styleGridVirtualization', () => {
  it('keeps collapsed groups capped to the configured render limit', () => {
    const presets = Array.from({ length: 40 }, (_, index) => index);

    expect(getVisibleStylePresets(presets, false, 16)).toHaveLength(16);
    expect(getVisibleStylePresets(presets, true, 16)).toHaveLength(40);
  });

  it('estimates enough placeholder height to keep offscreen group layout stable', () => {
    const collapsedHeight = estimateStyleGroupPlaceholderHeight({
      renderedPresetCount: 16,
      gridColumns: 4,
      containerWidth: 1000,
      hasShowMore: true,
    });
    const expandedHeight = estimateStyleGroupPlaceholderHeight({
      renderedPresetCount: 40,
      gridColumns: 4,
      containerWidth: 1000,
      hasShowMore: false,
    });

    expect(collapsedHeight).toBeGreaterThan(900);
    expect(expandedHeight).toBeGreaterThan(collapsedHeight);
  });
});
