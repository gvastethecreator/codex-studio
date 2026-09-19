import { describe, expect, it } from 'vitest';

import {
  CODEX_HTTP_EXECUTION_DEFAULTS,
  CODEX_HTTP_RATIO_SIZES,
  describeCodexHttpImageSize,
  listCodexHttpImageSizeOptions,
  resolveCodexExecutionPolicy,
  resolveCodexHttpImageSize,
} from './codexExecutionContract';

describe('codex HTTP image size contract', () => {
  it('keeps the documented 1K ratio table', () => {
    expect(resolveCodexHttpImageSize({ aspectRatio: '16:9', imageSize: '1K' })).toBe('1536x864');
    expect(resolveCodexHttpImageSize({ aspectRatio: '2:3' })).toBe(CODEX_HTTP_RATIO_SIZES['2:3']);
  });

  it('maps 2K and 4K labels to valid GPT Image sizes', () => {
    expect(resolveCodexHttpImageSize({ aspectRatio: '1:1', imageSize: '2K' })).toBe('2048x2048');
    expect(resolveCodexHttpImageSize({ aspectRatio: '16:9', imageSize: '2K' })).toBe('2048x1152');
    expect(resolveCodexHttpImageSize({ aspectRatio: '9:16', imageSize: '2K' })).toBe('1152x2048');
    expect(resolveCodexHttpImageSize({ aspectRatio: '16:9', imageSize: '4K' })).toBe('3840x2160');
    expect(resolveCodexHttpImageSize({ aspectRatio: '9:16', imageSize: '4K' })).toBe('2160x3840');
    expect(resolveCodexHttpImageSize({ aspectRatio: '1:1', imageSize: '4K' })).toBe('2880x2880');
  });

  it('keeps exact 4K pixels inside the documented GPT Image budget', () => {
    for (const aspectRatio of Object.keys(CODEX_HTTP_RATIO_SIZES)) {
      const size = resolveCodexHttpImageSize({ aspectRatio, imageSize: '4K' });
      const [width, height] = size.split('x').map(Number);
      expect(width % 16).toBe(0);
      expect(height % 16).toBe(0);
      expect(Math.max(width, height)).toBeLessThanOrEqual(3840);
      expect(width * height).toBeLessThanOrEqual(8_294_400);
      expect(width * height).toBeGreaterThanOrEqual(655_360);
    }
  });

  it('captures 2K and 4K sizes on the ChatGPT HTTP policy', () => {
    const policy = resolveCodexExecutionPolicy(
      {
        ...CODEX_HTTP_EXECUTION_DEFAULTS,
        providerOptions: {
          codex: { transport: 'subscription_http', imageModel: 'gpt-image-2.5-sunburst' },
        },
      },
      { output: { aspectRatio: '16:9', imageSize: '4K' }, assets: [] },
      'subscription_http',
    );
    expect(policy.image).toMatchObject({
      model: 'gpt-image-2.5-sunburst',
      size: '3840x2160',
      quality: 'medium',
    });
  });

  it('marks sizes above 2560x1440 as experimental', () => {
    expect(describeCodexHttpImageSize('16:9', '2K').experimental).toBe(false);
    expect(describeCodexHttpImageSize('1:1', '2K').experimental).toBe(true);
    expect(describeCodexHttpImageSize('16:9', '4K').experimental).toBe(true);
    expect(listCodexHttpImageSizeOptions('16:9').map((option) => option.tier)).toEqual([
      '1K',
      '2K',
      '4K',
    ]);
  });
});
