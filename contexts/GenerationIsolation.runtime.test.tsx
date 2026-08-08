/**
 * @vitest-environment jsdom
 *
 * Runtime regression: 30 prompt keystrokes must update only the generation
 * draft subscription. Run and chrome consumers must keep their render count.
 */
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import type { ImageGenerationConfig } from '../types';

const stable = vi.hoisted(() => ({
  addToast: vi.fn(),
  closeModal: vi.fn(),
  handleAddToContext: vi.fn(),
  handleFileSelect: vi.fn(),
  handlePastedFiles: vi.fn(),
  handleRemoveAttachment: vi.fn(),
  log: vi.fn(),
  openModal: vi.fn(),
  setActiveCarouselId: vi.fn(),
  setModalImage: vi.fn(),
  updateAttachment: vi.fn(),
}));

vi.mock('../contexts/GlobalContext', () => ({
  useRuntimeLogActions: () => ({ log: stable.log }),
  useToastUi: () => ({ addToast: stable.addToast }),
  useWorkspaceState: () => ({ activeWorkspaceId: 'default' }),
}));

vi.mock('../hooks/useGenerationConfig', async () => {
  const ReactModule = await import('react');
  const { DEFAULT_GENERATION_CONFIG } = await import('../constants');

  return {
    useGenerationConfig: () => {
      const [generationConfig, setGenerationConfig] =
        ReactModule.useState<ImageGenerationConfig>(DEFAULT_GENERATION_CONFIG);
      const updateGenerationConfig = ReactModule.useCallback(
        <K extends keyof ImageGenerationConfig>(key: K, value: ImageGenerationConfig[K]) => {
          setGenerationConfig((current) => ({ ...current, [key]: value }));
        },
        [],
      );

      return {
        generationConfig,
        setGenerationConfig,
        updateGenerationConfig,
        updateAttachment: stable.updateAttachment,
        handleFileSelect: stable.handleFileSelect,
        handlePastedFiles: stable.handlePastedFiles,
        handleRemoveAttachment: stable.handleRemoveAttachment,
        handleAddToContext: stable.handleAddToContext,
        maxAttachments: 5,
        codexModelCatalog: null,
        isLoadingCodexModelCatalog: false,
        codexModelCatalogError: null,
      };
    },
  };
});

vi.mock('../hooks/useModalManager', () => ({
  useModalManager: () => ({
    modalImage: null,
    activeCarouselId: null,
    setActiveCarouselId: stable.setActiveCarouselId,
    transitioningImageId: null,
    openModal: stable.openModal,
    closeModal: stable.closeModal,
    isModalOpen: false,
    setModalImage: stable.setModalImage,
  }),
}));

const {
  GenerationProvider,
  useGenerationChrome,
  useGenerationDraft,
  useGenerationRun,
  useGenerationShell,
} = await import('./GenerationContext');

type RenderCounter = { current: number };

function DraftProbe({ renders }: { renders: RenderCounter }) {
  const { generationConfig, updateGenerationConfig } = useGenerationDraft();
  renders.current += 1;
  return (
    <input
      data-testid="prompt-draft"
      value={generationConfig.prompt}
      onChange={(event) => updateGenerationConfig('prompt', event.target.value)}
    />
  );
}

function WorkspaceRuntimeChromeProbe({ renders }: { renders: RenderCounter }) {
  const { recipe, ui } = useGenerationChrome();
  renders.current += 1;
  return (
    <span data-testid="chrome-state">
      {recipe.activeRecipe ?? 'studio'}:{ui.isInteractingWithToolbar ? 'busy' : 'idle'}
    </span>
  );
}

function ShellProbe({ renders }: { renders: RenderCounter }) {
  const { aspectRatio } = useGenerationShell();
  renders.current += 1;
  return <span data-testid="shell-state">{aspectRatio}</span>;
}

function RunProbe({
  renders,
  executeIdentities,
}: {
  renders: RenderCounter;
  executeIdentities: Set<unknown>;
}) {
  const { executeGeneration, isGenerating } = useGenerationRun();
  executeIdentities.add(executeGeneration);
  renders.current += 1;
  return <span data-testid="run-state">{isGenerating ? 'running' : 'idle'}</span>;
}

afterEach(cleanup);

describe('Generation context isolation', () => {
  it('keeps workspace/runtime chrome stable across 30 prompt keystrokes', () => {
    const draftRenders = { current: 0 };
    const chromeRenders = { current: 0 };
    const shellRenders = { current: 0 };
    const runRenders = { current: 0 };
    const executeIdentities = new Set<unknown>();

    render(
      <GenerationProvider>
        <DraftProbe renders={draftRenders} />
        <WorkspaceRuntimeChromeProbe renders={chromeRenders} />
        <ShellProbe renders={shellRenders} />
        <RunProbe renders={runRenders} executeIdentities={executeIdentities} />
      </GenerationProvider>,
    );

    const chromeAfterMount = chromeRenders.current;
    const shellAfterMount = shellRenders.current;
    const runAfterMount = runRenders.current;
    const promptInput = screen.getByTestId('prompt-draft');

    for (let length = 1; length <= 30; length += 1) {
      fireEvent.change(promptInput, { target: { value: 'x'.repeat(length) } });
    }

    expect((promptInput as HTMLInputElement).value).toHaveLength(30);
    expect(draftRenders.current).toBeGreaterThan(chromeAfterMount);
    expect(chromeRenders.current).toBe(chromeAfterMount);
    expect(shellRenders.current).toBe(shellAfterMount);
    expect(runRenders.current).toBe(runAfterMount);
    expect(executeIdentities.size).toBe(1);
    expect(screen.getByTestId('chrome-state').textContent).toBe('studio:idle');
    expect(screen.getByTestId('shell-state').textContent).toBe('1:1');
    expect(screen.getByTestId('run-state').textContent).toBe('idle');
  });
});
