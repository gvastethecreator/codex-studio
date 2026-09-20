/** @vitest-environment jsdom */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AnimationFramePreview } from './AnimationFramePreview';
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

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
  it('plays available frames and marks gaps before export', async () => {
    vi.useFakeTimers();
    render(
      <AnimationFramePreview frames={[{ id: 'f1', src: '/first.webp' }, { id: 'f2' }]} fps={2} />,
    );
    expect(screen.getByRole('img', { name: 'Preview frame 1' })).toBeTruthy();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(screen.getByRole('img', { name: 'Preview frame 1' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Play preview' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(screen.getByText('Frame 2 · Not generated yet')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Pause preview' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(screen.getByText('Frame 2 · Not generated yet')).toBeTruthy();
  });

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
    expect(html).toContain('Frame details');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('A motion prompt is required to prepare a run.');
    expect(html).toContain('Preview works with partial frames. GIF export requires every frame.');
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
