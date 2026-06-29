import { describe, expect, it } from 'vite-plus/test';

import {
  ONBOARDING_STYLE_CAROUSEL_SEEDS,
  buildOnboardingStyleCarouselEntries,
  pickNextOnboardingStyleCarouselIndex,
} from './onboardingStyleCarousel';

describe('onboardingStyleCarousel', () => {
  it('keeps concrete style prompts paired with available preset images', () => {
    const firstSeed = ONBOARDING_STYLE_CAROUSEL_SEEDS[0];
    const entries = buildOnboardingStyleCarouselEntries(
      {
        [firstSeed.presetId]: '/assets/film-noir.webp',
      },
      '/assets/fallback.webp',
    );

    expect(entries).toEqual([
      expect.objectContaining({
        presetId: firstSeed.presetId,
        styleName: firstSeed.styleName,
        imageUrl: '/assets/film-noir.webp',
      }),
    ]);
    expect(entries[0].prompt).toContain(firstSeed.presetId);
    expect(entries[0].prompt).toContain(firstSeed.styleName);
    expect(entries[0].prompt).not.toContain('/imagine');
  });

  it('falls back to a complete default entry when curated images are unavailable', () => {
    const entries = buildOnboardingStyleCarouselEntries({}, '/assets/fallback.webp');

    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      presetId: 'SP01-001',
      styleName: 'Studio Headshot',
      imageUrl: '/assets/fallback.webp',
    });
  });

  it('picks a random next slide without repeating the current slide', () => {
    expect(pickNextOnboardingStyleCarouselIndex(4, 2, () => 0.6)).toBe(3);
    expect(pickNextOnboardingStyleCarouselIndex(4, 2, () => 0.2)).toBe(0);
    expect(pickNextOnboardingStyleCarouselIndex(1, 0, () => 0.8)).toBe(0);
  });
});
