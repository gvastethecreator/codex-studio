/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { StudioCommandCenterProjection } from '../../lib/commandCenterProjection';
import type { StudioUsageSummary } from '../../lib/studioDiagnostics';
import { StudioStatusBar } from './StudioStatusBar';

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
      tooltip: 'Grok ready',
      canExecute: true,
      statusDetail: 'Ready',
    },
  ],
  queue: { activeCount: 1, reviewCount: 4, isOpen: false },
};

describe('StudioStatusBar', () => {
  it('shows provider, health, usage and queue landmarks', () => {
    const onToggleQueue = vi.fn();
    render(
      <StudioStatusBar
        usage={usage}
        commandCenter={commandCenter}
        isQueueOpen={false}
        onToggleQueue={onToggleQueue}
        onOpenDashboard={vi.fn()}
        onOpenOnboarding={vi.fn()}
      />,
    );

    expect(screen.getByRole('contentinfo', { name: 'Studio status' })).toBeTruthy();
    expect(screen.getByRole('list', { name: 'Provider status' })).toBeTruthy();
    expect(screen.getByLabelText('Codex: Ready')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Usage status' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open runtime status: Ready' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /open jobs/i }));
    expect(onToggleQueue).toHaveBeenCalled();
  });

  it('shows the image total and recovery action in the status bar', () => {
    const loadMore = vi.fn().mockResolvedValue(undefined);
    const refresh = vi.fn().mockResolvedValue(undefined);
    render(
      <StudioStatusBar
        usage={usage}
        commandCenter={commandCenter}
        imageHistory={{
          total: 6094,
          isLoading: false,
          error: new Error('Connection lost'),
          hasMore: true,
          loadMore,
          refresh,
        }}
        isQueueOpen={false}
        onToggleQueue={vi.fn()}
        onOpenDashboard={vi.fn()}
        onOpenOnboarding={vi.fn()}
      />,
    );

    const statusBar = screen.getByRole('contentinfo', { name: 'Studio status' });
    expect(statusBar.querySelector('[role="status"]')?.textContent).toBe('6094 images');
    fireEvent.click(screen.getByRole('button', { name: 'Retry loading images' }));
    expect(loadMore).toHaveBeenCalledOnce();
    expect(refresh).not.toHaveBeenCalled();
  });
});
