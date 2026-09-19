/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../contexts/GlobalContext', () => ({
  useToastUi: () => ({ addToast: vi.fn() }),
}));

import { MODELS } from '../../constants';
import { RecipeResultPreview } from './RecipeResultPreview';
import type { Attachment, GeneratedImageWithConfig } from '../../types';

afterEach(cleanup);

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
  it('uses the stage presentation without writing draft state on select', () => {
    const onOpen = vi.fn();
    render(<RecipeResultPreview variant="stage" images={[IMAGE]} onOpen={onOpen} />);

    const preview = screen.getByRole('region', { name: 'Result preview' });
    expect(preview.getAttribute('data-result-variant')).toBe('stage');

    fireEvent.click(screen.getByRole('button', { name: 'View result 1' }));
    expect(screen.getByRole('button', { name: 'View result 1' }).getAttribute('aria-pressed')).toBe(
      'true',
    );
    expect(onOpen).not.toHaveBeenCalled();
    expect(screen.queryByText('Compare reference')).toBeNull();
    expect(screen.queryByText('Result')).toBeNull();
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
    fireEvent.click(screen.getByRole('button', { name: 'Use as reference' }));
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
    expect(screen.queryByRole('button', { name: 'Previous result' })).toBeNull();
  });
});
