/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../ui/DemandMountedGsapDropdown', () => ({
  DemandMountedGsapDropdown: ({ open, children }: { open: boolean; children: unknown }) =>
    open ? <div role="dialog">{children}</div> : null,
}));

import type { CommandCenterProviderProjection } from '../../lib/commandCenterProjection';
import { ProviderQuickSwitch } from './ProviderQuickSwitch';

afterEach(cleanup);

const CODEX: CommandCenterProviderProjection = {
  id: 'codex',
  label: 'Codex app-server',
  shortLabel: 'Codex',
  toolbarLabel: 'Codex',
  status: 'active',
  tone: 'success',
  tooltip: 'Ready',
  canExecute: true,
  statusDetail: 'Ready',
};

const GROK: CommandCenterProviderProjection = {
  id: 'grok',
  label: 'Grok Imagine',
  shortLabel: 'Grok',
  toolbarLabel: 'Grok',
  status: 'active',
  tone: 'success',
  tooltip: 'Ready',
  canExecute: true,
  statusDetail: 'Ready',
};

describe('ProviderQuickSwitch', () => {
  it('selects another provider from the menu', async () => {
    const onSelectProvider = vi.fn();
    render(
      <ProviderQuickSwitch
        provider={CODEX}
        providerOptions={[CODEX, GROK]}
        isProviderSaving={false}
        onSelectProvider={onSelectProvider}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /change provider/i }));
    fireEvent.click(await screen.findByRole('button', { name: /grok imagine/i }));
    expect(onSelectProvider).toHaveBeenCalledWith('grok');
  });
});
