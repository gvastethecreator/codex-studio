/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../contexts/GlobalContext', () => ({
  useToastUi: () => ({ addToast: vi.fn() }),
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
  it('places provider and Codex execution on one row', () => {
    const { container } = renderToolbar();
    const row = container.querySelector('.create-tool-provider-row');
    const provider = screen.getByRole('button', { name: /change provider/i });
    const execution = screen.getByRole('button', { name: /codex task execution/i });
    const generate = screen.getByRole('button', { name: /generate/i });

    expect(row?.contains(provider)).toBe(true);
    expect(row?.contains(execution)).toBe(true);
    expect(screen.queryByRole('button', { name: /generation model/i })).toBeNull();
    expect(
      provider.compareDocumentPosition(execution) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      execution.compareDocumentPosition(generate) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Landscape' })).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Square' })).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Portrait' })).toBeTruthy();
    expect(screen.queryByText('Advanced')).toBeNull();
    expect(screen.getByRole('textbox', { name: 'Negative prompt' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Increase image count' })).toHaveProperty(
      'disabled',
      false,
    );
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
});
