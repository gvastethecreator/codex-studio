/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../contexts/GlobalContext', () => ({
  useToastUi: () => ({ addToast: vi.fn() }),
}));

import { MODELS } from '../../constants';
import { RecipeResultPreview } from './RecipeResultPreview';
import type { Attachment, GeneratedImageWithConfig } from '../../types';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const IMAGE: GeneratedImageWithConfig = {
  id: 'img-1',
  src: '/library/one.png',
  thumbnail: '/library/one-thumb.png',
  batchId: 'batch-1',
  createdAt: Date.parse('2026-05-26T00:00:00.000Z'),
  config: {
    prompt: 'A lantern',
    attachments: [],
    aspectRatio: '3:4',
    batchCount: 1,
    model: MODELS.CODEX_IMAGEGEN,
    executionModel: 'gpt-5.4-codex',
    executionReasoningEffort: 'medium',
    executionSpeed: 'standard',
    recipeId: 'styles',
  },
};

const IMAGE_TWO: GeneratedImageWithConfig = {
  ...IMAGE,
  id: 'img-2',
  src: '/library/two.png',
  thumbnail: '/library/two-thumb.png',
};

describe('RecipeResultPreview', () => {
  it('keeps zoom working after StrictMode cleanup and resets when switching images', () => {
    vi.useFakeTimers();
    render(
      <StrictMode>
        <RecipeResultPreview
          variant="stage"
          images={[IMAGE, IMAGE_TWO]}
          reference={{
            id: 'ref-1',
            name: 'Reference',
            dataUrl: '/library/reference.png',
            strength: 1,
          }}
        />
      </StrictMode>,
    );
    const zoomIn = () =>
      act(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
        vi.advanceTimersByTime(500);
      });
    zoomIn();
    expect(screen.getByRole('img', { name: 'Generated result' }).style.transform).toContain(
      'scale(1.25)',
    );
    fireEvent.click(screen.getByRole('button', { name: 'View result 2' }));
    expect(screen.getByRole('img', { name: 'Generated result' }).style.transform).toContain(
      'scale(1)',
    );
    zoomIn();
    expect(screen.getByRole('img', { name: 'Generated result' }).style.transform).toContain(
      'scale(1.25)',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Compare reference' }));
    expect(screen.getByRole('img', { name: 'Reference image' }).style.transform).toContain(
      'scale(1)',
    );
    zoomIn();
    expect(screen.getByRole('img', { name: 'Reference image' }).style.transform).toContain(
      'scale(1.25)',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Reset zoom to 100%' }));
    expect(screen.getByRole('img', { name: 'Reference image' }).style.transform).toContain(
      'scale(1)',
    );
  });

  it('uses the stage presentation without writing draft state on select', () => {
    const onOpen = vi.fn();
    render(<RecipeResultPreview variant="stage" images={[IMAGE]} onOpen={onOpen} isGenerating />);

    const preview = screen.getByRole('region', { name: 'Result preview' });
    expect(preview.getAttribute('data-result-variant')).toBe('stage');
    expect(preview.getAttribute('aria-busy')).toBe('true');
    expect(screen.getByRole('status').textContent).toContain('Generating');

    fireEvent.click(screen.getByRole('button', { name: 'View result 1' }));
    expect(screen.getByRole('button', { name: 'View result 1' }).getAttribute('aria-pressed')).toBe(
      'true',
    );
    expect(onOpen).not.toHaveBeenCalled();
    expect(screen.queryByText('Compare reference')).toBeNull();
    expect(screen.queryByText('Result')).toBeNull();
  });

  it('keeps thumbnail clicks active after dragging the result strip', () => {
    render(<RecipeResultPreview variant="stage" images={[IMAGE, IMAGE_TWO]} onOpen={vi.fn()} />);

    const strip = screen.getByLabelText('Library results');
    Object.defineProperties(strip, {
      clientWidth: { configurable: true, value: 120 },
      scrollWidth: { configurable: true, value: 400 },
      setPointerCapture: { configurable: true, value: vi.fn() },
      hasPointerCapture: { configurable: true, value: vi.fn(() => false) },
    });

    fireEvent.pointerDown(strip, {
      button: 0,
      clientX: 100,
      isPrimary: true,
      pointerId: 1,
      pointerType: 'mouse',
    });
    fireEvent.pointerMove(strip, { clientX: 60, pointerId: 1 });
    fireEvent.pointerUp(strip, { clientX: 60, pointerId: 1 });

    const secondResult = screen.getByRole('button', { name: 'View result 2' });
    fireEvent.pointerDown(secondResult, {
      button: 0,
      clientX: 60,
      isPrimary: true,
      pointerId: 2,
      pointerType: 'mouse',
    });
    fireEvent.pointerUp(secondResult, { clientX: 60, pointerId: 2 });
    fireEvent.click(secondResult);

    expect(secondResult.getAttribute('aria-pressed')).toBe('true');
  });

  it('keeps recipe images in the library stage and exposes canvas actions', () => {
    const onToggleFavorite = vi.fn();
    const onUseAsReference = vi.fn();
    render(
      <RecipeResultPreview
        variant="stage"
        images={[IMAGE, IMAGE_TWO]}
        onOpen={vi.fn()}
        onToggleFavorite={onToggleFavorite}
        onUseAsReference={onUseAsReference}
      />,
    );

    expect(screen.getByRole('button', { name: 'View result 2' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Next result' })).toBeNull();
    const canvas = screen.getByRole('img', { name: 'Generated result' }).parentElement;
    expect(canvas).toBeTruthy();
    vi.spyOn(canvas as HTMLElement, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 400,
      bottom: 300,
      width: 400,
      height: 300,
      toJSON() {
        return {};
      },
    });
    fireEvent.pointerMove(canvas as HTMLElement, { clientX: 300, clientY: 80 });
    fireEvent.click(screen.getByRole('button', { name: 'Next result' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add to favorites' }));
    fireEvent.click(screen.getByRole('button', { name: 'Use as source' }));
    fireEvent.click(screen.getByRole('button', { name: 'Checkered background' }));
    expect(screen.getByRole('toolbar', { name: 'Selected result actions' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open result' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeTruthy();
    expect(onToggleFavorite).toHaveBeenCalledWith('img-2');
    expect(onUseAsReference).toHaveBeenCalledWith(expect.objectContaining({ id: 'img-2' }));
    expect(
      screen.getByRole('region', { name: 'Result preview' }).getAttribute('data-stage-background'),
    ).toBe('checkered');
  });

  it('puts Compare, the prompt, and backgrounds on the stage toolbar', () => {
    const reference: Attachment = {
      id: 'ref-1',
      name: 'ref.png',
      dataUrl: '/library/ref.png',
      strength: 1,
    };
    render(<RecipeResultPreview variant="stage" images={[IMAGE]} reference={reference} />);

    expect(screen.getByRole('button', { name: 'Compare reference' })).toBeTruthy();
    expect(screen.getByText('A lantern')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Copy image' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Download image' })).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Canvas background' })).toBeTruthy();
    const toolbar = screen.getByRole('toolbar', { name: 'Selected result actions' });
    expect(toolbar.contains(screen.getByRole('group', { name: 'Canvas background' }))).toBe(true);
    expect(toolbar.contains(screen.getByRole('group', { name: 'Zoom controls' }))).toBe(true);
    expect(screen.getByText('Not a source')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Previous result' })).toBeNull();
  });
});
