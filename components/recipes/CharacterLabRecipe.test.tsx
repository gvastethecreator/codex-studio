/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_GENERATION_CONFIG } from '../../constants';
import { activateCharacterLabView } from '../../lib/characterLabDraft';
import { CharacterLabRecipe } from './CharacterLabRecipe';
import { RecipeWorkbenchContext } from './RecipeWorkbenchContext';

vi.mock('../../contexts/GenerationContext', () => ({
  useGenerationDraft: () => ({ isDraftReady: true, setGenerationConfig: vi.fn() }),
}));
vi.mock('../../contexts/WorkspaceContext', () => ({
  useWorkspaceState: () => ({ activeWorkspaceId: 'character-test' }),
}));

afterEach(cleanup);

describe('CharacterLabRecipe', () => {
  it('explains unavailable actions before interaction and restores generation for an image action', () => {
    const onGenerate = vi.fn();
    const props = { updateConfig: vi.fn(), onGenerate, isGenerating: false };
    const { rerender } = render(
      <CharacterLabRecipe
        {...props}
        config={activateCharacterLabView(DEFAULT_GENERATION_CONFIG, 'motion')}
      />,
    );

    const unavailable = screen.getByRole('button', { name: /^Unavailable:/ }) as HTMLButtonElement;
    expect(unavailable.disabled).toBe(true);
    expect(
      screen.getByText(
        'Video generation is not yet available. Choose an image action to generate.',
      ),
    ).toBeTruthy();
    fireEvent.click(unavailable);
    expect(onGenerate).not.toHaveBeenCalled();

    rerender(
      <CharacterLabRecipe
        {...props}
        config={activateCharacterLabView(DEFAULT_GENERATION_CONFIG, 'profile')}
      />,
    );
    expect(
      (screen.getByRole('button', { name: /^Unavailable:/ }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(
      screen.getByText(
        'Character analysis is not yet available. Choose an image action to generate.',
      ),
    ).toBeTruthy();

    rerender(
      <CharacterLabRecipe
        {...props}
        config={activateCharacterLabView(DEFAULT_GENERATION_CONFIG, 'poses')}
      />,
    );
    expect(screen.queryByRole('button', { name: /^Unavailable:/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /^Generate Front View/ }));
    expect(onGenerate).toHaveBeenCalledOnce();

    const effects = activateCharacterLabView(DEFAULT_GENERATION_CONFIG, 'effects');
    rerender(<CharacterLabRecipe {...props} config={effects} />);
    expect(
      (screen.getByRole('button', { name: /^Needs source:/ }) as HTMLButtonElement).disabled,
    ).toBe(true);
    rerender(
      <CharacterLabRecipe
        {...props}
        config={{
          ...effects,
          attachments: [
            { id: 'source', name: 'a.png', dataUrl: 'data:image/png;base64,a', strength: 0.5 },
          ],
        }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /^Generate Zoom Out/ }));
    expect(onGenerate).toHaveBeenCalledTimes(2);
  });

  it('queues one single-output job per action in a category batch', () => {
    const onGenerate = vi.fn();
    render(
      <RecipeWorkbenchContext
        value={{
          controls: null,
          action: null,
          overlay: null,
          sidePanel: document.body,
          compare: null,
          setCompare: () => {},
        }}
      >
        <CharacterLabRecipe
          updateConfig={vi.fn()}
          onGenerate={onGenerate}
          isGenerating={false}
          config={activateCharacterLabView(DEFAULT_GENERATION_CONFIG, 'poses')}
        />
      </RecipeWorkbenchContext>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Choose action' }));
    fireEvent.click(screen.getAllByRole('button', { name: /Batch/ })[0]!);
    const runs = onGenerate.mock.calls.map(([prompt, overrides]) => ({ prompt, overrides }));
    expect(runs.map(({ overrides }) => overrides.recipeParams.actionId)).toEqual([
      'poses:front',
      'poses:back',
      'poses:left',
      'poses:right',
      'poses:three_quarter',
    ]);
    for (const { prompt, overrides } of runs) {
      expect(overrides.batchCount).toBe(1);
      expect(prompt).toContain(`Action: ${overrides.recipeParams.actionLabel}`);
      expect(prompt).not.toContain('Batch request');
    }
  });
});
