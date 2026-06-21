import { describe, expect, it } from 'vite-plus/test';

import { buildCarouselThumbnailWindow } from './imageCarouselThumbnails';

describe('buildCarouselThumbnailWindow', () => {
  it('keeps only a bounded window around the active thumbnail', () => {
    const items = Array.from({ length: 100 }, (_, index) => index);
    const window = buildCarouselThumbnailWindow(items, 50, 2);

    expect(window.map((entry) => entry.index)).toEqual([48, 49, 50, 51, 52]);
    expect(window.map((entry) => entry.item)).toEqual([48, 49, 50, 51, 52]);
  });

  it('fills the window at list edges', () => {
    const items = Array.from({ length: 100 }, (_, index) => index);

    expect(buildCarouselThumbnailWindow(items, 0, 2).map((entry) => entry.index)).toEqual([
      0, 1, 2, 3, 4,
    ]);
    expect(buildCarouselThumbnailWindow(items, 99, 2).map((entry) => entry.index)).toEqual([
      95, 96, 97, 98, 99,
    ]);
  });
});
