/** @vitest-environment jsdom */
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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
import {
  RecipeControls,
  RecipeEditor,
  RecipeOptionsPanel,
  RecipeWorkbenchContext,
} from '../recipes/RecipeWorkbenchContext';

afterEach(cleanup);

const GenerationDock = ((props: StudioGenerationDockProps) => (
  <div data-generation-dock-layout={props.layout ?? 'dock'} data-testid="generation-dock">
    {props.railTools}
    {props.railAction}
  </div>
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

  it('keeps recipe tools on the left and a specialized stage on the right', () => {
    const { container } = render(
      <CreateWorkspace
        recipePageProps={recipePageProps}
        hasGenerationDock
        GenerationDock={GenerationDock}
        generationDockProps={generationDockProps}
        routeKey="recipe-camera"
        tools={<div data-testid="recipe-tools">Camera tools</div>}
        stage={<div data-testid="camera-stage">Camera editor</div>}
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
    expect(stage.contains(screen.getByTestId('camera-stage'))).toBe(true);
    expect(screen.queryByRole('region', { name: 'Result preview' })).toBeNull();
    expect(
      recipeTools.compareDocumentPosition(stage) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(toolsRail.className).toContain('workbench-config');
  });
  it('preserves the editor draft when results arrive and removes old workflow panels', async () => {
    function Workspace({
      resultId,
      workflow = 'camera',
    }: {
      resultId?: string;
      workflow?: string;
    }) {
      const [controls, setControls] = React.useState<HTMLElement | null>(null);
      const [sidePanel, setSidePanel] = React.useState<HTMLElement | null>(null);
      return (
        <RecipeWorkbenchContext
          value={{
            controls,
            sidePanel,
            action: null,
            overlay: null,
            compare: null,
            setCompare: () => {},
            latestResultId: resultId,
            results: <div>Workflow result</div>,
          }}
        >
          <CreateWorkspace
            recipePageProps={recipePageProps}
            hasGenerationDock
            GenerationDock={GenerationDock}
            generationDockProps={generationDockProps}
            tools={<div ref={setControls} />}
            onSidePanelTarget={setSidePanel}
            stage={
              <React.Fragment key={workflow}>
                <RecipeControls>
                  <button>Workflow control</button>
                </RecipeControls>
                <RecipeOptionsPanel title="Frame details">
                  <input aria-label="Correction" />
                </RecipeOptionsPanel>
                <RecipeEditor label="Camera">
                  <input aria-label="Editor draft" defaultValue="Keep this" />
                </RecipeEditor>
              </React.Fragment>
            }
          />
        </RecipeWorkbenchContext>
      );
    }
    const { rerender } = render(<Workspace resultId="old" />);
    const rail = screen.getByRole('complementary', { name: 'Create tools' });
    expect(rail.contains(screen.getByRole('button', { name: 'Workflow control' }))).toBe(true);
    const trigger = screen.getByRole('button', { name: 'Frame details' });
    fireEvent.click(trigger);
    const panel = screen.getByRole('dialog', { name: 'Frame details' });
    expect(document.activeElement).toBe(panel);
    fireEvent.keyDown(panel, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    fireEvent.change(screen.getByRole('textbox', { name: 'Editor draft' }), {
      target: { value: 'Edited draft' },
    });
    rerender(<Workspace resultId="new" />);
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: 'Results' }).getAttribute('aria-selected')).toBe(
        'true',
      ),
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Camera' }));
    expect((screen.getByRole('textbox', { name: 'Editor draft' }) as HTMLInputElement).value).toBe(
      'Edited draft',
    );
    fireEvent.click(trigger);
    rerender(<Workspace resultId="new" workflow="timeline" />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
