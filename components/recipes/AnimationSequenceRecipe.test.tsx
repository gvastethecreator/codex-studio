import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../../constants';
import { AnimationSequenceRecipe } from './AnimationSequenceRecipe';
import { parseBoundedNumberInput } from './animationSequenceNumberInput';

function renderRecipe(prompt = '') {
  return renderToStaticMarkup(
    <AnimationSequenceRecipe
      config={{ ...DEFAULT_GENERATION_CONFIG, prompt }}
      updateConfig={() => {}}
      onGenerate={() => {}}
      isGenerating={false}
    />,
  );
}

describe('AnimationSequenceRecipe', () => {
  it('keeps bounded numeric settings valid while a field is edited', () => {
    expect(parseBoundedNumberInput('', 2, 48)).toBeNull();
    expect(parseBoundedNumberInput('not-a-number', 2, 48)).toBeNull();
    expect(parseBoundedNumberInput('1', 2, 48)).toBe(2);
    expect(parseBoundedNumberInput('24', 2, 48)).toBe(24);
    expect(parseBoundedNumberInput('80', 2, 48)).toBe(48);
  });

  it('keeps compact workbenches scrollable and explains the empty prompt state', () => {
    const html = renderRecipe();

    expect(html).toContain('data-animation-workbench="true"');
    expect(html).toContain('overflow-y-auto');
    expect(html).toContain('lg:grid-cols-[18rem_minmax(0,1fr)]');
    expect(html).toContain('A motion prompt is required to prepare a run.');
    expect(html).toContain('Enter a motion prompt to preview frame instructions.');
    expect(html).toContain('Loading runs...');
    expect(html).toContain('aria-pressed="true"');
  });

  it('uses an entered motion prompt instead of the empty-state guidance', () => {
    const html = renderRecipe('A paper bird unfolds and takes flight.');

    expect(html).toContain('A paper bird unfolds and takes flight.');
    expect(html).not.toContain('A motion prompt is required to prepare a run.');
    expect(html).not.toContain('Enter a motion prompt to preview frame instructions.');
  });
});
