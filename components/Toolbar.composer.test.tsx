/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../contexts/GlobalContext', () => ({
  useToastUi: () => ({ addToast: vi.fn() }),
}));

vi.mock('./ui/DemandMountedGsapDropdown', () => ({
  DemandMountedGsapDropdown: ({
    open,
    children,
    role,
    'aria-label': ariaLabel,
  }: {
    open: boolean;
    children: ReactNode;
    role?: string;
    'aria-label'?: string;
  }) =>
    open ? (
      <div role={role ?? 'dialog'} aria-label={ariaLabel}>
        {children}
      </div>
    ) : null,
}));

import { MODELS } from '../constants';
import type { StudioCommandCenterProjection } from '../lib/commandCenterProjection';
import type { ImageGenerationConfig } from '../types';
import { Toolbar, type ToolbarProps } from './Toolbar';

afterEach(cleanup);

const commandCenter: StudioCommandCenterProjection = {
  compactMode: false,
  runtimeStatus: { label: 'Ready', tone: 'success', tooltip: 'Runtime ready.' },
  provider: {
    id: 'codex',
    label: 'Codex app-server',
    shortLabel: 'Codex',
    toolbarLabel: 'Codex',
    status: 'active',
    tone: 'success',
    tooltip: 'Ready',
    canExecute: true,
    statusDetail: 'Ready',
  },
  providerOptions: [
    {
      id: 'codex',
      label: 'Codex app-server',
      shortLabel: 'Codex',
      toolbarLabel: 'Codex',
      status: 'active',
      tone: 'success',
      tooltip: 'Ready',
      canExecute: true,
      statusDetail: 'Ready',
    },
    {
      id: 'grok',
      label: 'Grok Imagine',
      shortLabel: 'Grok',
      toolbarLabel: 'Grok',
      status: 'active',
      tone: 'success',
      tooltip: 'Ready',
      canExecute: true,
      statusDetail: 'Ready',
    },
  ],
  queue: { activeCount: 0, reviewCount: 0, isOpen: false },
};

function config(overrides: Partial<ImageGenerationConfig> = {}): ImageGenerationConfig {
  return {
    prompt: 'A lantern',
    attachments: [],
    aspectRatio: '1:1',
    batchCount: 4,
    model: MODELS.CODEX_IMAGEGEN,
    executionModel: 'gpt-5.4-codex',
    executionReasoningEffort: 'medium',
    executionSpeed: 'standard',
    ...overrides,
  };
}

function renderToolbar(overrides: Partial<ToolbarProps> = {}) {
  const props: ToolbarProps = {
    generationConfig: config(),
    updateConfig: vi.fn(),
    updateAttachment: vi.fn(),
    onGenerate: vi.fn(),
    isGenerating: false,
    generationStartTime: null,
    onFileSelect: vi.fn(),
    onFilesDrop: vi.fn(),
    onRemoveAttachment: vi.fn(),
    isEnhancingPrompt: false,
    onEnhancePrompt: vi.fn(),
    setPreviewRatio: vi.fn(),
    setIsInteracting: vi.fn(),
    onOpenEditor: vi.fn(),
    isKeyPopoverOpen: false,
    onOpenKeySelector: vi.fn(),
    onSelectKey: vi.fn(),
    maxAttachments: 4,
    codexModelCatalog: null,
    isLoadingCodexModelCatalog: false,
    codexModelCatalogError: null,
    activeProviderId: 'codex',
    commandCenter,
    onSelectProvider: vi.fn(),
    isProviderSaving: false,
    onOpenSettings: vi.fn(),
    layout: 'rail',
    ...overrides,
  };
  return render(<Toolbar {...props} />);
}

