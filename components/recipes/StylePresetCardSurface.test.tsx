/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

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
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
    };
    const onApply = vi.fn();
    const onUsePrompt = vi.fn();
    const onCopy = vi.fn();
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
          border: 'border-cyan-500/2',
          text: 'text-cyan-400',
        }}
        FadeImageComponent={(props) => <img {...props} />}
        onApply={onApply}
        onCopy={onCopy}
        onUsePrompt={onUsePrompt}
        onToggleFavorite={() => {}}
        onHoverPreviewChange={() => {}}
      />,
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'Select style Polished Glass' })[0]);
    expect(onApply).toHaveBeenCalledExactlyOnceWith(PRESET);
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Copy prompt' }));
    fireEvent.click(screen.getByRole('button', { name: 'Use as prompt' }));
    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(onUsePrompt).toHaveBeenCalledExactlyOnceWith(PRESET);
    expect(onApply).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Information about Polished Glass' }));
    expect(screen.getByText('Card', { selector: '[data-style-active-image-label]' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next image for Polished Glass' }));
    expect(screen.getByText('Grok', { selector: '[data-style-active-image-label]' })).toBeTruthy();
    expect(container.querySelector('[data-style-image-label="Grok"]')).toBeTruthy();
    expect((screen.getAllByAltText('Polished Glass')[0] as HTMLImageElement).src).toContain(
      '/style-grok.webp',
    );
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it('keeps preview available but disables adding when all five slots are occupied', () => {
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
          border: 'border-cyan-500/2',
          text: 'text-cyan-400',
        }}
        FadeImageComponent={(props) => <img {...props} />}
        onApply={onApply}
        onCopy={() => {}}
        onToggleFavorite={() => {}}
        onHoverPreviewChange={() => {}}
      />,
    );

    const imageAction = screen.getByRole('button', { name: 'Information about Polished Glass' });
    const selectionActions = screen.getAllByRole('button', { name: 'Select style Polished Glass' });

    expect((imageAction as HTMLButtonElement).disabled).toBe(false);
    for (const action of selectionActions) {
      expect((action as HTMLButtonElement).disabled).toBe(true);
      fireEvent.click(action);
    }
    expect(onApply).not.toHaveBeenCalled();
  });
});
