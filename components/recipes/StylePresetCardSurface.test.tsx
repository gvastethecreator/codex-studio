/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import type { StyleRuntimePreset } from './styles/runtimeTypes';
import { StylePresetCard } from './StylePresetCardSurface';

afterEach(cleanup);

const PRESET: StyleRuntimePreset = {
  id: 'SP09-006',
  name: 'Polished Glass',
  category: '2. Man-Made Materials',
  style: {
    aesthetic: 'clean transparent studio material',
    subject_treatment: 'simple object silhouette',
    color_and_tone: 'cool mineral blues',
    lighting_and_shadow: 'softbox highlights',
    texture_and_material: 'polished glass caustics',
    camera_and_composition: 'centered product crop',
    atmosphere_and_mood: 'quiet inspection',
    rendering_and_quality: 'sharp commercial render',
  },
};

describe('StylePresetCard', () => {
  it('shows the active image label while cycling provider variants', () => {
    const { container } = render(
      <StylePresetCard
        preset={PRESET}
        packId="pack_09"
        visualState={{
          presetPackName: 'Texture & Materiality',
          resultImages: [],
          defaultImage: '/style.webp',
          defaultImageVariants: [{ src: '/style-grok.webp', label: 'Grok' }],
          defaultImageStale: false,
          previewImage: undefined,
          exampleImageSrc: null,
        }}
        active={false}
        selectionDisabled={false}
        copied={false}
        favorite={false}
        theme={{
          color: 'cyan',
          bg: 'bg-cyan-500',
          border: 'border-cyan-500',
          text: 'text-cyan-400',
        }}
        FadeImageComponent={(props) => <img {...props} />}
        onApply={() => {}}
        onCopy={() => {}}
        onToggleFavorite={() => {}}
        onHoverPreviewChange={() => {}}
      />,
    );

    expect(screen.getByText('Card', { selector: '[data-style-active-image-label]' })).toBeTruthy();
    expect(container.querySelector('[data-style-image-label="Card"]')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Next image for Polished Glass' }));

    expect(screen.getByText('Grok', { selector: '[data-style-active-image-label]' })).toBeTruthy();
    expect(container.querySelector('[data-style-image-label="Grok"]')).toBeTruthy();
    expect((screen.getByAltText('Polished Glass') as HTMLImageElement).src).toContain(
      '/style-grok.webp',
    );
  });

  it('disables unselected style actions when all five slots are occupied', () => {
    const onApply = vi.fn();

    render(
      <StylePresetCard
        preset={PRESET}
        packId="pack_09"
        visualState={{
          presetPackName: 'Texture & Materiality',
          resultImages: [],
          defaultImage: '/style.webp',
          defaultImageVariants: [],
          defaultImageStale: false,
          previewImage: undefined,
          exampleImageSrc: null,
        }}
        active={false}
        selectionDisabled
        copied={false}
        favorite={false}
        theme={{
          color: 'cyan',
          bg: 'bg-cyan-500',
          border: 'border-cyan-500',
          text: 'text-cyan-400',
        }}
        FadeImageComponent={(props) => <img {...props} />}
        onApply={onApply}
        onCopy={() => {}}
        onToggleFavorite={() => {}}
        onHoverPreviewChange={() => {}}
      />,
    );

    const imageAction = screen.getByRole('button', { name: 'Select Polished Glass' });
    const compactAction = screen.getByRole('button', { name: 'Select style Polished Glass' });

    expect((imageAction as HTMLButtonElement).disabled).toBe(true);
    expect((compactAction as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(imageAction);
    fireEvent.click(compactAction);
    expect(onApply).not.toHaveBeenCalled();
  });
});