describe('Toolbar composer chrome', () => {
  it('blocks Remaster click and shortcut until a source is attached', () => {
    const onGenerate = vi.fn();
    const view = renderToolbar({
      activeRecipe: 'remaster',
      codexTransport: 'subscription_http',
      codexAvailableTransports: ['subscription_http'],
      generationConfig: config({ recipeId: 'remaster' }),
      onGenerate,
    });
    fireEvent.click(screen.getByRole('button', { name: /generate 4 images/i }));
    fireEvent.keyDown(document, { key: 'Enter', ctrlKey: true });
    expect(onGenerate).not.toHaveBeenCalled();
    expect(screen.getAllByText('Add a source image to restore.').length).toBeGreaterThan(0);
    view.unmount();
    renderToolbar({
      activeRecipe: 'remaster',
      codexTransport: 'subscription_http',
      codexAvailableTransports: ['subscription_http'],
      generationConfig: config({
        recipeId: 'remaster',
        attachments: [
          {
            id: 'source',
            name: 'original.png',
            dataUrl: 'data:image/png;base64,aaaa',
            strength: 1,
          },
        ],
      }),
      onGenerate,
    });
    fireEvent.click(screen.getByRole('button', { name: /generate 4 images/i }));
    expect(onGenerate).toHaveBeenCalledOnce();
  });

  it('shows one generate requirement next to Generate and keeps the action usable', () => {
    const { container } = renderToolbar({
      codexTransport: 'subscription_http',
      codexAvailableTransports: ['subscription_http'],
      generationConfig: config({ prompt: '' }),
    });
    const requirement = container.querySelector('#generation-requirement');
    expect(requirement?.textContent).toBe('Add a prompt or image.');
    expect(container.querySelectorAll('#generation-requirement')).toHaveLength(1);
    const generate = screen.getByRole('button', { name: /generate 4 images/i });
    expect(generate.getAttribute('aria-disabled')).toBeNull();
    expect(generate).toHaveProperty('disabled', false);
    fireEvent.click(generate);
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Prompt input' }));
    expect(container.querySelector('.create-prompt-error')?.textContent).toBe(
      'Add a prompt or image.',
    );
    expect(container.querySelectorAll('#generation-requirement')).toHaveLength(1);
  });

  it('groups provider and Codex execution in the same Create rail row', () => {
    const { container } = renderToolbar();
    const row = container.querySelector('.create-tool-provider-row');
    const provider = screen.getByRole('button', { name: /change provider/i });
    const execution = screen.getByRole('button', { name: /codex task execution/i });
    const generate = screen.getByRole('button', { name: /generate 4 images/i });

    expect(row?.contains(provider)).toBe(true);
    expect(row?.contains(execution)).toBe(true);
    expect(screen.queryByRole('button', { name: /generation model/i })).toBeNull();
    expect(
      provider.compareDocumentPosition(execution) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      execution.compareDocumentPosition(generate) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      container
        .querySelector('.create-tool-execution')
        ?.nextElementSibling?.querySelector('[data-studio-generate-button]'),
    ).toBe(generate);
    expect(generate.getAttribute('data-studio-generate-button')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Format: 1:1, Square' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Aspect ratio: 1:1' })).toBeNull();
    expect(screen.getByText('Model')).toBeTruthy();
    expect(screen.getByText('5.4 Codex')).toBeTruthy();
    expect(screen.queryByRole('group', { name: 'Landscape' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Advanced settings' })).toBeTruthy();
    expect(screen.queryByRole('textbox', { name: 'Negative prompt' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Expand prompt editor' })).toBeTruthy();
    expect(screen.getByText('Drop an image or paste it into the prompt.')).toBeTruthy();
    expect(container.querySelector('.create-footer-meta')).toBeTruthy();
    expect(container.querySelector('.create-shortcut-hint')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Increase image count' })).toHaveProperty(
      'disabled',
      false,
    );
  });

  it('reveals negative prompt inside advanced settings', () => {
    renderToolbar();
    fireEvent.click(screen.getByRole('button', { name: 'Advanced settings' }));
    expect(screen.getByRole('textbox', { name: 'Negative prompt' })).toBeTruthy();
    expect(screen.getByText('Optional')).toBeTruthy();
  });

  it('expands the prompt editor and saves the draft', () => {
    const updateConfig = vi.fn();
    renderToolbar({ updateConfig });
    fireEvent.click(screen.getByRole('button', { name: 'Expand prompt editor' }));
    const editor = screen.getByRole('textbox', { name: 'Full prompt' });
    fireEvent.change(editor, { target: { value: 'A brass lantern' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save prompt' }));
    expect(updateConfig).toHaveBeenCalledWith('prompt', 'A brass lantern');
    expect(screen.queryByRole('dialog', { name: 'Edit prompt' })).toBeNull();
  });

  it('can remove a reference thumbnail from the Create rail', () => {
    const onRemoveAttachment = vi.fn();
    renderToolbar({
      onRemoveAttachment,
      generationConfig: config({
        attachments: [
          {
            id: 'ref-1',
            name: 'hero.png',
            dataUrl: 'data:image/png;base64,aaaa',
            strength: 1,
          },
        ],
      }),
    });

    fireEvent.click(screen.getByRole('button', { name: 'Remove hero.png' }));
    expect(onRemoveAttachment).toHaveBeenCalledWith('ref-1');
  });

  it('clamps Grok batch to 1 and restores prompt tools on the rail', () => {
    const updateConfig = vi.fn();
    renderToolbar({
      activeProviderId: 'grok',
      grokCanExecute: true,
      generationConfig: config({ batchCount: 4 }),
      updateConfig,
    });

    expect(screen.getByRole('button', { name: 'Increase image count' })).toHaveProperty(
      'disabled',
      true,
    );
    expect(screen.getByRole('button', { name: 'Decrease image count' })).toHaveProperty(
      'disabled',
      true,
    );
    expect(screen.getByRole('button', { name: 'Analyze references' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open edit instructions' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Enhance prompt' })).toBeTruthy();
    expect(updateConfig).toHaveBeenCalledWith('batchCount', 1);
  });

  it('shows 1K, 2K, and 4K when ChatGPT Sign in is selected', () => {
    const updateConfig = vi.fn();
    renderToolbar({
      activeProviderId: 'codex',
      codexTransport: 'subscription_http',
      codexAvailableTransports: ['codex_app_server', 'subscription_http'],
      generationConfig: config({
        aspectRatio: '16:9',
        imageSize: '1K',
        executionModel: 'gpt-5.5',
        executionReasoningEffort: 'provider_default',
        executionSpeed: 'standard',
        codexTransport: 'subscription_http',
      }),
      updateConfig,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Image size: 1K' }));
    fireEvent.click(screen.getByRole('option', { name: '4K: 3840×2160' }));
    expect(updateConfig).toHaveBeenCalledWith('imageSize', '4K');

    fireEvent.click(screen.getByRole('button', { name: /codex task execution/i }));
    expect(screen.getByRole('heading', { name: 'Connection' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Text model' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Image model' })).toBeTruthy();
    expect(screen.getByText('Managed by ChatGPT')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Reasoning: Managed' })).toBeNull();
    expect(screen.getByRole('group', { name: 'ChatGPT image size' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '2K: 2048×1152' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Close generation settings' }));
    expect(screen.queryByRole('dialog', { name: 'Codex task execution' })).toBeNull();
  });

  it('hides ChatGPT size choices on Codex app-server', () => {
    renderToolbar({
      activeProviderId: 'codex',
      codexTransport: 'codex_app_server',
      codexAvailableTransports: ['codex_app_server', 'subscription_http'],
    });
    expect(screen.queryByRole('button', { name: 'Image size: 1K' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /codex task execution/i }));
    expect(screen.getByRole('heading', { name: 'Reasoning' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Speed' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Image model' })).toBeNull();
  });
});
