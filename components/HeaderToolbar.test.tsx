/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { StudioCommandCenterProjection } from '../lib/commandCenterProjection';
import type { StudioUsageSummary } from '../lib/studioDiagnostics';
import { ThemeProvider } from '../hooks/useTheme';
import { HeaderToolbar, type HeaderToolbarProps } from './HeaderToolbar';
import { RecipeWorkbenchContext } from './recipes/RecipeWorkbenchContext';

afterEach(() => {
  cleanup();
  window.localStorage.removeItem('codex-studio-appearance');
  window.localStorage.removeItem('codex-studio-theme-index');
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-appearance');
});

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

function renderHeader(
  overrides: Partial<HeaderToolbarProps> = {},
  compare?: { showReference: boolean; toggle: () => void } | null,
) {
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
    onSelectRecipe: vi.fn(),
    ...overrides,
  };
  return render(
    <ThemeProvider>
      <RecipeWorkbenchContext
        value={{
          controls: null,
          action: null,
          overlay: null,
          sidePanel: null,
          compare: compare ?? null,
          setCompare: vi.fn(),
        }}
      >
        <HeaderToolbar {...props} />
      </RecipeWorkbenchContext>
    </ThemeProvider>,
  );
}

describe('HeaderToolbar chrome', () => {
  it('keeps workspace on the right and drops provider and jobs from the top bar', () => {
    renderHeader();

    expect(screen.getByRole('button', { name: 'Open create workspace' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open Library' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /open workspace switcher: shots/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Workflow: Default' })).toBeTruthy();
    expect(document.querySelector('.create-workflow-block.is-header')).toBeTruthy();
    const nav = screen.getByRole('navigation', { name: 'Studio navigation' });
    expect(
      [...nav.querySelectorAll('button')].map((button) => button.getAttribute('aria-label')),
    ).toEqual(['Open create workspace', 'Workflow: Default', 'Open Library']);
    expect(screen.queryByRole('button', { name: /change provider/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /open jobs/i })).toBeNull();
    expect(document.querySelector('.studio-toolbar-shell.studio-bar')).toBeTruthy();
  });

  it('toggles light and dark appearance from the toolbar', () => {
    renderHeader();
    const toggle = screen.getByRole('button', { name: 'Switch to light appearance' });
    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: 'Switch to dark appearance' })).toBeTruthy();
    expect(document.documentElement.getAttribute('data-theme')).toBe('paper');
  });

  it('paints Tools with Workbench popover chrome', () => {
    renderHeader();
    expect(document.querySelector('.studio-popover')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open help and setup' }).className).toContain(
      'studio-menu-item',
    );
  });

  it('keeps Compare off the header', () => {
    renderHeader({}, { showReference: false, toggle: vi.fn() });
    expect(screen.queryByRole('button', { name: 'Compare reference' })).toBeNull();
  });

  it('shows the active recipe in the workflow control between Create and Library', () => {
    const onCloseRecipe = vi.fn();
    renderHeader({
      routeView: 'recipe',
      currentView: 'recipes',
      activeRecipe: 'styles',
      onCloseRecipe,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Workflow: Styles' }));
    fireEvent.click(screen.getByRole('option', { name: 'Default' }));
    expect(onCloseRecipe).toHaveBeenCalledTimes(1);
  });
});
