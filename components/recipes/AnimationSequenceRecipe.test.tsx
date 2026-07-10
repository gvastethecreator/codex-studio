import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vite-plus/test';

import { DEFAULT_GENERATION_CONFIG } from '../../constants';
import { AnimationSequenceRecipe } from './AnimationSequenceRecipe';

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
