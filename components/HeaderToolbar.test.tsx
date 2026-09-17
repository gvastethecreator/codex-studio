/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { StudioCommandCenterProjection } from '../lib/commandCenterProjection';
import type { StudioUsageSummary } from '../lib/studioDiagnostics';
import { HeaderToolbar, type HeaderToolbarProps } from './HeaderToolbar';

afterEach(cleanup);

const usage: StudioUsageSummary = {
  value: '120',
  meta: 'ChatGPT Pro',
  tooltip: 'Available usage for ChatGPT Pro',
  unitLabel: 'credits',
  limits: [],
  tone: 'available',
  isLoading: false,
};

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
  providerOptions: [],
  queue: { activeCount: 1, reviewCount: 4, isOpen: false },
};

function renderHeader(overrides: Partial<HeaderToolbarProps> = {}) {
  const props: HeaderToolbarProps = {
    isGenerating: false,
    workspaces: [{ id: 'default', name: 'Shots', createdAt: 1, imageCount: 3 }],
    activeWorkspaceId: 'default',
    onSwitchWorkspace: vi.fn(),
    onAddWorkspace: vi.fn(),
    onDeleteWorkspace: vi.fn(),
    onRenameWorkspace: vi.fn(),
    routeView: 'recipes',
    currentView: 'recipes',
    onViewChange: vi.fn(),
    activeRecipe: null,
    onCloseRecipe: vi.fn(),
    onOpenDashboard: vi.fn(),
    onOpenOnboarding: vi.fn(),
    onOpenChat: vi.fn(),
    onOpenTrash: vi.fn(),
    trashCount: 0,
    onToggleDebug: vi.fn(),
    usage,
    commandCenter,
    isQueueOpen: false,
    onToggleQueue: vi.fn(),
    onOpenSettings: vi.fn(),
    onSelectProvider: vi.fn(),
    isProviderSaving: false,
    ...overrides,
  };
  return render(<HeaderToolbar {...props} />);
}

describe('HeaderToolbar chrome', () => {
  it('keeps workspace on the right and drops provider and jobs from the top bar', () => {
    renderHeader();

    expect(screen.getByRole('button', { name: 'Open recipes' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Go to studio' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /open workspace switcher: shots/i })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /change provider/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /open jobs/i })).toBeNull();
  });
});
