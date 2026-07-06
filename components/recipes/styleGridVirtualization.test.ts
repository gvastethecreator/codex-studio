import { describe, expect, it } from 'vite-plus/test';

import { estimateStyleGroupPlaceholderHeight } from './styleGridVirtualization';

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
});
