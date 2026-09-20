/** @vitest-environment jsdom */
import { render, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { GsapDropdown } from './GsapDropdown';

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
});
