import { describe, expect, it } from 'vite-plus/test';

import { finishCarouselSlideState } from './ImageCarousel';

const idleState = {
  direction: 0,
  isSliding: false,
  isFullscreen: false,
  copiedPrompt: false,
  isComparing: false,
};

describe('finishCarouselSlideState', () => {
  it('keeps idle state reference so animation completion cannot loop renders', () => {
    expect(finishCarouselSlideState(idleState)).toBe(idleState);
  });

  it('clears sliding state once', () => {
    const slidingState = { ...idleState, direction: 1, isSliding: true };

    expect(finishCarouselSlideState(slidingState)).toEqual({
      ...slidingState,
      isSliding: false,
    });
  });
});
