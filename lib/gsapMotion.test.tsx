/** @vitest-environment jsdom */
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { AnimatePresence } from './gsapMotion';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it('retains exiting surfaces without interaction and cancels removal on rapid reopen', () => {
  vi.useFakeTimers();
  const surface = (open: boolean, label = 'Settings') => (
    <AnimatePresence>{open && <button key="settings">{label}</button>}</AnimatePresence>
  );
  const view = render(surface(true));
  view.rerender(surface(true, 'Updated settings'));
  view.rerender(surface(false));
  expect(screen.queryByRole('button')).toBeNull();
  expect(screen.getByText('Updated settings').closest('[inert]')).toBeTruthy();
  act(() => {
    vi.advanceTimersByTime(60);
  });
  view.rerender(surface(true));
  act(() => {
    vi.advanceTimersByTime(200);
  });
  expect(screen.getByRole('button', { name: 'Settings' })).toBeTruthy();
  view.rerender(surface(false));
  act(() => {
    vi.advanceTimersByTime(120);
  });
  expect(screen.queryByText('Settings')).toBeNull();
  view.rerender(
    <AnimatePresence mode="wait">
      <button key="first">First</button>
    </AnimatePresence>,
  );
  view.rerender(
    <AnimatePresence mode="wait">
      <button key="second">Second</button>
    </AnimatePresence>,
  );
  expect(screen.queryByRole('button', { name: 'Second' })).toBeNull();
  act(() => {
    vi.advanceTimersByTime(120);
  });
  expect(screen.getByRole('button', { name: 'Second' })).toBeTruthy();
});
