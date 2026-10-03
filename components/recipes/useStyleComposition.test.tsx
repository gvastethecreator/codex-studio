/** @vitest-environment jsdom */
import { act, cleanup, renderHook } from '@testing-library/react';
import { useCallback, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_GENERATION_CONFIG } from '../../constants';
import type { ImageGenerationConfig } from '../../types';
import { getGenerationRequirement } from '../../packages/shared/src/generationRequirements';
import { useStyleComposition } from './useStyleComposition';
import type { StyleRuntimePreset } from './styles/runtimeTypes';

afterEach(cleanup);

const preset: StyleRuntimePreset = {
  id: 'glass',
  name: 'Glass',
  category: 'Materials',
  style: {
    aesthetic: 'clear glass',
    creative_brief: 'a transparent glass object',
    subject_treatment: 'simple silhouette',
    color_and_tone: 'cool blue',
    lighting_and_shadow: 'soft studio light',
    texture_and_material: 'polished glass',
    camera_and_composition: 'centered',
    atmosphere_and_mood: 'quiet',
    rendering_and_quality: 'sharp',
  },
};

function useComposer(intentionalStylesV1 = false) {
  const [config, setConfig] = useState<ImageGenerationConfig>({
    ...DEFAULT_GENERATION_CONFIG,
    prompt: 'A lantern',
    attachments: [],
  });
  const updateConfig = useCallback(
    <K extends keyof ImageGenerationConfig>(key: K, value: ImageGenerationConfig[K]) =>
      setConfig((current) => ({ ...current, [key]: value })),
    [],
  );
  const composition = useStyleComposition({
    config,
    updateConfig,
    onGenerate: vi.fn(),
    referenceImages: config.attachments,
    generationBlocked: false,
    maxSlots: 4,
    intentionalStylesV1,
  });
  return { config, ...composition };
}

describe('optional Default styles', () => {
  it.each([false, true])('allows a prompt without a style (intentional: %s)', (intentional) => {
    const { result } = renderHook(() => useComposer(intentional));
    expect(result.current.config.recipeId).toBeNull();
    expect(getGenerationRequirement({ ...result.current.config, referenceCount: 0 })).toBeNull();
    expect(result.current.compileIssues).toEqual([]);
  });

  it('uses normal generation after disabling or removing the last layer', () => {
    const { result } = renderHook(() => useComposer());
    act(() => result.current.toggleStyle(preset, 'test-pack', 'Test pack'));
    expect(result.current.config.recipeId).toBe('styles');
    expect(result.current.config.recipeParams?.selectedStyles).toEqual([
      expect.objectContaining({ presetId: 'glass', enabled: true }),
    ]);

    act(() => result.current.toggleSelectedStyleEnabled('glass'));
    expect(result.current.config.recipeId).toBeNull();
    expect(getGenerationRequirement({ ...result.current.config, referenceCount: 0 })).toBeNull();
    expect(result.current.config.recipeParams?.selectedStyleDraft).toHaveLength(1);

    act(() => result.current.toggleSelectedStyleEnabled('glass'));
    expect(result.current.config.recipeId).toBe('styles');
    act(() => result.current.removeSelectedStyle('glass'));
    expect(result.current.config.recipeId).toBeNull();
    expect(result.current.config.recipeParams?.selectedStyles).toEqual([]);
  });
});
