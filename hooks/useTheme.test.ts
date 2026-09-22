/** @vitest-environment jsdom */
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Logo from '../components/Logo';

import {
  ACCENT_PALETTES,
  ThemeProvider,
  accentOnColor,
  applyAccentPaletteToDocument,
  rgbTripletToHex,
} from './useTheme';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.localStorage.clear();
  document.documentElement.removeAttribute('style');
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-appearance');
  document.documentElement.style.colorScheme = '';
});

describe('accent palettes', () => {
  it('starts with Neutral and maps 500 onto Workbench accent tokens', () => {
    expect(ACCENT_PALETTES[0].name).toBe('Neutral');
    applyAccentPaletteToDocument(ACCENT_PALETTES[0]);
    expect(document.documentElement.style.getPropertyValue('--wb-accent')).toBe('#737373');
    expect(document.documentElement.style.getPropertyValue('--wba-accent')).toBe('#737373');
    expect(document.documentElement.style.getPropertyValue('--wbp-accent')).toBe('#737373');
    expect(document.documentElement.style.getPropertyValue('--create-primary')).toBe('#737373');
    expect(document.documentElement.style.getPropertyValue('--accent-500')).toBe('115 115 115');
    expect(document.documentElement.style.getPropertyValue('--wb-on-accent')).toBe(
      accentOnColor('115 115 115'),
    );
  });

  it('cycles a later palette across the whole accent system', () => {
    const rose = ACCENT_PALETTES.find((palette) => palette.name === 'Rose');
    expect(rose).toBeTruthy();
    applyAccentPaletteToDocument(rose!);
    expect(document.documentElement.style.getPropertyValue('--wb-accent')).toBe(
      rgbTripletToHex(rose!.colors[500]),
    );
    expect(document.documentElement.style.getPropertyValue('--wba-accent')).toBe(
      rgbTripletToHex(rose!.colors[500]),
    );
  });
  it('cycles all eight colors from the logo, wraps, and restores the selected color', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const app = () => React.createElement(ThemeProvider, null, React.createElement(Logo));
    const view = render(app());
    const logo = screen.getByRole('button', { name: /Codex Studio.*Neutral/ });
    expect(ACCENT_PALETTES.map(({ name }) => name)).toEqual([
      'Neutral',
      'Rose',
      'Orange',
      'Amber',
      'Green',
      'Cyan',
      'Blue',
      'Violet',
    ]);
    for (const palette of [...ACCENT_PALETTES.slice(1), ACCENT_PALETTES[0]]) {
      fireEvent.click(logo);
      expect(logo.getAttribute('aria-label')).toContain(`current: ${palette.name}`);
      expect(document.documentElement.style.getPropertyValue('--wb-accent')).toBe(
        rgbTripletToHex(palette.colors[500]),
      );
      for (const [shade, rgb] of Object.entries(palette.colors)) {
        expect(document.documentElement.style.getPropertyValue(`--accent-${shade}`)).toBe(rgb);
      }
    }
    fireEvent.click(logo);
    view.unmount();
    render(app());
    expect(screen.getByRole('button', { name: /Codex Studio.*Rose/ })).toBeTruthy();
  });
});
