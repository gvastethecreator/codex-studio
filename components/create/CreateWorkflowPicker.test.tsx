/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CreateWorkflowPicker } from './CreateWorkflowPicker';

vi.mock('../../lib/recipeRouteModules', () => ({ preloadRecipeComponent: vi.fn() }));
vi.mock('../../lib/studioViewportRouteSurfaces', () => ({
  preloadStudioViewportSurface: vi.fn(),
}));

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

  it('returns to Default through the optional default handler', () => {
    const onSelectDefault = vi.fn();

    render(
      <CreateWorkflowPicker
        selectedLabel="Styles"
        onSelectRecipe={vi.fn()}
        onSelectDefault={onSelectDefault}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Workflow: Styles' }));
    fireEvent.click(screen.getByRole('option', { name: 'Default' }));
    expect(onSelectDefault).toHaveBeenCalledTimes(1);
  });
  it('marks an alias selected and supports keyboard navigation and focus return', () => {
    render(
      <CreateWorkflowPicker
        selectedId="character-poses"
        selectedLabel="Character Poses"
        onSelectRecipe={vi.fn()}
      />,
    );
    const trigger = screen.getByRole('button', { name: 'Workflow: Character Poses' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    const selected = screen.getByRole('option', { name: 'Open character poses' });
    expect(selected.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(selected);
    fireEvent.keyDown(selected, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(
      screen.getByRole('option', { name: 'Open character sprites' }),
    );
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
