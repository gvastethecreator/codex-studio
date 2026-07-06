import { describe, expect, it } from 'vite-plus/test';

import {
  IMAGE_GEN_RATIO_OPTIONS,
  getImageGenSizeForRatio,
  normalizeImageGenRatio,
} from './imageGenSizing';

describe('imageGenSizing', () => {
  it('exposes the full supported aspect-ratio set for image generation', () => {
    expect(IMAGE_GEN_RATIO_OPTIONS.map((option) => option.ratio)).toEqual([
      '21:9',
      '16:9',
      '4:3',
      '3:2',
      '5:4',
      '1:1',
      '4:5',
      '2:3',
      '3:4',
      '9:16',
    ]);
  });

  it('maps ratios to explicit image sizes', () => {
    expect(getImageGenSizeForRatio('16:9')).toMatchObject({
      size: '1536x864',
      width: 1536,
      height: 864,
    });
    expect(getImageGenSizeForRatio('4:5')).toMatchObject({
      size: '1024x1280',
      width: 1024,
      height: 1280,
    });
  });

  it('keeps supported ratios and normalizes legacy extremes to nearest available ratios', () => {
    expect(normalizeImageGenRatio('4:3')).toBe('4:3');
    expect(normalizeImageGenRatio('5:4')).toBe('5:4');
    expect(normalizeImageGenRatio('4:1')).toBe('21:9');
    expect(normalizeImageGenRatio('1:4')).toBe('9:16');
    expect(normalizeImageGenRatio('unknown')).toBe('1:1');
  });
});
