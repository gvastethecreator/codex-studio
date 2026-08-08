/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

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
});
