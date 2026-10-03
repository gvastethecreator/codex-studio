/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRef, useState } from 'react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { GsapDropdown } from './GsapDropdown';

afterEach(cleanup);

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
});

describe('GsapDropdown Workbench Ambient', () => {
  it('keeps Carbon scope and makes a closing menu inert until it reopens', async () => {
    const { container, rerender } = render(
      <GsapDropdown open onOpenChange={() => undefined}>
        Item
      </GsapDropdown>,
    );
    const menu = container.querySelector('[data-gsap-dropdown]');
    expect(menu?.className).toContain('wb-ambient');
    expect(menu?.className).toContain('wbp-system');
    expect(menu?.className).toContain('studio-popover');
    expect(menu?.getAttribute('data-theme')).toBe('carbon');
    expect(menu?.getAttribute('data-density')).toBe('comfortable');
    expect(menu?.getAttribute('data-wbp-density')).toBe('comfortable');
    rerender(<GsapDropdown open={false}>Item</GsapDropdown>);
    expect(menu?.hasAttribute('inert')).toBe(true);
    expect(menu?.getAttribute('aria-hidden')).toBe('true');
    rerender(<GsapDropdown open>Item</GsapDropdown>);
    await waitFor(() => expect((menu as HTMLElement).style.opacity).toBe('1'));
    expect(menu?.hasAttribute('inert')).toBe(false);
    expect(container.querySelector('[data-gsap-dropdown]')).toBe(menu);
  });

  it('keeps keyboard focus in the options, then returns it when the menu closes', async () => {
    function Menu() {
      const triggerRef = useRef<HTMLButtonElement>(null);
      const [open, setOpen] = useState(false);
      return (
        <>
          <button ref={triggerRef} aria-expanded={open} onClick={() => setOpen(!open)}>
            Choose format
          </button>
          <GsapDropdown open={open} onOpenChange={setOpen} triggerRef={triggerRef} role="listbox">
            <button role="option" aria-selected={false}>
              Square
            </button>
            <button role="option" aria-selected={true}>
              Portrait
            </button>
            <button role="option" aria-selected={false} onClick={() => setOpen(false)}>
              Landscape
            </button>
          </GsapDropdown>
        </>
      );
    }
    render(<Menu />);
    const trigger = screen.getByRole('button', { name: 'Choose format' });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'Enter' });
    fireEvent.click(trigger);
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('option', { name: 'Portrait' })),
    );
    fireEvent.keyDown(document.activeElement!, { key: 'End' });
    expect(document.activeElement).toBe(screen.getByRole('option', { name: 'Landscape' }));
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByRole('option', { name: 'Square' }));
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(trigger);
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('option', { name: 'Portrait' })),
    );
    fireEvent.click(screen.getByRole('option', { name: 'Landscape' }));
    expect(document.activeElement).toBe(trigger);
    fireEvent.pointerDown(trigger);
    fireEvent.click(trigger);
    const lastOption = await screen.findByRole('option', { name: 'Landscape' });
    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(lastOption);
  });
});
