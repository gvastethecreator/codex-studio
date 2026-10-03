/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { DEFAULT_GENERATION_CONFIG } from '../../constants';
import { SpritesheetRecipe } from './SpritesheetRecipe';

afterEach(cleanup);

describe('SpritesheetRecipe', () => {
  it('keeps the cell textarea outside the button that opens it', () => {
    render(
      <SpritesheetRecipe
        config={DEFAULT_GENERATION_CONFIG}
        updateConfig={() => {}}
        onGenerate={() => {}}
        isGenerating={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Edit cell 1 prompt' }));

    const textarea = screen.getByRole('textbox', { name: 'Cell 1 prompt' });
    expect(textarea.closest('button')).toBeNull();
  });

  it('updates background controls when output transparency changes', () => {
    const renderRecipe = (outputBackground: 'workflow' | 'transparent') => (
      <SpritesheetRecipe
        config={{ ...DEFAULT_GENERATION_CONFIG, outputBackground }}
        updateConfig={() => {}}
        onGenerate={() => {}}
        isGenerating={false}
      />
    );
    const { rerender } = render(renderRecipe('workflow'));
    const background = screen.getByRole('button', { name: 'Background' });

    expect(background.closest('fieldset')?.disabled).toBe(false);
    rerender(renderRecipe('transparent'));
    expect(background.closest('fieldset')?.disabled).toBe(true);
    rerender(renderRecipe('workflow'));
    expect(background.closest('fieldset')?.disabled).toBe(false);
    // A reference sets identity, not the backdrop.
    rerender(
      <SpritesheetRecipe
        config={{
          ...DEFAULT_GENERATION_CONFIG,
          outputBackground: 'workflow',
          attachments: [{ id: 'ref', name: 'Ref', dataUrl: 'data:image/png;base64,', strength: 1 }],
        }}
        updateConfig={() => {}}
        onGenerate={() => {}}
        isGenerating={false}
      />,
    );
    expect(background.closest('fieldset')?.disabled).toBe(false);
  });
});
