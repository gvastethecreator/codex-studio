/** @vitest-environment jsdom */
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import Tooltip, { ControlTooltips } from './Tooltip';

afterEach(cleanup);

it('lets Escape reach an open overlay when either kind of tooltip is visible', () => {
  const closeOverlay = vi.fn();
  document.addEventListener('keydown', closeOverlay);
  try {
    render(
      <>
        <ControlTooltips />
        <button aria-label="Settings">Settings</button>
        <Tooltip content="Help">
          <button>Help control</button>
        </Tooltip>
      </>,
    );

    const settings = screen.getByRole('button', { name: 'Settings' });
    fireEvent.focusIn(settings);
    expect(screen.getByRole('tooltip')).toBeTruthy();
    const settingsEscape = fireEvent.keyDown(settings, { key: 'Escape' });
    expect(settingsEscape).toBe(true);
    expect(closeOverlay).toHaveBeenCalledTimes(1);

    const help = screen.getByRole('button', { name: 'Help control' });
    fireEvent.focus(help);
    expect(screen.getByRole('tooltip')).toBeTruthy();
    const helpEscape = fireEvent.keyDown(help, { key: 'Escape' });
    expect(helpEscape).toBe(true);
    expect(closeOverlay).toHaveBeenCalledTimes(2);
  } finally {
    document.removeEventListener('keydown', closeOverlay);
  }
});
