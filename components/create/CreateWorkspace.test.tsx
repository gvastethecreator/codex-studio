/** @vitest-environment jsdom */
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../contexts/GenerationContext', () => ({
  useGenerationDraft: () => ({
    generationConfig: { attachments: [] },
  }),
}));

vi.mock('../../contexts/GlobalContext', () => ({
  useToastUi: () => ({ addToast: vi.fn() }),
}));

vi.mock('../../lib/studioViewportRouteSurfaces', () => ({
  preloadStudioViewportSurface: vi.fn(),
}));

vi.mock('../../lib/recipeRouteModules', () => ({
  preloadRecipeComponent: vi.fn(),
}));

import type { RecipePageRuntimeProps } from '../RecipePage';
import type { StudioGenerationDockProps } from '../shell/StudioGenerationDock';
import { CreateWorkspace } from './CreateWorkspace';

afterEach(cleanup);

const GenerationDock = ((props: StudioGenerationDockProps) => (
  <div data-generation-dock-layout={props.layout ?? 'dock'} data-testid="generation-dock" />
)) as unknown as React.LazyExoticComponent<React.ComponentType<StudioGenerationDockProps>>;

const recipePageProps = {
  imagesWithConfig: [
    {
      id: 'img-styles',
      src: '/library/styles.png',
      thumbnail: '/library/styles-thumb.png',
      batchId: 'batch-1',
      createdAt: Date.parse('2026-05-26T00:00:00.000Z'),
      config: {
        prompt: 'A lantern',
        attachments: [],
        aspectRatio: '3:4',
        batchCount: 1,
        model: 'gpt-image-1',
        executionModel: 'gpt-5.4-codex',
        executionReasoningEffort: 'medium',
        executionSpeed: 'standard',
        recipeId: 'styles',
      },
    },
  ],
  openModal: vi.fn(),
} as unknown as RecipePageRuntimeProps;

const generationDockProps: StudioGenerationDockProps = {
  isModalOpen: false,
  isUiChromeSuppressed: false,
  currentView: 'recipes',
  activeRecipe: null,
  isDragging: false,
  toolbarArgs: {} as StudioGenerationDockProps['toolbarArgs'],
  layout: 'rail',
};

describe('CreateWorkspace', () => {
  it('places the tool rail left of the result canvas', () => {
    const { container } = render(
      <CreateWorkspace
        recipePageProps={recipePageProps}
        hasGenerationDock
        GenerationDock={GenerationDock}
        generationDockProps={generationDockProps}
      />,
    );

    const workspace = container.querySelector('.create-workspace');
    expect(workspace?.getAttribute('data-route-key')).toBe('recipes-list');
    expect(screen.getByRole('complementary', { name: 'Create tools' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Create canvas' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Result preview' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'View result 1' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Workflow: Default' })).toBeNull();
    expect(screen.getByTestId('generation-dock').getAttribute('data-generation-dock-layout')).toBe(
      'rail',
    );
  });

  it('keeps recipe tools on the left and results with a carousel on the right', () => {
    const { container } = render(
      <CreateWorkspace
        recipePageProps={recipePageProps}
        hasGenerationDock
        GenerationDock={GenerationDock}
        generationDockProps={generationDockProps}
        routeKey="recipe-camera"
        tools={<div data-testid="recipe-tools">Camera tools</div>}
      />,
    );

    const workspace = container.querySelector('.create-workspace');
    const toolsRail = screen.getByRole('complementary', { name: 'Create tools' });
    const stage = screen.getByRole('region', { name: 'Create canvas' });
    const recipeTools = screen.getByTestId('recipe-tools');
    const generate = screen.getByTestId('generation-dock');

    expect(workspace?.getAttribute('data-route-key')).toBe('recipe-camera');
    expect(toolsRail.contains(recipeTools)).toBe(true);
    expect(toolsRail.contains(generate)).toBe(true);
    expect(stage.contains(screen.getByRole('region', { name: 'Result preview' }))).toBe(true);
    expect(
      recipeTools.compareDocumentPosition(stage) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(toolsRail.className).toContain('workbench-config');
  });
});
