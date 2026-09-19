/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest';

import {
  ACCENT_PALETTES,
  accentOnColor,
  applyAccentPaletteToDocument,
  rgbTripletToHex,
} from './useTheme';

afterEach(() => {
  document.documentElement.removeAttribute('style');
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-appearance');
  document.documentElement.style.colorScheme = '';
});

describe('accent palettes', () => {
  it('starts with Brass and maps 500 onto Workbench accent tokens', () => {
    expect(ACCENT_PALETTES[0].name).toBe('Brass');
    applyAccentPaletteToDocument(ACCENT_PALETTES[0]);
    expect(document.documentElement.style.getPropertyValue('--wb-accent')).toBe('#c3b28d');
    expect(document.documentElement.style.getPropertyValue('--wba-accent')).toBe('#c3b28d');
    expect(document.documentElement.style.getPropertyValue('--wbp-accent')).toBe('#c3b28d');
    expect(document.documentElement.style.getPropertyValue('--create-primary')).toBe('#c3b28d');
    expect(document.documentElement.style.getPropertyValue('--accent-500')).toBe('195 178 141');
    expect(document.documentElement.style.getPropertyValue('--wb-on-accent')).toBe(
      accentOnColor('195 178 141'),
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
});
