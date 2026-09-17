/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CreateWorkflowPicker } from './CreateWorkflowPicker';

afterEach(cleanup);

describe('CreateWorkflowPicker', () => {
  it('keeps Default selected and does not navigate when Default is chosen', () => {
    const onSelectRecipe = vi.fn();
    const onPreviewRecipe = vi.fn();

    render(
      <CreateWorkflowPicker onSelectRecipe={onSelectRecipe} onPreviewRecipe={onPreviewRecipe} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Workflow: Default' }));
    const listbox = screen.getByRole('listbox', { name: 'Workflows' });
    expect(listbox).toBeTruthy();
    expect(listbox.className).toContain('custom-scrollbar');

    fireEvent.click(screen.getByRole('option', { name: 'Default' }));
    expect(onSelectRecipe).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox', { name: 'Workflows' })).toBeNull();
  });

  it('navigates to a recipe from the catalog', () => {
    const onSelectRecipe = vi.fn();
    const onPreviewRecipe = vi.fn();

    render(
      <CreateWorkflowPicker onSelectRecipe={onSelectRecipe} onPreviewRecipe={onPreviewRecipe} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Workflow: Default' }));
    fireEvent.click(screen.getByRole('option', { name: /open styles/i }));

    expect(onSelectRecipe).toHaveBeenCalled();
    const [recipeId] = onSelectRecipe.mock.calls[0];
    expect(recipeId).toBe('styles');
  });
});
